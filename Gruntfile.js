module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jasmine: {
			overscore: {
				src: ["overscore.js", 'events.js', 'model.js'], // change this; browserify should generate this file on the test server. ?
				options: {
					specs: 'jasmine/spec/*Spec.js',
					summary: true
				}
			},
		},
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
					'<%= grunt.template.today("yyyy-mm-dd") %> */',
				mangle: {
					except: ["m_"]
				},
				sourceMap: true
			},
			overscore: {
				files: {
					'build/<%= pkg.name %>.min.js': ['<%= jasmine.overscore.src %>']
				}
			}
		},
		concat: {
			options: {
				separator: ';'
			},
			dist: {
				src: ['<%= jasmine.overscore.src %>'],
				dest: 'build/<%= pkg.name %>.js'
			}
		},
	    jsduck: {
		    overscore: {
		        // source paths with your code
		        src: ['<%= jasmine.overscore.src %>'],

		        // docs output dir
		        dest: 'jsdocs',

		        // extra options
		        options: {
		            'builtin-classes': false,
		            'warnings': ['-no_doc', '-dup_member', '-link_ambiguous'],
		            'external': ['XMLHttpRequest']
		        }
		    }
		},
		watch: {
		  	files: ['<%= jasmine.overscore.src %>', '<%= jasmine.overscore.options.specs %>', "Gruntfile.js"],
		   	tasks: ['concat', 'jasmine', 'jsduck'] /* Concat lets us test in our local dev env and won't get done if we run/fail tests first. */
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jasmine');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-jsduck');

  	grunt.registerTask('default', ['uglify', 'concat', 'jasmine', 'jsdoc']);

  	grunt.registerTask('jenkins', ['uglify', 'concat', 'jasmine', 'jsdoc']);

};