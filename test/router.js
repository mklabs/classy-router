'use strict';

const http    = require('http');
const Router  = require('..');
const assert  = require('assert');
const request = require('supertest');

const PORT = process.env.PORT || 0;

describe('Router', () => {

  describe('API', () => {

    it('Router.createServer()', (done) => {
      Router.createServer().listen(PORT, done);
    });


    it('Router.listen()', (done) => {
      Router.listen(PORT, done);
    });

    it('Router.create()', () => {
      var router = Router.create();
      assert.ok(router instanceof Router);
    });

    it('Router.dispatch() - express middleware', (done) => {
      var middleware = Router.middleware();

      var req = { url: '/' };
      var res = {};

      middleware(req, res, done);
    });

    it('Router.dispatch() - HTTP server', () => {
      var middleware = Router.middleware();

      var req = { url: '/' };
      var res = {};

      // middleware(req, res);
    });

    it('App extends Router', (done) => {
      class App extends Router {
        get routes() {
          return {
            '/': 'index'
          };
        }

        index(req, res, next) {
          return res.end('OK');
        }
      }

      var app = new App();
      app.listen(PORT, done);
    });
  });

  describe('HTTP response', () => {
    class TestApp extends Router {
      get routes() {
        return {
          '/': 'index'
        };
      }

      index(req, res, next) {
        return res.end('OK');
      }
    }


    beforeEach(() => {
      this.app = new TestApp();
    });

    it('GET /', (done) => {
      request(this.app)
        .get('/')
        .expect('OK')
        .expect(200, done);
    });

    it('404', (done) => {
      var server = TestApp.createServer();
      request(this.app)
        .get('/aoizheuaziouh')
        .expect(404, done);
    });
  });


});
