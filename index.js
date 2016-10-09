/* jshint node: true */

var path = require('path');
var util = require('util');

var _ = require('lodash');
var Minimatch = require('minimatch').Minimatch;
var SourceMapConsumer = require('source-map').SourceMapConsumer;
var stackTrace = require('stack-trace');

function parseStacktrace(stacktrace) {
  // this feels like a hack... but I guess it works
  var parsedLines = stackTrace.parse({
    stack: stacktrace
  });

  var lines = stacktrace.replace(/\r\n/g, '\n').split('\n');
  var errMsg = lines.shift();

  parsedLines.forEach(function (line, idx) {
    line.lineString = lines[idx];
  });

  return {
    message: errMsg,
    lines: parsedLines
  };
}

function createDecoder(sourcemaps, options) {
  var maps = _.reduce(sourcemaps, function (memo, map, pattern) {
    memo[pattern] = {
      map: map,
      consumer: new SourceMapConsumer(map),
      matcher: new Minimatch(pattern),
      pattern: pattern
    };

    return memo;
  }, {});

  return function decoder(line) {
    var filename = line.getFileName();
    var mapper = _.find(maps, function (map) {
      return map.matcher.match(filename);
    });

    if (!mapper) {
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

    var original = mapper.consumer.originalPositionFor(errObj);

    if (original.source === null) {
      // this is not part of the file, so return the original line
      return line.lineString;
    }

    var out = util.format(
      '    at %s (%s:%s:%s)',
      original.name || '<anonymous>',
      options.root ?
        path.resolve(options.root, original.source.replace(/^\//, '')) :
        original.source.replace(/^\//, ''),
      original.line,
      original.column
    );

    return out;
  };
}

module.exports = function (stacktrace, sourcemaps, options) {
  options = options || {};

  var stack = parseStacktrace(stacktrace);
  var decoder = createDecoder(sourcemaps, options);

  return [stack.message].concat(stack.lines.map(function (line) {
    return decoder(line);
  })).join('\n');
};
