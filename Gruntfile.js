var app_config = {
    build: {
        root: 'dist',
        file_name : 'jing'
    },
    test : {
        root: 'test',
        html_root : 'test/html',
        file_name : 'jing.test'
    },
    modules : ['util', 'scope', 'module', 'directive', {
        name : 'parse',
        modules : ['node']
    }, 'drive', 'filter', 'jing'],
    root : __dirname
};

//
//(function() {
//    var output = "(function(){\n";
//    files.forEach(function(file) {
//        output += FS.readFileSync('src/' + file).toString() + '\n';
//    });
//    output += '})()';
//    FS.writeFileSync('dist/jing.js', output);
//    var mi = UglifyJS.minify(output, {fromString: true});
//    FS.writeFileSync('dist/jing.min.js', mi.code);
//})();

module.exports = function(grunt) {
    grunt.initConfig({
        uglify: {
            build: {
                options : {
                    banner : "/*** jing.js(https://github.com/YuhangGe/jing.js) ***/\n"
                },
                files: [{
                    src : [app_config.build.root + '/' + app_config.build.file_name + '.js'],
                    dest : app_config.build.root + '/' + app_config.build.file_name + '.min.js'
                }]
            }
        },
        shell: {
            test : {

            }
        },
        karma: {
            unit: {
                configFile: 'grunt/karma.conf.js'
            }
        },
        generate : {
            build : {
                modules : app_config.modules,
                root : app_config.root,
                file : app_config.build.root + '/' + app_config.build.file_name + '.js'
            },
            test : {
                modules : app_config.modules,
                root : app_config.root,
                file : app_config.test.root + '/' + app_config.test.file_name + '.js',
                html_root : app_config.test.html_root
            }
        }
    });

    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-shell');

    //load local tasks
    grunt.loadTasks('grunt/tasks');

    grunt.registerTask('build', ['generate:build', 'uglify:build']);

    grunt.registerTask('test', ['generate:test', 'karma:unit']);

};