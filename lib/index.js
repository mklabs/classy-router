'use strict';

const http         = require('http');
const Url          = require('url');
const pathToRegexp = require('path-to-regexp');
const debug        = require('debug')('tilt-router');

module.exports = class Router {
  get routes() {
    return {};
  }

  get verbs() {
    return ['GET', 'POST', 'PUT', 'HEAD', 'OPTION', 'DELETE'];
  }

  constructor(app) {
    this.app = app;
    this._routes = [];

    if (!this.app) {
      this.app = http.createServer(this.dispatch.bind(this));
    }

    if (this.app instanceof http.Server) {
      this.verbs.forEach((verb) => {
        verb = verb.toLowerCase();
        this.app[verb] = this.action(verb);
      })
    }

    debug('Init');
    this.registerRoutes();
  }


  action(verb) {
    return (pattern, handler) => {
      debug('Register %s - %s', verb, pattern);

      this._routes.push({
        verb: verb,
        path: pattern,
        handler: handler
      });
    }
  }

  registerRoutes() {
    var routes = this.routes;

    debug('Register routes', routes);
    Object.keys(routes).forEach((path) => {
      var method = routes[path];
      var verb = path.split(' ').length > 1 ? path.split(' ')[0] : 'get';
      verb = verb.toLowerCase();

      debug('Register %s %s', verb, path);
      if (typeof this.app.connection === 'function') {
        // Hapi like server, use Hapi API
        this.app.route({
          method: verb.toUpperCase(),
          path: path,
          handler: this[method].bind(this)
        });
      } else {
        this.app[verb](path, this[method].bind(this));
      }
    });
  }

  listen(port, done) {
    if (!this.app) throw new Error('Missing app property');
    return this.app.listen(port, done);
  }

  dispatch(req, res, next) {
    debug('Request - %s', req.url);

    // express middleware, nothing to do
    if (next) return next();

    // figure out which route to invoke based on url
    var pattern = pathToRegexp(req.url);
    var route = this._routes.find((route) => {
      debug('Check %s vs %s', req.method.toLowerCase(), route.verb, route.path);
      return req.method.toLowerCase() === route.verb && pattern.test(route.path);
    });

    if (!route) {
      debug('No route found', this._routes);
      res.statusCode = 404;
      return res.end('No route found');
      // return finalhandler(req, res, next);
    }

    route.handler.apply(this, arguments);
  }

  address() {
    return this.app.address();
  }

  static create(app, options) {
    if (!options) {
      options = app || {};
      app = options.app;
    }

    return new Router(app, options);
  }

  static middleware(app, options) {
    var router = Router.create(app, options);
    return router.dispatch.bind(router);
  }

  static createServer(listener) {
    return http.createServer(listener);
  }

  static listen(listener, port, done) {
    if (!done) {
      if (port) {
        done = port;
        port = listener;
        listener = Router.middleware();
      } else {
        port = listener;
        done = null;
        listener = Router.middleware();
      }
    }

    debug('Listen on http://localhost:%s', port);
    return Router.createServer(listener).listen(port, done);
  }
}
