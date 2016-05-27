'use strict';
import http from 'http';

const { resolve } = require('universal-router');

const debug = require('debug')('tilt-router');

export default class Router {
  get routes () {
    return {};
  }

  get verbs () {
    return ['GET', 'POST', 'PUT', 'HEAD', 'OPTION', 'DELETE'];
  }

  constructor (app) {
    this.app = app;
    this._routes = [];

    if (!this.app) {
      this.app = http.createServer(this.dispatch.bind(this));
    }

    if (this.app.use) {
      this.app.use(this.dispatch.bind(this));
    }

    this.registerRoutes();
  }

  action (verb) {
    return (pattern, handler) => {
      debug('Register %s %s', verb.toUpperCase(), pattern);

      this._routes.push({
        verb: verb,
        path: pattern,
        action: handler
      });
    };
  }

  registerRoutes () {
    let routes = this.routes;
    Object.keys(routes).forEach((path) => {
      let method = routes[path];
      let parts = path.split(' ');
      let verb = parts.length > 1 ? parts[0] : 'get';
      verb = verb.toLowerCase();
      path = parts.length > 1 ? parts[1] : path;

      method = this[method];
      this.action(verb)(path, method);
    });
  }

  listen (port, done) {
    if (!this.app) throw new Error('Missing app property');
    return this.app.listen(port, done);
  }

  dispatch (req, res, next) {
    var routes = this._routes.filter((route) => {
      return req.method.toLowerCase() === route.verb;
    });

    return resolve(routes, { path: req.url })
      .catch((err) => {
        res.writeHeader(500, { 'Content-Type': 'text/html' });
        res.end('Internal server error: ' + err.message);
      })
      .then(result => {
        if (!result) {
          if (res.end) {
            res.writeHeader(404, { 'Content-Type': 'text/html' });
            return res.end('No route found');
          } else if (next) {
            return next(new Error('No route found'));
          } else {
            throw new Error('No route found');
          }
        }

        res.end(result);
      });
  }

  address () {
    return this.app.address();
  }

  static create (app, options) {
    if (!options) {
      options = app || {};
      app = options.app;
    }

    return new Router(app, options);
  }

  static middleware (app, options) {
    var router = Router.create(app, options);
    return router.dispatch.bind(router);
  }

  static createServer (listener) {
    return http.createServer(listener);
  }

  static listen (listener, port, done) {
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
