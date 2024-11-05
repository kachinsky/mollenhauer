var syntax        = 'sass';

var	gulp          = require('gulp'),
	gutil         = require('gulp-util' ),
	sass          = require('gulp-sass')(require('sass')),
	browserSync   = require('browser-sync'),
	reload 		  = browserSync.reload,
	concat        = require('gulp-concat'),
	uglify        = require('gulp-uglify-es').default;
	cleancss      = require('gulp-clean-css'),
	rename        = require('gulp-rename'),
	autoprefixer  = require('gulp-autoprefixer'),
	notify        = require("gulp-notify"),
	imagemin      = require('gulp-imagemin'),
	pngquant      = require('imagemin-pngquant'),
    jpegtran      = require('imagemin-jpegtran'),
    optipng       = require('imagemin-optipng'),
	mozjpg        = require('imagemin-mozjpeg'),
	svgo          = require('imagemin-svgo'),
	gifsicle      = require('imagemin-gifsicle'),
	webp          = require('imagemin-webp'),
	extReplace 	  = require("gulp-ext-replace"),
	cache         = require('gulp-cache'),
	rsync         = require('gulp-rsync'),
	sourcemaps    = require('gulp-sourcemaps'),
	gulpIf        = require('gulp-if'),
	rigger        = require('gulp-rigger'),
	del           = require('del'),
	merge         = require('merge-stream'),
	plumber 	  = require('gulp-plumber'),
	include 	  = require('gulp-include'),
	svgSprite     = require('gulp-svg-sprite'),
	fileinclude	  = require('gulp-file-include'),
	path          = require('path'),
	es 			  = require("event-stream"),
	mergeStream   = require('merge-stream'),
	chalk         = require('chalk'),
	GulpSFTP      = require('gulp-ssh'),
	multiDest     = require('gulp-multi-dest'),
	cached        = require('gulp-cached'),
	newer		  = require('gulp-newer');

var isDev = true;

//
// Path for project
//

var path = {
	project: getDefaultContext('Project'),
	build: {
		html: 'app/markup/',
		js: 'app/markup/js',
		css: 'app/markup/css',
		img: 'app/markup/images',
		fonts: 'app/markup/fonts'
	},
	src: {
		html: 'app/workspace/pages/*.html',
		htmlAll: 'app/workspace/**/*.html',
		common: 'app/workspace/js/common/*.js', // JS
		jsLibs: 'app/workspace/js/libs/**/*.js',
		jquery: 'app/workspace/js/jquery/*.js',
		style: 'app/workspace/'+syntax+'/main.scss',
		sass: 'app/workspace/'+syntax+'/*.scss',
		css: 'app/workspace/css/*.css',
		img: 'app/workspace/images/**/*',
		fonts: 'app/workspace/fonts/**/*'
	},
	clean: 'app/markup/*'
};

function getDefaultContext(defaultName) {
	var argv = process.argv[2] || process.argv[3];
	if (typeof argv !== 'undefined' && argv.indexOf('--') < 0) {
		argv = process.argv[3];
	}
	return (typeof argv === 'undefined') ? defaultName : argv.replace('--', '');
}

function runInContextGlob(filepath, cb) {
	var context = path.relative(process.cwd(), filepath);

	// Console
	console.log(
		' has been changed: ' + chalk.cyan(context)
	);
	cb();
}

//
// Clean
//

function cleanAll(cb) {
	return del(path.clean).then(() => {
		cb()
	})
}
exports.clean = cleanAll;
exports.wipe = cleanAll;

//
// Clean
//

function cleanImg(cb) {
	return del(path.build.img).then(() => {
		cb()
	})
}
exports.cleanImg = cleanImg;
exports.wipeImg = cleanImg;

//
// Standard remove
//
function standardRemove() {
	return mergeStream([
		//Fonts
		gulp.src(path.src.fonts)
		.pipe(gulp.dest(path.build.fonts)),

		//JS Libs
		gulp.src(path.src.jquery)
		.pipe(gulp.dest(path.build.js)),

		//CSS
		gulp.src(path.src.css)
		.pipe(gulp.dest(path.build.css))
	])
}
exports.standardRemove = standardRemove;

