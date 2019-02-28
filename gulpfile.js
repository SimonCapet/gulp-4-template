// methods are defined using the ES6 destructing assignment syntax
const {src, dest, watch, series, parallel} = require('gulp');

const babel = require('gulp-babel');
const browserSync = require('browser-sync').create();
const cleanCss = require('gulp-clean-css');
const concat = require('gulp-concat');
const del = require('del');
const htmlClean = require('gulp-htmlclean');
const prefix = require('gulp-autoprefixer');
const scss = require('gulp-sass');
const sourceMaps = require('gulp-sourcemaps');
const ts = require('gulp-typescript');
const uglify = require('gulp-uglify');

//image compression plugins
const imageMin = require('gulp-imagemin');
const pngQuant = require('pngquant');
const jpegRecompress = require('imagemin-jpeg-recompress');

sass.compiler = require('node-sass');

// file paths
const paths = {
    src: {
        html: 'src/*.html',
        css: 'src/css/**/*.css',
        images: 'src/assets/images/**/*.{png,jpeg,jpg,svg,gif}',
        js: 'src/scripts/**/*.js',
        sass: 'src/scss/**/*.scss',
        compiledTypescript: 'src/scripts/compiled-typescript',
        typescript: 'src/typescript/**/*ts',
    },
    tmp: {
        imagesIn: 'tmp/assets/images',
        imagesOut: 'tmp/assets/images/**/*.{png,jpeg,jpg,svg,gif}',
        index: 'tmp/*.html',
        path: 'tmp',
        scripts: 'tmp/*.js',
        styles: 'tmp/*.css',
    },
    dist: {
        images: 'dist/assets/images',
        path: 'dist'
    }
};

//Build functions

function cleanBuild() {
    console.log('Removing dist folder');
    return del([
        paths.dist.path
    ])
}

function imagesBuild() {
    console.log('Building images');
    return src(paths.tmp.imagesOut)
        .pipe(imageMin(
            [
                imageMin.gifsicle(),
                imageMin.jpegtran(),
                imageMin.optipng(),
                imageMin.svgo(),
                pngQuant(0),
                jpegRecompress()
            ]
        ))
        .pipe(dest(paths.dist.images))
}

function indexBuild() {
    console.log('Building index');
    return src(paths.tmp.index)
        .pipe(htmlClean())
        .pipe(dest(paths.dist.path))
}

function scriptsBuild() {
    console.log('Building scripts');
    return src(paths.tmp.scripts)
        .pipe(sourceMaps.init())
        .pipe(uglify())
        .pipe(sourceMaps.write())
        .pipe(dest(paths.dist.path))
}

function stylesBuild() {
    console.log('Building styles')
    return src(paths.tmp.styles)
        .pipe(sourceMaps.init())
        .pipe(cleanCss())
        .pipe(sourceMaps.write())
        .pipe(dest(paths.dist.path))
}

function distServer(done) {
    browserSync.init({
        open: true,
        injectChanges: true,
        server: {
            baseDir: './dist'
        },
        port: 8585
    });
    done();
}

//Local functions

function clean() {
    return del([
        paths.tmp.path,
        paths.src.compiledTypescript
    ]);
}

function html() {
    console.log('Change made to an html file');
    return src(paths.src.html)
        .pipe(dest(paths.tmp.path))
        .pipe(browserSync.stream())
}

function images() {
    console.log('Change made to an image file');
    return src(paths.src.images)
        .pipe(dest(paths.tmp.imagesIn))
        .pipe(browserSync.stream())
}

function sass() {
    console.log('Change made to a scss file');
    return src(paths.src.sass)
        .pipe(sourceMaps.init())
        .pipe(prefix({
            browsers: 'last 2 versions'
        }))
        .pipe(scss({
            outputStyle: 'nested'
        }))
        .pipe(sourceMaps.write())
        .pipe(dest(paths.tmp.path))
        .pipe(browserSync.stream())
}

function js() {
    console.log('Change made to a javascript file');
    return src(paths.src.js)
        .pipe(sourceMaps.init())
        .pipe(babel({
            presets: ['@babel/preset-env']
        }))
        .pipe(concat('scripts.js'))
        .pipe(sourceMaps.write())
        .pipe(dest(paths.tmp.path))
        .pipe(browserSync.stream())
}

function typescript() {
    console.log('Change made to a typescript file');
    return src(paths.src.typescript)
        .pipe(sourceMaps.init())
        .pipe(ts({
            target: 'ES5',
            outFile: 'compiled-typescript.js'
        }))
        .pipe(sourceMaps.write())
        .pipe(dest(paths.src.compiledTypescript))
        .pipe(browserSync.stream())
}

// watch files
function watchFiles() {
    console.log('Gulp is watching (⌐■_■)');
    watch(paths.src.html, html);
    watch(paths.src.images, images);
    watch(paths.src.js, js);
    watch(paths.src.sass, sass);
    watch(paths.src.typescript, typescript);
    // watch(paths.src.css, css);
}

function server(done) {
    browserSync.init({
        open: true,
        injectChanges: true,
        server: {
            baseDir: './tmp'
        },
        port: 8500
    });
    done();
}

//define complex tasks. These tasks must be run in series not parallel to avoid timing conflicts.
exports.build = series(cleanBuild, imagesBuild, indexBuild, scriptsBuild, stylesBuild, distServer);
exports.default = series(clean, images, html, sass, typescript, js, server, watchFiles);

//to register a task publicly - so that you can execute the task independently - you must export it here
exports.clean = clean;
exports.distServer = distServer;
exports.html = html;
exports.images = images;
exports.js = js;
exports.sass = sass;
exports.server = server;
exports.typescript = typescript;
exports.watchFiles = watchFiles;
