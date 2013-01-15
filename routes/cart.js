
/*
 * cart.
 */

var db = require("simple-db"),
    url = require("url"),
    E = require("http-error");

exports.create = function(req, res, next){
  if (req.body && req.body.user && req.body.user.value) {

    db.post("carts", {user: req.body.user.value}, function(err, cartID) {
      if (err) return next(err);

      db.put("index", req.body.user.value, cartID, function(err) {
        if (err) return next(err);

        res.set("location", "/carts/"+cartID);
        res.send(303);
      });
    });
  }
  else {
    next(new E.BadRequest("Cart must have a user"));
  }
};

exports.get = function(req, res, next){
  var cartID = req.params.id;
  db.get("carts", cartID, function(err, cart) {
    if (err) return next(err);
    // Pass it on to the notFound middleware
    if (!cart) return next();

    res.send(renderGetRes(req.base, cartID, cart));
  });
};

exports.edit = function(req, res, next){
  var cartID = req.params.id;
  db.get("carts", cartID, function(err, cart) {
    if (err) return next(err);
    if (!cart) return next();

    if (!req.body.item || !req.body.item.value) {
      return next(new E.BadRequest("Item field needs to be filled out"));
    }
    else {
      var itemHref = url.parse(req.body.item.value);
      if (!itemHref.path) {
        return next(new E.BadRequest("Item field needs to be filled out"));
      }
    }
    if (!req.body.quantity || !req.body.quantity.value) {
      return next(new E.BadRequest("Quantity field needs to be filled out"));
    }

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

        res.send(renderGetRes(req.base, cartID, cart));
        res.send(203);
      });

    });

  });
};


var renderGetRes = function(base, cartID, cart) {
  var response = {
    _links: {
      self: {href: base+"/carts/"+cartID},
      history: {href: base+"/carts/"+cartID+"/history"},
      user: {href: cart.user}
    },
    // Is this redundant...?
    size: (cart.items?cart.items.length:0),
    _embedded: {
      items: []
    },
    _templates: {
      add: {action: base+"/carts/"+cartID+"/history", method: "post", form: {
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
          update: {action: base+"/carts/"+cartID+"/history", method: "post", form: {
            item: {value: item.href},
            quantity: {value: item.quantity, prompt: "Quantity"}
          }},
          remove: {action: base+"/carts/"+cartID+"/history", method: "post", form: {
            item: {value: item.href},
            quantity: {value: 0}
          }}
        }
      });
    });
  }
  return response;
};