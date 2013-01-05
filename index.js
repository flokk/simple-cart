
/**
 * Module dependencies.
 */

var express = require('express')
  , root = require('./routes')
  , cart = require('./routes/cart');

module.exports = function create(options) {
  if (!options) options = {};

  var app = express();

  app.configure(function(){
    app.set("x-powered-by", false);
    app.use(function fqdn(req, res, next) {
      req.fqdn = req.protocol+"://"+req.headers.host;
      next();
    });
    app.use(express.favicon());
    if(app.settings.env !== "test") app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    if(options.auth) app.use(options.auth);
    app.use(app.router);
  });

  app.configure('development', function(){
    app.use(express.errorHandler());
  });

  app.get('/', root.index);
  app.post('/carts', cart.create);
  app.get('/carts/:id', cart.get);
  // TODO
  // app.get('/carts/:id/history', cart.get_history);
  app.post('/carts/:id/history', cart.edit);

  return app;
};
