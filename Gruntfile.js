var app_config = {
  build: {
    root: 'dist',
    file_name: 'jing'
  },
  test: {
    root: 'test',
    html_root: 'test/html',
    file_name: 'jing.test'
  },
  modules: ['util', 'environment', 'module', 'directive', {
    name: 'parse',
    modules: ['node', 'token']
  }, 'event', 'strut', 'datasource', 'drive', 'filter', 'jing'],
  root: __dirname
};

module.exports = function (grunt) {
  grunt.initConfig({
    uglify: {
      build: {
        options: {
          banner: "/*** jing.js(https://github.com/YuhangGe/jing.js) ***/\n",
          sourceMap: true
        },
        files: [{
          src: [app_config.build.root + '/' + app_config.build.file_name + '.js'],
          dest: app_config.build.root + '/' + app_config.build.file_name + '.min.js'
        }]
      }
    },
    compress: {
      build: {
        options: {
          mode: 'gzip'
        },
        src: [app_config.build.root + '/' + app_config.build.file_name + '.min.js'],
        dest: app_config.build.root + '/' + app_config.build.file_name + '.min.js.gzip'
      }
    },
    shell: {
      test: {}
    },
    karma: {
      unit: {
        configFile: 'grunt/karma.conf.js'
      }
    },
    generate: {
      build: {
        modules: app_config.modules,
        root: app_config.root,
        file: app_config.build.root + '/' + app_config.build.file_name + '.js'
      },
      test: {
        modules: app_config.modules,
        root: app_config.root,
        file: app_config.test.root + '/' + app_config.test.file_name + '.js',
        html_root: app_config.test.html_root
      },
      template: {
        modules: app_config.modules,
        root: app_config.root,
        test_root: app_config.test.root,
        file: app_config.test.root + '/index.html',
        temp: app_config.test.root + '/template.html',
        replace: '<!--JING SOURCE FILES-->'
      }
    },
    watch: {
      test: {
        files: ['src/**/*.js', 'test/template.html'],
        tasks: ['generate:template']
      }
    }
  });

  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-compress');

  //load local tasks
  grunt.loadTasks('grunt/tasks');

  grunt.registerTask('build', ['generate:build', 'uglify:build', 'compress:build']);

  grunt.registerTask('test', ['generate:test', 'karma:unit']);

};