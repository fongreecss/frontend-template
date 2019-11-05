const gulp = require('gulp');
const path = require('path');
const copy = require('gulp-copy');
const data = require('gulp-data');
const eslint = require('gulp-eslint');
const twig = require('gulp-twig');
const prefix = require('gulp-autoprefixer');
const sass = require('gulp-sass');
const tildeImporter = require('node-sass-tilde-importer');
const imagemin = require('gulp-imagemin');
const plumber = require('gulp-plumber');
const webpackStream = require('webpack-stream');
const browserSync = require('browser-sync');
const webpack = require('webpack');
const through = require('through2');
const notify = require('gulp-notify');
const sourcemaps = require('gulp-sourcemaps');
const rev = require('gulp-rev');
const revdel = require('gulp-rev-del');
const collect = require('gulp-rev-collector');
const replace = require('gulp-string-replace');
const clean = require('gulp-rimraf');
const fs = require('fs');
const purgecss = require('gulp-purgecss');
const gulpIf = require('gulp-if');
const postcss = require('gulp-postcss');


/*
 * Load environemnt variables
 */
require('dotenv').config();

/**
 * Should we use purgeCSS in production
 */
const purgeCssOnBuild = true;

/**
 * Wordpress theme directory
 */
const wordpress = process.env.SITE_NAME

/*
 * Directories
 */
const pathSrc = './src/';
const pathBuild = './build/';

const paths = {
  css: `${pathBuild}assets/css/`,
  js: `${pathBuild}assets/js/`,
  manifest: `${pathBuild}manifest.json`,
  assets: `${pathBuild}assets/`,

  sass: `${pathSrc}scss/`,
  templates: `${pathSrc}templates/`,
  scripts: `${pathSrc}js/`,
  data: `${pathSrc}templates/data/`,
  dataGlobal: `${pathSrc}templates/data/global.json`,
  media: `${pathSrc}media/`,
  font: `${pathSrc}fonts/`,
  images: `${pathSrc}images/`,

  wordpress: `./web/app/themes/${wordpress}/static/`,
};

function verify() {
  const options = {
    objectMode: true
  };

  function write(file, enc, cb) {
    console.log('file', file.path);
    cb(null, file);
  }

  function end(cb) {
    console.log('done');
    cb();
  }

  return through(options, write, end);
}

// Check if ESLint has run the fix
function isFixed(file) {
  return file.eslint !== null && file.eslint.fixed;
}

/**
 * Compile .twig files and pass data from json filegulp
 * matching file name. index.twig - index.twig.json into HTMLs
 */
gulp.task('twig', () => gulp.src([`${paths.templates}pages/*.twig`])
  // Stay live and reload on error
  .pipe(plumber({
    handleError(err) {
      console.log(err);
      this.emit('end');
    },
  }))
  .pipe(data(() => {
    let json;
    try {
      json = JSON.parse(fs.readFileSync(paths.dataGlobal));
    } catch {
      json = {}
    }
    return json;
  }))
  .pipe(data(file => {
    let json;
    try {
      json = JSON.parse(fs.readFileSync(`${paths.data + path.basename(file.path)}.json`));
    } catch {
      json = {};
    }
    return json;
  }))
  .pipe(twig({
    base: './src',
    functions: [{
        name: 'manifest',
        func(file) {
          if (process.env.ENV === 'production') {
            return JSON.parse(fs.readFileSync(paths.manifest, 'utf8'))[file];
          } else {
            return file;
          }
        },
      },
      {
        name: 'env',
        func(variable) {
          return process.env[variable];
        },
      },
      {
        name: 'function',
        func: function (args) {
          return "<!-- Load WP function in backend -->";
        }
      },
    ],
  }))
  .on('error', function (err) {
    process.stderr.write(`${err.message}\n`);
    this.emit('end');
  })
  .pipe(gulp.dest(pathBuild))
  .pipe(browserSync.reload({
    stream: true
  })));

/**
 * Compile .scss files into build css directory With autoprefixer no
 * need for vendor prefixes then live reload the browser.
 */
gulp.task('sass', () => gulp.src(`${paths.sass}/*.scss`)
  .pipe(sourcemaps.init())
  // Stay live and reload on error
  .pipe(plumber({
    handleError(err) {
      console.log(err);
      this.emit('end');
    },
  }))
  .pipe(
    sass({
      importer: tildeImporter,
      includePaths: [
        `${paths.sass}/`,
        'node_modules/',
      ],
      outputStyle: (process.env.ENV === 'production') ? 'compressed' : 'expanded',
      sourceComments: process.env.ENV !== 'production',
    }).on('error', function (err) {
      console.log(err.message);
      this.emit('end');
    }),
  )
  .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {
    cascade: true,
  }))
  .pipe(postcss([
    require('tailwindcss'),
    require('autoprefixer'),
    require('cssnano')({
      preset: 'default',
    }),
  ]))
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest(paths.css))
  .pipe(browserSync.stream()));

