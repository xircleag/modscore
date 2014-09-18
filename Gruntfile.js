module.exports = function(grunt) {

	grunt.registerMultiTask("buildGitReadme", "Replace specified file with matching text", function() {
	    var paths = grunt.file.expand( this.data.paths ),
	        out = this.data.output,
	        contents = this.data.prepend;

	        /* Don't expect multiple paths, but its boilerplate code I found which we can build upon */
	    paths.forEach(function( path ) {
	    	var tmpContents = grunt.file.read(path);
	    	if (tmpContents.match(/START-GIT-README/)) {
	    		tmpContents = tmpContents.replace(/^[\s\S]*?START-GIT-README([\s\S]*?)END-GIT-README[\s\S]*$/m, "$1");
	    		tmpContents = tmpContents.replace(/^\s*\* ?/mg,"");
	    		contents += tmpContents;
	    	}
	    });

	    grunt.file.write( out, contents );
	});

	grunt.registerMultiTask("removeDebuggers", "Report errors if debugger; shows up in code", function() {
	    var paths = grunt.file.expand( this.data.paths );

	        /* Don't expect multiple paths, but its boilerplate code I found which we can build upon */
	    paths.forEach(function( path ) {
	    	var contents = grunt.file.read(path);
	    	var matches = contents.match(/^\s*debugger\s*;\s*$/m);
	    	if (matches) throw new Error("Debugger found in " + path);
	    });
	});



	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jasmine: {
			modscore: {
				src: ["build/modscore.js"],
				options: {
					specs: ['jasmine/spec/overscoreSpec.js', 'jasmine/spec/modelSpec.js'],
					summary: true
				}
			},
		},
		browserify: {
		  	modscore: {
			    files: {
			      'build/modscore.js': ['js/browserify.js']
			    },
			    options: {}
			}
		},
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
					'<%= grunt.template.today("yyyy-mm-dd") %> */ ' ,
				mangle: {
					except: ["m_"]
				},
				sourceMap: true
			},
			modscore: {
				files: {
					'build/<%= pkg.name %>.min.js': ['build/<%= pkg.name %>.js']
				}
			}
		},
/*		concat: {

			options: {
				separator: ';'
			},
			modscore: {
				src: ['<%= jasmine.overscore.src %>'],
				dest: 'build/<%= pkg.name %>.js'
			}
		},*/
	    jsduck: {
		    modscore: {
		        // source paths with your code
		        src: ['js/*.js'],

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
		buildGitReadme: {
			overscore: {
				prepend: "<%= pkg.name %>\n========\n\n",
				paths: ["js/model.js"],
				output: "README.md"
			}
		},
		removeDebuggers: {
			overscore: {
				paths: ["js/*.js"],
				output: "README.md"
			}
		},

		watch: {
		  	files: ['js/*.js', '<%= jasmine.overscore.options.specs %>', "Gruntfile.js"],
		   	tasks: ['browserify', 'jasmine', 'jsduck', 'buildGitReadme'] /* Concat lets us test in our local dev env and won't get done if we run/fail tests first. */
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jasmine');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-jsduck');
	grunt.loadNpmTasks('grunt-browserify');

  	grunt.registerTask('default', ['browserify', 'jasmine', 'jsduck', 'buildGitReadme', 'uglify', 'removeDebuggers']);

  	grunt.registerTask('jenkins', ['browserify', 'jasmine', 'jsduck', 'buildGitReadme', 'uglify', 'removeDebuggers']);

};