'use strict';

const http    = require('http');
const Router  = require('..');
const assert  = require('assert');
const request = require('supertest');

const PORT = process.env.PORT || 0;

describe('Router', () => {

  it('class TestApp extends Router', () => {
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

    var app = new TestApp();
    assert.ok(app.dispatch);
  });

  describe('HTTP response', () => {
    beforeEach(() => {
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

      this.app = new App();
      this.App = App;
    });

    it('GET /', (done) => {
      request(this.app)
        .get('/')
        .expect('OK')
        .expect(200, done);
    });

    it('404', (done) => {
      request(this.app)
        .get('/aoizheuaziouh')
        .expect(404, done);
    });
  });


});
