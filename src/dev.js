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

            'jing.js'], run);
    });
})();

function run() {
    jing.module('Service')
        .factory('A', function(module) {

            /*
             * 获取rootScope的标准方法是通过任意一个scope来调用scope.$root.
             *   通常情况下，factory中不应该直接访问rootScope.
             *   但是，如果一定想要得到rootScope，
             *   可以使用 jing.scope(module.path)
             *      但当该module没有drive任何html元素，这个函数返回空值。
             *
             * 从软件工程角度讲，两个模块之间应该是松耦合的，
             *   不同模块的factory不应该直接去访问其它模块的rootScope,
             *   如果一定要访问，使用下面的方法。
             * 注意，如果jing.scope传入的module没有drive任何html元素，则返回为空值。
             */
            var rootScope = jing.scope(jing.module('MyApp').path); // return rootScope of app.
            var rootScope2 = jing.scope(jing.module('Service3.ChildS1.ChildS2').path); //return undefined/null

            var SeB = module.require('B');
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
        .factory('B', function(module) {

            /*
             * 如果下面这行代码取消注释，则会抛出循环依赖的异常。
             *
             */
            //var SA = module.require('A');  //throw circular require exception, because factory A has required B.
            var CC = module.require('Service3.ChildS1.ChildS2.CC');
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
        .factory('MyService', function() {
            var _ = {};
            var n = 1;
            Object.defineProperty(_, 'tick', {
                get : function() {
                    return n++;
                }
            });

            return _;
        })
        .controller("TestCtrl", function (module, scope) {
            var ServiceA = module.require('Service.A');
            var ServiceB = module.require('Service.B');
            var MyService = module.require('MyService');
            var CS = module.require('Service3.ChildS1.ChildS2.CC');

            /*
             * 上面四行代码等价于下面四行。
             * 通过module.require来导入依赖，这种情况下可以省略模块名，
             *   则表示从该module里面查找。
             * 此外，jing.require和jing.factory函数是同一个函数，都是获取模块里面的factory.
             * var SA = jing.require('Service.A');
             * var SB = jing.require('Service.B');
             * var SC = jing.require('MyApp.MyService');
             * var CS = jing.require('Service3.ChildS1.ChildS2.CC');
             */

            /*
             * 获取rootScope的标准方法是通过任意一个scope来调用scope.$root.
             *   通常情况下，factory中不应该直接访问rootScope.
             *   但是，如果一定想要得到rootScope，
             *   可以使用 jing.scope(module.path)
             *      但当该module没有drive任何html元素，这个函数返回空值。
             */
            //var rootScope = jing.scope(module.path)
            var rootScope = scope.$root;

            log(ServiceA.array);
            log(ServiceB.func(), ServiceB.func());
            log(MyService.tick, MyService.tick, MyService.tick, MyService.tick);
            log(CS);
            log(rootScope.rootMessage);
            log(rootScope.oooo);

            scope.message = 'Hello, World!';
            scope.boys = [1, 2, 3, 4];
            scope.test = function (event) {
                log(event);
                alert(scope.message);
                log(this.message); //this 即 scope
                scope.message = "Hello, Jing!";
                this.boys.push(6);
                log(scope.boys);
                scope.$root.message = "update message from client to server";
            };
            scope.$watch('boys', function(var_name, new_value, data) {
                log('boys changed to ', new_value);
                log(data);
            }, {
                info : '额外的数据'
            });

            scope.book_list = module.dataSource('bookList');

        })
        .data('bookList', function() {
            return {
                type : 'json'
            }
        })
        .data('message', function() {
            return {
                type : 'text'
            }
        })
        .config({
            data_source_url : 'http://localhost:8088/datasource'
        })
        .initialize(function(module, rootScope) {
            var CC = module.require('Service3.ChildS1.ChildS2.CC');
            rootScope.rootMessage = module.data('message');
        })
        .drive(document.body);

    document.createDocumentFragment()
}
