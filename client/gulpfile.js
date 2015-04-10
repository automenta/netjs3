// TODO: 0, build/*
// TODO: 1, client/client.js
// TODO: 2, client/client.map
// TODO: 3, client/client.*.js
// TODO: 4, client/client.*.map
// TODO: 5, client/test/testclient.js
var gulp = require('gulp');
var rename = require('gulp-rename');
var browserify = require('gulp-browserify');
var mocha = require('gulp-mocha');
var del = require('del');
var uglify = require('gulp-uglify');
var iff = require('gulp-if');

var production = false;

gulp.task('authors', function () {
    return gulp
        .src('Ward Cunningham <ward@c2.com>,Stephen Judkins <stephen.judkins@gmail.com>,Sam Goldstein <sam@aboutus.org>,Steven Black <steveb@stevenblack.com>,Don Park <don@donpark.org>,Sven Dowideit <SvenDowideit@fosiki.com>,Adam Solove <asolove@gmail.com>,Nick Niemeir <nick.niemeir@gmail.com>,Erkan Yilmaz <erkan77@gmail.com>,Matt Niemeir <matt.niemeir@gmail.com>,Daan van Berkel <daan.v.berkel.1980@gmail.com>,Nicholas Hallahan <nick@theoutpost.io>,Ola Bini <ola.bini@gmail.com>,Danilo Sato <dtsato@gmail.com>,Henning Schumann <henning.schumann@gmail.com>,Michael Deardeuff <michael.deardeuff@gmail.com>,Pete Hodgson <git@thepete.net>,Marcin Cieslak <saper@saper.info>,M. Kelley Harris (http://www.kelleyharris.com),Ryan Bennett <nomad.ry@gmail.com>,Paul Rodwell <paul.rodwell@btinternet.com>,David Turnbull <dturnbull@gmail.com>,Austin King <shout@ozten.com>')
        .pipe(gulp.dest('prior'))
        ;
});

gulp.task('clean', function (cb) {
    del([
        'build/*', 'client/client.js', 'client/client.map', 'client/client.*.js', 'client/client.*.map', 'client/test/testclient.js'
    ], cb);
});


gulp.task('packageClient', function (cb) {
    return gulp
        .src('./index.js')
        .pipe(browserify({
            debug: !production
        }))
        .pipe(iff(production, uglify({
            compress: production,
            sourceMap: true,
            sourceMapRoot: "/",
            sourceMapName: 'client/client.map',
            banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
            ' * Copyright <%= grunt.template.today("yyyy") %> <%= pkg.author.name %> and other contributors;' +
            ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
        })))
        .pipe(gulp.dest('client',cb));
});

gulp.task('testClient', function (cb) {
    return gulp
        .src('./testclient.js')
        .pipe(browserify())
        .pipe(gulp.dest('client/test',cb));
});

gulp.task('mochaTest', function (cb) {
    return gulp.src([
        'test/util.js',
        'test/random.js',
        'test/page.js',
        'test/lineup.js',
        'test/drop.js',
        'test/revision.js',
        'test/resolve.js',
        'test/wiki.js'
    ]).pipe(mocha({reporter: 'spec'},cb));
});

gulp.task('watch', function () {
    gulp.watch(['lib/*.js', '*.js', 'test/*.js'], ['build']);
});


gulp.task('update-authors', undefined);

gulp.task('build', [
    "clean", "packageClient", "testClient"]);

gulp.task('test', [ "mochaTest" ]);

gulp.task('default', ["build"]);

