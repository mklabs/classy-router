
const debug = require('debug');
module.exports = tilt;

const Router = require('./index');

class Tilt extends Router {
  get routes () {
    return {
      '/': 'index',
      '/foo': 'foo'
    };
  }

  constructor () {
    super();
    this.debug = debug('tilt');
    debug.enable('tilt*');
  }

  welcome (msg = 'Tilt!') {
    console.log('%c' + msg, 'font-size: 50px; font-weight: 800; color: #727272;');
  }
}

function tilt () {
  return new Tilt();
}
