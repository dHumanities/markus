module.exports = function(grunt) {
    
      // Project configuration.
      grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
          uglify: {
            my_target: {
              options: {
                mangle: false
              },
              files: [{
                expand: true,
                src: 'js/*.js',
                dest: 'dist/',
                ext: '.min.js'
            }]
            }
          },
          concat: {
            options: {
              separator: ';',
            },
            dist: {
              src: ['js/comparativus.js', 'js/util.js',  'js/worker.js' ,'js/ui.js', 'js/file.js',
              'js/vis.js', 'js/popover.js', 'js/urn.js', 'js/text.js', 'js/global.js'], //keep global.js as the last file
              dest: 'dist/comparativus.min.comp.js',
            },
          },
          watch: {
            scripts:{
              files: ['js/*.js'],
              tasks: ['concat']
            }
          }
      });
    
      // Load the plugin that provides the "uglify" task.
      grunt.loadNpmTasks('grunt-contrib-uglify');
      grunt.loadNpmTasks('grunt-contrib-concat');
      grunt.loadNpmTasks('grunt-contrib-watch');
      

      // Default task(s).
      grunt.registerTask('default', ['concat']);
    
    };