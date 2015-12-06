/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
module.exports = function (grunt)
{
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-mocha-test');

	grunt.initConfig({
		jshint: {
			all: [
				'*.js', 'src/*.js', 'test/*.js'
			],
			// http://jshint.com/docs/options/
			options: {
				curly: true,
				funcscope: true,
				latedef: true,
				laxbreak: true,	// TODO In the next JSHint release it will probably possible to get rid of this deprecated option (https://github.com/jshint/jshint/issues/2793).
				node: true,
				nonew: true,
				singleGroups: true,
				undef: true,
				unused: true
			}
		},
		mochaTest: {
			test: {
				options: {
					reporter: 'spec'
				},
				src: ['test/**/*.js']
			}
		}
	});

	grunt.registerTask('test', ['jshint', 'mochaTest']);
	grunt.registerTask('default', ['test']);
};
