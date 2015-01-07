(function() {
    var complete_handler = null;
    var index = 0;
    var total = 0;
    var scripts_to_load = [];
    var $head = null;
    function log() {
        console.log.apply(console, arguments);
    }

    function loadScript(scripts, on_complete) {
        complete_handler = on_complete;
        for(var i=0;i<scripts.length;i++) {
            [].push.apply(scripts_to_load, scripts[i].split(','));
        }
        total = scripts_to_load.length;
        setTimeout(do_load, 0);
    }

    function do_load() {
        if(index === total) {
            complete_handler();
            return;
        }
        var s = document.createElement('script');
        s.src = scripts_to_load[index];
        s.onload = function() {
            index++;
            setTimeout(do_load, 0);
        };
        $head.appendChild(s);
    }

    document.addEventListener('DOMContentLoaded', function() {
        $head = document.getElementsByTagName('head')[0];

        loadScript(['util/util.js',
            'scope/scope.js',
            'ctrl/controller.js',
            'directive/directive.js',
            'directive/j-click.js',
            'directive/j-model.js',
            'directive/j-repeat.js',
            'module/module.js',
            'drive/drive.js',
            'drive/parse.js',
            'jing.js'], run);
    });
})();

function run() {
    jing.controller("TestCtrl", function($ctrl) {
        $ctrl.declare({
            'message' : 'Hello, World!',
            'boys' : [1,2,3,4]
        });
        $ctrl.declare("test", function(ev) {

            alert($ctrl.message);
            console.log(this.message); //this 即 $ctrl
            $ctrl.message = "Hello, Jing!";
            this.boys.push(6);
            console.log($ctrl.boys);
        });
    });

    jing.drive(document.body);
}
