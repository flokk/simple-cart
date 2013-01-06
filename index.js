
/**
 * Module dependencies.
 */

var express = require('express')
  , pack = require('simple-stack')
  , root = require('./routes')
  , cart = require('./routes/cart');

module.exports = function create(options) {
  if (!options) options = {};

  var app = express();
  var stack = pack({router: app.router});

  app.configure(function(){
    app.set("x-powered-by", false);
    app.use(stack);
  });

  app.configure('development', function(){
    app.use(express.errorHandler());
  });
  app.configure('test', function(){
    stack.remove("logger");
  });

  app.get('/', root.index);
  app.post('/carts', cart.create);
  app.get('/carts/:id', cart.get);
  // TODO
  // app.get('/carts/:id/history', cart.get_history);
  app.post('/carts/:id/history', cart.edit);

  return app;
};
