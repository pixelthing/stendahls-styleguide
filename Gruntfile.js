/// <vs AfterBuild='build' Clean='clean' SolutionOpened='default' />
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    config: {
      src:  'root-src',
      dev:  'root-dev'
    },
    jshint: {
      files: ['Gruntfile.js', '<%= config.src %>/js/*.js'],
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
      preTmp: {
        files: [
          {
            expand: true,
            cwd: '.tmp/',
            src: '**/*',
          },
        ],
      },
      preInt: {
        files: [
          {
            expand: true,
            cwd: '<%= config.src %>/tmp',
            src: '**/*',
          },
        ],
      },
      preDev: {
        files: [
          {
            expand: true,
            cwd: '<%= config.dev %>/style/',
            src: '**/*',
          },
        ],
      },
      post: {
        files: [
          {
            expand: true,
            cwd: '<%= config.src %>/tmp',
            src: '**/*',
          },
        ],
      }
    },
    concat: {
      options: {
        banner: '',
        stripBanners: false,
      },
      dev: {
        src: [
          '<%= config.src %>/js/*',
        ],
        dest: '<%= config.src %>/tmp/app.js',
      },
    },
    sass: {
      options: {
        sourceMap: false,
      },
      dev: {
        files: {
          '<%= config.src %>/tmp/style.css': '<%= config.src %>/scss/style.scss'
        },
      },
    },
    postcss: {
        options: {
            map: true,
            processors: [
                require('autoprefixer')({
                    browsers: ['last 3 versions']
                }),
                require('csswring')
            ]
        },
        dev: {
            src: '<%= config.src %>/tmp/*.css'
        }
    },
    embed: {
      options: {
      },
      some_target: {
        files: {
          '<%= config.dev %>/style/style.html': '<%= config.src %>/style.html'
        }
      }
    },
    connect: {
      server: {
        options: {
          port: 8000,
          hostname: '*'
        }
      },
      dev : {
        options: {
          base: '<%= config.dev %>'
        }
      }
    },
    watch: {
      page: {
        files: ['<%= config.src %>/*.style'],
      },
      sass: {
        files: ['<%= config.src %>/**/*.scss'],
        tasks: ['sass', 'postcss', 'embed'],
        options: {
          livereload: true,
        },
      },
      script: {
        files: ['<%= config.src %>/**/*.js'],
        tasks: ['concat', 'embed'],
      }
    }
  });

  require('load-grunt-tasks')(grunt);
  grunt.loadNpmTasks('grunt-embed');
  grunt.loadNpmTasks('grunt-postcss');
  grunt.loadNpmTasks('grunt-contrib-connect');

  grunt.registerTask('devbuild', [ 'clean:preTmp', 'clean:preInt', 'clean:preDev', 'concat', 'sass', 'postcss', 'embed']);

  grunt.registerTask('default', ['devbuild', 'connect:dev', 'watch']);

};