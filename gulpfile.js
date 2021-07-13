const { src, dest, watch, task, series, parallel } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const browserSync = require('browser-sync');
const cssnano = require('cssnano');
const rename = require('gulp-rename');
const postcss = require('gulp-postcss');
const csscomb = require('gulp-csscomb');
const autoprefixer = require('autoprefixer');
const mqpacker = require('css-mqpacker');
const sortCSSmq = require('sort-css-media-queries');
const terser = require('gulp-terser');
const concat = require('gulp-concat');
const del = require('del');

const PATH = {
  scssFile: './assets/scss/style.scss',
  scssFiles: './assets/scss/**/*.scss',
  scssFolder: './assets/scss',
  cssFolder: './assets/css',
  cssMinFiles: './assets/css/**/*.min.css',
  htmlFiles: './*.html',
  jsFiles: [
    './assets/js/**/*.js',
    '!./assets/js/**/*.min.js',
    '!./assets/js/**/*all.js'
  ],
  jsFolder: './assets/js',
  jsMinFiles: './assets/js/**/*.min.js',
  jsBundleName: 'all.js',
  buildFolder: 'dest'
};

const PLUGINS = [
  autoprefixer({
    overrideBrowserslist: ['last 5 versions', '> 0.1%'],
    cascade: true
  }),
  mqpacker({ sort: sortCSSmq })
];

function scss() {
  return src(PATH.scssFile)
    .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
    .pipe(postcss(PLUGINS))
    .pipe(dest(PATH.cssFolder))
    .pipe(browserSync.stream());
};

function scssDev() {
  return src(PATH.scssFile, { sourcemaps: true })
    .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
    .pipe(postcss(PLUGINS))
    .pipe(dest(PATH.cssFolder, { sourcemaps: true }))
    .pipe(browserSync.stream());
};

function scssMin() {
  const pluginsExtended = [...PLUGINS, cssnano({ preset: 'default' })]

  return src(PATH.scssFile)
    .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
    .pipe(postcss(pluginsExtended))
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest(PATH.cssFolder))
    .pipe(browserSync.stream());
};

function comb() {
  return src(PATH.scssFiles)
    .pipe(csscomb())
    .pipe(dest(PATH.scssFolder));
};

function syncInit() {
  browserSync.init({
    server: {
      baseDir: './'
    }
  });
};

async function sync() {
  browserSync.reload();
}

function watchFiles() {
  syncInit();
  watch(PATH.scssFiles, scss);
  // watch(PATH.scssFiles, series(scss, scssMin));
  watch(PATH.htmlFiles, sync);
  watch(PATH.jsFiles, sync);
};

function concatJS() {
  return src(PATH.jsFiles)
    .pipe(concat(PATH.jsBundleName))
    .pipe(dest(PATH.jsFolder))
};

function uglifyJS() {
  return src(PATH.jsFiles)
    .pipe(terser({
      toplevel: true,
      output: { quote_style: 3 }
    }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest(PATH.jsFolder))
};

function buildJS() {
  return src(PATH.jsMinFiles)
    .pipe(dest(PATH.buildFolder + '/js'));
};

function buildCSS() {
  return src(PATH.cssMinFiles)
    .pipe(dest(PATH.buildFolder + '/css'));
};

function buildHTML() {
  return src(PATH.htmlFiles)
    .pipe(dest(PATH.buildFolder + '/templates'));
};

async function clearFolder() {
  await del(PATH.buildFolder, { force: true });
  return true;
}

task('scss', scss);
// task('scss', series(scss, scssMin));
task('dev', scssDev);
task('min', scssMin);
task('comb', comb);
task('concat', concatJS);
task('uglify', uglifyJS);
task('build', series(clearFolder, parallel(buildJS, buildCSS, buildHTML)));
task('watch', watchFiles);