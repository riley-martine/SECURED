'use strict';

import gulp from 'gulp';
import del from 'del';
import notify from 'gulp-notify';
import merge from 'merge-stream';

import browserSync from 'browser-sync';
var server = browserSync.create();

import sass from 'gulp-sass';
import sassLint from 'gulp-sass-lint';
import cleanCSS from 'gulp-clean-css';
import autoprefixer from 'gulp-autoprefixer';
import uncss from 'gulp-uncss';

import htmlmin from 'gulp-htmlmin';
import pug from 'gulp-pug';
import puglint from 'gulp-pug-lint';

import imagemin from 'gulp-imagemin';


const paths = {
	scripts: {
		lib: 'src/lib/scripts/*.js', // The only scripts we use come from someone else
		dest: 'dist/scripts/'
	},
	styles: {
		src: 'src/scss/**/*.scss',
		lib: 'src/lib/css/*.css',
		dest: 'dist/css'
	},
	images: {
		src: 'src/img/**/*.*',
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
	var css = gulp.src([paths.styles.src])
		.pipe(sassLint())
		.pipe(sassLint.format())
		.pipe(sass(sassOptions)).on('error', sass.logError)
		.pipe(autoprefixer());
	
	
	var lib = gulp.src(paths.styles.lib);

	return merge(css, lib)
		.pipe(uncss({
			html: ['dist/**/*.html']}))
		.pipe(cleanCSS({debug: true}, function(details) {
            console.log(details.name + ': ' + details.stats.originalSize);
            console.log(details.name + ': ' + details.stats.minifiedSize);
        }))
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
	return gulp.src(paths.images.src)
		.pipe(imagemin())
		.pipe(gulp.dest(paths.images.dest));
});

gulp.task('compile', gulp.series('clean', gulp.parallel('sass','pug')), (done) => {
	// Does not default to doing images because that takes too long
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
	gulp.watch(paths.views.all, gulp.series('pug', 'sass', reload));
	gulp.watch(paths.images.src, gulp.series('images', reload));
})

gulp.task('default',  gulp.parallel('serve', 'watch'));

