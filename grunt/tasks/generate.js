var fs = require('fs'),
    path = require('path');

module.exports = function (grunt) {

    function get_each_module_files(module, root) {
        var dir = path.join(root, module);
        var rtn = [];

        if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
            return rtn;
        }
        var files = fs.readdirSync(dir), fi, first = module + '.js';
        for (var k = 0; k < files.length; k++) {
            fi = path.join(dir, files[k]);
            if (/\.js$/.test(fi) && fs.statSync(fi).isFile()) {
                if (files[k] === first) {
                    rtn.unshift(fi)
                } else {
                    rtn.push(fi);
                }
            }
        }

        return rtn;
    }

    function get_files(modules, root) {
        var module_files = [];
        var em, i, mn;
        var files, sub_files;
        for (i = 0; i < modules.length; i++) {
            em = modules[i];
            if (typeof em === 'string') {
                mn = em;
            } else if (typeof em === 'object') {
                mn = em.name;
            }
            files = get_each_module_files(mn, root);

            if (typeof em === 'object' && em.modules instanceof Array) {
                sub_files = get_files(em.modules, path.join(root, mn));
                [].push.apply(files, sub_files);
            }

            [].push.apply(module_files, files);
        }

        return module_files;
    }

    grunt.registerMultiTask('generate', 'generate source of modules', function () {
        var modules = this.data.modules,
            file_name = this.data.file,
            root = this.data.root;
        var src_files = get_files(modules, root + '/src');
        var src_concat = '';

        grunt.log.write('generate ' + file_name + '...');

        src_files.forEach(function(file) {
            src_concat += fs.readFileSync(file).toString() + '\n\n';
        });
        var file_content = '';
        if(this.target === 'test') {
            file_content = 'function __html_get__(name) { return __html__["'
            + path.join(root, this.data.html_root)
            +'/" + name];}\n'
            + src_concat;
        } else {
            file_content = '(function(){\n' + src_concat + '\n})();';
        }

        fs.writeFileSync(path.join(root, file_name), file_content);

        grunt.log.ok();
    });
};