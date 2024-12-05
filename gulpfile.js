const gulp = require('gulp');
const fileInclude = require('gulp-file-include');
const rename = require('gulp-rename');
const path = require('path');
const merge = require('merge-stream');
const inlineSource = require('gulp-inline-source');

const folders = [
    { folder: 'azimut/anthena', output: 'anthena.html' },
    { folder: 'azimut/angle', output: 'angle.html' }
];

gulp.task('default', function () {

    const streams = folders.map(config => {
        return gulp.src('src/azimut/calc.html')
            .pipe(inlineSource({ rootpath: 'src/azimut' }))
            .pipe(fileInclude({
                prefix: '@@',
                basepath: path.join('src', config.folder)
            }))
            .pipe(rename(config.output))
            .pipe(gulp.dest('dosc'));
    });

    streams.push(gulp.src('src/index.html')
        .pipe(gulp.dest('dosc')));

    streams.push(gulp.src('src/favicon.ico')
        .pipe(gulp.dest('dosc')));

    return merge(...streams);
});
