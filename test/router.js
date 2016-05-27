'use strict';

const Router  = require('..');
const assert  = require('assert');
const request = require('supertest');

describe('Router', () => {
  it('class TestApp extends Router', () => {
    class TestApp extends Router {
      get routes () {
        return {
          '/': 'index',
          '/async': 'async'
        };
      }

      index (ctx) {
        return 'OK';
      }

      async (ctx) {
        return new Promise((r, errback) => {
          setTimeout(() => { r('Async action'); }, 500);
        });
      }
    }

    var app = new TestApp();
    assert.ok(app.dispatch);
  });

  describe('HTTP response', () => {
    beforeEach(() => {
      class App extends Router {
        get routes () {
          return {
            '/': 'index',
            '/async': 'async'
          };
        }

        index (req, res, next) {
          return 'OK';
        }

        async (ctx) {
          return new Promise((r, errback) => {
            setTimeout(() => { r('Async action'); }, 500);
          });
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
