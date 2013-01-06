var simpleCart = require("simple-cart");

var app = module.exports = simpleCart({
  auth: function auth(req, res, next) {
    // Auth goes logic here
    next();
  }
});

app.on("create", function() {

});

app.on("update", function() {

});
