var should = require("should"),
    request = require("supertest"),
    url = require("url"),
    app = require("../index")();

describe("app", function() {

  var root;

  beforeEach(function(done) {
    request(app)
      .get("/")
      .end(function(err, res) {
        res.ok.should.be.ok;
        should.not.exist(err);
        should.exist(res);
        should.exist(res.body);
        root = res.body;
        done()
      });
  });

  describe("/", function() {

    describe("GET", function() {

      it("should have a template to create a cart", function() {
        should.exist(root._templates);
        should.exist(root._templates.create);
        should.exist(root._templates.create.target);
        should.exist(root._templates.create.method);
        should.exist(root._templates.create.form);
        root._templates.create.method.should.eql("post");
      });

    });

    describe("/carts", function() {

      var createCart = function(done, cartDone) {
        var form = root._templates.create.form;
        form.user = "http://example.com/users/cameron"

        var href = url.parse(root._templates.create.target);

        request(app)
          .post(href.path)
          .send(form)
          .end(function(err, res) {
            if (err) return done(err);
            should.exist(res.headers);
            should.exist(res.headers.location);

            request(app)
              .get(res.headers.location)
              .end(function(err2, res2) {
                if (err2) return done(err2);
                if (cartDone) cartDone(res2.body);
                done();
              });
          });
      };

      var cart;

      beforeEach(function(done) {
        createCart(done, function(newCart) {
          cart = newCart;
        });
      });


      describe("POST", function() {

        it("should create a cart", createCart);
        it("should validate form has a user");

      });


      describe("/:id", function() {

        describe("GET", function() {
          it("should get a created cart");
          it("should send a `404` for non-existant carts");
        });

        describe("/history", function() {

          describe("GET", function() {
            it("should get a list of the history of the cart");
            it("should send a `404` for non-existant carts");
          });

          describe("POST", function() {
          
            it("should edit a cart", function(done) {
              var form = cart._templates.add.form;
              form.quantity.value = 2;
              form.item.value = "http://www.amazon.com/Building-Hypermedia-APIs-HTML5-Node/dp/1449306578/ref=sr_1_1?ie=UTF8&qid=1357383195&sr=8-1&keywords=building+hypermedia+apis+with+html5+and+node";

              var href = url.parse(cart._templates.add.target);

              request(app)
                .post(href.path)
                .send(form)
                .end(function(err, res) {
                  should.not.exist(err);
                  should.exist(res);
                  should.exist(res.headers);
                  should.exist(res.body._embedded);
                  should.exist(res.body._embedded.items);
                  should.exist(res.body._embedded.items[0]);
                  should.exist(res.body._embedded.items[0]._links.self, "Cart doesn't have item");
                  should.exist(res.body._embedded.items[0].quantity, "Cart doesn't have item quantity");
                  res.body._embedded.items[0]._links.self.href.should.eql(form.item.value);
                  res.body._embedded.items[0].quantity.should.eql(form.quantity.value);
                  done();
                });
            });

            it("should send a `404` for non-existant carts");
            it("should validate bad form posts");

          });

        });

      });
    });

  });

});
