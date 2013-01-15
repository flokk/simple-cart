
/**
 * Module dependencies.
 */

var stack = require('simple-stack')
  , root = require('./routes')
  , cart = require('./routes/cart');

module.exports = function create(options) {
  if (!options) options = {};

  var app = stack(options);

  app.get('/', root.index);
  app.post('/carts', cart.create);
  app.get('/carts/:id', cart.get);
  // TODO
  // app.get('/carts/:id/history', cart.get_history);
  app.post('/carts/:id/history', cart.edit);

  return app;
};
