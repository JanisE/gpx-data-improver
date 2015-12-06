/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var gulp = require('gulp');
var pandoc = require('gulp-pandoc');

gulp.task('default', ['doc']);

// TODO How can I make the embedded images work on both the main repository page on GitHub, and on doc/README.html?
gulp.task('doc', function ()
{
	gulp.src('*.md')
		.pipe(pandoc({
			from: 'markdown_github+implicit_header_references',
			to: 'html',
			ext: '.html',
		  args: ['--standalone']
		}))
		.pipe(gulp.dest('doc/'));
});
