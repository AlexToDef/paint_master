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
var autoprefixer = require('gulp-autoprefixer');
var server = require('gulp-server-livereload');

gulp.task('build', function() {
  gulp.src([
      'source/javascripts/essentials/namespace_initializer.coffee',
      'source/javascripts/essentials/modules/attribute_events.coffee',
      'source/javascripts/essentials/modules/canvas_elements.coffee',
      'source/javascripts/essentials/modules/events_listeners.coffee',
      'source/javascripts/essentials/paint_master.coffee',
      'source/javascripts/settings/base_setting.coffee',
      'source/javascripts/settings/*.coffee',
      'source/javascripts/tools/base_tool.coffee',
      'source/javascripts/tools/*.coffee',
      'source/javascripts/essentials/init.coffee'
      ])
    .pipe(concat('paint_master.coffee'))
    .pipe(coffee({bare: true}))
    .pipe(gulp.dest('./dist'))

  gulp.src([
      'source/stylesheets/pm_variables.sass',
      'source/stylesheets/icon_font.sass',
      'source/stylesheets/pm_bar.sass',
      'source/stylesheets/pm_overlay.sass',
      'source/stylesheets/pm_tools.sass',
      'source/stylesheets/pm_settings.sass',
      'source/stylesheets/pm_positioning.sass'
      ])
    .pipe(concat('paint_master.sass'))
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(gulp.dest('dist/'));

  gulp.src('source/stylesheets/fonts/*.*')
    .pipe(gulp.dest('dist/fonts/'))

  gulp.src('source/stylesheets/font-awesome-fonts/*.*')
    .pipe(gulp.dest('dist/font-awesome-fonts/'))

  gulp.src('source/stylesheets/custom-fonts/*.*')
    .pipe(gulp.dest('dist/custom-fonts/'))
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

gulp.task('webserver', function() {
  gulp.src('source')
    .pipe(server({
      livereload: true,
      directoryListing: true,
      open: true
    }));
});

 