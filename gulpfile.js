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
var webserver = require('gulp-webserver');

var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');

var config = {
  app_main: 'src/js/app.js',
  bundle: 'js/main.js'
};

gulp.task('bundle', function () {
    return browserify({entries: config.app_main, debug: true})
        .transform(babelify, {presets: ["es2015"]})
        .bundle()
        .pipe(source(config.bundle))
        .pipe(gulp.dest('dist'));
});

gulp.task('watch', ['bundle'], function () {
    gulp.watch('*.js', ['build']);
});

gulp.task('default', ['watch']);

gulp.task('jsonlint', function(){
      gulp.src('js/config.json')
        .pipe(jsonlint())
        .pipe(jsonlint.report('verbose'));
});

gulp.task('build', ['jsonlint', 'bundle'], function() {
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
