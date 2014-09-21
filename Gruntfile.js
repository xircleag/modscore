module.exports = function(grunt) {

	/* Experimental code for disabling audible alerts on error;
	 * grunt-notify is better suited to the task in this work environment
	 */
	var oldout = process.stdout.write;
	process.stdout.write = function(msg) {
	  oldout.call(this, msg.replace('\x07', ''));
	};

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
					summary: true,
					message: "Jasmine Failed"
				}
			},
			options: {}
		},
		browserify: {
		  	modscore: {
			    files: {
			      'build/modscore.js': ['js/browserify.js']
			    }
			},
			options: {}
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
		    },
			options: {}
		},
		buildGitReadme: {
			overscore: {
				prepend: "<%= pkg.name %>\n========\n\n",
				paths: ["js/model.js"],
				output: "README.md"
			},
			options: {}
		},
		removeDebuggers: {
			overscore: {
				paths: ["js/*.js"],
				output: "README.md"
			},
			options: {}
		},
		bump: {
			options: {
				push: false
			}
		},
		/* Do not use --save on this as we don't need this in docker:
		 * > npm install superstartup-closure-compiler
		 * > npm install grunt-closure-tools
		 * This task is used only to do a quick validation of each individual file
		 * without the noise of a linter.
		 */
		closureCompiler:  {

		  	options: {
			    // [REQUIRED] Path to closure compiler
			    compilerFile: 'node_modules/superstartup-closure-compiler/build/compiler.jar',
			    checkModified: true,
			    compilerOpts: {
			    	compilation_level: "WHITESPACE_ONLY",
			    	summary_detail_level: 1,
			    	warning_level: "QUIET"
			    }
			},
			layerjs: {
				src: ['js/*.js'],
				dest: "tmp/tmp.js"
			}
		},
		watch: {
		  	files: ['js/*.js', '<%= jasmine.modscore.options.specs %>', "Gruntfile.js"],
		   	tasks: ['closureCompiler', 'browserify', 'jasmine', 'jsduck', 'buildGitReadme'] /* Concat lets us test in our local dev env and won't get done if we run/fail tests first. */
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jasmine');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-jsduck');
	grunt.loadNpmTasks('grunt-browserify');
 	grunt.loadNpmTasks('grunt-notify');
	grunt.loadNpmTasks('grunt-bump');
	grunt.loadNpmTasks('grunt-closure-tools');

  	grunt.registerTask('default', ['closureCompiler', 'browserify', 'jasmine', 'jsduck', 'buildGitReadme', 'uglify', 'removeDebuggers']);

  	grunt.registerTask('jenkins', ['browserify', 'jasmine', 'jsduck', 'buildGitReadme', 'uglify', 'removeDebuggers']);

};