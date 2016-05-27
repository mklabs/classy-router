const path = require('path');
const http = require('http');
var browserify = require('browserify');
const { createReadStream: read } = require('fs');

let server = module.exports = http.createServer((req, res) => {
  if (req.url !== '/bundle.js') return read(path.join(__dirname, '../index.html')).pipe(res);

  var file = path.join(__dirname, 'bundle.js');
  res.setHeader('content-type', 'application/javascript');

  var b = browserify(file, { debug: true }).bundle();
  b.on('error', (err) => { console.error(err.message); });
  b.pipe(res);
});

if (process.env.PORT) {
  server.listen(process.env.PORT, console.log.bind(console, 'Listening on %s', process.env.PORT));
}
