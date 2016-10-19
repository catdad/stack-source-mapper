/* jshint node: true, mocha: true */

var expect = require('chai').expect;

var mapper = require('../');

describe('[index]', function () {
  it('transforms a stacktrace using the source map');

  it('throws if stacktrace is not a string', function () {
    expect(mapper.bind(null, 14)).to.throw(TypeError, 'stacktrace must be a string');
  });
  it('throws if sourcemap is not an object');
});
