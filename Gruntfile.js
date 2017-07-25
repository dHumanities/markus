module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        // define a string to put between each file in the concatenated output
        separator: ';'
      },
      dist: {
        // the files to concatenate
        src: ['src/js/markus.js','src/js/*.js'],
        // the location of the resulting JS file
        dest: 'dist/markus.min.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'dist/markus.min.js',
        dest: 'build/markus.min.js'
      }
      ,
      my_target: {
        files: [{
            expand: true,
            cwd: 'dist/js',
            src: '*.js',
            dest: 'build/js'
        }]
      }

    },
    htmlmin: {                                     // Task
      dist: {                                      // Target
        options: {                                 // Target options
          removeComments: true,
          collapseWhitespace: true,
          minifyJS: true,
          minifyCSS: true
        },
        expand: true,
        cwd: 'dist',
        src: ['**/*.html'],
        dest: 'build/'
      

        // files: {                                   // Dictionary of files
        //                                            // 'destination': 'source'
        //   'build/index.html': 'dist/index.html'
          
        // }
      },
      
    },
    cssmin: {
      dist: {
        files: {
          'dist/css/markus.min.css': ['src/css/bootstrap.min.css','src/css/offcanvas.css','src/css/website.css','src/css/colorPicker.css']
        }
      },
      build: {
        files: {
          'build/css/markus.min.css': ['src/css/bootstrap.min.css','src/css/offcanvas.css','src/css/website.css','src/css/colorPicker.css']
        }
      }

    },
    copy: {
      main: {
        files: [
          // includes files within path
          // {expand: true, src: ['path/*'], dest: 'dest/', filter: 'isFile'},

          // includes files within path and its sub-directories
          {expand: true, cwd: 'lib/',src: ['**'], dest: 'dist/'},
          {expand: true, cwd: 'lib/',src: ['**'], dest: 'build/'},
          {expand: true, cwd: 'dist/',src: ['*.zip'], dest: 'build/'}
          // ,
          // {expand: true, cwd: 'src/', src: ['*.html'], dest: 'dist/'}
          // ,

          // makes all src relative to cwd
          // {expand: true, cwd: 'path/', src: ['**'], dest: 'dest/'},

          // flattens results to a single level
          // {expand: true, flatten: true, src: ['path/**'], dest: 'dest/', filter: 'isFile'}
        ]
      }
    },
    browserify: {
      options: {
        preBundleCB: function (b) {
          b.plugin(remapify, [
            {
              src: 'src/convertTEI.js', // glob for the files to remap
              dist: 'src/convertTEI.browserify.js'
            }
          ]);
        }
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-browserify');
  // Default task(s).
  grunt.registerTask('browser', ['browserify']);
  grunt.registerTask('default', ['concat','cssmin']);
  grunt.registerTask('release', ['copy','concat','uglify','htmlmin','cssmin']);
  grunt.registerTask('css', ['cssmin']);
  grunt.registerTask('html', ['copy','htmlmin']);
  grunt.registerTask('js', ['concat','uglify']);

};