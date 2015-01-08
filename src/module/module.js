var __module_table = {};
var __scope_counter = 0;

function module_register(name, parent) {
    var __module = {};
    var __factories = {};
    var __controllers = {};
    var __directives = {};
    var __run_array = [];

    if(parent) {
        parent.$children[name] = __module;
    } else {
        __module_table[name] = __module;
    }


    $defineProperty(__module, '$parent', parent ? parent : null);
    $defineProperty(__module, '$children', {});
    $defineProperty(__module, '$name', name);
    $defineProperty(__module, '$scope', scope_create('jing.module.' + __scope_counter++, __module));

    $defineGetterSetter(__module, '$root', function() {
        return this.$parent ? this.$parent.$root : this
    });


    function filter(name, func) {
        if(!func) {
            return __factories.hasOwnProperty(name) ? __factories[name] : null;
        }
        if(typeof func === 'function') {
            //var fi = func(__module.rootScope);
            if(typeof fi === 'function') {
                __factories[name] = fi;
            }
        } else {
            log('filter must be function.')
        }
        return __module;
    }

    function controller_register(name, func) {
        var __ctrl = {};
        var ctrl_scope = scope_create('jing.controller.' + __scope_counter++, __module, __module.$scope);


        $defineProperty(__ctrl, '$name', name);
        $defineProperty(__ctrl, '$module', __module);
        $defineProperty(__ctrl, '$scope', ctrl_scope);

        __controllers[name] = {
            state : 0,
            inst : __ctrl,
            func : func
        };
    }

    function controller(name, func) {
        if(!func) {
            var ctrl = __controllers[name];
            if(!ctrl) {
                log(name, ': controller not found.');
                return null;
            }
            if(ctrl.state === 0) {
                ctrl.state = 999;
                ctrl.func(ctrl.inst.$scope, __module);
                ctrl.state = 1;
            }
            return ctrl.inst;
        } else if(typeof func === 'function'){
            controller_register(name, func);
            return __module;
        } else {
            log('controller must be function');
            return __module;
        }
    }

    function factory_register(name, func) {
        if(__factories.hasOwnProperty(name)) {
            log(name, ':factory has been exists. override!');
        }
        /**
         * state代表当前factory的状态，
         *  0 : 还没有实例化。（lazy load机制，在使用时才实例化。）
         *  1 : 已经实例化。
         *  999 : 正在实例化中。
         */
        var fac;
        if(typeof func === 'function') {
            fac = {
                state : 0,
                inst : null,
                func : func
            }
        } else {
            fac = {
                state : 1,
                inst : func
            }
        }
        __factories[name] = fac;
    }

    function factory(name, func) {
        if(!func) {
            var fac = __factories[name];
            if(!fac) {
                log(name, ': factory not found!');
                return null;
            }
            if(fac.state === 0) {
                fac.state = 999;
                fac.inst = fac.func(__module.$scope, __module);
                fac.state = 1;
            } else if(fac.state === 999) {
                throw 'factory is loading.';
            }
            return fac.inst;
        } else {
            factory_register(name, func);
            return __module;
        }

    }

    function directive_register(name, func) {
        if(typeof func !== 'function') {
            log('directive need function');
            return;
        }
        if(__directives.hasOwnProperty(name)) {
            log('directive exists! override.');
        }
        __directives[name] = {
            state : 0,
            inst : null,
            func : func
        }
    }

    function directive_get(name) {
        var dire = __directives[name];
        if(!dire) {
            return null;
        } else {
            if(dire.state === 0) {
                dire.state = 999;
                var df = dire.func(__module);
                dire.state = 1;
                if(typeof df !== 'function') {
                    throw('directive should return function.');
                }
                dire.inst = df;
            }
            return dire.inst;
        }
    }

    function directive(name, func) {
        if(!func) {
            return directive_get(name);
        } else {
            directive_register(name , func);
            return __module;
        }
    }

    function directive_each(func) {
        for(var dn in __directives) {
            func(dn, directive_get(dn));
        }
    }

    __module.controller = controller;
    __module.filter = filter;
    __module.drive = function drive(element) {
        if(this.$parent) {
            throw 'function "drive" can only be applied to root Module';
        }
        setTimeout(function() {
            for(var i=0;i<__run_array.length;i++) {
                __run_array[i](__module.$scope);
            }
            drive_element(element, __module, __module.$scope);
        }, 0);
        return this;
    };
    __module.factory = factory;
    __module.directive = directive;
    __module.__directive_enum = directive_each;

    __module.run = function(func) {
        if(this.$parent) {
            throw 'function "run" can only be applied to root Module';
        }
        if(typeof func === 'function') {
            __run_array.push(func);
        }
        return this;
    };

    return __module;
}

function module_require(name, module) {
    var ns = name.split('.');
    var mo;
    for(var i=0;i<ns.length-1;i++) {
        mo = i===0 ? __module_table[ns[i]] : mo.$children[ns[i]];
        if(!mo) {
            throw 'require error: module ' + name + ' not found.';
        }
    }
    var mt = mo ? mo : module;
    var ln = ns[ns.length -1];
    var fac = mt.factory(ln);
    if(!fac) {
        throw 'require error: factory '+ name + ' not found.';
    }
    return fac;
}


function module_create(name) {
    var ns = name.split('.');
    var pm, cm;
    for(var i=0;i<ns.length-1;i++) {
        cm = i===0 ? __module_table[ns[i]] : pm.$children[ns[i]];
        if(!cm) {
            cm = module_register(ns[i], pm);
        }
        pm = cm;
    }
    var mt = pm ? pm.$children : __module_table;
    var ln = ns[ns.length-1];
    if(mt.hasOwnProperty(ln)) {
        return mt[ln];
    } else {
        return module_register(ln, pm);
    }
}

function module_extract(name_array) {
    if(name_array.length <= 1) {
        return null;
    }
    var m;
    for(var i=0;i<name_array.length-1;i++) {
        m = i === 0 ? __module_table[name_array[i]] : m.children[name_array[i]];
        if(!m) {
            return null;
        }
    }
    return m;
}