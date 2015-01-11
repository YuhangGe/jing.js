/**
 * 由于当前项目还处于探索阶段，因此Gruntfile.js只是预留的。
 * 实际上为了简单起见先手写了下面的代码。
 * 直接执行 'node Gruntfile.js'就可以了。
 */
var FS = require('fs');
var UglifyJS = require("uglify-js");

var files = ['util/util.js',
    'scope/scope.js',
    'module/module.js',
    'module/controller.js',
    'module/directive.js',

    'directive/global.js',
    'directive/j-ctrl.js',
    'directive/j-include.js',
    'directive/j-click.js',
    'directive/j-model.js',
    'directive/j-repeat.js',

    'drive/drive.js',
    'drive/directive.js',
    'drive/view.js',

    'jing.js'];

(function() {
    var output = "(function(){\n";
    files.forEach(function(file) {
        output += FS.readFileSync('src/' + file).toString() + '\n';
    });
    output += '})()';
    FS.writeFileSync('dist/jing.js', output);
    var mi = UglifyJS.minify(output, {fromString: true});
    FS.writeFileSync('dist/jing.min.js', mi.code);
})();
