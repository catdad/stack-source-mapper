/* jshint node: true */

var path = require('path');
var util = require('util');

var SourceMapConsumer = require('source-map').SourceMapConsumer;
var stackTrace = require('stack-trace');

module.exports = function (stacktrace, sourcemap, filename) {

  // this feels like a hack... but I guess it works
  var parsedLines = stackTrace.parse({
    stack: stacktrace
  });

  var lines = stacktrace.replace(/\r\n/g, '\n').split('\n');
  var errMsg = lines.shift();

  parsedLines.forEach(function (line, idx) {
    line.lineString = lines[idx];
  });

  var outputLines = [errMsg];
  var root = path.resolve('.');

  var consumer = new SourceMapConsumer(sourcemap);

  return outputLines.concat(parsedLines.map(function (line) {

    if (path.basename(line.getFileName()) !== filename) {
      return line.lineString;
    }

    var errObj = {
      line: line.getLineNumber(),
      column: line.getColumnNumber()
    };

    if (errObj.line === 1) {
      // node issue with adding code to the first line
      errObj.column -= 62;
    }

    var original = consumer.originalPositionFor(errObj);

    if (original.source === null) {
      // this is not part of the file, so return the original line
      return line.lineString;
    }

    var out = util.format(
      '    at %s (%s:%s:%s)',
      original.name || '<anonymous>',
      path.resolve(root, original.source.replace(/^\//, '')),
      original.line,
      original.column
    );

    return out;
  })).join('\n');
};
