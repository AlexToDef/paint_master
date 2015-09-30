var gulp = require('gulp');
var concat = require('gulp-concat');
var coffee = require('gulp-coffee');
var scss = require('gulp-scss');
var sass = require('gulp-sass');
var iconfont = require('gulp-iconfont');
var consolidate = require('gulp-consolidate');
var gutil = require('gulp-util');
var watch = require('gulp-watch');
var batch = require('gulp-batch');
var csscomb = require('gulp-csscomb');

gulp.task('build', function() {
  gulp.src([
      'source/javascripts/essentials/paint_master.coffee',
      'source/javascripts/tools/base_tool.coffee',
      'source/javascripts/tools/*.coffee',
      'source/javascripts/essentials/init.coffee'
      ])
    .pipe(concat('paint_master.coffee'))
    .pipe(coffee({bare: true}))
    .pipe(gulp.dest('./dist'))

  gulp.src([
      'source/stylesheets/toolbox.sass',
      'source/stylesheets/icon_font.sass',
      'source/stylesheets/tools.sass',
      'source/stylesheets/positioning.sass'
      ])
    .pipe(concat('paint_master.sass'))
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('dist/'));

  gulp.src('source/stylesheets/fonts/*.*')
    .pipe(gulp.dest('dist/fonts/'))
});

gulp.task('scripts', function() {
  return gulp.src('./actions/*.js')
    .pipe(concat('all.js'))
    .pipe(gulp.dest('dist/'));
});

gulp.task('scss', function() {
  return gulp.src('source/stylesheets/toolbox.scss')
    .pipe(scss())
    .pipe(gulp.dest('dist/test/ters'));
});

gulp.task('sass', function () {
  gulp.src(['source/stylesheets/toolbox.sass'])
    .pipe(concat('paint_master.sass'))
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('dist/'));
});

gulp.task( 'csscombsass', function( ){
    return gulp.src( 'source/stylesheets/*.sass' )
               .pipe( csscomb( ) )
               .pipe( gulp.dest('source/stylesheets') );
} );

gulp.task('watch', function () {
    watch('source/**/*.*', batch(function (events, done) {
        gulp.start('build', done);
    }));
});

 