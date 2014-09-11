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


	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		readme: String(grunt.file.read("model.js")).replace(/^[\s\S]*?START-GIT-README([\s\S]*?)END-GIT-README[\s\S]*$/m, "$1"),
		jasmine: {
			overscore: {
				src: ["overscore.js", 'events.js', 'model.js'], // change this; browserify should generate this file on the test server. ?
				options: {
					specs: ['jasmine/spec/overscoreSpec.js', 'jasmine/spec/modelSpec.js'],
					summary: true
				}
			},
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
		buildGitReadme: {
			overscore: {
				prepend: "<%= pkg.name %>\n========\n\n",
				paths: ["model.js"],
				output: "README.md"
			}
		},
		watch: {
		  	files: ['<%= jasmine.overscore.src %>', '<%= jasmine.overscore.options.specs %>', "Gruntfile.js"],
		   	tasks: ['concat', 'jasmine', 'jsduck', 'buildGitReadme'] /* Concat lets us test in our local dev env and won't get done if we run/fail tests first. */
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jasmine');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-jsduck');

  	grunt.registerTask('default', ['uglify', 'concat', 'jasmine', 'jsduck', 'buildGitReadme']);

  	grunt.registerTask('jenkins', ['uglify', 'concat', 'jasmine', 'jsduck', 'buildGitReadme']);

};