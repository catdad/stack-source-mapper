/* jshint node: true */

var fs = require('fs');
var path = require('path');

var errFile = fs.readFileSync(path.resolve('bin', 'error.err')).toString().trim();
var mapFile = JSON.parse(fs.readFileSync(path.resolve('bin', 'error.min.js.map')).toString());

var filePath = 'error.min.js';

var mapper = require('./');

var result = mapper(errFile, {
  '**/error.min.js': mapFile
}, {
  root: process.cwd()
});

console.log(result);
