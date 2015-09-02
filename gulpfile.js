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
      'source/stylesheets/tools.sass'
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

// gulp.task('default', function() {
//   // place code for your default task here
// });

// gulp.task('scripts', function() {
//   return gulp.src('./actions/*.js')
//     .pipe(concat('all.js'))
//     .pipe(gulp.dest('dist/'));
// });
 
// gulp.task('build', function() {
//   gulp.src(['source/javascripts/essentials/paint_me.coffee',
//             'source/javascripts/essentials/toolbar.coffee',
//             'source/javascripts/actions/*.coffee',
//             'source/javascripts/tools/*.coffee'])
//     .pipe(concat('paintme.coffee'))
//     .pipe(coffee({bare: true}))
//     .pipe(gulp.dest('./dist'))
    
//   gulp.src('source/stylesheets/*.scss')
//     .pipe(scss())
//     .pipe(concat('paintme.css'))
//     .pipe(gulp.dest('./dist/'))
// });

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

// gulp.task('iconfont', function(){
//   gulp.src(['icons/*.svg'])
//     .pipe(iconfont({
//       fontName: 'PaintMeIcons', // required 
//       appendUnicode: true, // recommended option 
//       normalize: true,
//       fontHeight: 1001
//     }))
//       .on('glyphs', function(glyphs, options) {
//         // CSS templating, e.g. 
//         console.log(glyphs, options);
//       })
//     .pipe(gulp.dest('dist/fonts/'));
// });

// gulp.task('stream', function () {
//     return gulp.src('source/**/*.*')
//         .pipe(gulp.dest('build'));
// });
 
gulp.task('watch', function () {
    watch('source/**/*.*', batch(function (events, done) {
        gulp.start('build', done);
    }));
});

// gulp.task('callback', function (cb) {
//     watch('css/**/*.css', function () {
//         gulp.src('css/**/*.css')
//             .pipe(watch('css/**/*.css'))
//             .on('end', cb);
//     });
// });
 