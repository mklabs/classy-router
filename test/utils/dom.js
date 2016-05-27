var jsdom = require('jsdom');
var path = require('path');
var { readFileSync: read } = require('fs');

// setup the simplest document possible
let html = read(path.join(__dirname, '../index.html'), 'utf8');
// let html = '<!doctype html><html><body></body></html>';

var doc = jsdom.jsdom(html, {
  // scripts: ['https://code.jquery.com/jquery-2.2.4.js'],
  virtualConsole: jsdom.createVirtualConsole().sendTo(console),
  features: {
    FetchExternalResources: ['script'],
    ProcessExternalResources: ['script'],
    SkipExternalResources: false
  }
});

// get the window object out of the document
var win = doc.defaultView;

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
