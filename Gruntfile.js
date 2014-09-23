/* Info on debugging grunt at https://gist.github.com/kagemusha/5866759 */
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

	var credentials;
	try {
		credentials = grunt.file.readJSON('credentials.json');
	} catch(e) {
		console.warn("You do not have a credentials.json file; saucelabs builds will not be available");
		credentials = {};
	}

	grunt.initConfig({
		credentials: credentials,
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
			modscore: {
				src: ['js/*.js'],
				dest: "tmp/tmp.js"
			}
		},
		connect: {
			server: {
		        options: {
		            port: 9023
		        }
		    }
	    },
		'saucelabs-jasmine': { 
			  modscore: {
			    options: {
			      username: credentials.saucelabs.user,
			      key: credentials.saucelabs.pass,
			      urls: ['http://127.0.0.1:9023/jasmine/SpecRunner.html'],
			      //build: process.env.CI_BUILD_NUMBER,
			      testname: 'Sauce Unit Test for modscore',
			      browsers: [
			      	{
					    browserName: "internet explorer",
					    platform: "WIN8",
					    version: "10"
					},
					{
				        browserName: 'firefox',
				        version: '19',
				        platform: 'XP'
			        }/*,
			        {
			        	browserName: 'iphone',
			        	version: '7.1',
						platform: 'OS X 10.9'
					},
					{
						browserName: 'android',
			        	version: '4.4',
						platform: 'Linux'
					},
					{
						browserName: 'safari',
			        	version: '7',
						platform: 'OS X 10.9'

					}*/
			      ],

					/* Result looks like:
					{
						id: "3f462dc7015342138bc02a76f1424691",
						job_id: "e893247296014130838963db162a8dee",
						passed: false,
						platform: ["XP", "firefox","19"],
						result: null,
						testPageUrl: "http://127.0.0.1:9023/jasmine/SpecRunner.html",
						url: "https://saucelabs.com/jobs/e893247296014130838963db162a8dee"
					}
				*/

			      onTestComplete: function(result, callback) {
			      	console.dir(result);
			      	  var user = "mkantor_layer_com";
        			  var pass = "7fe4f738-4780-41f4-b8e3-58a034eed2c5";
			      	  require("request").put({
				            url: ['https://saucelabs.com/rest/v1', user, 'jobs', result.job_id].join('/'),
				            auth: { user: user, pass: pass },
				            json: { passed: Boolean(result.passed) }
				      }, function (error, response, body) {
				      	if (response.statusCode != 200) {
				      		console.error("Error updating sauce results: " + body.error);
				      	}
				      });

			      	  console.log("Test Complete: " + Boolean(result.passed) + " for " + result.platform.join(" "));
			      	  if (result.passed) {
			      	  	console.log("Passed Tests: " + result.platform.join(" "));
			      	  	callback();
			      	  } else {
			      	  	callback(new Error(result.platform.join(" ") + " failed tests; results at " + result.url));
			      	  }

			      }
			    }
			  }
		},
		watch: {
			modscore: {
			  	files: ['js/*.js', '<%= jasmine.modscore.options.specs %>', "Gruntfile.js"],
			   	tasks: ['closureCompiler', 'browserify', 'jasmine', 'jsduck', 'buildGitReadme'] /* Concat lets us test in our local dev env and won't get done if we run/fail tests first. */
			}
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
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-saucelabs');


  	grunt.registerTask('default', ['closureCompiler', 'browserify', 'jasmine', 'jsduck', 'buildGitReadme', 'uglify', 'removeDebuggers']);

  	grunt.registerTask('jenkins', ['browserify', 'jasmine', 'jsduck', 'buildGitReadme', 'uglify', 'removeDebuggers']);
	//grunt.registerTask("sauce", ["connect", "watch"]);

	grunt.registerTask('sauce', ['connect', 'saucelabs-jasmine']);

};