/*
// SVG SPRITE
var config = {
	shape: {
		dimension: { // Set maximum dimensions
			maxWidth: 32,
			maxHeight: 32
		},
		spacing: { // Add padding
			padding: 10
		},
		dest: 'app/markup/images/intermediate-svg' // Keep the intermediate files
	},
	mode: {
		view: { // Activate the «view» mode
			bust: false,
			render: {
				sass: true // Activate Sass output (with default options)
			}
		},
		symbol: true // Activate the «symbol» mode
	}
};

gulp.task('svgSprite', function() {
	return gulp.src('app/markup/images/*.svg')
		.pipe(svgSprite(config))
		.pipe(gulp.dest('app/markup/images/'))
});
*/
// Generate Sprite icons
/*gulp.task('sprite', function () {
	// Generate our spritesheet
	var spriteData = gulp.src('app/workspace/icon-sprite/*.png')
		.pipe(spritesmith({
			imgName: '_sprite.png',
			imgPath: '../images/_sprite.png',
			cssName: '_sprite.scss',
			cssTemplate: 'app/workspace/icon-sprite/scss-minimal.handlebars', //IMPORTANT, don't delete
			//retinaSrcFilter: 'app/workspace/icon-sprite/*@2x.png',
			//retinaImgName: '_sprite@2x.png',
			//retinaImgPath: '../images/_sprite@2x.png',
			cssVarMap: function (sprite) {
				sprite.name = 'icon-' + sprite.name;
			},
			padding: 10
		}));

	// Pipe image stream onto disk
	var imgStream = spriteData.img
		.pipe(gulp.dest('app/workspace/images/'));

	// Pipe CSS stream onto disk
	var cssStream = spriteData.css
		.pipe(gulp.dest('app/workspace/sass/'));

	// Return a merged stream to handle both `end` events
	return merge(imgStream, cssStream);
});*/

//
// Images
//
function images() {
	return (
		gulp.src(path.src.img)
		.pipe(newer(path.build.img))
		.pipe(
			imagemin([
				gifsicle({ interlaced: true }),
				jpegtran({ progressive: true }),
				optipng({ optimizationLevel: 5 }),
				svgo({
					plugins: [
						{
							removeViewBox: false,
							collapseGroups: true
						}
					]
				})
			])
		)
		.pipe(gulp.dest(path.build.img))
	)
}

exports.images = images;

//
//WEBP
//
function webpImg() {
	return (
		gulp.src(path.src.img + '.{png,jpg,jpeg}')
		.pipe(
			imagemin([
				webp({ quality: 80 }),
			])
		)
		.pipe(extReplace(".webp"))
		.pipe(gulp.dest(path.build.img))
		.on('end', function(){ console.log(chalk.cyan('Images optimized')); })
	)
}

exports.webpImg = webpImg;

//
// Minify images
//
function imgmin() {
	return ( gulp.src(path.build.img + '*.{jpg,jpeg,png,gif,bmp}')
		.pipe(cache(imagemin({
			interlaced: true,
			progressive: true,
			use: [pngquant()]
		})))
		.pipe(gulp.dest(path.build.img))
	)
}

exports.imgmin = imgmin;

//
// SASS/Styles
//
function styles() {
	return (
		gulp.src(path.src.style)
		.pipe(plumber()) //log error
		.pipe(gulpIf(isDev, sourcemaps.init()))
		.pipe(sass({ outputStyle: 'expanded' }).on("error", notify.onError()))
		.pipe(rename({ suffix: '.min', prefix : '' }))
		.pipe(autoprefixer(['last 15 versions']))
		.pipe(cleancss( {level: { 1: { specialComments: 0 } } })) // Opt., comment out when debugging
		.pipe(gulpIf(isDev, sourcemaps.write('../maps/')))
		.pipe(gulp.dest(path.build.css))
		.pipe(reload({ stream: true }))
	)
}

exports.styles = styles;

//
// HTML
//
function html() {
	return (
		gulp.src(path.src.html)
		.pipe(plumber()) //log error
		.pipe(fileinclude({
			prefix: '@@',
			basepath: '@file'
		}))
		.pipe(gulp.dest(path.build.html))
		.pipe(reload({ stream: true }))
	)
}

exports.html = html;

//
// Server
//
function server() {
	browserSync({
		server: {
			baseDir: path.build.html,
			index: 'home.html'
		}
	})
}

exports.server = server;

//
// JS
//
function js() {
	return (
		gulp.src([
			path.src.jsLibs,
			path.src.common // Always at the end
		])
		.pipe(plumber()) //log error
		.pipe(gulpIf(isDev, sourcemaps.init()))
		.pipe(concat('scripts.min.js'))
		.pipe(uglify()) // Mifify js (opt.)
		.pipe(gulpIf(isDev, sourcemaps.write('../maps/')))
		.pipe(gulp.dest(path.build.js))
		.pipe(reload({ stream: true }))
	)
}

exports.js = js;

//
// Rsync
//
function deploy() {
	return ( gulp.src(path.build + '**')
		.pipe(rsync({
			root: 'app/markup/',
			hostname: 'username@yousite.com',
			destination: 'yousite/public_html/',
			// include: ['*.htaccess'], // Includes files to deploy
			exclude: ['**/Thumbs.db', '**/*.DS_Store'], // Excludes files from deploy
			recursive: true,
			archive: true,
			silent: false,
			compress: true
		}))
	)
}
exports.deploy = deploy;

//
// Watch
//
function watcher() {

	gulp.watch([path.src.fonts, path.src.css], standardRemove);

	gulp.watch(path.src.sass, styles);

	gulp.watch(path.src.img, images, webpImg);

	gulp.watch([path.src.jsLibs, path.src.common], js);

	gulp.watch(path.src.htmlAll, html);
}

exports.watcher = watcher;

//
// Default
//
exports.default = gulp.series(cleanAll, gulp.parallel(standardRemove, html), images, webpImg, js, styles, gulp.parallel(server, watcher));