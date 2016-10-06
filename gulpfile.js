/* jshint node: true */

var path = require('path');
var fs = require('fs');

var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var shellton = require('shellton');
var del = require('del');

function getStackTrace(file, done) {
  shellton('node ' + file, function (err, stdout, stderr) {
    stderr = stderr.replace(/\r\n/g, '\n');

    var stack = stderr.split('\n').slice(4).join('\n');

    done(null, stack);
  });
}

gulp.task('stack:minified', function (done) {
  var file = path.join('bin', 'error.min.js');

  getStackTrace(file, function (err, stack) {
    fs.writeFile(path.resolve('bin', 'error.err'), stack, done);
  });
});

gulp.task('stack:source', function (done) {
  var file = path.join('fixtures', 'error.js');

  getStackTrace(file, function (err, stack) {
    fs.writeFile(path.resolve('bin', 'error.control.err'), stack, done);
  });
});

gulp.task('stack', ['stack:source', 'stack:minified']);

gulp.task('fixtures', function () {
  return gulp.src('fixtures/*.js')
    .pipe(sourcemaps.init())
    .pipe(uglify({
      mangle: true,
      preserveComments: 'all'
    }))
    .pipe(rename({
      suffix: '.min',
      extname: '.js'
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('bin'));
});

gulp.task('clean', function () {
  return del('bin');
});
