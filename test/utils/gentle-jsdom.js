const http = require('http');
const jsdom = require('jsdom');
const { Test } = require('supertest');

// const path = require('path');
// const { readFileSync: read } = require('fs');

let html = '<!doctype html><html><body></body></html>';

let gentle = module.exports = (url, app, opts = {}) => {
  app = app || http.createServer((req, res) => res.end(html));
  return new DOM(app, 'get', url);
};

gentle.changeURL = (win = global.window, url) => {
  return jsdom.changeURL(win, url);
};

class DOM extends Test {
  // expect (reg) {
  //   if (typeof reg === 'string') reg = new RegExp(reg, 'gim');
  //   return this;
  // }
  //
  // end (done) {
  //   done();
  //   return this;
  // }
  end (done) {
    // let end = Test.prototype.end;
    this.initJSDom((err) => {
      if (err) return done(err);

      console.log('call end', done + '', err);
      // return done();
      Test.prototype.end.call(this, () => {
        console.log('call end', done + '', err);
        done();
      });
    });
  }

  initJSDom (done) {
    console.log('init dom', this.serverAddress(this.app, '/'));

    var doc = jsdom.env({
      // scripts: ['https://code.jquery.com/jquery-2.2.4.js'],
      url: this.serverAddress(this.app, '/'),
      virtualConsole: jsdom.createVirtualConsole().sendTo(console),
      features: {
        FetchExternalResources: ['script'],
        ProcessExternalResources: ['script'],
        SkipExternalResources: false
      },

      done () {
        console.log('done');
        done();
      },

      onload () {
        console.log('onload');
      }
    });

    // get the window object out of the document
    var win = doc.defaultView;

    // win.on('load', console.log.bind(console, 'win load'));

    // set globals for mocha that make access to document and window feel
    // natural in the test environment
    global.document = doc;
    global.window = win;

    // take all properties of the window object and also attach it to the
    // mocha global object
    propagateToGlobal(win);

    // from mocha-jsdom https://github.com/rstacruz/mocha-jsdom/blob/master/index.js#L80
    function propagateToGlobal (window) {
      for (let key in window) {
        if (!window.hasOwnProperty(key)) continue;
        if (key in global) continue;

        global[key] = window[key];
      }
    }

    return doc;
  }
}
