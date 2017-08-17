var fs = require('fs');
var path = require('path');
var merge = require('merge-stream');
var gulp = require('gulp');
var less = require('gulp-less');
var cleanCss = require('gulp-clean-css');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var clean = require('gulp-clean');
var appScriptsPath = 'js/app';

function getFolders(dir) {
    // 提取文件夹
    return fs.readdirSync(dir)
        .filter(function (file) {
            return fs.statSync(path.join(dir, file)).isDirectory();
        });
}

gulp.task('build-lib-js', [], function () {
    // 整合引用的script文件
    return gulp.src([
            './lib/angular/angular.min.js',
            './lib/angular-ui-router/angular-ui-router.min.js',
            './lib/ocLazyLoad/ocLazyLoad.min.js',
            './lib/jquery/jquery.min.js'
        ])
        .pipe(concat('lib.min.js', {newLine: '\r\n'}))
        .pipe(gulp.dest('js/dist'));
});

gulp.task('build-app-js', function () {
    // 提取app中各个模块的js整合并压缩至
    var folders = getFolders(appScriptsPath);
    var tasks = folders.map(function (folder) {
        return gulp.src(path.join(appScriptsPath, folder, '/*.js'))
            .pipe(concat(folder + '.js'))
            .pipe(uglify())
            .pipe(gulp.dest('js/dist'))
    });
    return merge(tasks);
});

gulp.task('build-common-js', [], function () {
    // 整合配置相关文件和公共js文件
    return gulp.src([
            'js/core/*.js',
            'js/config/*.js'
        ])
        .pipe(uglify())
        .pipe(concat('common.min.js', {newLine: '\r\n'}))
        .pipe(gulp.dest('js/dist'));
});

gulp.task('concat-js', ['build-lib-js', 'build-common-js'], function () {
    return gulp.src([
            './js/dist/lib.min.js',
            './js/dist/common.min.js'
        ])
        .pipe(concat('all.min.js', {newLine: '\r\n'}))
        .pipe(gulp.dest('js/dist'));
});

gulp.task('build-less', [], function () {
    // 整合less文件
    return gulp.src(['less/reset.less', 'less/index.less', 'less/app/*less'])
        .pipe(concat('index.less'))
        .pipe(less())
        .pipe(cleanCss())
        .pipe(gulp.dest('css/'));
});

gulp.task('clean', ['concat-js'], function () {
    return gulp.src(['js/dist/lib.min.js', 'js/dist/common.min.js'], {read: false})
        .pipe(clean());
});

gulp.task('watch', ['build-less'], function () {
    gulp.watch('less/**/*.less', ['build-less']).on('change', function (event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    });
});

gulp.task('release', ['build-less', 'clean']);

gulp.task('default', ['release']);