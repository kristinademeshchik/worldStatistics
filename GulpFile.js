var gulp = require('gulp'),
    stylus = require('gulp-stylus');

gulp.task('stylus', function () {
    return gulp.src('./public/stylus/style.styl')
        .pipe(stylus())
        .pipe(gulp.dest('./public/css/'));
});


gulp.task('default', ['stylus']);

gulp.task('watch', function () {
    gulp.watch(['./public/stylus/components/*.styl', './public/stylus/core/*.styl'], ['stylus']);
});
