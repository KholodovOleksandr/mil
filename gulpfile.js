const gulp = require('gulp');
const fileInclude = require('gulp-file-include');
const rename = require('gulp-rename');
const path = require('path');
const merge = require('merge-stream');
const inlineSource = require('gulp-inline-source');

const folders = [
    { folder: 'azimuth/antenna', output: 'antenna.html' },
    { folder: 'azimuth/angle', output: 'angle.html' }
];

gulp.task('default', function () {

    const streams = folders.map(config => {
        return gulp.src('src/azimuth/calc.html')
            .pipe(inlineSource({ rootpath: 'src/azimuth' }))
            .pipe(fileInclude({
                prefix: '@@',
                basepath: path.join('src', config.folder)
            }))
            .pipe(rename(config.output))
            .pipe(gulp.dest('docs'));
    });

    streams.push(gulp.src('src/index.html')
        .pipe(gulp.dest('docs')));

    streams.push(gulp.src('src/favicon.ico')
        .pipe(gulp.dest('docs')));

    return merge(...streams);
});
