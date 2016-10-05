/* jshint node: true */

var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');

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
