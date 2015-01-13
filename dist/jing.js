(function(){
function $inherit(inheritClass, baseClass) {
    if(typeof inheritClass === 'undefined' || typeof baseClass ==='undefined'){
        console.trace();
        throw "inherit error!";
    }
    //首先把父类的prototype中的函数继承到子类中
    for(var pFunc in baseClass.prototype) {
        var sp = inheritClass.prototype[pFunc];
        //如果子类中没有这个函数，添加
        if( typeof sp === 'undefined') {
            inheritClass.prototype[pFunc] = baseClass.prototype[pFunc];
        }
        //如果子类已经有这个函数，则忽略。以后可使用下面的callBase函数调用父类的方法

    }
    //保存继承树，当有多级继承时要借住继承树对父类进行访问
    inheritClass.__base_objects__ = [];
    inheritClass.__base_objects__.push(baseClass);

    if( typeof baseClass.__base_objects__ !== 'undefined') {
        for(var i = 0; i < baseClass.__base_objects__.length; i++)
            inheritClass.__base_objects__.push(baseClass.__base_objects__[i]);
    }

    /**
     * 执行父类构造函数，相当于java中的this.super()
     * 不使用super是因为super是ECMAScript保留关键字.
     * @param {arguments} args 参数，可以不提供
     */
    inheritClass.prototype.base = function(args) {

        var baseClass = null, rtn = undefined;
        if( typeof this.__inherit_base_deep__ === 'undefined') {
            this.__inherit_base_deep__ = 0;
        } else {
            this.__inherit_base_deep__++;
        }

        baseClass = inheritClass.__base_objects__[this.__inherit_base_deep__];

        if( typeof args === "undefined" || args == null) {
            rtn = baseClass.call(this);
        } else if( args instanceof Array === true) {
            rtn = baseClass.apply(this, args);
        } else {
            // arguments 是Object而不是Array，需要转换。
            rtn = baseClass.apply(this, [].slice.call(arguments));
        }

        this.__inherit_base_deep__--;

        //$.dprint("d-:"+this.__inherit_deep__);
        return rtn;
    };
    /**
     * 给继承的子类添加调用父函数的方法
     * @param {string} method 父类的函数的名称
     * @param {arguments} args 参数，可以不提供
     */
    inheritClass.prototype.callBase = function(method, args) {

        var baseClass = null, rtn = undefined;

        if( typeof this.__inherit_deep__ === 'undefined') {
            this.__inherit_deep__ = 0;

        } else {
            this.__inherit_deep__++;
            //$.dprint("d+:"+this.__inherit_deep__);
        }

        //$.dprint(this.__inherit_deep__);
        baseClass = inheritClass.__base_objects__[this.__inherit_deep__];

        var med = baseClass.prototype[method];
        if( typeof med === 'function') {
            if( typeof args === "undefined" || args === null) {
                rtn = med.call(this);
            } else if( args instanceof Array === true) {
                rtn = med.apply(this, args);
            } else {
                rtn = med.apply(this, [].slice.call(arguments, 1));
            }
        } else {
            throw "There is no method:" + method + " in baseClass";
        }

        this.__inherit_deep__--;
        return rtn;
    };
}

function $extend(dst, src) {
    for(var kn in src) {
        dst[kn] = src[kn];
    }
}
function $bind(instance, func) {
    return function() {
        func.apply(instance, arguments);
    };
}
function $css(ele, name, value) {
    //todo name如果是'background-color'这样的带短横线的，要转成'backgroundColor'
    if(typeof name === 'object') {
        for(var kn in name) {
            ele.style[kn] = name[kn];
        }
    } else {
        ele.style[name] = value;
    }
}
function $attr(ele, attr_name, attr_value) {
    if(typeof attr_value !== 'undefined') {
        ele.setAttribute(attr_name, attr_value);
    } else {
        return ele.getAttribute(attr_name);
    }
}
function $hasAttr(ele, attr_name) {
    if(attr_name instanceof Array) {
        for(var i=0;i<attr_name.length;i++) {
            if(!ele.hasAttribute(attr_name[i])) {
                return false;
            }
        }
    } else {
        return ele.hasAttribute(attr_name);
    }
}
function $data(ele, data) {
    if(typeof data !== 'undefined') {
        ele['__JING_BIND_DATA__'] = data;
    } else {
        return ele['__JING_BIND_DATA__'];
    }
}
function $each(arr, func) {
    for(var i=0;i<arr.length;i++) {
        if(func(arr[i], arr[i], i)===false) {
            return;
        }
    }
}
function $in(obj, func) {
    for(var kn in obj) {
        if(func(obj[kn], kn) === false) {
            return;
        }
    }
}
function $defineProperty(obj, prop, value, writable, enumerable) {
    Object.defineProperty(obj, prop, {
        value : value,
        writable : writable ? true : false,
        enumerable : enumerable ? true : false
    });
}
function $hasProperty(obj, prop) {
    return obj.hasOwnProperty(prop);
}

function $defineGetterSetter(obj, prop, getter, setter, configurable, enumerable) {
    var desc = {
        configurable : configurable ? true : false,
        enumerable : enumerable ? true : false
    };
    if(getter) {
        desc['get'] = getter;
    }
    if(setter) {
        desc['set'] = setter;
    }
    Object.defineProperty(obj, prop, desc);
}

function $on(ele, event_name, event_handler) {
    ele.addEventListener(event_name, event_handler);
}
function $timeout(func, time) {
    setTimeout(func, time);
}
function log() {
    console.log.apply(console, arguments);
}
function $isArray(obj) {
    return obj instanceof Array;
}
function $isUndefined(obj) {
    return typeof obj === 'undefined';
}
function $merge(src, options) {
    if(!options) {
        return src;
    }
    for(var kn in options) {
        src[kn] = options[kn];
    }
    return src;
}
function $copyArray(arr) {
    var rtn = [];
    for(var i=0;i<arr.length;i++) {
        rtn.push(arr[i]);
    }
    return rtn;
}
/*
 * 在部署时，所有$assert的调用都应该删除。
 */
function $assert(condition) {
    if(!condition) {
        throw '$assert failure!';
    }
}

var __AM = ['push', 'pop', 'reverse', 'shift', 'sort', 'unshift', 'splice'];
var __AProto = Array.prototype;
var __scope_counter = 0;
var __root_scope_table = {};

function Scope(name, parent) {
    /**
     * $$用来保存通过$declare定义的变量。
     * __用来保存支撑逻辑的内部变量。
     * 通过这个方式，使用Scope的实例尽可能信息隐藏；
     *   通过for in只能取到通过$declare定义的变量。
     */
    var __ = {};
    $defineProperty(this, '__', __);
    $defineProperty(__, 'watchers', {});

    $defineProperty(this, '$$', {});

    $defineProperty(this, '$name', name);
    $defineProperty(this, '$children', {});
    $defineProperty(this, '$parent', parent ? parent : null);

}

var __scope_prototype = Scope.prototype;

$defineGetterSetter(__scope_prototype, '$root', function() {
    return this.$parent ? this.$parent.$root : this;
});

$defineProperty(__scope_prototype, '$declare', function(var_name, var_value) {
    var $me = this;

    if(typeof var_name === 'object') {
        for(var vn in var_name) {
            $me.$declare(vn, var_name[vn]);
        }
    } else if(typeof var_value !== 'function') {
        if(var_value instanceof Array) {
            $each(__AM, function(item) {
                var_value[item] = function() {
                    var rtn = __AProto[item].apply(this, arguments);
                    $me.$emit(var_name);
                    return rtn;
                }
            });
            /*
             * 由于js不能重载[]运算符。因此要修改元素，只能使用set函数才能影响。
             * ES6里面会引入新的Proxy方式，可以实现重载[]运算符的功能。未来的版本可以修改。
             */
            var_value.$set = function(idx, val) {
                this[idx] = val;
                $me.$emit(var_name);
            };
        }

        $me.$$[var_name] = var_value;

        if(var_value instanceof DataSource) {

            $defineGetterSetter($me, var_name, function() {
                return $me.$$[var_name].get();
            }, function(val) {
                if($me.$$[var_name].get() === val) {
                    return;
                }
                $me.$$[var_name].update(val);
                $me.$emit(var_name);
            }, true, true);
        } else {
            $defineGetterSetter($me, var_name, function() {
                return $me.$$[var_name];
            }, function(val) {
                if($me.$$[var_name] === val) {
                    return;
                }
                $me.$$[var_name] = val;
                $me.$emit(var_name);
            }, true, true);
        }
    }
});


$defineProperty(__scope_prototype, '$child', function(name) {
    if(!name) {
        name = this.$parent ? this.$parent.name + '.' + __scope_counter++ : 'jing.scope.' + __scope_counter++;
    }
    var cd = this.$children;
    if($hasProperty(cd, name)) {
        return cd[name];
    } else {
        var cs = new Scope(name, this);
        $defineProperty(cd, name, cs, false, true);
        return cs;
    }
});

$defineProperty(__scope_prototype, '$get', function(var_name) {
    if($hasProperty(this, var_name)) {
        return this[var_name];
    } else if(this.$parent) {
        return this.$parent.$get(var_name);
    } else {
        return null;
    }
});

$defineProperty(__scope_prototype, '$set', function(var_name, value) {
    if($hasProperty(this, var_name)) {
        this[var_name] = value;
    } else if(this.$parent) {
        this.$parent.set(var_name, value);
    } else {
        throw 'scope does not have declare var:' + var_name;
    }
});

function scope_create(parent) {
    var name = this.$parent ? this.$parent.name + '.' + __scope_counter++ : 'jing.scope.' + __scope_counter++;
    var cs = new Scope(name, parent);
    if(parent) {
        $defineProperty(parent.$children, name, cs, false, true);
    }
    return cs;
}

$defineProperty(__scope_prototype, '$watch', function(var_name, callback, data) {
    if(typeof callback !== 'function') {
        log('$watch need function');
        return;
    }

    var names = var_name instanceof  Array ? var_name : var_name.split('.');

    if(!$hasProperty(this.$$, var_name)) {
        if(!$hasProperty(this, var_name)) {
            log('"'+var_name+'" of scope:' + this.name + ' not found!');
            return;
        }
        var val = this[var_name];
        delete this[var_name];
        this.$declare(var_name, val);
    }
    var watchers = this.__.watchers;
    if(!$hasProperty(watchers, var_name)) {
        watchers[var_name] = new Watcher(this, var_name, null);
    }
    __watch[var_name].push({
        cb : callback,
        data : data
    });
});

$defineProperty(__scope_prototype, '$emit', function(var_name) {
    var __watch = this.__.watch;
    var w_arr = __watch[var_name];
    if(!w_arr || w_arr.length === 0) {
        return;
    }
    //may be replace by setImmediate in future
    //todo 当连续几行代码改变是的同一个变量时，不应该每一行代码都更新一次。目前还只是demo初期版本。
    $timeout($bind(this, function() {
        for(var i=0;i<w_arr.length;i++) {
            w_arr[i].cb(var_name, this.$$[var_name], w_arr[i].data);
        }
    }), 0);
});

function Handler(func, data) {
    this.handler = func;
    this.data = data;
}

function Watcher(scope, var_name, parent) {
    $defineProperty(this, 'scope', scope);
    $defineProperty(this, 'children', {});
    $defineProperty(this, 'parent', parent ? parent : null);
    $defineProperty(this, 'listeners', []);
    $defineProperty(this, 'name', var_name);

    this.old_value = scope[var_name];
}
var __watcher_prototype = Watcher.prototype;

$defineProperty(__watcher_prototype, 'emit', function(new_value) {
    var ls_arr = this.listeners, ls;
    for(var i=0;i<ls_arr.length;i++) {
        ls = ls_arr[i];
        ls.handler(this.old_value, new_value, ls.data);
    }
    var children = this.children;
    for(var cn in children) {
        children[cn].emit(new_value[cn]);
    }
    this.old_value = new_value;
});

/*
 * 保存全局的顶层Module
 */
var __module_table = {};
var __root_module = new Module('jing', null);

/**
 * directive的scope类型，
 *
 */
var __SCOPE_TYPE_INHERIT = 0;
var __SCOPE_TYPE_CREATE = 1;
var __SCOPE_TYPE_PARENT = 2;

function Module(name, parent) {
    var __ = {};
    $defineProperty(this, '__', __);
    $defineProperty(__, 'factories', {});
    $defineProperty(__, 'directives', {});
    $defineProperty(__, 'runs' , []);
    $defineProperty(__, 'controllers', {});
    $defineProperty(__, 'datasources', {});
    $defineProperty(__, 'config', {
        data_source_url : 'datasource'
    });

    $defineProperty(this, 'parent', parent ? parent : null);
    $defineProperty(this, 'children', {});
    $defineProperty(this, 'name', name);


}
var __module_prototype = Module.prototype;

function module_require(name, module) {
    var ns = name.split('.');
    var module_array = __module_table,
        mo;
    for(var i=0;i<ns.length-1;i++) {
        mo = module_array[ns[i]];
        if(!mo) {
            throw 'require error: module ' + name + ' not found.';
        }
        module_array = mo.children;
    }
    var mt = mo ? mo : module;
    var ln = ns[ns.length-1];
    var fac = mt.factory(ln);
    if(!fac) {
        throw 'require error: factory '+ name + ' not found.';
    }
    return fac;
}

$defineProperty(__module_prototype, 'require', function(name) {
    return module_require(name, this);
});

function module_create(name) {
    var ns = name.split('.');
    var module_array = __module_table,
        parent_module = null,
        child_module;
    for(var i=0;i<ns.length-1;i++) {
        child_module = module_array[ns[i]];
        if(!child_module) {
            child_module = new Module(ns[i], parent_module);
            $defineProperty(module_array, ns[i], child_module, false, true);
        }
        module_array = child_module.children;
        parent_module = child_module;
    }

    var ln = ns[ns.length-1];
    if($hasProperty(module_array, ln)) {
        return module_array[ln];
    } else {
        child_module = new Module(ln, parent_module);
        $defineProperty(module_array, ln, child_module);
        return child_module;
    }
}

function module_get(name, include_last) {
    var ns = name.trim().split('.');
    if(!include_last && ns.length <= 1) {
        return null;
    }
    var m, e = include_last ? ns.length : ns.length-1;
    for(var i=0;i<e;i++) {
        m = i === 0 ? __module_table[ns[i]] : m.children[ns[i]];
        if(!m) {
            return null;
        }
    }
    return include_last ? m : [m, ns[ns.length-1]];
}
$defineGetterSetter(__module_prototype, 'path', function path() {
    return this.parent ? this.parent.path + '.' + this.name : this.name;
});
$defineGetterSetter(__module_prototype, 'root', function root() {
    return this.parent ? this.parent.root : this
});
$defineProperty(__module_prototype, 'drive', function drive(element) {
    if(this.parent) {
        throw 'function "drive" can only be applied to root Module';
    }
    var root_scope = new Scope('jing.scope.' + this.path + __scope_counter++);
    __root_scope_table[this.path] = root_scope;

    setTimeout($bind(this, function() {
        for(var i=0;i<this.__.runs.length;i++) {
            this.__.runs[i](this, __root_scope_table[this.path]);
        }
        drive_parse_element(element, this, root_scope);
    }), 0);

    return this;
});
$defineProperty(__module_prototype, 'factory', function factory(name, func) {
    var fac;
    if(!func) {
        fac = this.__.factories[name];
        if(!fac) {
            log(name, ': factory not found!');
            return null;
        }
        if(fac.state === 0) {
            fac.state = 999;
            fac.inst = fac.func(this);
            fac.state = 1;
        } else if(fac.state === 999) {
            throw 'factory "'+name+'" of Module "' + this.name +'" is loading. 可能的原因是产生了循环依赖。';
        }
        return fac.inst;
    } else {
        if(this.__.factories.hasOwnProperty(name)) {
            log(name, ':factory has been exists. override!');
        }
        /**
         * state代表当前factory的状态，
         *  0 : 还没有实例化。（lazy load机制，在使用时才实例化。）
         *  1 : 已经实例化。
         *  999 : 正在实例化中。
         */
        var is_func = typeof func === 'function';
        fac = {
            state : is_func ? 0 : 1,
            inst : is_func ? null : func,
            func : is_func ? func : null
        };
        this.__.factories[name] = fac;
        return this;
    }

});
$defineProperty(__module_prototype, 'directive', function directive(name, scope_type, func) {
    var dire;
    if(!func) {
        dire = this.__.directives[name];
        if(!dire) {
            return null;
        } else {
            directive_initialize(dire, this);
            return dire.inst;
        }
    } else {
        if(typeof func !== 'function') {
            log('directive need function');
            return;
        }
        if(this.__.directives.hasOwnProperty(name)) {
            log('directive exists! override.');
        }
        dire = new Directive(this, name,  scope_type, func);
        this.__.directives[name] = dire;
        directive_register(dire);
        return this;
    }
});
$defineProperty(__module_prototype, 'initialize', function(func) {
    if(this.parent) {
        throw 'function "initialize" can only be applied to root Module';
    }
    if(typeof func === 'function') {
        this.__.runs.push(func);
    }
    return this;
});
$defineProperty(__module_prototype, 'config', function(options) {
    for(var kn in options) {
        if($hasProperty(this.__.config, kn)) {
            this.__.config[kn] = options[kn];
        }
    }
    return this;
});

$defineProperty(__module_prototype, 'controller', function(name, func) {
    var $controllers = this.__.controllers;
    if(!func) {
        return $controllers[name];
    } else if(typeof func === 'function'){
        $defineProperty($controllers, name, new Controller(this, name, func));
        return this;
    } else {
        log('controller must be function');
        return this;
    }
});

function Controller(module, name, func) {
    this.name = name;
    this.module = module;
    this.func = func;
}
var __controller_prototype = Controller.prototype;

__controller_prototype.bind_scope = function(module, scope) {
    /**
     * bind_scope里面传入的module不一定和该controller的this.module一样。
     * bind_scope传入的module是驱动根元素(.drive函数)函数所属于的module，
     *    scope是该根元素向下传递的scope.
     * this.module是该controller定义时所属于的module(.controller函数的调用者)
     */
    this.func(module, scope);
};

$defineProperty(__module_prototype, 'data', function(name, func) {
    var ds = this.__.datasources;
    if(typeof func === 'function') {
        ds[name] = {
            state : 0,
            func : func,
            inst : null
        }
    } else {
        var d = ds[name];
        if(!d) {
            throw 'Data Source "' + name + '" not found.';
        }
        if(d.state === 0) {
            d.inst = new DataSource(name, d.func(this));
            d.state = 1;
        }
        return d.inst.value;
    }
});

function Directive(module, name, scope_type, func) {
    this.name = name;
    this.module = module;
    this.state = 0;
    this.scope_type = typeof scope_type === 'function' ? __SCOPE_TYPE_INHERIT : scope_type;
    this.func = typeof scope_type === 'function' ? scope_type :func;
    this.link_func = null;
}
var __directive_prototype = Directive.prototype;


var __directive_short_table = {};
var __directive_full_table = {};


function directive_initialize(dire) {
    if(!dire) {
        debugger;
    }
    if(dire.state === 0) {
        dire.state = 999;
        var df = dire.func(dire.module);
        dire.state = 1;
        dire.link_func = df;
    }
}

function directive_register(directive) {
    __directive_short_table[directive.name] = directive;
    __directive_full_table[directive.module.path + '.' + directive.name] = directive;
}

function directive_create(name, scope_type, func) {
    directive_register(new Directive(__root_module, name, scope_type, func));
}

directive_create('j-click', function() {
    return function(drive_module, directive_module, scope, element, attr_value, attr_name) {
        var handler = scope[attr_value];
        if(typeof handler !== 'function') {
            //当前版本暂时只能直接j-click=scope.function
            throw 'j-click need function.'
        }
        $on(element, 'click', $bind(scope, handler));
    }
});

directive_create('j-ctrl', __SCOPE_TYPE_PARENT, function() {

    return function(drive_module, directive_module, scope, element, attr_value) {
        var ctrl;
        if(attr_value.indexOf('.') >= 0) {
            var ms = module_get(attr_value, false);
            if(!ms) {
                throw 'j-ctrl: controller "'+attr_value+'" not found. module not found.';
            }
            ctrl = ms[0].controller(ms[1]);
        } else {
            ctrl = drive_module.controller(attr_value.trim());
        }
        if(!ctrl) {
            throw 'j-ctrl: controller "' + attr_value + '" not found.';
        }
        ctrl.bind_scope(drive_module, scope);
    }

});

//directive_create('j-include', __SCOPE_TYPE_INHERIT, function() {
//
//});

directive_create('j-model', function() {
    return function(drive_module, directive_module, scope, element, attr_value) {
        if(element.nodeName !== 'INPUT') {
            return;
        }
        $data(element, scope);
        $on(element, 'input', function() {
            $data(this)[$attr(this, 'j-model')] = this.value;
        });
        element.value = scope[attr_value];
        scope.$watch(attr_value, function(var_name, new_value, input_ele) {
            input_ele.value = new_value;
        }, element);
    };
});

directive_create('j-repeat', function() {

    return function(drive_module, directive_module, scope, element, attr_value) {

        /**
         * todo 还有很多问题需要解决。
         * 1. 使用更高效率的createDocumentFragment一类的函数。避免多次appendChild和removeChild。
         * 2. parse
         */
        var scope_value = scope[attr_value];
        if(!scope_value instanceof Array) {
            log('j-repeat need Array!');
            return;
        }
        $css(element, 'display', 'none');
        $data(element, []);

        render(element, scope_value);

        scope.$watch(attr_value, function(var_name, new_value, element) {
            update(element, new_value);
        }, element);

        function render(element, array) {
            var pn = element.parentNode, ne,
                e_arr = $data(element);
            for(var i=0;i<array.length;i++) {
                ne = element.cloneNode(true);
                $css(ne, 'display', 'block');
                ne.removeAttribute('j-repeat');
                pn.appendChild(ne);
                e_arr.push(ne);
            }
        }
        function update(element, new_array) {
            var arr = $data(element);
            for(var i=0;i<arr.length;i++) {
                arr[i].parentNode.removeChild(arr[i]);
            }
            arr.length = 0;
            render(element, new_array);
        }

    };
});

function GrammarNode(type, child_nodes, properties) {
    this.type = type;
    this.nodes = child_nodes ? child_nodes : [];
    this.props = $merge({
        writable : false //是否是可以写入的类型。比如 ng-model=''这种指令就需要writable为true
    }, properties);
}
GrammarNode.prototype = {
    increment : function(scope, is_add) {
        return this.exec(scope);
    },
    exec : function(scope) {
        return this.nodes[0].exec(scope);
    }
};

function parse_inherit_node(node, exec_func, other_proto) {
    node.prototype.exec = exec_func;
    if(other_proto) {
        $extend(node.prototype, other_proto);
    }
    $inherit(node, GrammarNode);
}


var __parse_text = '';
var __parse_idx = 0;
var __parse_end = 0;
var __parse_chr = '';

function parse_is_space(char) {
    //空字符其实还有很多，但考虑代码中可能出现的情况，基本就下面四种。
    return char === ' ' || char === '\r' || char === '\t' || char === '\n';
}
function parse_read_char(ignore_space) {
    if(__parse_idx === __parse_end) {
        __parse_chr = null;
        return __parse_chr;
    }
    __parse_chr = __parse_text.charAt(__parse_idx++);
    ignore_space = ignore_space ? true : false;
    while(ignore_space && parse_is_space(__parse_chr)) {
        if(__parse_idx === __parse_end) {
            __parse_chr = null;
            return __parse_chr;
        }
        __parse_chr = __parse_text.charAt(__parse_idx++);
    }

    return __parse_chr;
}

function parse_is_number_char(chr) {
    return chr >= '0' && chr <= '9';
}
function parse_is_variable_char(chr) {
    return (chr >= 'a' && chr <= 'z')
        ||(chr>='A' && chr<= 'Z')
        || (chr >= '0' && chr <= '9')
        || chr === '_' || chr === '$';
}


function parse_error() {
    throw 'parse error: ' + __parse_text;
}

function parse_read_when(condition_func) {
    var start_idx = __parse_idx- 1,
        idx = start_idx;
    var chr;
    while((chr=idx<__parse_end ? __parse_text[idx] : null) !== null && condition_func(chr)) {
        idx++;
    }
    __parse_chr = chr;
    __parse_idx = idx;
    return __parse_text.substring(start_idx, idx);
}

function parse_number() {
    return parse_read_when(function(chr) {
        return (chr >= '0' && chr <= '9') || chr === '.'
    });
}

function parse_variable() {
   return parse_read_when(parse_is_variable_char);
}

function parse_read_until(char) {
    var start_idx = __parse_idx-1,
        idx = __parse_idx-1;
    var chr;
    while((chr = idx<__parse_end ? __parse_text[idx] : null) !== null
    && chr !== char) {
        idx++;
    }
    __parse_idx = idx;
    return __parse_text.substring(start_idx, idx);
}

function parse_string(quote) {
    return parse_read_until(quote);
}
function parse_init(text) {
    __parse_text = text;
    __parse_idx = 0;
    __parse_end = text.length;
}

function parse_look_after(count) {
    return __parse_text.substring(__parse_idx,__parse_idx + count);
}
function parse_look_before(count) {
    return __parse_text.substring(__parse_idx - count - 1, __parse_idx-1);
}
function parse_skip_space() {
    while(__parse_chr !== null && parse_is_space(__parse_chr)) {
        __parse_idx++;
        __parse_chr = __parse_idx < __parse_end ? __parse_text[__parse_idx] : null;
    }
}

var __parse_node_stack = [];
var __parse_op_stack = [];
var __parse_expr_stack = [];

var __parse_op_priority = {

    '#' : 50, //用这个字符表示函数调用。函数调用的优先级小于属性获取"."和“[]”以及参数“,”，高于其它运算符。

    '.' : 100,
    '[]' : 100,

    '+' : 0,
    '-' : 0,
    '*' : 1,
    '/' : 1,
    '++' : 10,
    '--' : 10,
    '!' : 5,

    ',' : -20, //函数调用参数列表的优先级低于其它。
    '|' : -10 //过滤器filter的优先级也很低
};

/**
 * 以下代码使用逆波兰表达式生成语法树。
 */

function parse_expression(expr_str) {
    parse_init(expr_str);
    parse_read_char(true);

    if(__parse_chr === null) {
        return new EmptyGrammarNode();
    }

    parse_expr();

    parse_reduce_op();

    if(__parse_node_stack.length > 0) {
        __parse_expr_stack.push(__parse_node_stack.pop());
        if(__parse_node_stack.length > 0) {
            parse_error();
        }
    }

    if(__parse_expr_stack.length === 0) {
        return new EmptyGrammarNode();
    }

    var root_node = __parse_expr_stack.length>1 ? new GrammarNode('root', $copyArray(__parse_expr_stack)) : __parse_expr_stack[0];

    __parse_expr_stack.length = 0;

    return root_node;

}

function parse_expr() {
    var last_op;
    var pre_chr;
    var cur_op;

    while(__parse_chr !== null) {
        //if(__parse_chr === '+' || __parse_chr === '-') {
        // todo prefix ++a
        //} else
        if(parse_is_number_char(__parse_chr)) {
            parse_push_node(new NumberGrammarNode(parse_number()));
            parse_read_char(true);
        } else if(parse_is_variable_char(__parse_chr)) {
            parse_push_node(new VariableGrammarNode(parse_variable()));
            parse_read_char(true);
        } else  if(__parse_chr === ';') {
            parse_reduce_op();
            if(__parse_node_stack.length > 0) {
                __parse_expr_stack.push(__parse_node_stack.pop());
                if(__parse_node_stack.length > 0) {
                    parse_error();
                }
            }
            parse_read_char(true);
            break;
        } else if(__parse_chr==='"' || __parse_chr==='\'') {
            pre_chr = __parse_chr;
            parse_read_char(false);
            parse_push_node(new StringGrammarNode(parse_string(pre_chr)));
            parse_read_char(true);
            break;
        } else if(__parse_chr === '(' || __parse_chr === '[') {
            pre_chr = parse_look_before(1);
            if(__parse_chr === '[') {
                if(!parse_is_variable_char(pre_chr)) {
                    parse_error();
                } else {
                    //这种情况是属性获取。当然也包括数组访问。
                    __parse_op_stack.push('[]');
                }
            }
            if(__parse_chr === '(' && parse_is_variable_char(pre_chr)) {
                //这种情况下是函数调用，额外放入一个#符。
                __parse_op_stack.push('#');
            }

            __parse_op_stack.push(__parse_chr);
            parse_read_char(true);


        } else if(__parse_chr === ')' || __parse_chr === ']') {

            parse_reduce_op(__parse_chr===')' ? '(' : '[');
            parse_read_char(true);

        } else if($hasProperty(__parse_op_priority, __parse_chr)) {
            last_op = parse_op_last();
            cur_op = parse_look_after(1);
            if((__parse_chr === '+' || __parse_chr === '-') && __parse_chr === cur_op) {
                cur_op = __parse_chr + cur_op;
                parse_read_char();
            } else {
                cur_op = __parse_chr;
            }
            if(last_op !== null && __parse_op_priority[cur_op] <= __parse_op_priority[last_op]) {
                __parse_op_stack.pop();
                parse_deal_op(last_op);
            }
            __parse_op_stack.push(cur_op);
            parse_read_char(true);

        } else {
            parse_error();
        }

    }
}

function parse_reduce_op(op) {
    var cur_op = null;
    while(__parse_op_stack.length > 0) {
        cur_op = __parse_op_stack.pop();
        if(op && cur_op === op) {
            break; //important!!
        } else {
            parse_deal_op(cur_op);
        }
    }
    if(op && cur_op === null) {
        parse_error('括号不匹配');
    }
}

function parse_deal_op(op) {
    var node_a, node_b, tmp;
    switch (op) {
        case '#':
            node_b = parse_pop_node();
            //if(node_b.type !== 'argument') {
            //    node_a = node_b;
            //    tmp = new EmptyGrammarNode();
            //} else {
            //    tmp = node_b;
            //    node_a = parse_pop_node();
            //}

            parse_push_node(new FunctionCallGrammarNode(node_a, tmp));
            break;
        case ',':
            node_b = parse_pop_node();
            node_a = parse_pop_node();
            if(node_a.type === 'argument') {
                tmp = node_a;
            } else {
                tmp = new ArgumentGrammarNode(node_a);
            }
            tmp.merge(node_b);
            parse_push_node(tmp);
            break;
        case '.':
            node_b = parse_pop_node();
            node_a = parse_pop_node();
            tmp = node_b.type==='variable' ? new StringGrammarNode(node_b.var_name):node_b;
            parse_push_node(new PropertyGrammarNode(node_a, tmp));
            break;
        case '[]':
            node_b = parse_pop_node();
            node_a = parse_pop_node();
            parse_push_node(new PropertyGrammarNode(node_a, node_b));
            break;
        case '++':
        case '--':
        case '!':
            node_a = parse_pop_node();
            tmp = new CalcGrammarNode(op, node_a, node_b);
            if(node_a.type === 'number') {
                tmp = new NumberGrammarNode(tmp.exec());
            }
            parse_push_node(tmp);
            break;
        case '+':
        case '-':
        case '*':
        case '/':
            node_b = parse_pop_node();
            node_a = parse_pop_node();
            tmp = new CalcGrammarNode(op, node_a, node_b);
            if(node_a.type === 'number' && node_b.type === 'number') {
                /*
                 * 如果是两个常数运算，在parse期间就把数据算出来。这是一个很小的优化。
                 */
                tmp = new NumberGrammarNode(tmp.exec());
            }
            parse_push_node(tmp);
            break;
    }

}

function parse_op_last() {
    return __parse_op_stack.length > 0 ? __parse_op_stack[__parse_op_stack.length-1] : null;
}


function parse_pop_node() {
    if(__parse_node_stack.length===0) {
        parse_error();
    }
    return __parse_node_stack.pop();
}

function parse_push_node(node) {
    __parse_node_stack.push(node);
}

function ArgumentGrammarNode(expr_node) {
    this.base('argument', [expr_node]);
}
parse_inherit_node(ArgumentGrammarNode, function(scope) {
    for(var i=0;i<this.nodes.length;i++) {
        this.nodes[i].exec(scope);
    }
}, {
    merge : function(expr_node) {
        if(expr_node.type === 'argument') {
            [].push.apply(this.nodes, expr_node.nodes);
        } else {
            this.nodes.push(expr_node);
        }
    }
});

function CalcGrammarNode(operator, left_node, right_node) {
    this.base('calc', [left_node, right_node]);
    this.operator = operator;
}
parse_inherit_node(CalcGrammarNode, function(scope) {
    var nodes = this.nodes;
    switch (this.operator) {
        case '+':
            return nodes[0].exec(scope) + nodes[1].exec(scope);
            break;
        case '-':
            return nodes[0].exec(scope) - nodes[1].exec(scope);
            break;
        case '*':
            return nodes[0].exec(scope) * nodes[1].exec(scope);
            break;
        case '/':
            return nodes[0].exec(scope) / nodes[1].exec(scope);
            break;
        case '++':
            return nodes[0].increment(scope, true);
            break;
        case '--':
            return nodes[0].increment(scope, false);
            break;
        case '!':
            return !nodes[0].exec(scope);
            break;
    }
});

function StringGrammarNode(value) {
    this.base('string');
    this.value = value;
}
parse_inherit_node(StringGrammarNode, function() {
    return this.value;
});

function NumberGrammarNode(value) {
    this.base('number');
    this.value = typeof value !== 'number' ? Number(value) : value;
}
parse_inherit_node(NumberGrammarNode, function() {
    return this.value;
});

function EmptyGrammarNode() {
    this.base('empty');
}
parse_inherit_node(EmptyGrammarNode, function() {
    return null;
});

function FunctionCallGrammarNode(func_node, argv_nodes) {
    var nodes = [func_node];
    if(!$isArray(argv_nodes)) {
        argv_nodes = [argv_nodes];
    }
    [].push.apply(nodes, argv_nodes);
    this.base('function', nodes, {
        readable : false
    });
}
parse_inherit_node(FunctionCallGrammarNode, function() {

}, {
    toString : function() {
        return 'func';
    }
});

function PropertyGrammarNode(var_node, prop_node) {
    this.base('property', [var_node, prop_node], {
        writable : true
    });
}
parse_inherit_node(PropertyGrammarNode, function(scope) {
    var variable = this.nodes[0].exec(scope),
        prop_name = this.nodes[1].exec(scope);
    if(variable === null) {
        return null
    } else {
        return $hasProperty(variable, prop_name) ? variable[prop_name] : null;
    }
}, {
    increment : function(scope, is_add) {
        var variable = this.nodes[0].exec(scope),
            prop_name = this.nodes[1].exec(scope);
        if(variable === null || !$hasProperty(variable, prop_name)) {
            return null
        } else {
            var val = variable[prop_name];
            variable[prop_name] = val+(is_add ? 1 : -1);
            return val;
        }
    }
});

function VariableGrammarNode(var_name) {
    this.base('variable', [], {
        writable : true
    });
    this.var_name = var_name;
}
parse_inherit_node(VariableGrammarNode, function(scope) {
    return scope.$get(this.var_name);
}, {
    increment : function(scope, is_add) {
        var val = this.exec(scope);
        scope.$set(this.var_name, val+(is_add ? 1 : -1));
        return val;
    }
});

/*
 * require scope
 */
var __JDN = 'j-directive-name';
var __JDV = 'j-directive-value';

function drive_directive_name_value(ele, drive_module, scope) {
    var dn = $attr(ele, __JDN).split(','),
        dv = $hasAttr(ele, __JDV) ? $attr(ele, __JDV).split(',') : [];
    if(dn.length === 0) {
        //todo check format
    }
    var i, ns, val, dire, link_scope, parent_scope;
    for(i=0;i<dn.length;i++) {
        ns = dn[i].trim();
        val = dv[i];
        dire = __directive_full_table[ns];
        if(!dire) {
            throw 'directive "' + ns + '" not found!';
        }
        link_scope = drive_run_directive(ele, drive_module, dire, scope, val);
        if(dire.scope_type === __SCOPE_TYPE_PARENT) {
            if(parent_scope) {
                throw 'directive with scope_type:jing.scope_types.PARENT can be occur once on one element!';
            } else {
                parent_scope = link_scope;
            }
        }
    }
    return parent_scope;
}

function drive_run_directive(element, drive_module, directive, scope, val) {
    directive_initialize(directive);
    var scope_type = directive.scope_type,
        link_func = directive.link_func;
    var link_scope = (scope_type === __SCOPE_TYPE_CREATE
    || scope_type === __SCOPE_TYPE_PARENT) ? scope.$child() : scope;
    //todo parse value such as 'test(name) | toUpper'
    link_func(drive_module, directive.module,  link_scope, element, val, directive.name);
    return link_scope;
}

function drive_parse_element(ele, drive_module, parent_scope) {
    var i, an;
    var attr_array, directive, link_scope, new_parent_scope;
    if($hasAttr(ele, __JDN)) {
        new_parent_scope = drive_directive_name_value(ele, drive_module, parent_scope);
    } else if(ele.hasAttributes()) {
        attr_array = ele.attributes;
        for(i=0;i<attr_array.length;i++) {
            an = attr_array[i];
            if(an.name === __JDN || an.name === __JDV) {
                continue;
            }
            directive = __directive_short_table[an.name];
            if(!directive) {
                continue;
            }
            link_scope = drive_run_directive(ele, drive_module, directive, parent_scope, an.value);
            if(directive.scope_type === __SCOPE_TYPE_PARENT) {
                if(new_parent_scope) {
                    throw 'directive with scope_type:jing.scope_types.PARENT can be occur once on one element!';
                } else {
                    new_parent_scope = link_scope;
                }
            }
        }
    }
    drive_render_view(ele, new_parent_scope ? new_parent_scope : parent_scope);

    //这里使用递归的方法来遍历所有元素。当一个页面有海量的元素时，递归有可能存在内存问题。
    var c_ele = ele.children;
    for(i=0;i<c_ele.length;i++) {
        drive_parse_element(c_ele[i], drive_module, new_parent_scope ? new_parent_scope : parent_scope);
    }

}


/*
 * require scope
 */



function drive_render_view(ele, scope) {
    var cn = ele.childNodes;
    if(cn.length === 0) {
        return;
    }
    for(var i=0;i<cn.length;i++) {
        if(cn[i].nodeName !== '#text'){
            continue;
        }
        var txt = cn[i].textContent;
        var m = txt.match(/\{\{\s*([\w\d_]+)\s*\}\}/);
        if(!m) {
            continue;
        }

        var val = scope.$get(m[1]);
        if(!val) {
            log('"'+m[1]+'" not found in scope: ' + scope.$name);
            continue;
        }
        cn[i].textContent = txt.replace(m[0], val);
        var template = txt.replace(m[0], "{{0}}");

        scope.$watch(m[1], function(var_name, new_value, data) {
            data.ele.textContent = data.tem.replace("{{0}}", new_value);
        }, {
            ele : cn[i],
            tem : template
        });

        //todo 一个textNode里面可能有多个{{var_name}}，并且{{var_name}}可能有重复。
    }
}



jing = {};

jing.scope_types = {
    INHERIT : __SCOPE_TYPE_INHERIT,
    CREATE : __SCOPE_TYPE_CREATE,
    PARENT : __SCOPE_TYPE_PARENT
};

jing.$on = $on;

jing.module = module_create;
jing.require = module_require;
jing.controller = function(name) {
    var ms = module_get(name, false);
    if(!ms) {
        log(name , ': controller not found. no module.');
        return null;
    } else {
        return ms[0].controller(ms[1]);
    }
};
jing.directive = function(name) {
    var ms = module_get(name, false);
    if(!ms) {
        log(name , ': directive not found. no module.');
        return null;
    } else {
        return ms[0].directive(ms[1]);
    }
};
jing.factory = function(name) {
    var ms = module_get(name, false);
    if(!ms) {
        log(name , ': factory not found. no module.');
        return null;
    } else {
        return ms[0].factory(ms[1]);
    }
};
jing.scope = function(name) {
    if(name) {
        return __root_scope_table[name];
    } else {
        return scope_create();
    }
};


})();