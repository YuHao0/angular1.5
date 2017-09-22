var fs = require('fs');
var path = require('path');
var merge = require('merge-stream');
var gulp = require('gulp');
var less = require('gulp-less');
var cleanCss = require('gulp-clean-css');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var clean = require('gulp-clean');
var rev = require('gulp-rev');
var replace = require('gulp-replace');
var revReplace = require("gulp-rev-replace");
var revFormat = require('gulp-rev-format');
var appScriptsPath = 'js/app';

function getFolders(dir) {
    // 提取文件夹
    return fs.readdirSync(dir)
        .filter(function (file) {
            return fs.statSync(path.join(dir, file)).isDirectory();
        });
}

gulp.task('build-app-js', function () {
    // 提取app中各个模块的js整合并压缩
    var folders = getFolders(appScriptsPath);
    var tasks = folders.map(function (folder) {
        return gulp.src(path.join(appScriptsPath, folder, '/*.js'))
            .pipe(concat(folder + '.js'))
            .pipe(uglify())
            .pipe(gulp.dest('dist/'))
    });
    return merge(tasks);
});

gulp.task('build-lib-js', [], function () {
    // 整合引用的script文件
    return gulp.src([
            './lib/angular/angular.min.js',
            './lib/angular-ui-router/angular-ui-router.min.js',
            './lib/angular-resource/angular-resource.min.js',
            './lib/ocLazyLoad/ocLazyLoad.min.js',
            './lib/jquery/jquery.min.js',
            './lib/messenger/messenger.min.js'
        ])
        .pipe(concat('lib.min.js', {newLine: '\r\n'}))
        .pipe(gulp.dest('dist/'));
});

gulp.task('build-common-js', [], function () {
    // 整合配置相关文件和公共js文件
    return gulp.src([
            'js/config/*.js',
            'js/core/dashboard.js',
            'js/core/utils.js',
            'js/core/main.js'
        ])
        .pipe(uglify())
        .pipe(concat('common.min.js', {newLine: '\r\n'}))
        .pipe(gulp.dest('dist/'));
});

gulp.task('concat-js', ['build-lib-js', 'build-common-js'], function () {
    return gulp.src([
            'dist/lib.min.js',
            'dist/common.min.js'
        ])
        .pipe(concat('all.min.js', {newLine: '\r\n'}))
        .pipe(gulp.dest('dist/'))
});

gulp.task('build-less', [], function () {
    // 整合less文件
    return gulp.src(['less/reset.less', 'less/index.less', 'less/app/*less'])
        .pipe(concat('all.min.less'))
        .pipe(less())
        .pipe(cleanCss())
        .pipe(gulp.dest('dist/'))
});

gulp.task('clean', ['concat-js'], function () {
    // 清除lib和common生成的中间文
    return gulp.src(['dist/lib.min.js', 'dist/common.min.js'], {read: false})
        .pipe(clean());
});

gulp.task('rev', ['build-less','concat-js'], function () {
    // 生成版本号清单
    return gulp.src(['dist/all.*'])
        .pipe(rev())
        .pipe(revFormat({
            prefix: '.',
            suffix: '.cache',
            lastExt: false
        }))
        .pipe(rev.manifest())
        .pipe(gulp.dest("rev/"));
});

gulp.task('add-version', ['rev'], function () {
    //替换版本号
    var manifest = gulp.src('rev/rev-manifest.json');

    function modifyUnreved(filename) {
        return filename;
    }

    function modifyReved(filename) {
        if (filename.indexOf('.cache') > -1) {
            const _version = filename.match(/\.[\w]*\.cache/)[0].replace(/(\.|cache)*/g, "");
            const _filename = filename.replace(/\.[\w]*\.cache/, "");
            filename = _filename + "?v=" + _version;
            return filename;
        }
        return filename;
    }

    return gulp.src(['index.html'])
        .pipe(replace(/(\.[a-z]+)\?(v=)?[^\'\"\&]*/g, "$1"))
        .pipe(revReplace({
            manifest: manifest,
            modifyUnreved: modifyUnreved,
            modifyReved: modifyReved
        }))
        .pipe(gulp.dest('./'));
});

gulp.task('watch', ['build-less', 'build-app-js'], function () {
    // 开启文件监听,自动编译模块中文件
    gulp.watch('less/**/*.less', ['build-less']).on('change', function (event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    });
    gulp.watch('js/app/**/*.js', ['build-app-js']).on('change', function (event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    });
});

gulp.task('release', ['build-less', 'build-app-js', 'concat-js', 'clean', 'add-version']);

gulp.task('default', ['release']);