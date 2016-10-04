/* jshint node: true */

var path = require('path');
var util = require('util');

var SourceMapConsumer = require('source-map').SourceMapConsumer;

module.exports = function (stacktrace, sourcemap) {

  var errLines = stacktrace.replace(/\r\n/g, '\n').split('\n');

  var outputLines = [];
  var root = path.resolve('.');

  // the first line is an error message, so just copy it over
  outputLines.push(errLines.shift());

  var consumer = new SourceMapConsumer(sourcemap);

  outputLines = outputLines.concat(errLines.map(function (errLine) {
  //  var regex = /\((.+):([0-9]+):([0-9]+)\)/;
    var regex = /^ +at.+\((.*):([0-9]+):([0-9]+)/;

    var matches = regex.exec(errLine);

    if (!matches) {
  //    console.log('no matches for line:', errLine);

      return errLine;
    }

    var errObj = {
      filename: path.relative(root, matches[1]),
      line: Number(matches[2]),
      column: Number(matches[3])
    };

    console.log(errObj);

    var original = consumer.originalPositionFor(errObj);

    console.log(original);

    if (original.source === null) {
      // this is not part of the file, so return the original line
      return errLine;
    }

    var out = util.format(
      '   at %s (%s:%s:%s)',
      original.name || '<anonymous>',
      path.resolve(root, original.source.replace(/^\//, '')),
      original.line,
      original.column
    );

    console.log(errLine, '\n', out, '\n---------------------------');

    return out;
  }));

  return outputLines.join('\n');
};
