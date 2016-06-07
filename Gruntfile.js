module.exports = function(grunt) {

  // Project configuration.
  //var compression = require('compression');
  grunt.initConfig({
    config: {
      src:  'src',
      devClient:  'devClient',
      devClientFolder:  'patterns',
      dev:  'devClient'
    },
    jshint: {
      files: ['Gruntfile.js', '<%= config.src %>/js/*.js', '<%= config.src %>/js/**/*.js'],
      options: {
        globals: {
          jQuery: false
        }
      }
    },
    csslint: {
      strict: {
        options: {
          import: 2
        },
        src: ['path/to/**/*.css']
      },
      lax: {
        options: {
          import: false
        },
        src: ['path/to/**/*.css']
      }
    },
    clean: {
      devClient: {
        files: [
          {
            expand: true,
            cwd: '<%= config.devClient %>/style/',
            src: '**/*',
          },
        ],
      },
    },
    concat: {
      options: {
        banner: '',
        stripBanners: false,
      },
      dev: {
        src: [
          '<%= config.src %>/js/**/*.js',
          '<%= config.src %>/js/*.js',
        ],
        dest: '<%= config.devClient %>/<%= config.devClientFolder %>/app.js',
      },
    },
    sass: {
      options: {
        sourceMap: false,
      },
      dev: {
        files: {
          '<%= config.devClient %>/<%= config.devClientFolder %>/style.css': '<%= config.src %>/scss/style.scss'
        },
      },
    },

    autoprefixer: {
        options: {
          "config": {
            "autoprefixerBrowsers": [
              "Android 2.3",
              "Android >= 4",
              "Chrome >= 20",
              "Firefox >= 24",
              "Explorer >= 8",
              "iOS >= 6",
              "Opera >= 12",
              "Safari >= 6"
            ]
          }
        },
        core: {
            options: {
                map: true
            },
            src: '<%= config.devClient %>/<%= config.devClientFolder %>/style.css'
        }
    },

    copy: {
        root: {
            expand: true,
            cwd: '<%= config.src %>/',
            src: [ '*.html', '*.txt', '*.json' ],
            dest: '<%= config.devClient %>/<%= config.devClientFolder %>/'
        }
    },
    
    connect: {
      server: {
        options: {
          port: 8118,
          hostname: '*',
          //middleware: function(connect, options, middlewares) {
          //  middlewares.unshift(compression());
          //  return middlewares;
          //}
        }
      }
    },
    
    watch: {
      page: {
        files: ['<%= config.src %>/index.html'],
        tasks: ['copy'],
      },
      sass: {
        files: ['<%= config.src %>/**/*.scss'],
        tasks: ['sass', 'autoprefixer'],
        options: {
          livereload: true,
        },
      },
      script: {
        files: ['<%= config.src %>/js/init.js','<%= config.src %>/js/**/*.js'],
        tasks: ['concat'],
      }
    }
    
  });
  
  require('load-grunt-tasks')(grunt, { scope: 'devDependencies' });
  require('time-grunt')(grunt);

  grunt.registerTask('devClientBuild', [ 'clean:devClient', 'concat', 'sass', 'autoprefixer', 'copy']);

  grunt.registerTask('default', ['devClientBuild', 'connect', 'watch']);

};