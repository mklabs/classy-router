const jsdom = require('jsdom');
const assert = require('assert');
const server = require('./utils/server');

let dom = (url, done) => {
  jsdom.env({
    url,
    // scripts: ['https://code.jquery.com/jquery-2.2.4.js'],
    virtualConsole: jsdom.createVirtualConsole().sendTo(console),
    features: {
      FetchExternalResources: ['script'],
      ProcessExternalResources: ['script'],
      SkipExternalResources: false
    },

    done (err, win) {
      if (err) return err(done);

      // set globals for mocha that make access to document and window feel
      // natural in the test environment
      global.document = win.document;
      global.window = win;

      // take all properties of the window object and also attach it to the
      // mocha global object
      propagateToGlobal(win);

      done();

      // from mocha-jsdom https://github.com/rstacruz/mocha-jsdom/blob/master/index.js#L80
      function propagateToGlobal (window) {
        for (let key in window) {
          if (!window.hasOwnProperty(key)) continue;
          if (key in global) continue;

          global[key] = window[key];
        }
      }
    }
  });
};

describe('Browser tests', () => {
  before((done) => {
    server.listen(0, (err) => {
      if (err) return done(err);
      this.port = server.address().port;
      this.url = `http://localhost:${this.port}`;
      dom(this.url, done);
    });
  });

  it('to be implemented', () => {
    assert.equal(window.location.pathname, '/');
    // console.log(serialize(document));
    jsdom.changeURL(window, this.url + '/foo');
    assert.equal(window.location.pathname, '/foo');
  });
});
