
/*
 * cart.
 */

var db = require("simple-db");

exports.create = function(req, res, next){
  if (req.body && req.body.user) {

    db.post("carts", {user: req.body.user}, function(err, cartID) {
      if (err) return next(err);

      db.put("index", req.body.user, cartID, function(err) {
        if (err) return next(err);

        res.set("location", "/carts/"+cartID);
        res.send(303);
      });
    });
    // Index the cart by user
  }
};

exports.get = function(req, res, next){
  var cartID = req.params.id;
  db.get("carts", cartID, function(err, cart) {
    if (err) return next(err);
    if (!cart) return next(new Error("Cart not found"));

    res.send(renderGetRes(req.fqdn, cartID, cart));
  });
};

exports.edit = function(req, res){
  var cartID = req.params.id;
  db.get("carts", cartID, function(err, cart) {
    if (err) return next(err);
    if (!cart) return next(new Error("Cart not found"));

    // TODO validate

    var commit = {
      href: req.body.item.value,
      quantity: req.body.quantity.value
    };

    if (!cart.items) cart.items=[];

    db.post(cartID, commit, function(err, commitID) {
      if (err) return next(err);

      res.set("location", "/carts/"+cartID+"/history/"+commitID);
      res.set("content-location", "/carts/"+cartID);
      res.set("content-type", "application/json");

      var checkedItems = cart.items.filter(function(item) {
        item.href === commit.href;
      });

      if (checkedItems[0]) {
        // Update the item quantity
        if (commit.quantity) {
          cart.items = cart.items.map(function(item) {
            if (item.href === commit.href) item.quantity = commit.quantity;
            return item;
          });
        }
        // Remove the item
        else {
          cart.items = cart.items.filter(function(item) {
            item.href !== commit.href;
          });
        };
      }
      // it's new
      else {
        cart.items.push(commit);
      }

      // Save the cart back
      return db.put("carts", cartID, cart, function(err) {
        if (err) return next(err);

        res.send(renderGetRes(req.fqdn, cartID, cart));
        res.send(203);
      });

    });

  });
};


var renderGetRes = function(fqdn, cartID, cart) {
  var response = {
    _links: {
      self: {href: fqdn+"/carts/"+cartID},
      history: {href: fqdn+"/carts/"+cartID+"/history"},
      user: {href: cart.user}
    },
    // Is this redundant...?
    size: (cart.items?cart.items.length:0),
    _embedded: {
      items: []
    },
    _templates: {
      add: {target: fqdn+"/carts/"+cartID+"/history", method: "post", form: {
        item: {value: "", prompt: "Item"},
        quantity: {value: 1, prompt: "Quantity"}
      }}
    }
  };
  if (cart.items) {
    cart.items.forEach(function(item) {
      response._embedded.items.push({
        _links: {
          self: {href: item.href}
        },
        quantity: item.quantity,
        _templates: {
          update: {target: fqdn+"/carts/"+cartID+"/history", method: "post", form: {
            item: {value: item.href},
            quantity: {value: item.quantity, prompt: "Quantity"}
          }},
          remove: {target: fqdn+"/carts/"+cartID+"/history", method: "post", form: {
            item: {value: item.href},
            quantity: {value: 0}
          }}
        }
      });
    });
  }
  return response;
};