module.exports = function(grunt) {

    grunt.initConfig({
	  jasmine: {
	    overscore: {
	      src: ["overscore.js", 'events.js', 'model.js'], // change this; browserify should generate this file on the test server. ?
	      options: {
	        specs: 'jasmine/spec/*Spec.js',
	        summary: true
	      }
	    }
	  }
	});

	//https://github.com/gruntjs/grunt-contrib-jasmine
    grunt.loadNpmTasks('grunt-contrib-jasmine');
};