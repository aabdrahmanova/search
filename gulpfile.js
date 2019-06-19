const { src, dest, parallel, watch } = require('gulp');
const sass = require('gulp-sass');

function css() {
  return src('src/sass/**/*.scss')
            .pipe(sass())
            .on('error', sass.logError)
            .pipe(dest('src/css'));
}

function watchFiles() {
  watch('src/sass/**/*', css);
}

exports.css = css;
exports.watch = parallel(watchFiles)
exports.default = parallel(css);
