const {src, dest, watch, series, parallel} = require('gulp');

const browserSync = require('browser-sync').create();
const cleanCss = require('gulp-clean-css');
const concat = require('gulp-concat');
const del = require('del');
const gulpBabel = require('gulp-babel');
const htmlClean = require('gulp-htmlclean');
const gulpPug = require('gulp-pug');
const postCss = require('gulp-postcss');
const prefix = require('gulp-autoprefixer');
const gulpSass = require('gulp-sass');
styles.compiler = require('node-sass');
const sourceMaps = require('gulp-sourcemaps');
const gulpTs = require('gulp-typescript');
const uglify = require('gulp-uglify');

//image compression plugins
const imageMin = require('gulp-imagemin');
const pngQuant = require('pngquant');
const jpegRecompress = require('imagemin-jpeg-recompress');

// file paths
const paths = {
    src: {
        path: 'src',
        assets: 'src/assets/**/*{png,jpeg,jpg,svg,gif}',
        pug: 'src/static-templates/**/*.pug',
        styles: 'src/static-templates/styles/styles.scss',
        scripts: 'src/static-templates/scripts/**/*ts'
    },
    tmp: {
        path: 'tmp',
        assetsIn: 'tmp/assets',
        assetsOut: 'tmp/assets/**/*{png,jpeg,jpg,svg,gif}',
        pug: 'tmp/static-templates',
        stylesIn: 'tmp/static-templates/styles',
        stylesOut: 'tmp/static-templates/styles/styles.css',
        scripts: 'tmp/static-templates/scripts'
    },
    dist: {
        path: 'dist/static-templates',
        assets: 'dist/static-templates/assets',
        scripts: 'dist/static-templates/scripts',
        styles: 'dist/static-templates/styles'
    }
};

//Build functions

function cleanBuild() {
    return del([
        paths.dist.path
    ])
}

function assetsBuild() {
    console.log('...building assets...');
    return src(paths.tmp.assetsOut)
        .pipe(sourceMaps.init())
        .pipe(sourceMaps.write())
        .pipe(dest(paths.dist.assets))
}

function stylesBuild() {
    console.log('...building css...');
    return src(paths.tmp.stylesOut)
        .pipe(sourceMaps.init())
        .pipe(cleanCss({debug: true}, (details) => {
            console.log(`${details.name}: ${details.stats.originalSize}`);
            console.log(`${details.name}: ${details.stats.minifiedSize}`);
        }))
        .pipe(sourceMaps.write())
        .pipe(dest(paths.dist.styles))
}

// function scriptsBuild() {
//     console.log('...building scripts...')
//     return src(paths.tmp.)
//         .pipe(gulpTs({
//             noImplicitAny: false,
//             suppressImplicitAnyIndexErrors: true,
//             target: 'ES5'
//         }))
//         .pipe(uglify())
//         .pipe(dest(paths.dist.scripts))
// }

//Local functions

function clean() {
    return del([
        paths.tmp.path
    ])
}

function assets() {
    console.log('Change made to an image file');
    return src(paths.src.assets)
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
        .pipe(dest(paths.tmp.assetsIn))
        .pipe(browserSync.stream())
}

function pug() {
    console.log('Change made to a pug file');
    return src(paths.src.pug)
        .pipe(gulpPug({
            doctype: 'html',
            pretty: true
        }))
        .pipe(dest(paths.tmp.pug))
        .pipe(browserSync.stream())
}

function scripts() {
    console.log('Change made to a typescript file');
    return src(paths.src.scripts)
        .pipe(gulpTs({
            noImplicitAny: false,
            suppressImplicitAnyIndexErrors: true,
            target: 'ES5'
        }))
        .pipe(gulpBabel())
        .pipe(dest(paths.tmp.scripts))
        .pipe(browserSync.stream())
}

function styles() {
    console.log('Change made to a scss file');
    return src(paths.src.styles)
        .pipe(sourceMaps.init())
        // .pipe(postCss([
        //     require('postcss-nested')
        // ], {syntax: require('postcss-scss')}))
        // .pipe(prefix({
        //     browsers: 'last 2 versions'
        // }))
        .pipe(gulpSass())
        .pipe(sourceMaps.write())
        .pipe(dest(paths.tmp.stylesIn))
        .pipe(browserSync.stream())
}

function server(done) {
    browserSync.init({
        open: true,
        injectChanges: true,
        server: {
            baseDir: './dist/landing-pages/ukbc/',
        },
        port: 5800,
    })
    ;
    done();
}

function watchFiles() {
    console.log('Gulp is watching (⌐■_■)');
    watch(paths.src.assets, assets);
    watch(paths.src.pug, pug);
    watch(paths.src.scripts, scripts);
}

exports.default = series(clean, assets, pug, scripts, styles, server, watchFiles);
exports.build = series(cleanBuild, assetsBuild, stylesBuild);

//build exports
exports.assetsBuild = assetsBuild;
exports.cleanBuild = cleanBuild;
// exports.scriptsBuild = scriptsBuild;
exports.stylesBuild = stylesBuild;

//local exports
exports.clean = clean;
exports.assets = assets;
exports.pug = pug;
exports.server = server;
exports.scripts = scripts;
exports.styles = styles;

