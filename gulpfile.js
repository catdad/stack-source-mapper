/* jshint node: true */

var path = require('path');
var fs = require('fs');

var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var shellton = require('shellton');
var del = require('del');
var sequence = require('run-sequence').use(gulp);

function getStackTrace(file, done) {
  shellton('node ' + file, function (err, stdout, stderr) {
    // we expect err code 1, but if anything else happens,
    // treat that as an error
    if (err && err.code !== 1) {
      return done(err);
    }

    var stack = stderr.replace(/\r\n/g, '\n').split('\n').slice(4).join('\n');

    done(null, stack);
  });
}

function saveStackTrace(nodefile, stackfile, done) {
  getStackTrace(nodefile, function (err, stack) {
    fs.writeFile(stackfile, stack, done);
  });
}

gulp.task('stack:minified', function (done) {
  saveStackTrace(
    path.join('bin', 'error.min.js'),
    path.resolve('bin', 'error.err'),
    done
  );
});

gulp.task('stack:source', function (done) {
  saveStackTrace(
    path.join('fixtures', 'error.js'),
    path.resolve('bin', 'error.control.err'),
    done
  );
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

gulp.task('prep', function (done) {
  return sequence('clean', 'fixtures', 'stack', done);
});
