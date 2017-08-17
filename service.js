var connect = require('connect');
var gulp = require('gulp');
var serveStatic = require('serve-static');
connect().use(serveStatic(__dirname)).listen(9090);
gulp.start();