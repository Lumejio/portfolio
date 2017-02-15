module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: {
      // build: ["path/to/dir/one", "path/to/dir/two"],
      // release: ["path/to/another/dir/one", "path/to/another/dir/two"]
    },
    copy: {},
    uglify: {
      dist: {
        files: {
          'scripts/production.js': ['scripts/production.min.js']
        }
      }
    },
    concat: {
      scripts: {
        src: [
          'sources/jquery.mousewheel.js',
          'sources/jquery.easings.js',
          'sources/jquery.color.js',
          'sources/chosen.jquery.js',

          'sources/everything.js',
          // 'sources/modernizr-custom.js',
          'sources/gsap/TweenMax.js',
          'sources/gsap-morph-svg.js',

          'sources/core.functions.js',
          'sources/core.scroll.js',
          'sources/core.js'
        ],
        dest: 'scripts/production.js'
      }
    },
    imagemin: {
      dynamic: {
        files: [{
          expand: true,
          cwd: 'images/',
          src: ['**/*.{png,jpg,gif}'],
          dest: 'images-minified/'
        }]
      }
    },
    compass: {
      dist: {
        options: {
          specify: 'sources/sass/production.scss',
          sassDir: 'sources/sass/',
          cssDir: 'styles/',
          environment: 'production'
        }
      },
      dev: {
        options: {
          specify: 'sources/sass/production.scss',
          sassDir: 'sources/sass/',
          cssDir: 'styles/'
        }
      }
    }
  });

  // Load plugins that provides tasks
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-contrib-compass');

  // Default task(s).
  grunt.registerTask('default',
    ['concat:scripts','uglify:dist','compass:dist']);
  grunt.registerTask('scripts', ['concat']);
  grunt.registerTask('styles', ['compass:dev']);
  grunt.registerTask('images', ['imagemin:dynamic']);

};