/**
 * remove the unused css
 */
gulp.task('purgecss', () => {
  const ThemePurgeCss = {
    whitelist: ['show', 'active', 'collapsing', 'dom-ready'],
    whitelistPatterns: [/js-/],
  };

  return gulp
    .src(`${paths.css}*.css`)
    .pipe(
      gulpIf((purgeCssOnBuild && (process.env.ENV === 'production')),
        purgecss({
          content: [`${pathBuild}*.html`],
          extractors: [{
            extractor: class {
              static extract(content) {
                return content.match(/[\w-/:]+(?<!:)/g) || []
              }
            },
            extensions: ['html', 'blade', 'twig']
          }],
          whitelist: ThemePurgeCss.whitelist,
          whitelistPatterns: ThemePurgeCss.whitelistPatterns,
        }),
      )
    )
    .pipe(gulp.dest(paths.css));
});

// Lint scripts
gulp.task('lint', () => gulp
  .src([`${paths.scripts}**/*`, './gulpfile.js'])
  .pipe(plumber())
  .pipe(eslint({
    fix: false,
  }))
  .pipe(eslint.format())
  .pipe(eslint.failAfterError()));

// Fix lint
gulp.task('lint:fix', () => gulp.src([`${paths.scripts}**/*`, './gulpfile.js'])
  .pipe(eslint({
    fix: true,
  }))
  .pipe(eslint.format())
  // if running fix - replace existing file with fixed one
  .pipe(gulpIf(isFixed, gulp.dest('./')))
  .pipe(eslint.failAfterError()));

/**
 * Compile .js files into build js directory With app.min.js
 */
