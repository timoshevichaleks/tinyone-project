'use strict';

require('../../gulp/gulp-init.js')({HTML: '.'});

const comb = require('../../gulp/tasks/comb');
const cs = require('../../gulp/tasks/create-structure');
const { scss, scssDev } = require('../../gulp/tasks/scss.js');
const mincss = require('../../gulp/tasks/mincss');
const uglifyes = require('../../gulp/tasks/uglify').uglifyes;
const { sync, syncInit } = require('../../gulp/tasks/sync');

function watchFiles () {
    syncInit();
    watch($.path.scss.files, series(scss));
    watch([$.path.js.files, '!' + $.path.js.filesMin], series(uglifyes, sync));
    watch($.path.html.files, sync);
}

task('cs', cs);
task('combScss', comb);
task('uglifyEs6', series(uglifyes, sync));
task('sass', series(scss));
task('sassDev', series(scssDev));
task('watch', watchFiles);
