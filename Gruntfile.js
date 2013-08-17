
module.exports = function (grunt) {

  grunt.initConfig({

    // metadata

    pkg: grunt.file.readJSON('package.json'),
    build: '<%= new Date().getTime() %>',
    product: 'Geolocation Track', // proper case
    productDescription: '<%= _.capitalize(pkg.description) %>',
    copyrightNotice: 'Copyright (c) <%= grunt.template.today("yyyy") %> outaTiME, Inc.',
    banner: '/*!\n' +
      ' *              __     _ \n' +
      ' *   _    _/__  /./|,//_`\n' +
      ' *  /_//_// /_|///  //_, \n' +
      ' *\n' +
      ' * <%= product %> v.<%= pkg.version %>\n' +
      ' * <%= copyrightNotice %>\n' +
      ' *\n' +
      " * Author: <%= pkg.author.name %> (afalduto [at] gmail dot com).\n" +
      " */\n",

    // configuration

    jshint: {
      dist: ['js/**/*.js']
    },

    clean: {
      build: ['dist']
    },

    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      dist: {
        src: ['js/track.js'],
        dest: 'dist/track.js',
      }
    },

    uglify: {
      options: {
        banner: '<%= banner %>',
        preserveComments: false
      },
      dist: {
        files: [
          {expand: true, cwd: 'dist', src: ['**/*.js'], dest: 'dist/'}
        ]
      }
    },

    strip: {
      dist: {
        src: 'dist/**/*.js',
        options: {
          inline: true
        }
      }
    },

    notify_hooks: {
      options: {
        title: '<%= product %>'
      }
    },

    notify: {
      build: {
        options: {
          title: '<%= product %>',
          message: 'Build completed.'
        }
      }
    },

    watch: {
      files: ['js/**/*.js'],
      tasks: ['default'],
      options: {
        livereload: true
      }
    }

  });

  // plugins

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-strip');
  grunt.loadNpmTasks('grunt-notify');

  // this will load your configuration changes

  grunt.task.run('notify_hooks');

  // tasks

  grunt.registerTask('default', ['jshint', 'clean', 'concat', 'notify:build']);
  grunt.registerTask('dist', ['jshint', 'clean', 'concat', 'uglify', 'strip', 'notify:build']);

};