function compileJs(params) {
  return gulp.src(`${paths.scripts}*.js`)
    .pipe(sourcemaps.init())
    .pipe(plumber({
      errorHandler(err) {
        notify.onError({
          title: `Gulp error in ${err.plugin}`,
          message: err.toString(),
        })(err);
      },
    }))
    .pipe(webpackStream({
      entry: {
        app: `${paths.scripts}app${params.suffix}.js`,
      },
      output: {
        filename: `[name]${params.suffix}.js`,
        chunkFilename: `[name]${params.suffix}.js`,
      },
      devtool: 'source-map',
      mode: (process.env.ENV === 'production') ? 'production' : 'development',
      module: {
        rules: params.rules,
      },
      plugins: [
        new webpack.ProvidePlugin({
          $: 'jquery',
          jQuery: 'jquery',
          'window.jQuery': 'jquery',
          objectFit: 'object-fit-images',
        }),
      ],
      optimization: {
        usedExports: true,
        splitChunks: {
          cacheGroups: {
            commons: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
        runtimeChunk: false,
      },
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.js))
    .pipe(browserSync.reload({
      stream: true
    }));
}

gulp.task('js', () => compileJs({
  rules: [{
    test: /\.(js)$/,
    exclude: /(node_modules)/,
    loader: 'babel-loader',
    query: {
      presets: [
        ['@babel/env', {
          targets: {
            browsers: [
              'Chrome >= 60',
              'Safari >= 11',
              'iOS >= 10.3',
              'Firefox >= 54',
              'Edge >= 15',
            ],
          },
          useBuiltIns: false,
          forceAllTransforms: false,
        }],
      ],
    },
  }],
  suffix: '',
}));

gulp.task('js:legacy', () => compileJs({
  rules: [{
    test: /\.(js)$/,
    exclude: /(node_modules\/core-js)/, // We do not want to compile core-js or we get an error in IE11
    loader: 'babel-loader',
    query: {
      presets: [
        ['@babel/env', {
          targets: {
            browsers: [
              '> 0.25%',
              'ie 11',
            ],
          },
          useBuiltIns: 'entry',
          forceAllTransforms: true,
          corejs: 3,
        }],
      ],
    },
  }],
  suffix: '-legacy',
}));

gulp.task('revision:rename', (done) => {
  if (process.env.ENV !== 'production') {
    done();
    return;
  }

  return gulp.src([`${pathBuild}**/*.css`,
      `${pathBuild}**/*.js`,
      `${pathBuild}**/*.{jpg,png,jpeg,gif,svg,mp4}`,
      `!${pathBuild}assets/images/placeholders/**/*`,
    ], {
      base: 'assets'
    })
    .pipe(rev())
    .pipe(revdel())
    .pipe(gulp.dest(pathBuild))
    .pipe(rev.manifest({
      path: 'manifest.json'
    }))
    .pipe(gulp.dest(pathBuild))
});

gulp.task('revision:replace-relative', (done) => {
  if (process.env.ENV !== 'production') {
    done();
    return;
  }

  return gulp.src([`${paths.css}*.css`]) // Any file globs are supported
    .pipe(replace(/\/assets\//g, '../'))
    .pipe(gulp.dest(paths.css))
});

gulp.task('revision:updateReferences', (done) => {
  if (process.env.ENV !== 'production') {
    done();
    return;
  }

  return gulp.src([paths.manifest, `${pathBuild}*.html`, `${pathBuild}**/*.css`])
    .pipe(collect({
      replaceReved: true,
    }))
    .pipe(gulp.dest(pathBuild))
});

gulp.task('images', () => gulp.src(`${paths.images}**/*`)
  .pipe(gulp.dest(`${paths.assets}images`)));

gulp.task('copy:fonts', () => gulp.src(`${paths.font}/**/*`)
  .pipe(copy(`${paths.assets}fonts`, {
    prefix: 1
  }))
  .pipe(verify()));

gulp.task('copy:media', () => gulp.src(`${paths.media}**/*`)
  .pipe(copy(`${paths.assets}media`, {
    prefix: 1
  }))
  .pipe(verify()));

gulp.task('wordpress:assets', () => gulp.src(`${paths.assets}**/*`)
  .pipe(gulp.dest(`${paths.wordpress}assets`)));

gulp.task('wordpress:manifest', () => gulp.src(paths.manifest, { allowEmpty: true })
  .pipe(gulp.dest(paths.wordpress)));

gulp.task('wordpress:templates', () => gulp.src(`${paths.templates}**/*`)
  .pipe(gulp.dest(`${paths.wordpress}templates`)));

/**
 * Clean the build folder before building.
 */
gulp.task('clean', () => gulp.src(`${pathBuild}*`, {
  read: false
}).pipe(clean()));

/**
 * Wait for twig, js and sass tasks, then launch the browser-sync Server
 */
gulp.task('browser-sync', () => browserSync.init({
  server: {
    baseDir: pathBuild,
    index: 'index.html',
  },
}));

// Process data in an array synchronously, moving onto the n+1 item only after the nth item callback
function doSynchronousLoop(data, processData, done) {
  if (data.length > 0) {
    const loop = (data, i, processData, done) => {
      processData(data[i], i, () => {
        if (++i < data.length) {
          loop(data, i, processData, done);
        } else {
          done();
        }
      });
    };
    loop(data, 0, processData, done);
  } else {
    done();
  }
}

/**
 * Watch scss files for changes & recompile
 * Watch .twig files run twig-rebuild then reload BrowserSync
 */
gulp.task('watch', () => {
  gulp.watch(`${paths.scripts}**/*.js`, gulp.series(['js']));
  // gulp.watch(`${paths.scripts}**/*.js`, gulp.series(['js', 'js:legacy']));
  gulp.watch(`${paths.sass}**/*.scss`, gulp.series(['sass']));
  gulp.watch(`${paths.templates}**/*.twig`, gulp.series(['twig', 'wordpress']));
  gulp.watch(`${paths.data}*.json`, gulp.series(['twig']));
  gulp.watch(`${paths.images}**/*.png`, gulp.series(['images', 'copy:media']));
  gulp.watch(`${paths.images}**/*.jpg`, gulp.series(['images', 'copy:media']));
  gulp.watch(`${paths.images}**/*.svg`, gulp.series(['images', 'copy:media']));
});

gulp.task('revision', gulp.series('revision:rename', 'revision:updateReferences', 'revision:replace-relative'), () => {
  done();
});

gulp.task('wordpress', gulp.parallel('wordpress:assets', 'wordpress:manifest', 'wordpress:templates'));
gulp.task('watch:run', gulp.parallel('browser-sync', 'watch'));

// Build task compile sass and twig.
gulp.task('build', gulp.series(['clean', 'sass', 'js', 'js:legacy', 'images', 'copy:media', 'copy:fonts', 'revision', 'twig', 'purgecss', 'wordpress']), () => {
  done();
});

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the project site, launch BrowserSync then watch
 * files for changes
 */
gulp.task('default', gulp.series(['build', 'watch:run']), () => {
  done();
});
