var gulp = require('gulp'),
  eslint = require('gulp-eslint'),
  stylus = require('gulp-stylus');

gulp.task('stylus', function () {
  return gulp.src('./public/stylus/style.styl')
    .pipe(stylus())
    .pipe(gulp.dest('./public/css/'));
});

gulp.task('lint', function () {
  return gulp.src(['public/js/*'])
    .pipe(eslint({
      'extends': 'eslint:recommended',

      'rules': {
        'no-alert': 2,
        'no-bitwise': 0,
        'camelcase': 1,
        'curly': 0,
        'eqeqeq': 0,
        'no-eq-null': 2,
        'guard-for-in': 1,
        'no-empty': 1,
        'no-use-before-define': 0,
        'no-obj-calls': 2,
        'no-unused-vars': 0,
        'new-cap': 1,
        'no-shadow': 2,
        'strict': 0,
        'no-invalid-regexp': 2,
        'comma-dangle': 2,
        'no-undef': 0,
        'no-new': 1,
        'no-extra-semi': 1,
        'no-debugger': 2,
        'no-caller': 1,
        'semi': 1,
        'quotes': 0,
        'no-unreachable': 2,
        'no-console': 0
      },
      'globals': {
        '$': false
      },

      'env': {
        'node': true
      }
    }))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('default', ['stylus']);

gulp.task('watch', function () {
  gulp.watch(['./public/stylus/components/*.styl', './public/stylus/core/*.styl'], ['stylus', 'lint']);
});
