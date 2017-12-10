const gulp = require('gulp');

const pug = require('gulp-pug');

const sass = require('gulp-sass');
const sassGlob = require('gulp-sass-glob');
const groupMediaQueries = require('gulp-group-css-media-queries');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');

const concat = require('gulp-concat');
const babel = require('gulp-babel');

const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const replace = require('gulp-replace');
const del = require('del');
const plumber = require('gulp-plumber');

const gulpWebpack = require('gulp-webpack');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');

const browserSync = require('browser-sync').create();

const paths = {
    build: './build',                               // paths.build
    templates: {
        pages: 'src/templates/pages/*.pug',         //paths.templates.pages
        src: 'src/templates/**/*.pug',              //paths.templates.src
    },
    styles: {
        src: 'src/styles/**/*.scss',                //paths.styles.src
        dest: 'build/assets/styles/'                //paths.styles.dest
    },    
    img: {
        src: 'src/img/**/*.*',                      //paths.img.src
        dest: 'build/assets/img/'                   //paths.img.dest
    },
    fonts: {
        src: 'src/fonts/**/*.*',                   //paths.fonts.src
        dest: 'build/assets/fonts/'                //paths.fonts.dest
    },
    scripts: {
        src: 'src/scripts/**/*.js',                 //paths.scripts.src
        dest: 'build/assets/scripts/'               //paths.scripts.dest
    }
}

// pug
function templates() {
    return gulp.src(paths.templates.pages)
        .pipe(plumber())
        .pipe(pug({ pretty: true }))
        .pipe(gulp.dest(paths.build));
}

// scss
function styles() {
    return gulp.src('./src/styles/main.scss')
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(sassGlob())
        .pipe(sass({outputStyle: 'compressed'}))
        .pipe(groupMediaQueries())
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(cleanCSS())
        .pipe(rename({suffix: '.min'}))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(paths.styles.dest))
}

// webpack
function scripts() {
    return gulp.src('src/scripts/main.js')
        .pipe(plumber())
        .pipe(gulpWebpack(webpackConfig, webpack)) 
        .pipe(gulp.dest(paths.scripts.dest));
}

// clean
function clean() {
    return del(paths.build);
}

// gulp watch
function watch() {
    gulp.watch(paths.styles.src, styles);
    gulp.watch(paths.templates.src, templates);
    gulp.watch(paths.img.src, img);
    gulp.watch(paths.scripts.src, scripts);
}

// server(livereload)
function server() {
    browserSync.init({
        server: paths.build
    });
    browserSync.watch(paths.build + '/**/*.*', browserSync.reload);
}

// replace img
function img() {
    return gulp.src(paths.img.src)
        .pipe(gulp.dest(paths.img.dest));
}

// replace fonts
function fonts() {
    return gulp.src(paths.fonts.src)
        .pipe(gulp.dest(paths.fonts.dest));
}

exports.templates = templates;
exports.styles = styles;
exports.scripts = scripts;
exports.clean = clean;
exports.img = img;
exports.fonts = fonts;
exports.watch = watch;

gulp.task('default', gulp.series(
    clean,
    gulp.parallel(styles, templates, img, fonts, scripts),
    gulp.parallel(watch, server)
));