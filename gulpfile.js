/*
Copyright (C) 2016 andrea rota <a@xelera.eu>

This file is part of Pattrn - http://pattrn.co/.

Pattrn is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Pattrn is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with Pattrn.  If not, see <http://www.gnu.org/licenses/>.
*/

'use strict';

var gulp = require('gulp');
var clean = require('gulp-clean');
var jade = require('gulp-jade');
var jsonlint = require('gulp-json-lint');
var sass = require('gulp-sass');
var util = require('gulp-util');
var webserver = require('gulp-webserver');

var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');


var config = require('./package.json').pattrn_configuration;

/**
 * @technical-debt: pattrn-data-config.json is not mandatory, as data can be
 * pulled in in a number of different ways, so we should first check for its
 * existence here, and handle this scenario in the install_data_package task
 * accordingly.
 */
config.pattrn_data = require('./pattrn-data-config.json');

/**
 * Copy over assets referenced from vendor stylesheets
 * This is currently configured manually through the assets member of the
 * config.vendor_stylesheets objects, from inspection of the vendor stylesheet
 * files for src references
 * @x-technical-debt: the destination is now hardcoded to /fonts within the
 * destination folder; this works but does not address the general scenario
 * where we may need to copy assets anywhere. we need to iterate over the
 * config.vendor_stylesheets elements, read source *and* destination
 * metadata for each, and pipe things accordingly to destinations.
 */
gulp.task('vendor-stylesheet-assets', function() {
  gulp.src(
    config.vendor_stylesheets
      .filter(item => { return item.assets && item.assets.length > 0; })
      .map(item => item.assets.map(group => group.src))
      .reduce((p, c, i) => { return p.concat(c); }, [])
    )
    .pipe(gulp.dest(config.dest + '/fonts'));
});

gulp.task('bundle', function () {
    return browserify({entries: config.app_main, debug: true})
        .transform(babelify, {presets: ["es2015"]})
        .bundle()
        .pipe(source(config.bundle))
        .pipe(gulp.dest(config.dest));
});

gulp.task('watch', ['bundle'], function () {
    gulp.watch('*.js', ['build']);
});

gulp.task('default', ['watch']);

gulp.task('clean', [], () => {
  return gulp.src(['src/config.json', 'src/data/**/*'], {read: false})
    .pipe(clean());
});

gulp.task('jsonlint', function(){
      gulp.src('js/config.json')
        .pipe(jsonlint())
        .pipe(jsonlint.report('verbose'));
});

gulp.task('views', [], () => {
  gulp.src([`${config.src}/**/*.jade`])
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest(config.dest))
});

gulp.task('sass', function () {
  return gulp.src(config.vendor_stylesheets.map(item => item.stylesheets).concat([ config.src + '/css/**/*.css', config.src + '/css/**/*.scss']))
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(config.dest + '/css'));
});

gulp.task('build', ['jsonlint', 'bundle', 'views', 'sass'], function() {
  gulp.src(['src/**/*'])
    .pipe(gulp.dest('dist'));
});


gulp.task('webserver', function() {
  gulp.src('dist')
    .pipe(webserver({
      host: '0.0.0.0',
      port: '8080',
      livereload: true,
      directoryListing: true
    }));
});
