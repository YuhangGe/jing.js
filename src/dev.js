(function () {
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
        for (var i = 0; i < scripts.length; i++) {
            [].push.apply(scripts_to_load, scripts[i].split(','));
        }
        total = scripts_to_load.length;
        setTimeout(do_load, 0);
    }

    function do_load() {
        if (index === total) {
            complete_handler();
            return;
        }
        var s = document.createElement('script');
        s.src = scripts_to_load[index];
        s.onload = function () {
            index++;
            setTimeout(do_load, 0);
        };
        $head.appendChild(s);
    }

    document.addEventListener('DOMContentLoaded', function () {
        $head = document.getElementsByTagName('head')[0];

        loadScript(['util/util.js',
            'scope/scope.js',
            'directive/j-click.js',
            'directive/j-model.js',
            'directive/j-repeat.js',
            'module/module.js',
            'drive/drive.js',
            'drive/directive.js',
            'drive/parse.js',
            'jing.js'], run);
    });
})();

function run() {
    jing.module('Service')
        .factory('A', function($scope) {
            /*
             * 以下三行代码等价。
             * var SB2 = $module.require('B');
             * var SB3 = $scope.module.require('B');
             *
             * factory会被传入当前module : $module, 当前module的rootScope : $scope.
             * 而scope的属性module又返回该module。
             */
            var SeB = $scope.$require('B');
            var arr = [];
            for(var i=0; i<10;i++) {
                arr.push(SeB.func());
            }

            return {
                array : arr,
                func : function(idx) {
                    return (idx > 0 && idx < arr.length) ? arr[idx] : null
                }
            }
        })
        .factory('B', function($scope) {
            var otherRootScope = jing.module('MyApp').$scope;
            otherRootScope.$declare({
                'oooo' : 323
            });

            /*
             * var SA = require('A')
             * 注意这里不能有这行代码。不允许循环依赖。
             */
            var CC = $scope.$require('Service3.ChildS1.ChildS2.CC');
            var name = 'Alibaba';
            return {
                func : function() {
                    return name + ' : ' + (CC++);
                }
            }
        });
    /*
     * 模块的定义非常灵活。原则就是，如果有，就返回。如果没有，就创建。
     * 支持通过点号来分隔定义子模块。不需要像angularjs得先创建再使用，是分开的。
     *
     * 但这样一来也有坏处，可能不利于大型项目的开发。未来版本的处理方式还待定。
     */
    jing.module('Service3.ChildS1.ChildS2')
        .factory('CC', 8888);

    jing.module('MyApp')
        .factory('MyService', function($scope) {
            var rootScope = $scope.$root;
            rootScope.$declare({
                'message' : 'root message'
            });

            var _ = {};
            var n = 1;
            Object.defineProperty(_, 'tick', {
                get : function() {
                    return n++;
                }
            });

            return _;
        })
        .controller("TestCtrl", function ($scope) {
            var ServiceA = $scope.$require('Service.A');
            var ServiceB = $scope.$require('Service.B');
            var MyService = $scope.$require('MyService');
            var CS = $scope.$require('Service3.ChildS1.ChildS2.CC');

            /*
             * 上面四行代码等价于下面四行。
             * 可以通过$scope.require来导入依赖，这种情况下可以省略模块名。
             * var SA = jing.require('Service.A');
             * var SB = jing.require('Service.B');
             * var SC = jing.require('MyApp.MyService');
             * var CS = jing.require('');
             */

            var rootScope = $scope.$root;

            log(ServiceA.array);
            log(ServiceB.func(), ServiceB.func());
            log(MyService.tick, MyService.tick, MyService.tick, MyService.tick);
            log(CS);
            log(rootScope.rootMessage);
            log(rootScope.oooo);

            $scope.$declare({
                'message': 'Hello, World!',
                'boys': [1, 2, 3, 4]
            });
            $scope.$declare("test", function (ev) {

                alert($scope.message);
                console.log(this.message); //this 即 $ctrl
                $scope.message = "Hello, Jing!";
                this.boys.push(6);
                console.log($scope.boys);
            });
        })
        .drive(document.body)
        .run(function($rootScope) {
            $rootScope.$declare({
                'rootMessage' : 'root message: hello.'
            });
        });
}
