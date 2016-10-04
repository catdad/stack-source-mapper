/* jshint node: true */

var fs = require('fs');
var path = require('path');
var util = require('util');

var SourceMapConsumer = require('source-map').SourceMapConsumer;

var errFile = fs.readFileSync(path.resolve('bin', 'error.err')).toString().trim();
var mapFile = JSON.parse(fs.readFileSync(path.resolve('bin', 'error.min.js.map')).toString());

var errLines = errFile.replace(/\r\n/g, '\n').split('\n');
var outputLines = [];
var root = path.resolve('.');
var filePath = 'error.min.js';

//console.log(errLines.join('\n'));

// the first line is an error message, so just copy it over
outputLines.push(errLines.shift());

var consumer = new SourceMapConsumer(mapFile);

outputLines = outputLines.concat(errLines.map(function (errLine) {
  var regex = /\((.+):([0-9]+):([0-9]+)\)/;

  var matches = regex.exec(errLine);

  if (!matches) {
    console.log('no matches for line:', errLine);

    return errLine;
  }

  var errObj = {
    filename: path.relative(root, matches[1]),
    line: Number(matches[2]),
    column: Number(matches[3])
  };

  var original = consumer.originalPositionFor(errObj);

  if (original.source === null) {
    // this is not part of the file, so return the original line
    return errLine;
  }

  var out = util.format(
    '    at %s (%s:%s:%s)',
    original.name || '<anonymous>',
    path.resolve(root, original.source),
    original.line,
    original.column
  );

  console.log(errLine, '\n', out, '\n---------------------------');

  return out;
}));

//console.log(outputLines.join('\n'));
