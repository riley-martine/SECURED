'use strict';

import gulp from 'gulp';
import del from 'del';
import browserSync from 'browser-sync';
var server = browserSync.create();
import sass from 'gulp-sass';
import sassLint from 'gulp-sass-lint';
import cleanCSS from 'gulp-clean-css';
import autoprefixer from 'gulp-autoprefixer';
import sourcemaps from 'gulp-sourcemaps';
import htmlmin from 'gulp-htmlmin';
import pug from 'gulp-pug';
import puglint from 'gulp-pug-lint';
import notify from 'gulp-notify';
import imagemin from 'gulp-imagemin';


const paths = {
	scripts: {
		src: 'src/scripts/*.js',
		dest: 'dist/scripts/'
	},
	styles: {
		src: 'src/scss/**/*.scss',
		dest: 'dist/css'
	},
	images: {
		src: 'src/img/**/*.*',
		base: 'src/img/',
		dest: 'dist/img'
	},
	views: {
		all: 'src/views/**/*', // Refresh on updates to anything in views
		src: ['src/views/*.pug', 'src/views/*.html'], // Pages to generate
		base: 'src/views/',
		dest: 'dist'
	},
};


gulp.task('clean', () => {
	return del(['dist']);
});


var sassOptions = {
	errLogToConsole: true,
	outputStyle: 'expanded'
};

gulp.task('sass', () => {
	return gulp.src(paths.styles.src)
		.pipe(sassLint())
		.pipe(sassLint.format())
		.pipe(sourcemaps.init())
		.pipe(sass(sassOptions)).on('error', sass.logError)
		.pipe(autoprefixer())
		.pipe(cleanCSS({debug: true}, function(details) {
            console.log(details.name + ': ' + details.stats.originalSize);
            console.log(details.name + ': ' + details.stats.minifiedSize);
        }))
		.pipe(sourcemaps.write('maps'))
		.pipe(gulp.dest(paths.styles.dest))
		.pipe(browserSync.stream({match: '**/*.css'})); // CSS glob allows for streaming w/ sourcemaps
});


gulp.task('pug', () => {
	return gulp.src(paths.views.src, {base: paths.views.base})
		.pipe(puglint())
		.pipe(pug({locals: {require: require}})).on('error', notify.onError(function (error) {
			return 'An error occurred while compiling pug.\nLook in the console for details.\n' + error;
		}))
		.pipe(htmlmin({collapseWhitespace: true}))
		.pipe(gulp.dest(paths.views.dest));
	reload;
});

gulp.task('images', () => {
	return gulp.src(paths.images.src, {base: paths.images.base})
		.pipe(imagemin())
		.pipe(gulp.dest(paths.images.dest));
});

gulp.task('compile', gulp.series('clean', gulp.parallel('sass','pug','images')), (done) => {
	done();
})

function reload(done) {
	server.reload(); 
	done(); 
}

function serve(done) {
	server.init({
		server: {
			baseDir: './dist'
		}
	});
	done();
}
gulp.task('serve', gulp.series('compile', serve))

gulp.task('watch', () => {
	gulp.watch(paths.styles.src, gulp.series('sass', reload));
	gulp.watch(paths.views.all, gulp.series('pug', reload));
	gulp.watch(paths.images.src, gulp.series('images', reload));
})

gulp.task('default',  gulp.parallel('serve', 'watch'));

