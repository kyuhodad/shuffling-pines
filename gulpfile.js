var gulp = require("gulp");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
// var ngmin = require('gulp-ngmin');
var minifycss = require("gulp-minify-css")
var Server = require('karma').Server;
var jshint = require('gulp-jshint');
var connect = require('gulp-connect');

var distRoot = 'dist';
var appRoot = 'app';
var testRoot = 'tests';
var libRoot = 'bower_components';

var appJs = appRoot + '/js';
var appCss = appRoot + '/css';

gulp.task('buildApp', function() {
  return gulp.src(appJs + '/**/*.js')
    .pipe(concat("app.js"))
//    .pipe(ngmin())
//    .pipe(uglify())
    .pipe(gulp.dest(distRoot))
    .pipe(connect.reload());
});

gulp.task("buildLib", function() {
  return gulp.src([
    libRoot + "/jquery/dist/jquery.min.js",
    libRoot + "/angular/angular.js",
    libRoot + "/bootstarp/dist/js/*.min.js"])
    .pipe(concat("lib.js"))
    .pipe(uglify())
    .pipe(gulp.dest(distRoot))
});

gulp.task('buildCSS', function() {
  return gulp.src([
    // libRoot + '/bootstrap/dist/css/bootstrap.min.css'])
    libRoot + '/bootstrap/dist/css/bootstrap.min.css',
    libRoot + '/angular/*.css',
    appCss  + '/**/*.css'])
    .pipe(concat('styles.css'))
    .pipe(minifycss())
    .pipe(gulp.dest(distRoot))
    .pipe(connect.reload());
});

// moveHTML --> dist
gulp.task('moveHTML', function() {
  return gulp.src(appRoot + '/**/*.html')
    .pipe(gulp.dest(distRoot))
    .pipe(connect.reload());
});

gulp.task('build', ['buildApp', 'buildLib', 'buildCSS', 'moveHTML']);

gulp.task('karma', function (done) {
  new Server({
    configFile:__dirname + '/karma.conf.js',
    singleRun: true
  }, done).start();
});

gulp.task('jshint', function () {
  return gulp.src([appJs + '/**/*.js', testRoot + '/**/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
});

gulp.task('test', ['karma', 'jshint']);

gulp.task('connect', function(){
  connect.server({
    root: distRoot,
    livereload: true
  });
});

gulp.task('watch', function () {
  gulp.watch(appJs    + '/**/*.js',   ['buildApp', 'test']);
  gulp.watch(testRoot + '/**/*.js',   ['test']);
  gulp.watch(appCss   + '/**/*.css',  ['buildCSS']);
  gulp.watch(appRoot  + '/**/*.html', ['moveHTML']);
});

gulp.task('watchRun', ['watch', 'connect']);

gulp.task('default', ['build', 'test', 'watch', 'connect']);
