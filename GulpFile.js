var gulp = require('gulp'),
    stylus = require('gulp-stylus');

gulp.task('stylus', function () {
    return gulp.src('./public/css/style.styl')
        .pipe(stylus())
        .pipe(gulp.dest('./public/css/build'));
});


gulp.task('default', ['stylus']);

gulp.task('watch', function () {
    gulp.watch(['./public/css/style.styl'], ['stylus']);
});
