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
function $env(ele, data) {
    if(typeof data !== 'undefined') {
        ele.__JING_ENV__ = data;
    } else {
        return ele.__JING_ENV__;
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
function $id(id) {
    return document.getElementById(id);
}

function $isString(str) {
    return typeof str === 'string';
}
function $isFunction(func) {
    return typeof func === 'function';
}
function $isNumber(num) {
    return typeof num === 'number';
}
function $isObject(obj) {
    return typeof obj === 'object';
}
function $isNull(nl) {
    return nl === null;
}
function $isUndefined(obj) {
    return typeof obj === 'undefined';
}
/*
 * 在部署时，所有$assert的调用都应该删除。
 */
function $assert(condition) {
    if(!condition) {
        console.trace();
        throw '$assert failure!';
    }
}

function $ajax(options) {
    var ops = $merge(options, {
        method : 'get',
        type : 'json',
        data : {}
    });
    var xhr = new XMLHttpRequest();

}


var __AM = ['push', 'pop', 'reverse', 'shift', 'sort', 'unshift', 'splice'];
var __AProto = Array.prototype;
var __env_counter = 0;
var __root_env_table = {};

function Environment(name, parent) {

    $defineProperty(this, '$name', name);
    $defineProperty(this, '$children', {});
    $defineProperty(this, '$parent', parent ? parent : null);

}

var __env_prototype = Environment.prototype;

$defineGetterSetter(__env_prototype, '$root', function() {
    return this.$parent ? this.$parent.$root : this;
});

$defineProperty(__env_prototype, '$child', function(name) {
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

/*
 * 取得变量名对应的值，会循环检索父亲env
 */
$defineProperty(__env_prototype, '$val', function(var_name) {
    if($hasProperty(this, var_name)) {
        return this[var_name];
    } else if(this.$parent) {
        return this.$parent.$val(var_name);
    } else {
        return null;
    }
});
/*
 * 检测是否存在变量名对应的值，会循环检索父亲env
 */
$defineProperty(__env_prototype, '$has', function(var_name) {
    if($hasProperty(this, var_name)) {
        return true;
    } else if(this.$parent) {
        return this.$parent.$has(var_name);
    } else {
        return false;
    }
});

/*
 * 取得变量名所在的env，会循环检索父亲env
 */
$defineProperty(__env_prototype, '$get', function(var_name) {
   if($hasProperty(this, var_name)) {
       return this;
   } else if(this.$parent) {
       return this.$parent.$var(var_name);
   } else {
       return null;
   }
});
/*
 * 设置变量名对应的值，会循环检索父亲env。
 */
$defineProperty(__env_prototype, '$set', function(var_name, value) {
    if($hasProperty(this, var_name)) {
        this[var_name] = value;
    } else if(this.$parent) {
        this.$parent.set(var_name, value);
    }
});

/**
 * 添加成员的辅助方法。在env中可以使用:
 *
 *   this.$prop({
 *      name : 'xiaoge',
 *      age : 10,
 *      say : function() {
 *          alert('hello, ' + this.name);
 *      }
 *   });
 *   this.$prop('name', 'xiaoge');
 *
 * 也可以直接在this上赋值，如：
 *   this.name = 'xiaoge';
 *   this.age = 10;
 *   this.say = function() {
 *      alert('hello, '+this.name);
 *   }
 */
$defineProperty(__env_prototype, '$prop', function(name, value) {
   if($isObject(name)) {
       for(var kn in name) {
           this[kn] = name[kn];
       }
   } else {
       this[name] = value;
   }
});


function environment_create(parent) {
    var name = this.$parent ? this.$parent.name + '.' + __env_counter++ : 'jing.scope.' + __env_counter++;
    var cs = new Environment(name, parent);
    if(parent) {
        $defineProperty(parent.$children, name, cs, false, true);
    }
    return cs;
}

function Emitter(id) {
    this.id = id;
    this.listeners = [];
    this.children = {};
}
Emitter.prototype = {
    notify : function(type, value) {
        var ls = this.listeners,
            chs = this.children;
        for(var i=0;i<ls.length;i++) {
            ls[i].tell(new EmitEvent(this.id, type, value));
        }
        for(var k in chs) {
            chs[k].tell(type, value);
        }
    }
};

function EmitEvent(id, type, value) {
    this.id = id;
    this.type = type;
    this.value = value;
}

function Listener(id, handler, data, lazy_time) {
    this.id = id;
    this.lazy = $isNumber(lazy_time) ? ((lazy_time = Math.floor(lazy_time)) >=0 ? lazy_time : 0) : 0;
    this.handler  = handler;
    this.data = data;
    this.timeout = null;
    this.emit_events = [];
    this.delegate = $bind(this, this.deal);
}
Listener.prototype = {
    notify : function(emit_event) {
        if(this.timeout !== null) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
        this.emit_events.push(emit_event);
        this.timeout = setTimeout(this.delegate, this.lazy);
    },
    deal : function() {
        this.handler(this.emit_events, this.data);
        this.emit_events.length = 0;
        this.timeout = null;
    }
};

/*
 * 尽可能使用一个不会被使用的名称来作为内部成员。
 */
var __environment_watch_inner_prop_name = '__$ge.jing.0210.prop$__';
var __environment_watch_inner_emit_name = '__$ge.jing.0210.emit$__';
var __environment_emit_type_value = 0;
var __environment_emit_type_array = 1;

/*
 * __environment_watch_inner_prop_name和__environment_watch_inner_emit_name在压缩时，
 *   会被检测到未被改写过，也就是常数，从而被替换为常数，避免闭包。
 *
 * 但var_name还是难以避免地成为闭包变量。
 *   通过Object.defineProperty定义的getter和setter如果能取得当前getter/setter的名称，
 *   就可以解决var_name的闭包问题。
 *
 */
function environment_declare_var(p, var_name, value) {
    if($isArray(value)) {

    } else {
        $defineGetterSetter(p, var_name, function() {
            return this[__environment_watch_inner_prop_name][var_name];
        }, function(val) {
            var prop = this[__environment_watch_inner_prop_name],
                pre_val = prop[var_name];
            if(pre_val === val) {
                return;
            }
            prop[var_name] = val;
            this[__environment_watch_inner_emit_name][var_name].tell(__environment_emit_type_value, val);
        });
    }
}

function environment_watch_each_var(p, var_name, et) {
    var ps, val, e_tree;
    if(!$hasProperty(p, __environment_watch_inner_prop_name)) {
        ps = {};
        $defineProperty(p, __environment_watch_inner_prop_name, ps);
    } else {
        ps = p[__environment_watch_inner_prop_name];
    }
    if(!$hasProperty(p, __environment_watch_inner_emit_name)) {
        e_tree = {};
        $defineProperty(p, __environment_watch_inner_emit_name, e_tree);
    } else {
        e_tree = p[__environment_watch_inner_emit_name];
    }

    if(!$hasProperty(ps, var_name)) {
        if(!$hasProperty(p, var_name)) {
            throw 'property '+ var_name + ' not found.'
        }
        val = p[var_name];
        delete p[var_name];
        ps[var_name] = val;
        environment_declare_var(p, var_name, val);
    }

    if(!$hasProperty(e_tree, var_name)) {
        e_tree[var_name] = new Emitter(var_name);
    }

    if(et && !$hasProperty(et.children, var_name)) {
        et.children[var_name] = e_tree[var_name];
    }
}

function environment_watch_vars(env, var_name, listener) {
    var var_array = var_name.split('.');
    var p = env, vn, i, et = null;
    for(i=0;i<var_array;i++) {
        vn = var_array[i];
        environment_watch_each_var(p, vn, et);
        p = p[__environment_watch_inner_prop_name][vn];
        et = p[__environment_watch_inner_emit_name][vn];
        if(!$isObject(p)) {
            throw('watch need object.');
        }
    }
    if(i>0) {
        ps[__environment_watch_inner_emit_name][vn].listeners.push(listener);
    }
}

$defineProperty(__env_prototype, '$watch', function(var_name, callback, data, lazy_time) {
    if(typeof callback !== 'function') {
        log('$watch need function');
        return;
    }
    var i, listener;
    var lazy = ($isUndefined(lazy_time) && $isNumber(data)) ? data : ($isNumber(lazy_time)?lazy_time:0);
    listener = new Listener(var_name, callback, data, lazy);
    if($isString(var_name)) {
        environment_watch_vars(this, var_name.trim(), listener);
    } else if($isArray(var_name)) {
        for(i=0;i<var_name.length;i++) {
            environment_watch_vars(this, var_name[i].trim(), listener);
        }
    } else if($isObject(var_name)) {
        //watch expression

    }

});

/*
 * 保存全局的顶层Module
 */
var __module_table = {};
var __root_module = new Module('jing', null);

/**
 * directive的environment类型，
 *
 */
var __ENV_TYPE_INHERIT = 0;
var __ENV_TYPE_CREATE = 1;
var __ENV_TYPE_PARENT = 2;

function Module(name, parent) {
    var __ = {};
    $defineProperty(this, '__', __);
    $defineProperty(__, 'factories', {});
    $defineProperty(__, 'directives', {});
    $defineProperty(__, 'runs' , []);
    $defineProperty(__, 'controllers', {});
    $defineProperty(__, 'datasources', {});
    $defineProperty(__, 'config', {});

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
$defineProperty(__module_prototype, 'init', function(func) {
    if(this.parent) {
        throw 'function "init" can only be applied to root Module';
    }
    if(typeof func === 'function') {
        this.__.runs.push(func);
    }
    return this;
});
$defineProperty(__module_prototype, 'conf', function(options) {
    for(var kn in options) {
        this.__.config[kn] = options[kn];
    }
    return this;
});

$defineProperty(__module_prototype, 'env', function(name, func) {
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

function Directive(module, name, func) {
    this.name = name;
    this.module = module;
    this.state = 0;
    this.func = func;
    this.link_func = null;
}
var __directive_prototype = Directive.prototype;


var __directive_short_table = {};
var __directive_full_table = {};
var __directive_inner_table = {};

function directive_put_inner(ele, inner) {
    var jid = event_jid(ele),
        inner_array;
    if(!$hasProperty(__directive_inner_table, jid)) {
        inner_array = __directive_inner_table[jid] = [];
    } else {
        inner_array = __directive_inner_table[jid];
    }
    inner_array.push(inner);
}

function directive_destroy_inner(ele) {
    var jid = ele.id,
        inner_array;
    if(!$hasProperty(__directive_inner_table, jid)) {
        return;
    }
    inner_array = __directive_inner_table[jid];
    for(var i=0;i<inner_array.length;i++) {
        inner_array[i].destroy();
        inner_array[i] = null;
    }
    inner_array.length = 0;
    delete __directive_inner_table[jid];
}

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

/*
 *
 * <div j-async-env='AEnv'>
 *      <ul j-async-env-ready>
 *          <li j-repeat='item in data.list' j-on='click: test(item, @index)'>
 *              {{item.name}}, {{item.amount}}
 *          </li>
 *      </ul>
 *      <div j-async-env-loading>
 *          <p>Loading...</p>
 *      </div>
 * </div>
 *
 */

function JAsyncEnv(root_ele, ready_ele, load_ele, drive_module, env) {

}

function directive_deal_j_async_env(ele, drive_module, env) {

}

/**
 * Created by abraham on 15/1/22.
 */


function directive_deal_j_env(ele, attr, drive_module, env) {
    var env_def;
    var item = attr.removeNamedItem('j-env'),
        env_value = item.value.trim();
    if (env_value.indexOf('.') >= 0) {
        var ms = module_get(env_value, false);
        if (!ms) {
            throw 'j-env: environment "' + env_value + '" not found. module not found.';
        }
        env_def = ms[0].env(ms[1]);
    } else {
        env_def = drive_module.env(env_value);
    }
    if (!env_def) {
        throw 'j-env: environment "' + env_value + '" not found.';
    }
    env_def.func.call(env, drive_module);
}

/*
 *
 * 使用方法如下，注意一定要用双引号把字符串包裹，因为j-include接受的也是表达式。
 * <div j-include='"home.html"'>
 *   <p>Loading...</p>
 * </div>
 * j-include是异步的过程，因此可以在其下显示加载完成前的提示，比如Loading...。
 * 加载成功后，该元素会被替换，并且解析里面的指令。
 *     如果加载失败，该元素会被替换为：<p class='j-include-error'>Error on j-include</p>
 *
 * j-include支持使用表达式，如下：
 *
 * jing('MyApp').factory('Template', {
 * });
 * jing('MyApp').init(function(module, $rootEnv) {
 *
 *      $rootEnv.include_urls = module.require('Template');
 *
 * })
 * .drive(document.body);
 *
 * <div j-include='include_urls.home'></div>
 *
 * 通过这种方式，可以将整个App的构建放在Template中，方便修改以及部署。
 *
 * 注意当前版本的设计，j-include和j-async-env不能同时存在。（似乎没有价值同时存在。）
 */
function JInclude(ele, drive_module, env) {
    this.ele = ele;
    this.module = drive_module;
    this.env = env;
}
var __jinclude_prototype = JInclude.prototype;
__jinclude_prototype.run = function(url) {
    $ajax({
        url : url,
        method : 'get',
        type : 'text',
        success : $bind(this, this.success),
        error : $bind(this, this.error)
    });
};
__jinclude_prototype.success = function(body) {
    var ele = this.ele,
        pn = ele.parentNode;
    var new_ele = document.createElement("div");
    var frag = document.createDocumentFragment();
    var chs = new_ele.childNodes,
        i,
        e = chs.length;
    new_ele.innerHTML = body;
    for(i=0;i<e;i++) {
        drive_parse_element(chs[i], this.module, this.env);
        frag.appendChild(chs[i]);
    }
    pn.insertBefore(frag, ele);
    pn.removeChild(ele);
};
__jinclude_prototype.error = function() {
    this.ele.innerHTML = '<p class="j-include-error">Error at j-include.</p>';
};
__jinclude_prototype.destroy = function() {
    this.ele = null;
    this.module = null;
    this.env = null;
};

function directive_deal_j_include(ele, attr, drive_module, env) {
    var item = attr.removeNamedItem('j-include'),
        expr_str = item.value;

    var expr = parse_expression(expr_str);
    var url = expr.exec(env);

    if(!$isString(url)) {
        throw 'j-include need string.';
    }

    var inner = new JInclude(ele, drive_module, env);
    directive_put_inner(ele, inner);
    inner.run(url);

}

function JInputModel(ele, env, expr) {
    this.ele = ele;
    this.env = env;
    this.expr = expr;
    this.val = null;
}
var __jimodel_prototype = JInputModel.prototype;
__jimodel_prototype.run = function() {
    this.render();

    this.env.$watch(this.expr, function(jmodel) {

        jmodel.render();
        //todo deal watch
    }, this);
};
__jimodel_prototype.render = function() {
    var new_val = this.expr.exec(this.env);
    if(this.val === new_val) {
        return;
    }
    this.ele.value = new_val;
    this.val = new_val;
};
__jimodel_prototype.destroy = function() {
    this.ele = null;
    //todo unwatch
    this.expr.destroy();
    this.expr = null;
};

directive_create('j-model', function() {

    return function(drive_module, directive_module, env, element, attr_value) {
        if(element.nodeName !== 'INPUT') {
            return;
        }
        var expr = parse_expression(attr_value);

        //todo check expr can be set. That is, expr.type is 'variable' or 'property'

        var inner = new JInputModel(element, env, expr);
        directive_put_inner(ele, inner);
        inner.run();

    };
});

directive_create('j-on', function() {
    return function(drive_module, directive_module, env, element, attr_value) {
        var m = event_check_directive(attr_value);
        if(!m) {
            throw 'j-on format wrong.';
        }
        var expr = parse_expression(m.expr);
        element.__JING_ENV__ = env;
        event_on(element, m.on, function() {
            expr.exec(this.__JING_ENV__);
        });
    }
});

function JRepeat(ele, attr, drive_module, env, expr) {
    this.ele = ele;
    this.env = env;
    this.expr = expr;
    this.attr = attr;
    this.module = drive_module;
    this.r_envs = [];
    this.r_eles = [];
    this.frag = null;
}
var __jrepeate_prototype = JRepeat.prototype;
__jrepeate_prototype.run = function() {
    $css(this.ele, 'display', 'none');

    this.render();



    this.env.$watch(this.expr, function(var_name, new_value, j_repeat) {
        //todo watch j-repeat
    }, this);
};
__jrepeate_prototype.render = function() {
    var array = this.expr[1].exec(this.env);
    var frag = document.createDocumentFragment();
    var r_ele, r_env, r_props;
    if(array instanceof Array) {
        for(var i=0;i<array.length;i++) {
            r_ele = this.ele.cloneNode(true);
            r_env = this.env.$child();
            r_props = {
                '@index' : i,
                '@item' : array[i],
                '@first' : i===0,
                '@last' : i===array.length-1,
                '@middle' : i!==0 && i!==array.length-1,
                '@key' : i
            };
            r_props[this.expr[0].value] = array[i];
            r_env.$props = r_props;
            drive_render_element(r_ele, this.attr, this.module, r_env);
            frag.appendChild(r_ele);
        }
    } else if(typeof array === 'object') {
        //todo j-repeat for key-value Object
        throw 'TODO: j-repeat for object.';
        //for(var kn in array) {
        //
        //}
    } else {
        log('value of j-repeat is not Array or key-value Object.');
        return;
    }
    if(this.frag !== null) {
        this.ele.parentNode.removeChild(this.frag);
        this.frag = null;
    }
    this.ele.parentNode.insertBefore(frag, this.ele);
    this.frag = frag;
};

function directive_deal_j_repeat(ele, attr, drive_module, env) {
    var item = attr.removeNamedItem('j-repeat'),
        expr_str = item.value;

    var expr = parse_expression(expr_str);
    if(expr.type !== 'in') {
        throw 'j-repeat format wrong!';
    }

    /*
     * 把逻辑放在Class里面，不使用函数的闭包。
     */
    new JRepeat(ele, attr, drive_module, env, expr).run();
}

function GrammarNode(type, child_nodes, properties) {
    this.type = type;
    this.nodes = child_nodes ? child_nodes : [];
    this.props = $merge({
        writable : false //是否是可以写入的类型。比如 ng-model=''这种指令就需要writable为true
    }, properties);
}
GrammarNode.prototype = {
    increment : function(scope, is_add, is_prefix) {
        return this.exec(scope);
    },
    exec : function(scope) {
        return this.nodes[0].exec(scope);
    },
    set : function(scope) {
    },
    destroy : function() {
        var ns = this.nodes;
        for(var i=0;i<ns.length;i++) {
            ns[i].destroy();
            ns[i] = null;
        }
        ns.length = 0;
        this.nodes = null;
    }
};

function parse_inherit_node(node, exec_func, other_proto) {
    node.prototype.exec = exec_func;
    if(other_proto) {
        $extend(node.prototype, other_proto);
    }
    $inherit(node, GrammarNode);
}

var __parse_node_stack = [];
var __parse_op_stack = [];
var __parse_token_pre_type = 'emp';
var __parse_in_node = null;

/*
 * 运算符优先级。第一个数字是优先级，第二个数字表示是从左到右还是从右到左。
 */
var __parse_op_priority = {
    '(' : [9000, 0],

    '[' : [300, 0],
    '.' : [300, 0],

    'F' : [200, 0], //用这个字符表示函数调用。函数调用的优先级小于属性获取"."和“[]”，高于其它运算符。


    '#++' : [90, 0], //自增(运算符在后)
    '#--' : [90, 0], //自减(运算符在后)



    '!' : [80, 1],
    '~' : [80, 1],
    '+#' : [80, 1], //一元加(正号)
    '-#' : [80, 1], //一元减(负号)
    '++#' : [80, 1], //自增(运算符在前)
    '--#' : [80, 1], //自减(运算符在前)

    '*' : [70, 0],
    '/' : [70, 0],
    '%' : [70, 0],

    '#+' : [60, 0],
    '#-' : [60, 0],

    '<<': [50, 0],
    '>>': [50, 0],
    '>>>': [50, 0],

    '<' : [40, 0],
    '>' : [40, 0],
    '<=':[40, 0],
    '>=':[40, 0],

    '==': [30, 0],
    '===': [30, 0],
    '!=' : [30, 0],
    '!==' : [30, 0],

    '&' : [20, 0],
    '^' : [19, 0],
    '|' : [18, 0],
    '&&' : [17, 0],
    '||' : [16, 0],

    '?' : [15, 1],
    ':' : [15, 1],

    '=' : [10, 1],
    '>>=' : [10, 1],
    '<<=' : [10, 1],
    '>>>=' : [10, 1],
    '+=': [10, 1],
    '-=' : [10, 1],
    '*=' : [10, 1],
    '/=' : [10, 1],
    '%=' : [10, 1],
    '&=' : [10, 1],
    '^=' : [10, 1],
    '|=' : [10, 1],

    '->' : [-10, 0], //过滤器filter的优先级也很低

    ',' : [-20, 0] //函数调用参数列表的优先级低于其它。

};

/**
 * 以下代码生成语法树。
 */

function parse_expression(expr_str) {
    __parse_token_pre_type = 'emp';
    __parse_in_node = null;
    parse_token_init(expr_str);

    parse_expr();

    parse_reduce_op();


    var root_node;
    if(__parse_node_stack.length === 0) {
        root_node =  new EmptyGrammarNode();
    } else if(__parse_node_stack.length === 1) {
        root_node = __parse_node_stack[0];
    } else {
        root_node = new GrammarNode('root', $copyArray(__parse_node_stack));
    }

    __parse_node_stack.length = 0;

    if(__parse_in_node !== null) {
        if(root_node.type === 'emp' || root_node.type === 'root') {
            parse_error();
        } else {
            root_node = new InGrammarNode(__parse_in_node, root_node);
        }
    }



    return root_node;

}

function parse_error() {
    __parse_node_stack = [];
    __parse_op_stack = [];
    throw 'parse error';
}

function parse_meet_op(op) {
    switch (op) {
        case ';':
            parse_reduce_op();
            break;
        case '(':
            if(__parse_token_pre_type === 'var') {
                __parse_op_stack.push('F');
                __parse_node_stack.push(new ArgumentGrammarNode([]));
            }
            __parse_op_stack.push(op);
            break;
        case ')':
        case ']':
            parse_reduce_op(op === ')' ? '(' : '[');
            break;
        case '+':
        case '-':
        case '++':
        case '--':
            parse_check_op(__parse_token_pre_type === 'op' ? op + '#' : '#' + op);
            break;
        default :
            parse_check_op(op);
            break;
    }
}

function parse_check_op(op) {
    var last_op, last_pri;
    var pri = __parse_op_priority[op];
    while(__parse_op_stack.length > 0) {
        last_op = __parse_op_stack[__parse_op_stack.length-1];
        last_pri = __parse_op_priority[last_op];
        if(pri[0] < last_pri[0] || (pri[0] === last_pri[0] && pri[1]===0)) {
            __parse_op_stack.pop();
            parse_deal_op(last_op);
        } else {
            break; //important!
        }
    }
    __parse_op_stack.push(op);
}

function parse_expr() {

    while(!__parse_token_EOF) {
        parse_token_lex();
        if(__parse_token_type === 'op' && ( __parse_token_value === '\'' || __parse_token_value==='"')) {
            __parse_token_value = parse_token_string(__parse_token_type);
            __parse_token_type = 'str';
        }
        switch (__parse_token_type) {
            case 'var':
                switch(__parse_token_value) {
                    case 'true':
                    case 'false':
                        parse_push_node(new ConstantGrammarNode(__parse_token_value === 'true'));
                        __parse_token_pre_type = 'num';
                        break;
                    case 'in':
                        if(__parse_op_stack.length !== 0
                            || __parse_node_stack.length !== 1
                            || __parse_node_stack[0].type !== 'var'
                            || __parse_in_node !== null) {
                            throw 'grammar wrong: in';
                        }
                        __parse_in_node = __parse_node_stack.pop().var_name;
                        break;
                    default:
                        parse_push_node(new VariableGrammarNode(__parse_token_value));
                        __parse_token_pre_type = 'var';
                        break;
                }
                break;
            case 'num':
                parse_push_node(new ConstantGrammarNode(Number(__parse_token_value)));
                __parse_token_pre_type = 'num';
                break;
            case 'str':
                parse_push_node(new ConstantGrammarNode(__parse_token_value));
                __parse_token_pre_type = 'str';
                break;
            case 'op':
                parse_meet_op(__parse_token_value);
                __parse_token_pre_type = 'op';
                break;
            default :
                break;
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
    var last_node, last_pre_node;
    if(op === '('
        && cur_op === '('
        && parse_op_last() === 'F') {
        last_node =  __parse_node_stack[__parse_node_stack.length-1];
        if(last_node && last_node.type !== 'argument' || last_node.nodes.length >0) {
            last_pre_node = __parse_node_stack[__parse_node_stack.length-2];
            if(!last_pre_node || last_pre_node.type === 'argument' || last_pre_node.nodes.length) {
                throw 'something strange wrong';
            }
            last_pre_node.merge(last_node);
            parse_pop_node();
        }
    }
}

function parse_deal_op(op) {
    var node_a, node_b, tmp;
    switch (op) {
        case 'F':
            node_b = parse_pop_node();
            node_a = parse_pop_node();
            parse_push_node(new FunctionCallGrammarNode(node_a, node_b));
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
            tmp = node_b.type==='variable' ? new ConstantGrammarNode(node_b.var_name) : node_b;
            parse_push_node(new PropertyGrammarNode(node_a, tmp));
            break;
        case '[]':
            node_b = parse_pop_node();
            node_a = parse_pop_node();
            parse_push_node(new PropertyGrammarNode(node_a, node_b));
            break;
        case '?' :
        case ':' :
            node_b = parse_pop_node();
            node_a = parse_pop_node();
            parse_push_node(new ConditionGrammarNode(op, node_a, node_b));
            break;
            break;

        case '++#':
        case '--#':
        case '#++':
        case '#--':
        case '+#':
        case '-#':
        case '!':
        case '~':
            node_a = parse_pop_node();
            tmp = new CalcGrammarNode(op, node_a, node_b);
            if(node_a.type === 'number') {
                tmp = new ConstantGrammarNode(tmp.exec());
            }
            parse_push_node(tmp);
            break;
        case '=':
        case '+=':
        case '-=':
        case '*=':
        case '/=':
        case '%=':
        case '>>=':
        case '>>>=':
        case '<<=':
        case '&=':
        case '^=':
        case '|=':
            node_b = parse_pop_node();
            node_a = parse_pop_node();
            tmp = new SetGrammarNode(op, node_a, node_b);
            parse_push_node(tmp);
            break;
        case '#+':
        case '#-':
        case '*':
        case '/':
        case '%':
        case '<<':
        case '>>':
        case '>>>':
        case '==':
        case '===':
        case '>':
        case '<':
        case '&':
        case '&&':
        case '|':
        case '||':
        case '!=':
        case '!==':
        case '^':
            node_b = parse_pop_node();
            node_a = parse_pop_node();
            tmp = new CalcGrammarNode(op, node_a, node_b);
            if(node_a.type === 'constant' && node_b.type === 'constant') {
                /*
                 * 如果是两个常数运算，在parse期间就把数据算出来。这是一个很小的优化。
                 */
                tmp = new ConstantGrammarNode(tmp.exec());
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

function ArgumentGrammarNode(args_node) {
    this.base('argument', args_node instanceof Array ? args_node : [args_node]);
}
parse_inherit_node(ArgumentGrammarNode, function(scope) {
    for(var i=0;i<this.nodes.length;i++) {
        this.nodes[i].exec(scope);
    }
}, {
    merge : function(expr_node, left) {
        var nodes = expr_node.type === 'argument' ? expr_node.nodes : [expr_node];
        if(left) {
            [].unshift.apply(this.nodes, nodes);
        } else {
            [].push.apply(this.nodes, nodes);
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
        case '#+':
            return nodes[0].exec(scope) + nodes[1].exec(scope);
            break;
        case '#-':
            return nodes[0].exec(scope) - nodes[1].exec(scope);
            break;
        case '+#':
            return 0+nodes[0].exec(scope);
            break;
        case '-#':
            return 0-nodes[0].exec(scope);
            break;
        case '*':
            return nodes[0].exec(scope) * nodes[1].exec(scope);
            break;
        case '/':
            return nodes[0].exec(scope) / nodes[1].exec(scope);
            break;
        case '#++':
            return nodes[0].increment(scope, true, false);
            break;
        case '#--':
            return nodes[0].increment(scope, false, false);
            break;
        case '++#':
            return nodes[0].increment(scope, true, false);
            break;
        case '--#':
            return nodes[0].increment(scope, false, true);
            break;
        case '!':
            return !nodes[0].exec(scope);
            break;
        case '>':
            return nodes[0].exec(scope) > nodes[1].exec(scope);
            break;
        case '<':
            return nodes[0].exec(scope) < nodes[1].exec(scope);
            break;
        case '>>':
            return nodes[0].exec(scope) >> nodes[1].exec(scope);
            break;
        case '>>>':
            return nodes[0].exec(scope) >>> nodes[1].exec(scope);
            break;
        case '<<':
            return nodes[0].exec(scope) << nodes[1].exec(scope);
            break;
        case '==':
            return nodes[0].exec(scope) == nodes[1].exec(scope);
            break;
        case '===':
            return nodes[0].exec(scope) === nodes[1].exec(scope);
            break;
    }
});

function ConditionGrammarNode(op, left_node, right_node) {
    var nodes = [left_node];
    if(op === '?' && right_node.type === 'condition') {
        [].push.apply(nodes, right_node.nodes);
    } else { // op === ':'
        nodes.push(right_node);
    }
    this.base('condition', nodes);
}
parse_inherit_node(ConditionGrammarNode, function(scope) {
    var ns = this.nodes;
    return ns[0] ? ns[1] : ns[2];
});

function ConstantGrammarNode(value) {
    this.base('constant');
    this.value = value;
}
parse_inherit_node(ConstantGrammarNode, function() {
    return this.value;
}, {
    increment : function(scope, is_add, is_prefix) {
        return this.value +(is_add? 1:0);
    }
});

function EmptyGrammarNode() {
    this.base('emp');
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

function InGrammarNode(key, items) {
    this.base('in', [key, items]);
}
parse_inherit_node(InGrammarNode, function() {

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
    increment : function(scope, is_add, is_prefix) {
        var variable = this.nodes[0].exec(scope),
            prop_name = this.nodes[1].exec(scope);
        if(variable === null || !$hasProperty(variable, prop_name)) {
            return null
        } else {
            var val = variable[prop_name],
                new_val = val+(is_add ? 1 : -1);
            variable[prop_name] = new_val;
            return is_prefix ? new_val : val;
        }
    },
    set : function(scope, value) {
        var variable = this.nodes[0].exec(scope),
            prop_name = this.nodes[1].exec(scope);
        variable[prop_name] = value;
    }
});

function SetGrammarNode(op, left_node, right_node) {
    this.op = op;
    this.base('set', [left_node, right_node]);
}
parse_inherit_node(SetGrammarNode, function(scope) {
    var r = this.nodes[1].exec(scope),
        l = this.nodes[0].exec(scope);
    var val = r;
    switch (this.op) {
        case '=':
            break;
        case '>>=':
            val = l>>r;
            break;
        case '<<=':
            val = l<<r;
            break;
        case '>>>=':
            val = l>>>r;
            break;
        case '+=':
            val = l+r;
            break;
        case '-=':
            val = l-r;
            break;
        case '*=':
            val = l*r;
            break;
        case '%=':
            val = l%r;
            break;
        case '/=':
            val = l/r;
            break;
        case '&=':
            val = l&r;
            break;
        case '^=':
            val = l^r;
            break;
        case '|=':
            val = l | r;
            break;
    }

    this.nodes[0].set(scope, val);
    return val;
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
    increment : function(scope, is_add, is_prefix) {
        var val = this.exec(scope),
            new_val = val + (is_add ? 1 : -1);
        scope.$set(this.var_name, new_val);
        return is_prefix ?  new_val : val;
    },
    set : function(scope, value) {
        scope.$set(this.var_name, value);
    }
});

var __parse_token_no_action = -1;
var __parse_token_unknow_char = -2;
var __parse_token_unmatch_char = -3;

var __parse_token_type = '';
var __parse_token_value = '';
var __parse_int_array = Int32Array;
var __parse_token_TABLE = {
    b: new __parse_int_array(18),
    d: new __parse_int_array(18),
    c: new __parse_int_array(29),
    n: new __parse_int_array(29),
    a: new __parse_int_array(18),
    e: new __parse_int_array(256)
};

function __parse_token_str2arrs(strs, arrs) {
    for(var j = 0; j < strs.length; j++) {
        var str = strs[j], arr = arrs[j], t = str.charCodeAt(0), len = str.length, c = 0;
        for(var i = 1; i < len; i++) {
            if(t === 0)
                arr[i - 1] = str.charCodeAt(i) - 1;
            else {
                var n = str.charCodeAt(i) - 1, v = str.charCodeAt(i + 1) - 1;
                for(var k = 0; k < n; k++) {
                    arr[c] = v;
                    c++;
                }
                i++;
            }
        }
    }
}
__parse_token_str2arrs(["\0\1\1\1\1\1\1\1\2\1\1\1\5\1\2\5\21", "\1\15\0\2\5\3\4\2\6", "\1\3\0\2\7\2\15\2\4\2\10\2\5\2\16\2\11\2\12\2\13\2\17\2\13\2\6\3\14\16\20\2\0","\0\0\0\1\1\1\4\1\5\1\1\13\1\13\6\14\14\3\2\7\15\10\10\16\17\11\12\14\2\13\0", "\0\2\1\6\2\2\5\1\1\1\1\3\4\1\1\1\0", "\1\12\1\5\16\24\1\2\16\2\6\2\2\2\1\2\15\2\2\2\11\5\2\2\3\2\2\2\4\2\14\2\2\13\13\3\2\2\10\2\5\2\7\2\2\2\1\33\15\2\2\2\1\3\2\2\15\2\1\33\15\2\1\2\12\2\1\2\2\x82\1"], [__parse_token_TABLE.b, __parse_token_TABLE.d, __parse_token_TABLE.c, __parse_token_TABLE.n, __parse_token_TABLE.a, __parse_token_TABLE.e]);

var MAIN______DEFAULT = 15;

var __parse_token_src = null,
    __parse_token_idx = 0,
    __parse_token_end = 0,
    __parse_token_chr = -1;

var __parse_token_state = 15;
var __parse_token_EOF = true;

function parse_token_init(src) {
    __parse_token_src = src;
    __parse_token_end = src.length;
    __parse_token_idx = 0;
    __parse_token_chr = -1;
    __parse_token_EOF = false;
}

function parse_token_lex() {
    if(__parse_token_EOF) {
        return;
    }

    var _yylen = 0;
    var state = __parse_token_state, action = __parse_token_no_action;
    var pre_idx = __parse_token_idx, pre_action = __parse_token_no_action, pre_act_len = 0;

    while (true) {
        if (__parse_token_read_ch() < 0) {
            if (pre_action >= 0) {
                action = pre_action;
                _yylen = pre_act_len;
                __parse_token_idx = pre_idx + pre_act_len;
            } else if (pre_idx < __parse_token_end) {
                action = __parse_token_unmatch_char;
                __parse_token_idx = pre_idx + 1;
            }
            if (pre_idx >= __parse_token_end) {
                __parse_token_EOF = true;
            }
            break;
        } else {
            _yylen++;
        }
        var eqc = __parse_token_TABLE.e[__parse_token_chr];
        if (eqc === undefined) {
            if (pre_action >= 0) {
                action = pre_action;
                _yylen = pre_act_len;
                __parse_token_idx = pre_idx + pre_act_len;
            } else
                action = __parse_token_unknow_char;
            break;
        }
        var offset, next = -1, s = state;

        while (s >= 0) {
            offset = __parse_token_TABLE.b[s] + eqc;
            if (__parse_token_TABLE.c[offset] === s) {
                next = __parse_token_TABLE.n[offset];
                break;
            } else {
                s = __parse_token_TABLE.d[s];
            }
        }

        if (next < 0) {
            if (pre_action >= 0) {
                action = pre_action;
                _yylen = pre_act_len;
                __parse_token_idx = pre_idx + pre_act_len;
            } else {
                action = __parse_token_unmatch_char;
                __parse_token_idx = pre_idx + 1;
            }
            //跳出内层while，执行对应的action动作
            break;
        } else {
            state = next;
            action = __parse_token_TABLE.a[next];
            if (action >= 0) {
                /**
                 * 如果action>=0，说明该状态为accept状态。
                 */
                pre_action = action;
                pre_act_len = _yylen;
            }
        }
    }
    __parse_token_value = __parse_token_src.substr(pre_idx, _yylen);

    parse_token_action(action);

}


function __parse_token_read_ch() {
    if (__parse_token_idx >= __parse_token_end)
        return __parse_token_chr = -1;
    else {
        __parse_token_chr = __parse_token_src[__parse_token_idx++].charCodeAt(0);
        return __parse_token_chr;
    }
}

function parse_token_action (action) {
    switch (action) {
        case __parse_token_no_action:
        case __parse_token_unknow_char:
        case __parse_token_unmatch_char:
            __parse_token_type = 'emp';

            break;

            case 1:

    __parse_token_type = 'op';

break;
case 4:

    __parse_token_type = 'emp';

break;
case 2:

    __parse_token_type = 'var';

break;
case 3:

    __parse_token_type = 'num';

break;
case 0:

     __parse_token_type = 'op';

break;
case 5:

    __parse_token_type = 'emp';

break;



    }
}


function parse_token_string(quote) {
    var chr, idx = __parse_token_idx, e_idx = idx;
    while((chr = __parse_token_src[e_idx++]) && chr !== quote) {

    }
    var not_end = chr === quote;
    __parse_token_idx = not_end ? e_idx+1:e_idx;
    __parse_token_EOF = not_end ? __parse_token_EOF : true;
    return __parse_token_src.substring(idx, not_end ? e_idx-1: e_idx);
}


var __event_table = {
    on : {}, //on
    be : {}, //before
    af : {}  //after
};

var __event_jid_counter = 0;

function event_jid(ele) {
    if(!ele.id) {
        ele.id = 'j.ele.' + (__event_jid_counter++).toString(36);
    }
    return ele.id;
}

function event_bind_stop(ev) {
    ev.__is_p_stoped = false;
    ev.stopPropagation = function() {
        this.__is_p_stoped = true;
    };
}
function event_is_stop(ev) {
    return ev.__is_p_stoped === true;
}

function event_global_handler(event) {

    var event_name = event.type;
    var event_ele = event.target || event.srcElement || event.originalTarget;

    var et, ls, jid, i;
    var table = __event_table.on;
    if(!$hasProperty(table, event_name)) {
        return;
    }
    et = table[event_name];

    event_bind_stop(event);


    while(!event_is_stop(event) && event_ele) {
        jid = $attr(event_ele, 'id');
        if(jid && $hasProperty(et, jid)) {
            ls = et[jid];
            for(i=0;i<ls.length;i++) {
                ls[i].call(event_ele, event);
            }
        }
        event_ele = event_ele.parentElement;
    }

}

function event_before(ele, event_name, handler) {

}

function event_on(ele, event_name, handler) {
    var jid = event_jid(ele);
    var table = __event_table.on,
        et;
    if(!$hasProperty(table, event_name)) {
        et = table[event_name] = {};
        $on(document.body, event_name, event_global_handler);
    } else {
        et = table[event_name];
    }
    var ls;
    if(!$hasProperty(et, jid)) {
        ls = et[jid] = [];
    } else {
        ls = et[jid];
    }
    ls.push(handler);
}

function event_on_remove() {

}

function event_check_directive(value) {
    var m = /^\s*(\w+)\s*:(.+)$/.match(value);
    if(m === null) {
        return null;
    }
    return {
        on : m[1],
        expr : m[2]
    }
}

function struct_init_jarray(jarray) {

}

function JArray(array, env) {
    var _array = $isUndefined(array) ? [] : ($isArray(array) ? array : ($isNumber(array) ? new Array(array) : [array]));
    var __ = {
        array :  _array,
        length : _array.length,
        env : env
    };
    $defineProperty(this, '__', __);

}
var __jarray_prototype = JArray.prototype;
$defineProperty(__jarray_prototype, 'push', function(item) {

});
$defineGetterSetter(__jarray_prototype, 'length', function() {
    return this.__.length;
}, function(len) {
    if(!$isNumber(len) || (len = Math.floor(len)) < 0) {
        return;
    }
    this.__.array.length = len;
});

function DataSource(name, options) {

    $defineProperty(this, 'name', name);
    $defineProperty(this, 'options', {
        direct : 's2c', // 'c2s', 'both'
        type : 'array'
    });

    $extend(this.options, options);

    var __ = {};
    $defineProperty(this, '__', __);
    __.listeners = {
        change : []
    };

    var tp = this.options.type;
    __.value = tp === 'object' ? {} : (tp === 'array' ? [] : '');

}
var __data_source_prototype =  DataSource.prototype;

$defineProperty(__data_source_prototype, 'get', function() {
    return this.__.value;
});

$defineProperty(__data_source_prototype, 'ping', function() {

});
$defineProperty(__data_source_prototype, 'update', function(value) {

});
$defineProperty(__data_source_prototype, 'on', function(event_name, handler) {
    if(typeof handler !== 'function') {
        throw 'DataSource on need function';
    }
    if(event_name === 'change') {
        this.listeners.change.push(handler);
    }
});
$defineProperty(__data_source_prototype, 'bind', function(scope, var_name) {

});


/*
 * require scope
 */
//
//function drive_directive_name_value(ele, drive_module, env) {
//    var dn = $attr(ele, __JDN).split(','),
//        dv = $hasAttr(ele, __JDV) ? $attr(ele, __JDV).split(',') : [];
//    if(dn.length === 0) {
//        //todo check format
//    }
//    var i, ns, val, dire, link_scope, parent_scope;
//    for(i=0;i<dn.length;i++) {
//        ns = dn[i].trim();
//        val = dv[i];
//        dire = __directive_full_table[ns];
//        if(!dire) {
//            throw 'directive "' + ns + '" not found!';
//        }
//        link_scope = drive_run_directive(ele, drive_module, dire, env, val);
//        if(dire.env_type === __ENV_TYPE_PARENT) {
//            if(parent_scope) {
//                throw 'directive with env_type:jing.env_types.PARENT can be occur once on one element!';
//            } else {
//                parent_scope = link_scope;
//            }
//        }
//    }
//    return parent_scope;
//}

function drive_run_directive(element, drive_module, directive, env, val) {
    directive_initialize(directive);
    var link_func = directive.link_func;
    link_func(drive_module, directive.module, env, element, val, directive.name);
}

function drive_render_element(ele, attr, drive_module, env) {
    $assert(attr);
    var i,
        item, directive, cur_env = env;


    item = attr.getNamedItem('j-async-env');
    if(item !== null) {
        directive_deal_j_async_env(ele, attr, drive_module, cur_env);
        /*
         * 由于j-async-env是异步加载的Environment，因此直接返回，等待加载。
         */
        return;
    }

    item = attr.getNamedItem('j-env');
    if(item !== null) {
        cur_env = env.$child();
        directive_deal_j_env(ele, attr, drive_module, cur_env);
    }

    item = attr.getNamedItem('j-include');
    if(item !== null) {
        directive_deal_j_include(ele, attr, drive_module, cur_env);
        /*
         * j-include也是直接返回，等待加载。
         * 注意j-include要放在j-env之后检测。
         */
        return;
    }


    item = attr.getNamedItem('j-repeat');
    if(item !== null) {
        directive_deal_j_repeat(ele, attr, drive_module, cur_env);
        /*
         * j-repeat里面会生成重复的元素，再对这些重复的元素进行drive_render_element.
         * 因此这里直接返回，不再进行接下来的操作。
         */
        return;
    }

    /*
     * 代码执行到这里的时候，attr里面已经不再有以上的j-env, j-async-env, j-repeat
     * 这也是为什么drive_render_element这个函数接受attr参数，
     * 而不是在函数内部通过ele.attributes来取得的原因。
     */

    item = attr.getNamedItem('j-directive-name');
    if(item !== null) {
        //todo
    }

    for(i=0;i<attr.length;i++) {
        item = attr[i];
        directive = __directive_short_table[item.name];
        if(directive) {
            drive_run_directive(ele, drive_module, directive.module, cur_env, item.value);
        }
    }

}

function drive_parse_element(ele, drive_module, env) {
    /*
     * check nodeType. see https://developer.mozilla.org/zh-CN/docs/Web/API/Node.nodeType
     */
    switch (ele.nodeType) {
        case 1:
            // Element
            var new_env = drive_render_element(ele, ele.attributes, drive_module, env);
            /*
             * 使用递归的方式遍历DOM树。目前来看性能是可以保障的。
             */
            var chs = ele.childNodes;
            for(var i=0;i<chs.length;i++) {
                drive_parse_element(chs[i], drive_module, new_env ? new_env : env);
            }
            break;
        case 3:
            // #text
            drive_render_view(ele, env);
            break;
        default:
            //ignore other.
            break;
    }

}


/*
 * require scope
 */



var __drive_view_REG = /\{\{.+?\}\}/g;

function RenderPiece(type, value) {
    this.type = type;
    this.value = value;
}

function drive_render_view(ele, scope) {
    var txt = ele.textContent;
    var expr = null;
    var piece_start = 0;
    var piece_array = [];
    while((expr = __drive_view_REG.exec(txt))!==null) {
        if(expr.index > piece_start) {
            piece_array.push(new RenderPiece(0, txt.substring(piece_start, expr.index)));
        }
        piece_start = expr.index + expr[0].length;
        piece_array.push(new RenderPiece(1, parse_expression(expr[0])));
    }
    if(expr === null) {
        return;
    } else if(piece_start < txt.length) {
        piece_array.push(new RenderPiece(0, txt.substring(piece_start)));
    }

    for(var i=0;i<piece_array.length;i++) {
        if(piece_array[i].type === 1) {
            scope.$watch(piece_array[i].value, drive_view_observer, {
                element : ele,
                pieces : piece_array,
                piece_idx : i
            });
        }
    }

    var val = scope.$get(m[1]);
    if(!val) {
        log('"'+m[1]+'" not found in scope: ' + scope.$name);
    }
    cn[i].textContent = txt.replace(m[0], val);
    var template = txt.replace(m[0], "{{0}}");



    //todo 一个textNode里面可能有多个{{var_name}}，并且{{var_name}}可能有重复。
}

function drive_view_observer( var_name, new_value, data) {
    //data.element.textContent =
}


jing = {};

jing.scope_types = {
    INHERIT : __ENV_TYPE_INHERIT,
    CREATE : __SCOPE_TYPE_CREATE,
    PARENT : __SCOPE_TYPE_PARENT
};

jing.module = module_create;
jing.require = module_require;

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
jing.environment = function(name, func) {

};


})();