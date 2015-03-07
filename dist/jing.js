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


function $defineProperty(obj, prop, value, writable, enumerable) {
    //Object.defineProperty(obj, prop, {
    //    value : value,
    //    writable : writable ? true : false,
    //    enumerable : enumerable ? true : false
    //});
    //开发阶段enumerable都为true，方便调试
    //todo remove enumerable [true]
    Object.defineProperty(obj, prop, {
        value : value,
        writable : writable ? true : false,
        enumerable : true
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
    return Array.isArray(obj); // obj instanceof Array;
}
function $isJArray(obj) {
    return obj instanceof JArray;
}
function $$before(new_ele, ele) {
    ele.parentNode.insertBefore(new_ele, ele);
}
function $$remove(ele) {
    ele.parentNode.removeChild(ele);
}
function $$all(query) {
    return document.querySelectorAll(query);
}
function $$append(parent, ele) {
    parent.appendChild(ele);
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
function $setArray(dst_arr, src_arr) {
    for(var i=0;i<src_arr.length;i++) {
        dst_arr[i] = src_arr[i];
    }
}
function $$id(id) {
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
    return obj !== null && typeof obj === 'object';
}
function $isNull(nl) {
    return nl === null;
}
function $isUndefined(obj) {
    return typeof obj === 'undefined';
}
function $ready(fn) {
    if (document.readyState === 'complete') {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
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


function $JSONStringify(obj) {

    function get_origin_obj(obj) {
        var rtn_obj = obj;
        var i, k, tmp;
        if($isJArray(obj) || $isArray(obj)) {
            rtn_obj = [];
            tmp = $isArray(obj) ? obj : obj.__.array;
            for(i=0;i<tmp.length;i++) {
                rtn_obj.push(get_origin_obj(tmp[i]));
            }
        } else if($isObject(obj)) {
            rtn_obj = {};
            for(k in obj) {
                if(k !== __env_emit_name && k !== __env_prop_name) {
                    rtn_obj[k] = get_origin_obj(obj[k]);
                }
            }
        }

        return rtn_obj;
    }

    return JSON.stringify(get_origin_obj(obj));

}

function $JSONParse(str) {
    return JSON.parse(str);
}

function $ajax(options) {
    var ops = $merge(options, {
        method : 'get',
        type : 'json',
        data : {}
    });
    var xhr = new XMLHttpRequest();

}


function $map(array, func) {
    var len = array.length,
        new_array = new Array(len);
    for(var i=0;i<len;i++) {
        new_array[i] = func(array[i], i);
    }
    return new_array;
}

function $in(obj, func) {
    for(var kn in obj) {
        if(func(obj[kn], kn) === false) {
            return;
        }
    }
}


function $each(arr, func) {
    for(var i=0;i<arr.length;i++) {
        if(func(arr[i], arr[i], i)===false) {
            return;
        }
    }
}


function $filter(arr, fn) {

    function apply_filter(item, obj) {
        for(var k in obj){
            if(item[k] !== obj[k]) {
                return false;
            }
        }
        return true;
    }

    var new_arr =  arr, i;
    if($isFunction(fn)) {
        new_arr = arr.filter(fn);
    } else if($isObject(fn)) {
        new_arr = [];
        for(i=0;i<arr.length;i++) {
            if(apply_filter(arr[i], fn)) {
                new_arr.push(arr[i]);
            }
        }
    }
    return new_arr;
}

function Environment(name, parent) {
    $defineProperty(this, '__', {
        prop : $bind(this, environment_reg_props),
        bind : $bind(this, environment_reg_binds),
        emit_tree : new RootEmitNode('env.root'),
        name : name,
        children : {},
        parent : parent ? parent : null,
        listeners : {},
        //以下字段是给j-repeat的子Env用的。
        array : null,
        index : 0
    });
}

var __env_prototype = Environment.prototype;
$defineGetterSetter(__env_prototype, '$name', function() {
    return this.__.name;
});
$defineGetterSetter(__env_prototype, '$children', function() {
    return this.__.children;
});
$defineGetterSetter(__env_prototype, '$parent', function() {
    return this.__.parent;
});

$defineGetterSetter(__env_prototype, '$root', function() {
    return this.__.parent ? this.__.parent.$root : this;
});

$defineProperty(__env_prototype, '$destroy', function() {
    var k;
    for(k in this.__.children) {
        this.__.children[k].$destroy();
    }
    this.__.children = null;
    this.__.parent = null;
    this.__.emit_tree = null;
    var ls = this.__.listeners;
    for(k in ls) {
        environment_unwatch_listener(ls[k]);
        ls[k] = null;
    }
    this.__.listeners = null;
});

$defineProperty(__env_prototype, '$child', function(name) {
    var cd = this.__.children;
    if($hasProperty(cd, name)) {
        return cd[name];
    } else {
        var cs = new Environment(name, this);
        $defineProperty(cd, name, cs, false, true);
        return cs;
    }
});

/*
 * 取得变量名对应的值，会循环检索父亲env
 */
$defineProperty(__env_prototype, '$get', function(var_name) {
    if($hasProperty(this, var_name)) {
        return this[var_name];
    } else if(this.__.parent) {
        return this.__.parent.$get(var_name);
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
    } else if(this.__.parent) {
        return this.__.parent.$has(var_name);
    } else {
        return false;
    }
});

/*
 * 取得变量名所在的env，会循环检索父亲env
 */
$defineProperty(__env_prototype, '$find', function(var_name) {
   if($hasProperty(this, var_name)) {
       return this;
   } else if(this.__.parent) {
       return this.__.parent.$find(var_name);
   }
});
/*
 * 设置变量名对应的值，会循环检索父亲env。
 */
$defineProperty(__env_prototype, '$set', function(var_name, value) {
    if($hasProperty(this, var_name)) {
        this[var_name] = value;
    } else if(this.__.parent) {
        this.__.parent.$set(var_name, value);
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
 *   this.$prop = {
 *      name : 'xiaoge'
 *   }
 *
 * 也可以直接在this上赋值，如：
 *   this.name = 'xiaoge';
 *   this.age = 10;
 *   this.say = function() {
 *      alert('hello, '+this.name);
 *   }
 */
$defineGetterSetter(__env_prototype, '$prop', function() {
    return this.__.prop;
}, function() {
    environment_reg_props.apply(this, arguments);
});

$defineProperty(__env_prototype, '$bind', function() {
    return this.__.bind;
}, function() {
    environment_reg_binds.apply(this, arguments);
});

function environment_reg_props(name, value) {
    if($isObject(name)) {
        for(var kn in name) {
            this[kn] = name[kn];
        }
    } else {
        this[name] = value;
    }
}

function environment_reg_binds(name, var_str) {

    function reg_bind(name, var_name) {
        if($hasProperty(this, name)) {
            throw new Error('variable' + name + ' has been registered');
        }
        var var_array = environment_split_var(var_name);
        var env = this.$find(var_array[0]);
        if(!env || env === this) {
            throw new Error('variable ' + var_array[0] + ' not found in $bind');
        }
        /*
         * 构建emit_tree
         */
        var listener = new ImmListener();
        environment_watch_items(env, var_array[0], listener, false);
        environment_unwatch_listener(listener);
        /*
         *
         */
        var e_node = env.__.emit_tree;
        for(var i=0;i<var_array.length;i++) {
            e_node = e_node.children[var_array[i]];
        }

        $defineGetterSetter(this, name, function() {
            var p = env[var_array[0]];
            for(var i=1;i<var_array.length;i++) {
                p = p[var_array[i]];
            }
            return p;
        }, function(val) {
            var p = env, v = var_array[0];
            for(var i=0;i<var_array.length-1;i++) {
                p = p[var_array[i]];
                v = var_array[i+1];
            }
            p[v] = val;
        });

        var new_e_node = new EmitNode(name, this.__.emit_tree);
        new_e_node.L_emitter = e_node.L_emitter;
        new_e_node.I_emitter = e_node.I_emitter;

        this.__.emit_tree.children[name] = new_e_node;
        this[__env_emit_name][name] = new_e_node;


    }

    if($isObject(name)) {
        for(var kn in name) {
            reg_bind.call(this, kn, name[kn]);
        }
    } else {
        reg_bind.call(this, name, var_str);
    }
}

function environment_create_child(env, c_name) {
    var cd = env.__.children;
    var cs = new Environment(c_name, env);
    /*
     * 这里的第4个参数一定要为true，才能覆盖。
     */
    $defineProperty(cd, c_name, cs, true, false);
    return cs;
}

//
//function environment_create(parent) {
//    var name = this.__.parent ? this.__.parent.name + '.' + __env_counter++ : 'jing.scope.' + __env_counter++;
//    var cs = new Environment(name, parent);
//    if(parent) {
//        $defineProperty(parent.$children, name, cs, false, true);
//    }
//    return cs;
//}

function EmitNode(id, parent) {
    this.id = id;
    this.L_emitter = null;
    this.children = {};
    this.parent = parent;
    this.path = (parent.path ? parent.path + '.' : '') + id;
    this.I_emitter = new ImmEmitter(this.path);
    this.L_emitter = new ImmEmitter(this.path);
}
EmitNode.prototype = {
    /*
     * _notify_emitter
     */
    _ne : function(emit_type) {
        this.I_emitter.notify(emit_type);
        this.L_emitter.notify(emit_type);
    },
    notify : function() {
        this._ne("self");
        this._nc();
        if(this.parent) {
            this.parent._nu();
        }
    },
    item_notify : function(index) {
        var cn = this.children[index];
        if(cn) {
            cn._ne('self');
            cn._nc();
        }
        this._nu();
    },
    /*
     * _notify_down
     * @private
     */
    _nd : function() {
        this._ne("parent");
        this._nc();
    },
    /*
     * _notify_children
     * @private
     */
    _nc : function() {
        for(var k in this.children) {
            this.children[k]._nd();
        }
    },
    /**
     * _notify_up
     * @private
     */
    _nu : function() {
        this._ne("child");
        if(this.parent) {
            this.parent._nu();
        }
    },
    destroy : function() {
        this.I_emitter.destroy();
        this.L_emitter.destroy();
        for(var k in this.children) {
            this.children[k].destroy();
            delete this.children[k];
        }
        this.I_emitter = null;
        this.L_emitter = null;
        this.parent = null;
    }
};

function RootEmitNode(id) {
    this.id = id;
    this.children = {};
    this.path = '';
}
RootEmitNode.prototype = {
    _nu : function() {

    },
    _ne : function() {

    },
    _nd : function() {

    },
    destroy : function() {
        for(var k in this.children) {
            this.children[k].destroy();
            delete this.children[k];
        }
    }
};

function ImmEmitter(path) {
    this.listeners = [];
    this.path = path;
}
ImmEmitter.prototype = {
    reset : function() {
        /*
         * 这里我们并不需要destroy每一个listener，因为我们认为destroy某个listener
         * 是该listener所在environment的API职责，因为listener并不知道自己是属于哪个Env的。
         *
         * 在jing.js内部，目前只在jarray.js文件中，当数组元素减少时调用了这个函数。
         *   数组元素减少时，相应的子Env在j-repeat.js中会被$destroy，这时候这些listener就被destroy了。
         */
        this.listeners.length = 0;
    },
    notify : function(emit_type) {
        for(var i=0;i<this.listeners.length;i++) {
            this.listeners[i].notify(emit_type, this.path);
        }
    },
    addListener : function(listener) {
        if(this.listeners.indexOf(listener)<0) {
            this.listeners.push(listener);
            listener.emitters.push(this);
        }
    },
    destroy : function() {
        for(var i=0;i<this.listeners.length;i++) {
            this.listeners[i].destroy();
        }
        this.listeners.length = 0;
    }
};

function LazyEmitter(path) {
    this.base(path);
    this.handler = $bind(this, this.deal);
    this.tm = null;
    this.et = '';
}
LazyEmitter.prototype = {
    notify : function(emit_type) {
        if(this.tm !== null) {
            clearTimeout(this.tm);
            this.tm = null;
        }
        this.et = emit_type; //只记录最后一次的变化类型。
        this.tm = setTimeout(this.handler, 0);
    },
    deal : function() {
        this.tm = null;
        this.callBase('notify', this.et);
    },
    destroy : function() {
        if(this.tm !== null) {
            clearTimeout(this.tm);
            this.tm = null;
        }
        this.callBase('destroy');
    }
};
$inherit(LazyEmitter, ImmEmitter);

/*
 * 目前对于数组的处理方式为：
 *   将数组封装为自定义的JArray类，实际数组存在JArray的__.array成员变量里，
 *   通过给JArray定义属性，来实现jarray[index]访问单个元素。这样做的缺点
 *   包括，
 *   1.当数组巨大时，该JArray实例也会有巨大数量的属性；
 *   2.想要访问的元素位置超出数组元素的个数时，也会无效；
 *   4.为了简化，数组数量减少时，JArray的属性数量不变。
 *   以及如下问题：
 *     'slice'函数返回了新的 JArray对象，
 *     并且诸如 {{array.slice(4, 5)[0].name}}这样的表达式无法正确处理双向绑定。
 *
 * 当前的处理方式还需要进一步地斟酌和改进。
 *
 */
function jarray_up(jarray) {
    var i, e_tree, en,
        up = jarray.__.up,
        len = jarray.__.array.length;
    if(len === 0) {
        return;
    }

    for(i=up;i<len;i++) {
        if(!$hasProperty(jarray, i)) {
            (function(idx) {
                $defineGetterSetter(jarray, idx, function() {
                    return this.__.array[idx];
                }, function(val) {
                    var ov = this.__.array[idx];
                    if(ov !== val) {
                        this.__.array[idx] = val;
                        this.__.en.item_notify(idx);
                    }
                }, true, true);//这里的参数true很重要，使得该属性可以被重写覆盖。

            })(i);
        }
    }
    jarray.__.up = len;
}

function JArray(array, emit_node) {
    $defineProperty(this, '__', {
        array : array,
        en : emit_node,
        up : 0
    });
    $defineProperty(this, __env_emit_name, {});

    jarray_up(this);
}
var __jarray_prototype = JArray.prototype;

$each(['push', 'pop', 'shift', 'unshift', 'splice'], function(med) {
    $defineProperty(__jarray_prototype, med, function() {
        var fn = Array.prototype[med],
            rtn = fn.apply(this.__.array, arguments);

        jarray_up(this, true);
        this.__.en.notify();
        return rtn;
    });
});


$each(['join', 'indexOf', 'fill', 'find'], function(med) {
    $defineProperty(__jarray_prototype, med, function() {
        return Array.prototype[med].apply(this.__.array, arguments);
    });
});

$defineProperty(__jarray_prototype, 'slice', function() {
    return new JArray(Array.prototype.slice.apply(this.__.array, arguments), new EmitNode('emp', this.__.en));
});

$defineProperty(__jarray_prototype, 'set', function(idx, val) {
    if($hasProperty(this, idx)) {
        this[idx] = val;
    } else {
        this.__.array[idx] = val;
        this.__.en.notify();
    }
});

$defineProperty(__jarray_prototype, 'get', function(idx) {
    return this.__.array[idx];
});

$defineGetterSetter(__jarray_prototype, 'length', function() {
    return this.__.array.length;
}, function(len) {
    this.__.array.length = len;
    jarray_up(this, true);
    this.__.en.notify();
});
$defineProperty(__jarray_prototype, 'filter', function(fn) {
    var src = this.__.array;
    if(!fn || src.length === 0) {
        return this;
    }
    var dst = $filter(src, fn);
    if(dst.length===src.length) {
        return this;
    }
    return new JArray(dst, this.__.en);
});

$defineProperty(__jarray_prototype, 'sort', function(fn) {
    var dst = this.__.array.sort(fn);
    return new JArray(dst, this.__.en);
});

$defineProperty(__jarray_prototype, 'destroy', function() {
    this.__.array.length = 0;
    this.__.en = null;
});

var __environment_listen_counter = 0;

function Listener(handler, data) {
    this.id = (__environment_listen_counter++).toString(36);
    this.handler = handler;
    this.data = data;
    this.emitters = [];
}
Listener.prototype = {
    destroy : function() {
        this.handler = null;
        this.data = null;
        this.emitters.length = 0;
        this.emitters = null;
    },
    notify : function() {
        //throw 'abstract method Listener.notify';
    },
    _deal : function() {
        //throw 'abstract method Listener.deal';
    }
};

function LazyListener(handler, data, lazy_time) {
    this.base(handler, data);
    this.lazy = $isNumber(lazy_time) ? ((lazy_time = Math.floor(lazy_time)) >=0 ? lazy_time : 0) : 0;
    this.tm = null;
    this.dg = $bind(this, this._deal);
    this.changes = [];
}
LazyListener.prototype = {
    notify : function(emit_type, var_path) {
        if(this.tm !== null) {
            clearTimeout(this.tm);
            this.tm = null;
        }
        this.changes.push(var_path);
        this.tm = setTimeout(this.dg, this.lazy);
    },
    destroy : function() {
        this.callBase('destroy');
        this.changes = null;
        if(this.tm !== null) {
            clearTimeout(this.tm);
            this.tm = null;
        }
        this.dg = null;
    }
};
$inherit(LazyListener, Listener);

function ImmExprListener(var_tree, expr, env, handler, data) {
    this.base(handler, data);
    this._init(var_tree, expr, env);
}
ImmExprListener.prototype = {
    _init : function(var_tree, expr, env) {
        this.expr = expr;
        this.var_tree = var_tree;
        this.env = env;
        this.pre_value = null;
        this.cur_value = null;
        //this.compare = true;
    },
    notify : function(emit_type, var_name) {
        var n = this.var_tree[var_name];
        if(!n) {
            return;
        }
        listen_refresh_expr_node(n);

        this._deal();
    },
    /*
     * notify_change
     */
    _deal : function() {

        this.cur_value = this.expr.exec(this.env);
        if(!$isJArray(this.cur_value) && this.cur_value === this.pre_value) {
            return;
        }
        this.handler([{
            type : 'expr',
            pre_value : this.pre_value,
            cur_value : this.cur_value
        }], this.data);
        this.pre_value = this.cur_value;

    },
    destroy : function() {
        this.callBase('destroy');
        destroy_expr_listener(this);
    }
};

$inherit(ImmExprListener, Listener);

function LazyExprListener(var_tree, expr, env, handler, data, lazy_time) {
    this.base(handler, data, lazy_time);
    ImmExprListener.prototype._init.call(this, var_tree, expr, env);
}

LazyExprListener.prototype = {
    _deal : function() {
        var i, c, n_arr, j;
        for(i=0;i<this.changes.length;i++) {
            c = this.changes[i];
            n_arr = this.var_tree[c];
            if(!n_arr) {
                continue;
            }
            for(j=0;j<n_arr.length;j++) {
                n_arr[j].cached = false;
                listen_refresh_expr_node(n_arr[j]);
            }
        }

        this.changes.length = 0;
        /*
         * 这样写只是为了省一点代码。
         * LazyExprListener不仅继承了LazyListener的性质，也继承了ImmExprListener的一些性质。
         */
        ImmExprListener.prototype._deal.call(this);

    },
    destroy : function() {
        this.callBase('destroy');
        destroy_expr_listener(this);
    }
};
$inherit(LazyExprListener, LazyListener);

function destroy_expr_listener(listener) {
    listener.expr.destroy();
    listener.expr = null;
    listener.env = null;
    for(var k in listener.var_tree) {
        delete listener.var_tree[k];
    }
    listener.var_tree = null;
    listener.pre_value = null;
    listener.cur_value = null;
}

function listen_refresh_expr_node(node) {
    /*
     * 如果node.cached===false，说明当前node及其父亲树都已经被refresh过了，
     *   不需要再次遍历。这是一个简单的优化。
     */
    function re_loop(node) {
        if(!node || node.cached === false) {
            return;
        }
        node.cached = false;
        re_loop(node.parent);
    }

    node.cached = false;
    re_loop(node.parent);

}


/*
 * 尽可能使用一个不会被使用的名称来作为内部成员。
 */
var __env_prop_name = '__$jing.0210.prop$__';
var __env_emit_name = '__$jing.0210.emit$__';
/*
 * __env_prop_name和__env_emit_name在压缩时，
 *   会被检测到未被改写过，也就是常数，从而被替换为常数，避免闭包。
 *
 * 但var_name还是难以避免地成为闭包变量。
 *   通过Object.defineProperty定义的getter和setter如果能取得当前getter/setter的名称，
 *   就可以解决var_name的闭包问题。
 *
 *
 */
function environment_declare_obj(p, var_name, value, emit_node) {
    var v = $isArray(value) ? new JArray(value, emit_node) : value;
    p[__env_prop_name][var_name] = v;
    $defineGetterSetter(p, var_name, function () {
        return this[__env_prop_name][var_name];
    }, function (val) {
        var props = this[__env_prop_name], pv = props[var_name];

        if(pv === val) {
            return;
        }
        var pj = $isJArray(pv),
            cj = $isArray(val);
        if(pj && cj) {
            val = new JArray(val, pv.__.en);
        } else if(pj !== cj) {
            throw new Error('暂时不允许在Array和非Array类型之间进行切换赋值。');
        }

        if($isObject(props[var_name]) && $isObject(val) && $isObject(pv)) {
            var en = this[__env_emit_name][var_name];
            environment_redeclare_var(en, val, pv);
        }

        props[var_name] = val;
        this[__env_emit_name][var_name].notify();
    }, false, true);
    return v;
}
function environment_declare_arr(p, idx_str, emit_node) {
    //p is JArray
    var idx = parseInt(idx_str),
        v = p.__.array[idx];

    p[__env_emit_name][idx_str] = emit_node;
    if($isArray(v)) {
        v = p.__.array[idx] = new JArray(v, emit_node);
    }

    $defineGetterSetter(p, idx_str, function() {
        return this.__.array[idx];
    }, function(val) {
        var ov = this.__.array[idx];
        if(ov === val) {
            return;
        }
        if($isObject(ov) && $isObject(val)) {
            var en = this[__env_emit_name][idx];
            environment_redeclare_var(en, val);
        }
        this.__.array[idx] = val;
        this.__.en.item_notify(idx);
    });

    return v;
}

function environment_redeclare_var(emit_node, obj, p_obj) {
    var var_name, cs = emit_node.children, val, ps, v;
    var obj_em = obj[__env_emit_name],
        p_obj_em = p_obj[__env_emit_name];
    for(var_name in cs) {
        if(obj instanceof JArray && /^\d+$/.test(var_name)) {
            if(!$hasProperty(obj_em, var_name) && $hasProperty(p_obj_em, var_name)) {
                v = environment_declare_arr(obj, var_name, emit_node);
                environment_redeclare_var(cs[var_name], v, p_obj[var_name]);
            }
        } else {
            if(!$hasProperty(obj, var_name)) {
                continue;
            }

            if(!$hasProperty(obj, __env_emit_name)) {
                $defineProperty(obj, __env_emit_name, {});
            }
            if (!$hasProperty(obj, __env_prop_name)) {
                ps = {};
                $defineProperty(obj, __env_prop_name, ps);
            } else {
                ps = obj[__env_prop_name];
            }
            val = obj[var_name];
            delete obj[var_name];
            v = environment_declare_obj(obj, var_name, val, cs[var_name]);
            environment_redeclare_var(cs[var_name], v, p_obj[var_name]);
        }
    }
}

function environment_watch_each_var(p, var_name, emit_node) {
    var ps, val, et;

    if(p instanceof JArray) {
        if(var_name === 'length') {
            //do nothing. return.
            return p.length;
        } else if(/^\d+$/.test(var_name)) {
            if(!$hasProperty(p[__env_emit_name], var_name)) {
                environment_declare_arr(p, var_name, emit_node);
            }
            return p[var_name];
        }
    }

    if(!$hasProperty(p, __env_emit_name)) {
        et = {};
        $defineProperty(p, __env_emit_name, et);
    } else {
        et = p[__env_emit_name];
    }
    if (!$hasProperty(p, __env_prop_name)) {
        ps = {};
        $defineProperty(p, __env_prop_name, ps);
    } else {
        ps = p[__env_prop_name];
    }

    if (!$hasProperty(ps, var_name)) {
        if (!$hasProperty(p, var_name)) {
            throw 'property ' + var_name + ' not found.'
        }
        val = p[var_name];
        delete p[var_name];
        environment_declare_obj(p, var_name, val, emit_node);
        et[var_name] = emit_node;
    }
    //else if(!$hasProperty(et, var_name)) {
    //    et[var_name] = emit_node;
    //}

    return p[var_name];
}


function environment_watch_items(env, var_array, listener, is_lazy) {

    function get_node(parent, name) {
        var n = parent.children[name];
        if(!n) {
            n = parent.children[name] = new EmitNode(name, parent);
        }
        return n;
    }

    if(var_array.length === 0) {
        return;
    }

    var act_env = env.$find(var_array[0]);
    if(!act_env) {
        throw 'variable ' + var_array[0] + ' not found!';
    }
    var p = act_env, vn, i, e_tree = act_env.__.emit_tree;
    var e_node, cp, pen;
    for (i = 0; i < var_array.length; i++) {
        if (!$isObject(p)) {
            throw('$watch need object.');
        }
        vn = var_array[i];
        pen = p[__env_emit_name];
        e_node = get_node(e_tree, vn);
        cp = environment_watch_each_var(p, vn, e_node);
        p = cp;
        e_tree = e_node;
    }

    (is_lazy ? e_node.L_emitter : e_node.I_emitter).addListener(listener);
}

/*
 * 将a.b[4][3][7].c.d[9]转成a.b.4.3.7.c.d.9的形式。
 */
function environment_var2items(var_name) {
    return var_name.replace(/\[\s*(\d+)\s*\]/g, ".$1.").replace('..', '.', 'g').split('.');
}


$defineProperty(__env_prototype, '$unwatch', function(listener_id) {
    var lt = this.__.listeners,
        listener = lt[listener_id];
    if(!listener) {
        return;
    }
    delete lt[listener_id];
    environment_unwatch_listener(listener);
});

$defineProperty(__env_prototype, '$watch', function (var_name, callback, data, lazy_time) {



    if (typeof callback !== 'function') {
        throw new Error('$watch need function');
    }

    if (!$isString(var_name) ||! /^[\w\d]+(?:(?:\.[\w\d]+)|(?:\[\s*\d+\s*\]))*$/.test(var_name)) {
        throw new Error('$watch wrong format');
    }

    var is_lazy = lazy_time !== false;
    var v_tree = {},
        v_items = environment_var2items(var_name),
        expr = build_node_loop(v_items.length-1);

    function build_node_loop(idx) {
        if(idx === 0) {
            var vn = new VariableGrammarNode(v_items[0]);
            v_tree[v_items.join('.')] = [vn];
            return vn;
        } else {
            return new PropertyGrammarNode(build_node_loop(idx - 1), new ConstantGrammarNode(v_items[idx]));
        }
    }
    var listener = is_lazy ? new LazyExprListener(v_tree, expr, this, callback, data, $isNumber(lazy_time) ? lazy_time : 0) : new ImmExprListener(v_tree, expr, this, callback, data);

    environment_watch_items(this, v_items, listener, is_lazy);

    this.__.listeners[listener.id] = listener;
    listener.cur_value = listener.pre_value = expr.exec(this);

    return listener.id;
});

function environment_unwatch_listener(listener) {
    $each(listener.emitters, function(emitter) {
        var idx = emitter.listeners.indexOf(listener);
        if(idx>=0) {
            emitter.listeners.splice(idx, 1);
        }
    });
    listener.destroy();
}

function environment_watch_expr_loop(expr_node, watch_array, var_tree) {
    function expr_prop(expr, v_arr) {
        var nb = expr.nodes[1];
        if(nb.type === 'constant') {
            v_arr.push(nb.value);
            if(expr.parent && expr.parent.type === 'property') {
                expr_prop(expr.parent, v_arr);
            }
        }
    }

    if(expr_node.type === 'variable') {
        var vn = [expr_node.var_name];
        if(expr_node.parent && expr_node.parent.type === 'property') {
            expr_prop(expr_node.parent, vn);
        }
        watch_array.push(vn);
        var path = vn.join('.'), n_arr = var_tree[path];
        if(!n_arr) {
            n_arr = var_tree[path] = [];
        }
        if(n_arr.indexOf(expr_node)<0) {
            n_arr.push(expr_node);
        }
    } else {
        for(var i=0;i<expr_node.nodes.length;i++) {
            environment_watch_expr_loop(expr_node.nodes[i], watch_array, var_tree);
        }
    }

}

function environment_watch_expression(env, expr, callback, data, lazy_time) {
    var watch_array = [];
    var var_tree = {};

    environment_watch_expr_loop(expr, watch_array, var_tree);

    if(watch_array.length === 0) {
        return;
    }

    if(expr.type === 'property') {
        //todo 如果是简单表达式，则使用PropListener，精确传递变化类型。
    }

    var is_lazy = lazy_time !== false;
    var listener = is_lazy ? new LazyExprListener(var_tree, expr, env, callback, data, $isNumber(lazy_time) ? lazy_time : 0) : new ImmExprListener(var_tree, expr, env, callback, data);

    for (var i = 0; i < watch_array.length; i++) {
        environment_watch_items(env, watch_array[i], listener, is_lazy);
    }

    env.__.listeners[listener.id] = listener;

    listener.cur_value = listener.pre_value = expr.exec(env);

    return listener;
}

/*
 * 保存全局的顶层Module
 */
var __module_table = {};
var __root_module = new Module('jing', null);


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


var __module_drive_queue = {};
var __module_doc_ready = false;

function module_apply_drive() {
    console.time('ttt');
    var id, d_item, r_list, j;
    for(id in __module_drive_queue) {
        d_item = __module_drive_queue[id];
        if(d_item.init) {
            continue;
        }
        r_list = d_item.module.__.runs;
        for(j=0;j<r_list.length;j++) {
            r_list[j].call(d_item.env, d_item.module, d_item.env);
        }

        drive_parse_element(d_item.ele, d_item.module, d_item.env);

        drive_insert_before();

        d_item.init = true;
    }
    console.timeEnd('ttt');
}

$ready(function() {
   if(!__module_doc_ready) {
       __module_doc_ready = true;
   }
});

function module_get_root_env(element) {
    var id = event_jid(element),
        d_item = __module_drive_queue[id];
    if(!d_item) {
        return null;
    } else {
        return d_item.env;
    }
}

function module_drive_add(module, element) {
    var id = event_jid(element),
        d_item = __module_drive_queue[id];
    if(d_item) {
        throw 'element can\'t be driven more than once';
    } else {
        d_item = {
            init : false,
            env : new Environment(id),
            ele : element,
            module : module
        };
        __module_drive_queue[id] = d_item;
    }
}
$defineProperty(__module_prototype, 'drive', function drive(element) {
    if(this.parent) {
        throw 'function "drive" can only be applied to root Module';
    }
    if($isString(element)) {
        element = document.querySelector(element);
    }
    module_drive_add(element);

    if(__module_doc_ready) {
       module_apply_drive();
    }

    return this;
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


var __directive_short_table = {};
var __directive_full_table = {};

function directive_register(directive) {
    var name = directive.name;
    if($isArray(name)) {
        for(var i=0;i<name.length;i++) {
            r(name[i], directive);
        }
    } else {
        r(name, directive);
    }

    function r(n, d) {
        __directive_short_table[n] = d;
        __directive_full_table[d.module.path + '.' + n] = d;
    }
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

function directive_create(name, func) {
    directive_register(new Directive(__root_module, name, func));
}

$ready(function() {
    var app_list = $$all('*[j-app]');
    if(app_list.length===0) {
        return;
    }

    $each(app_list, function(ele) {
        var m_name = $attr(ele, 'j-app'),
            module = module_create(m_name);
        module_drive_add(module, ele);
    });

    module_apply_drive();
});

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

directive_create('j-class', function() {
    function apply_class(ele, pre, cur) {
        ele.className = (ele.className.replace(pre.trim(), '') + ' ' + cur).trim();
    }
    return function(drive_module, directive_module, env, element, attr_value) {

        var expr = parse_expression(attr_value, true);

        var listener = environment_watch_expression(env, expr, function(change_list, ele) {
            log('class')
            apply_class(ele, change_list[0].pre_value, change_list[0].cur_value);
        }, element, 10);

        apply_class(element, '', listener.cur_value);
    }
});

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
    env_def.func.call(env, drive_module, env);
}

/**
 * Created by abraham on 15/2/25.
 */
directive_create('j-if', function() {
    function apply_insert(ele, parent, insert) {
    }
    return function(drive_module, directive_module, env, element, attr_value) {
        throw 'j-if has not been implemented';
    }
});

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

function JInputModel(ele, env, expr, two_way) {
    this.ele = ele;
    this.env = env;
    this.expr = expr;

    var listener = environment_watch_expression(env, expr, function(change_list, j_model) {
        j_model.update(change_list[0].cur_value);
    }, this, 10);

    this.val = listener.cur_value;
    this.val_key = 'value';
    this.val_event = 'input';

    var type = $attr(ele, 'type');
    //todo 支持checkbox, radio等各种类型。

    switch (type) {
        case 'checkbox':
            this.val_key = 'checked';
            this.val_event = 'change';
            break;
    }

    this.ele[this.val_key] = this.val;

    if(two_way) {
        $on(ele, this.val_event, $bind(this, this.change));
    }

}
var __jimodel_prototype = JInputModel.prototype;

__jimodel_prototype.change = function() {
    this.val = this.ele[this.val_key];
    this.expr.set(this.env, this.val);
};

__jimodel_prototype.update = function(new_value) {
    if(this.val !== new_value) {
        this.ele[this.val_key] = new_value;
        this.val = new_value;
    }
};
__jimodel_prototype.destroy = function() {
    this.ele = null;
    //todo unwatch
    this.expr.destroy();
    this.expr = null;
};

function directive_data_bind(drive_module, directive_module, env, element, attr_value, two_way) {
    if(element.nodeName !== 'INPUT') {
        return;
    }
    //todo 支持checkbox, radio等各种类型。

    var expr = parse_expression(attr_value, false);

    if(expr.type !== 'variable' && expr.type !== 'property') {
        throw 'j-model only support settable expression';
    }

    new JInputModel(element, env, expr, two_way);
}

directive_create('j-model', function() {

    return function(drive_module, directive_module, env, element, attr_value) {
        directive_data_bind(drive_module, directive_module, env, element, attr_value, true);
    };
});

directive_create('j-value', function() {
    return function(drive_module, directive_module, env, element, attr_value) {
        directive_data_bind(drive_module, directive_module, env, element, attr_value, false);
    };
});

directive_create('j-on', function() {
    return function(drive_module, directive_module, env, element, attr_value) {
        var m = event_check_directive(attr_value);
        if(!m) {
            throw 'j-on format wrong.';
        }
        var expr = parse_expression(m.expr);
        event_on(element, m.on, function() {
            expr.exec(env);
        });
    }
});

directive_create('j-enter', function() {
    return function(drive_module, directive_module, env, element, attr_value) {
        var expr = parse_expression(attr_value);
        event_on(element, 'keydown', function(e) {
            if(e.keyCode === 13) {
                expr.exec(env);
            }
        });
    }
});

$each(['j-click', 'j-dblclick', 'j-mousedown'], function(d_name) {
    var e_name = d_name.substring(2);
    directive_create(d_name, function() {
        return function(drive_module, directive_module, env, element, attr_value) {
            var expr = parse_expression(attr_value);
            if(e_name==='blur') {
                debugger;
            }
            event_on(element, e_name, function(e) {
                expr.exec(env);
            });
        }
    });
});

$each(['j-blur', 'j-focus'], function(d_name) {
    var e_name = d_name.substring(2);
    directive_create(d_name, function() {
        return function(drive_module, directive_module, env, element, attr_value) {
            var expr = parse_expression(attr_value);
            $on(element, e_name, function(e) {
                expr.exec(env);
            });
        }
    });
});

directive_create('j-change', function() {
    return function(drive_module, directive_module, env, element, attr_value) {
        var expr = parse_expression(attr_value);
        $on(element, 'change', function(e) {
            /*
             * 因为j-model里面也是用的change事件，为了能够让j-model先起作用，延后执行。
             */
            setTimeout(function() {
                expr.exec(env);
            });
        });
    }
});

function j_repeat_env(env, key, jarray, index) {

    env.__.jarray = jarray;
    env.__.index = index;

    var jen = jarray.__.en.children[index];
    if(!jen) {
        jen = jarray.__.en.children[index] = new EmitNode(index, jarray.__.en);
    }
    env.__.emit_tree.children[key] = jen;

    $defineProperty(env, __env_emit_name, {});
    $defineProperty(env, __env_prop_name, {});
    env[__env_prop_name][key] = null;
    env[__env_emit_name][key] = jen;

    $defineGetterSetter(env, key, function() {
        return this.__.jarray[this.__.index];
    }, function(val) {
        this.__.jarray[this.__.index] = val;
    }, false, true);
}

function JRepeat(ele, attr, drive_module, key, env, expr) {
    this.ele = ele;
    this.cmt = document.createComment(ele.outerHTML);
    this.env = env;
    this.expr = expr;
    this.attr = attr;
    this.key = key;
    this.module = drive_module;
    this.frag = null; // document.createDocumentFragment();
    var listener = environment_watch_expression(env, expr, function(change_list, repeater) {
        var c = change_list[0];
        if(c.type !== 'child') {
            log('j-repeat update. todo: use diff strategy');
            repeater.update(change_list[0].cur_value);
        }
    }, this, 10);
    listener.compare = false;

    this.val = listener.cur_value;

    this.items = [];

    $$before(this.cmt, ele);
    $$remove(ele);


    this.render();
}
var __jrepeate_prototype = JRepeat.prototype;
__jrepeate_prototype.update = function(new_value) {
    /*
     * 目前是简单地重新全部更新元素。是一种很低效率的方式。
     * 同时，已经$watch的表达式没有被destroy
     * todo 采用diff的思想，只更新发生变化的元素。
     */
    for(var i=0;i<this.items.length;i++) {
        var it = this.items[i];
        $$remove(it.ele);
        it.env.$destroy();
        it.env = null;
        it.ele = null;
        it.val = null;
    }
    this.items.length = 0;
    this.val = new_value;
    this._get();
    __drive_insert_b.push({
        ele : this.frag,
        pos : this.cmt
    });
    drive_insert_before();
};
__jrepeate_prototype._get = function() {

    function replace_env_listener_var_key(env, org_key, org_reg, dst_key) {
        /*
         * todo 检查<li j-repeat><p j-env><li j-repeat><p j-env></p></li></p></li>这种复杂的嵌套情况，
         *
         */
        var ls = env.__.listeners, k, var_tree, t;
        for(k in ls) {
            var_tree = ls[k].var_tree;
            for(t in var_tree) {
                if(t === org_key) {
                    var_tree[dst_key] = var_tree[t];
                } else if(org_reg.test(t)) {
                    var_tree[t.replace(org_key, dst_key)] = var_tree[t];
                }
            }
        }
        for(var c in env.__.children) {
            replace_env_listener_var_key(env.__.children[c], org_key, dst_key);
        }
    }

    var array = this.val;
    if(!(array instanceof JArray)) {
        throw new Error('only support Array in j-repeat.');
    }
    var r_ele, r_env;
    var frag = document.createDocumentFragment();
    for(var i=0;i<array.length;i++) {
        r_ele = this.ele.cloneNode(true);
        r_env = environment_create_child(this.env, i);
        r_env.$prop = {
            '@index' : i,
            '@item' : array[i],
            '@first' : i===0,
            '@last' : i===array.length-1,
            '@middle' : i!==0 && i!==array.length-1,
            '@key' : i
        };
        j_repeat_env(r_env, this.key, array, i);
        /*
         * 目前是对每一次复制的元素进行render，包括解析directive和view。
         * todo 可以考虑复用directive和view，这样就不需要每次循环都去drive_render_view. destroy之前的元素的已经$watch的表达式。
         */
        drive_render_element(r_ele, this.attr, this.module, r_env);

        replace_env_listener_var_key(r_env, this.key, new RegExp('^'+this.key+'\\.'), array.__.en.children[i].path);
        //log(r_env);

        frag.appendChild(r_ele);
        this.items.push({
            ele : r_ele,
            env : r_env,
            val : array[i]
        });
    }
    this.frag = frag;
};

__jrepeate_prototype.render = function() {
    this._get();
    __drive_insert_b.push({
        ele : this.frag,
        pos : this.cmt
    });
};

function directive_deal_j_repeat(ele, attr, drive_module, env) {
    var item = attr.removeNamedItem('j-repeat'),
        expr_str = item.value;

    var expr = parse_expression(expr_str, true);
    if(expr.type !== 'in') {
        throw 'j-repeat format wrong!';
    }

    new JRepeat(ele, attr, drive_module, expr.nodes[0], env, expr.nodes[1]);
}

(function() {

    function apply_show_hide(ele, show) {
        ele.style.setProperty('display', show ? '' : 'none', '');
    }

    function directive_show_hide(drive_module, directive_module, env, element, attr_value, show) {
        var expr = parse_expression(attr_value);



        var listener = environment_watch_expression(env, expr, (show ? function(change_list, data) {
            apply_show_hide(data.ele, change_list[0].cur_value ? true : false);
        } : function(change_list, data) {
            apply_show_hide(data.ele, change_list[0].cur_value ? false : true);
        }), {
            ele : element
        }, 10);

        var val = listener.cur_value,
            is_show = show ? (val ? true : false) : (val ? false : true);

        apply_show_hide(element, is_show);


    }

    directive_create('j-show', function() {
        return function(drive_module, directive_module, env, element, attr_value) {
            directive_show_hide(drive_module, directive_module, env, element, attr_value, true);
        }
    });

    directive_create('j-hide', function() {
        return function(drive_module, directive_module, env, element, attr_value) {
            directive_show_hide(drive_module, directive_module, env, element, attr_value, false);
        }
    })
})();

/**
 * j-style可以使用两种方式。
 *   一种是使用嵌入表达式，
 *   比如<div j-style="background: {{bg-color}}; font-size:{{size}}"></div>。
 *   一种是使用完整表达式，
 *   比如<div j-style="st"></div>，其中st是在environment里定义的变量，可以是字符串也可以是json
 */
directive_create('j-style', function() {
    var pE = document.createElement('div');
    var pF = ['-webkit-', '-moz-', '-ms-'];
    var cF = ['Webkit', 'Moz', 'ms'];
    var imRegex = /!important;?$/;
    function prefix(key) {
        var camel = key.replace(/[-_](\w)/g, function(_, f) {
            return f.toUpperCase();
        });
        if (camel in pE.style) {
            return key;
        }
        var upper = camel.charAt(0).toUpperCase() + camel.slice(1);

        var i = cF.length;
        var prefixed;
        while (i--) {
            prefixed = cF[i] + upper;
            if (prefixed in pE.style) {
                return pF[i] + key;
            }
        }

        return false;
    }

    function apply_style(ele, style_value) {
        var s_key, c_key, c_val, im;
        if($isObject(style_value)) {
            for(s_key in style_value) {
                c_key = prefix(s_key);
                if(!c_key) {
                    return;
                }
                c_val = style_value[s_key];
                im = imRegex.test(c_val);
                if(im) {
                    c_val = c_val.replace(imRegex, '');
                    ele.style.setProperty(c_key, c_val, 'important');
                } else {
                    ele.style.setProperty(c_key, c_val, '');
                }
            }
        } else if($isArray(style_value)) {
            ele.style = style_value.join(';');
        } else {
            ele.style = style_value;
        }
    }
    return function(drive_module, directive_module, env, element, attr_value) {
        var expr = drive_get_view_expr(attr_value);
        if(expr === null) {
            expr = parse_expression(attr_value, true);
        }


        var listener = environment_watch_expression(env, expr, function(change_list, data) {
            apply_style(data.ele, change_list[0].cur_value);
        }, {
            ele : element
        }, 10);

        apply_style(element, listener.cur_value);

    }
});

function GrammarNode(type, child_nodes) {
    this.type = type;
    this.nodes = child_nodes ? child_nodes : [];
    this.parent = null;
    for(var i=0;i<this.nodes.length;i++) {
        //try{
            this.nodes[i].parent = this;
        //} catch(e){
        //    debugger;
        //}
    }
    /*
     * 以下成员用来对表达式的值进行缓存。
     * need_cached如果为false，则不缓存。用于 j-click 等情况。
     * need_cached如果为true，则缓存，用于{{expr}}等情况。
     */
    this.value = null;
    this.cached = false;
    this.need_cached = true;
}
GrammarNode.prototype = {
    increment : function(scope, is_add, is_prefix) {
        return this.exec(scope);
    },
    _exec : function(scope) {
        return this.nodes[0].exec(scope);
    },
    exec : function(scope) {
        if(!this.need_cached) {
            return this._exec(scope);
        } else {
            var val;
            if(this.cached) {
                val = this.value;
            } else {
                val = this._exec(scope);
                this.value = val;
                this.cached = true;
            }
            return val;
        }
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

function parse_inherit_node(node, do_exec_func, other_proto) {
    node.prototype._exec = do_exec_func;
    if(other_proto) {
        $extend(node.prototype, other_proto);
    }
    $inherit(node, GrammarNode);
}

var __parse_node_stack = [];
var __parse_op_stack = [];
var __parse_is_pre_token_var = false;
var __parse_in_node = null;
var __parse_node_need_cache = true;

/*
 * 运算符优先级。第一个数字是优先级，第二个数字表示是从左到右还是从右到左。
 */
var __parse_op_priority = {

    'A' : [400, 0], //Array的构造函数，优先级最高
    '.' : [200, 0],
    '[]' : [200, 0],
    'F' : [300, 0], //用字符F表示函数调用。


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

    ',' : [-20, 0], //多个元素分隔（包括函数调用参数列表）优先级

    '(' : [-1000, 0] //括号并算是严格的运算符。


};

/**
 * 以下代码生成语法树。
 */

function parse_expression(expr_str, node_need_cache) {
    __parse_is_pre_token_var = false;
    __parse_in_node = null;
    __parse_node_need_cache = node_need_cache ? true : false;
    parse_token_init(expr_str);

    //try {
        parse_expr();
        parse_reduce_op();
    //} catch(ex) {
    //    console.log(ex.message);
    //    console.log(ex.stack);
    //}



    var root_node;
    if(__parse_node_stack.length === 0) {
        root_node =  new EmptyGrammarNode();
    } else if(__parse_node_stack.length === 1) {
        root_node = __parse_node_stack[0];
    } else {
        root_node = new GrammarNode('root', $copyArray(__parse_node_stack));
        root_node.need_cached = __parse_node_need_cache;
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
            if(__parse_is_pre_token_var) {
                parse_check_op('F');
                __parse_op_stack.push('A');
                parse_push_node(new EmptyGrammarNode());
            }
            __parse_op_stack.push('(');
            break;
        case '[':
            if(__parse_is_pre_token_var) {
                /*
                 * 中括号相当于 .() ，也就是先运算括号内，再取Property
                 */
                parse_check_op('[]');
                __parse_op_stack.push('(');
            } else {
                /*
                 * 中括号是数组
                 */
                __parse_op_stack.push('A');
                parse_push_node(new EmptyGrammarNode());

                __parse_op_stack.push('(');
            }
            break;
        case ')':
        case ']':
            parse_reduce_op('(');
            break;
        case '+':
        case '-':
        case '++':
        case '--':
            parse_check_op(__parse_is_pre_token_var ? '#' + op : op + '#');
            break;
        default :
            parse_check_op(op);
            break;
    }
    __parse_is_pre_token_var = (op === ')' || op === ']');
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

    parse_token_lex();

    while(!__parse_token_EOF) {
        //log(__parse_token_type, __parse_token_value);

        switch (__parse_token_type) {
            case 'var':
                switch(__parse_token_value) {
                    case 'true':
                    case 'false':
                        parse_push_node(new ConstantGrammarNode(__parse_token_value === 'true'));
                        __parse_is_pre_token_var = true;
                        break;
                    case 'in':
                        if(__parse_op_stack.length !== 0
                            || __parse_node_stack.length !== 1
                            || __parse_node_stack[0].type !== 'variable'
                            || __parse_in_node !== null) {
                            throw 'grammar wrong: in';
                        }
                        __parse_in_node = __parse_node_stack.pop().var_name;
                        __parse_is_pre_token_var = false;
                        break;
                    default:
                        parse_push_node(new VariableGrammarNode(__parse_token_value));
                        __parse_is_pre_token_var = true;
                        break;
                }
                break;
            case 'num':
                parse_push_node(new ConstantGrammarNode(Number(__parse_token_value)));
                __parse_is_pre_token_var = true;
                break;
            case 'str':
                parse_push_node(new ConstantGrammarNode(__parse_token_value.substring(1, __parse_token_value.length-1)));
                __parse_is_pre_token_var = true;
                break;
            case 'op':
                parse_meet_op(__parse_token_value);
                break;
            default :
                break;
        }

        parse_token_lex();

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
}

function parse_deal_op_F() {
    var node_b = parse_pop_node();
    var node_a = parse_pop_node();
    var ctx = parse_op_last() === '.';
    if(node_b.type === 'array') {
        var cont = true;
        for(var i=0;i<node_b.nodes.length;i++) {
            if(!parse_is_constant(node_b.nodes[i])) {
                cont = false;
                break;
            }
        }
        if(cont) {
            //如果参数列表全部是常数，则转成常数Node
            node_b = new ConstantGrammarNode(node_b._exec());
        }
    } else if(!parse_is_constant(node_b)) {
        throw 'parse_deal_op_F: something strange wrong.'
    }

    if(ctx && node_a.type === 'variable') {
        node_a = new ConstantGrammarNode(node_a.var_name);
    }
    var tmp = new FunctionCallGrammarNode(null, node_a, node_b);
    /*
     * tmp.nodes是函数调用的三个部分：
     *    nodes[0]是调用上下文，caller
     *    nodes[1]是函数名，callee
     *    nodes[2]是函数调用参数，arguments
     */
    if(ctx) {
        __parse_op_stack.pop();
        node_b = parse_pop_node();
        if(parse_is_constant(node_b) && parse_is_constant(tmp.nodes[1]) && parse_is_constant(tmp.nodes[2])) {
            //诸如 '[1,2,3,4,5,6].slice(2,5).join("")'这样可以直接计算的函数调用，则直接计算。
            tmp = new ConstantGrammarNode(node_b.value[tmp.nodes[1].value].apply(node_b.value, tmp.nodes[2].value));
        } else {
            tmp.nodes[0] = node_b;
            node_b.parent = tmp;
        }
    }
    parse_push_node(tmp);
}

function parse_deal_op(op) {
    var node_a, node_b, tmp;
    switch (op) {
        case 'F':
            parse_deal_op_F();
            break;
        case 'A':
            node_a = parse_pop_node();
            tmp = new ArrayGrammarNode([]);
            node_b = true;
            while(node_a.type !== 'empty') {
                tmp.nodes.unshift(node_a);
                node_a.parent = tmp;
                if(!parse_is_constant(node_a)) {
                    node_b = false;
                }
                node_a = parse_pop_node();
            }
            if(node_b) {
                //如果所有元素都是常数，则优化成ConstantGrammarNode。
                tmp = new ConstantGrammarNode(tmp._exec());
            }
            parse_push_node(tmp);
            break;
        case ',':
            //node_b = parse_pop_node();
            //node_a = parse_pop_node();
            //if(node_a.type === 'array') {
            //    tmp = node_a;
            //} else {
            //    tmp = new ArrayGrammarNode(node_a);
            //}
            //tmp.concat(node_b);
            //parse_push_node(tmp);
            //元素分隔不作任何处理。
            break;
        case '[]' :
            node_b = parse_pop_node();
            node_a = parse_pop_node();
            //node_b = node_b.type==='variable' ? new ConstantGrammarNode(node_b.var_name) : node_b;
            if(parse_is_constant(node_a) && parse_is_constant(node_b)) {
                tmp = new ConstantGrammarNode(node_a.value[node_b.value]);
            } else {
                tmp = new PropertyGrammarNode(node_a, node_b);
            }
            parse_push_node(tmp);
            break;
        case '.':
            node_b = parse_pop_node();
            node_a = parse_pop_node();
            node_b = node_b.type==='variable' ? new ConstantGrammarNode(node_b.var_name) : node_b;
            if(parse_is_constant(node_a) && parse_is_constant(node_b)) {
                tmp = new ConstantGrammarNode(node_a.value[node_b.value]);
            } else {
                tmp = new PropertyGrammarNode(node_a, node_b);
            }
            parse_push_node(tmp);
            break;
        case '?' :
        case ':' :
            node_b = parse_pop_node();
            node_a = parse_pop_node();
            parse_push_node(new ConditionGrammarNode(op, node_a, node_b));
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
            tmp = new CalcGrammarNode(op, node_a);
            if(parse_is_constant(node_a)) {
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
            if(parse_is_constant(node_a) && parse_is_constant(node_b)) {
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
    node.need_cached = __parse_node_need_cache;
    __parse_node_stack.push(node);
}

function parse_is_constant(node) {
    return node.type === 'constant';
}

function ArrayGrammarNode(args_node) {
    this.base('array', $isArray(args_node) ? args_node : [args_node]);
}
parse_inherit_node(ArrayGrammarNode, function(env) {
    var array = [];
    for(var i=0;i<this.nodes.length;i++) {
        array.push(this.nodes[i].exec(env));
    }
    return array;
}, {
    concat : function(expr_node, left) {
        var nodes = expr_node.type === 'array' ? expr_node.nodes : [expr_node];
        if(left) {
            [].unshift.apply(this.nodes, nodes);
        } else {
            [].push.apply(this.nodes, nodes);
        }
    }
});

function CalcGrammarNode(operator, left_node, right_node) {
    this.base('calc', right_node? [left_node, right_node] : [left_node]);
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
parse_inherit_node(ConditionGrammarNode, function(env) {
    var ns = this.nodes;
    return ns[0].exec(env) ? ns[1].exec(env) : ns[2].exec(env);
});

function ConstantGrammarNode(value) {
    this.base('constant', []);
    this.value = value;
    this.cached = true;
}
parse_inherit_node(ConstantGrammarNode, function() {
    return this.value;
}, {
    exec : function() {
        return this.value;
    },
    increment : function(scope, is_add, is_prefix) {
        return this.value +(is_add? 1:0);
    }
});

function EmptyGrammarNode() {
    this.base('empty');
}
parse_inherit_node(EmptyGrammarNode, function() {
    return null;
});

function FunctionCallGrammarNode(context, func_node, argv_node) {
    this.base('function', [context ? context : new EmptyGrammarNode(), func_node, argv_node]);
}
parse_inherit_node(FunctionCallGrammarNode, function(env) {
    var fn = this.nodes[1].exec(env), func, ctx;
    if(this.nodes[0].type === 'empty') {
        func = fn;
        ctx = env;
    } else {
        ctx = this.nodes[0].exec(env);
        func = ctx[fn];
    }
    if(!$isFunction(func)) {
        return;
    }
    var args = this.nodes[2].exec(env);
    return func.apply(ctx, args);
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
    this.base('property', [var_node, prop_node]);
}
parse_inherit_node(PropertyGrammarNode, function(scope) {
    var variable = this.nodes[0].exec(scope),
        prop_name = this.nodes[1].exec(scope);
    return !variable ? null : variable[prop_name];
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
parse_inherit_node(SetGrammarNode, function(env) {
    var r = this.nodes[1].exec(env),
        l = this.nodes[0].exec(env);
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

    this.nodes[0].set(env, val);
    return val;
});

function VariableGrammarNode(var_name) {
    this.base('variable', []);
    this.var_name = var_name;
}
parse_inherit_node(VariableGrammarNode, function(env) {
    return env.$get(this.var_name);
}, {
    increment : function(env, is_add, is_prefix) {
        var val = this.exec(env),
            new_val = val + (is_add ? 1 : -1);
        env.$set(this.var_name, new_val);
        return is_prefix ?  new_val : val;
    },
    set : function(env, value) {
        env.$set(this.var_name, value);
    }
});

var __parse_token_type = '';
var __parse_token_value = '';
var __parse_token_EOF = false;
var __parse_token_src = '';

var __parse_token_regex = new RegExp(
        //加减乘除，包括单目和双目预算以及赋值运算, +, ++, +=, -, --, -=, *, *=, /, /=, %, %=
        "(?:\\+(?:\\+?)(?:=?))|(?:\\-(?:\\-?)(?:=?))|(?:\\*(?:=?))|(?:\\/(?:=?))|(?:%(?:=?))"
        //逻辑运算, !, !=, !==, ~, ~=, &, &&, &=, |, ||, |=, ^, ^=
        + "|(?:\\!(?:={0,2}))|(?:~(?:=?))|(?:&(?:&|=)?)|(?:\\|(?:\\||=)?)|(?:\\^(?:=?))"
        //比较运算和逻辑运算，包括>, >>, >>>, >=, >>=, >>>=, <, <<, <=, <<=
        + "|(?:>(?:>{0,2})(?:=?))|(?:<(?:<?)(?:=?))"
        //等号，包括=, ==, ===
        + "|(?:=(?:={0,2}))"
        //括号和点号
        + "|\\(|\\)|\\[|\\]|\\{|\\}|\\.|\\?|\\:|;|,"
        //字符串
        + "|(?:\"[^\"]*\")|(?:'[^']*')"
        //数字
        + "|(?:\\d+(?:\\.\\d+)?)"
        //变量
        + "|(?:[a-zA-Z$_][a-zA-Z0-9$_]*)"
    , "g");

function parse_token_lex() {
    if (__parse_token_EOF) {
        return;
    }
    var token = __parse_token_regex.exec(__parse_token_src);
    if(!token) {
        __parse_token_EOF = true;
        return;
    }

    __parse_token_value = token[0];
    var fc = __parse_token_value.charCodeAt(0);

    if(fc === 39 || fc === 34) {
        __parse_token_type = 'str';
    } else if(fc>=48 && fc<=57) {
        __parse_token_type = 'num';
    } else if((fc>=97 && fc<=122) || (fc>=65 && fc<=90) || fc===36 || fc===95) {
        __parse_token_type = 'var';
    } else {
        __parse_token_type = 'op';
    }
}

function parse_token_init(src) {
    __parse_token_src = src;
    __parse_token_regex.exec(''); //clear state
    __parse_token_EOF = false;
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

    var et, handler, jid, i;
    var table = __event_table.on;
    if(!$hasProperty(table, event_name)) {
        return;
    }
    et = table[event_name];

    event_bind_stop(event);


    while(!event_is_stop(event) && event_ele) {
        jid = event_ele.id;
        if(jid && $hasProperty(et, jid)) {
            handler = et[jid];
            for(i=0;i<handler.length;i++) {
                handler[i].call(event_ele, event);
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
    var handler_list;
    if(!$hasProperty(et, jid)) {
        handler_list = et[jid] = [];
    } else {
        handler_list = et[jid];
    }
    handler_list.push(handler);
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


var __drive_insert_b = [];

function drive_insert_before() {
    $each(__drive_insert_b, function(it) {
        it.pos.parentNode.insertBefore(it.ele, it.pos);
    });
    __drive_insert_b.length = 0;
}

function drive_run_directive(element, drive_module, directive, env, val) {
    directive_initialize(directive);
    var link_func = directive.link_func;
    link_func(drive_module, directive.module, env, element, val, directive.name);
}

function drive_render_element(ele, attr, drive_module, env) {
    var i, item, directive, cur_env = env;


    item = attr.getNamedItem('j-async-env');
    if(item !== null) {
        directive_deal_j_async_env(ele, attr, drive_module, cur_env);
        /*
         * 由于j-async-env是异步加载的Environment，因此直接返回，等待加载。
         */
        return;
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
            drive_run_directive(ele, drive_module, directive, cur_env, item.value);
        }
    }

    item = attr.getNamedItem('j-env');
    if(item !== null) {
        cur_env = env.$child(item.value);
        directive_deal_j_env(ele, attr, drive_module, cur_env);
    }

    /*
     * 使用递归的方式遍历DOM树。目前来看性能是可以保障的。
     */
    var chs = ele.childNodes;
    for(i=0;i<chs.length;i++) {
        var ce = chs[i];
        //if(ele.nodeName==='UL' && ce.nodeType === 1) {
        //    log(ce);
        //}
        drive_parse_element(ce, drive_module, cur_env);
    }

}

function drive_parse_element(ele, drive_module, env) {
    /*
     * check nodeType. see https://developer.mozilla.org/zh-CN/docs/Web/API/Node.nodeType
     */
    switch (ele.nodeType) {
        case 1:
            // Element
            drive_render_element(ele, ele.attributes, drive_module, env);
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


var __drive_view_expr_REG = /\{\{(.+?)\}\}/g;

function drive_get_view_expr(txt) {
    var piece_start = 0;
    var piece_array = [];
    var piece;

    while ((piece = __drive_view_expr_REG.exec(txt)) !== null) {
        if (piece.index > piece_start) {
            piece_array.push(new ConstantGrammarNode(txt.substring(piece_start, piece.index)));
        }
        piece_start = piece.index + piece[0].length;
        piece_array.push(parse_expression(piece[1], true));
    }

    if (piece_array.length === 0) {
        return null;
    } else {
        if(piece_start < txt.length) {
            piece_array.push(new ConstantGrammarNode(txt.substring(piece_start)));
        }
        if (piece_array.length === 1) {
            return piece_array[0];
        }
    }

    var ea = piece_array[0], eb;
    /*
     * 当前的处理方式，是把内容转成相加的表达式，
     *   比如<p>hello {{name}}</p>会转成  "Hello" + name。
     *   这样会存在一个小问题，比如<p>{{age}}{{year}}</p>
     *   转成  age + year，如果age和year都是数字，就会被以数学的方式加起来。
     *   为了简单起见，采取的解决方法是，在最左边添加一个空字符串，
     *   这样相加的时候会从左往右计算，javascript会以字符串形式链接 '' + age + year
     */
    if (ea.type !== 'constant' || !$isString(ea.value)) {
        piece_array.unshift(new ConstantGrammarNode(''));
        ea = piece_array[0];
    }

    for (var i = 1; i < piece_array.length; i++) {
        eb = piece_array[i];
        if (ea.type === 'constant' && eb.type === 'constant') {
            ea = new ConstantGrammarNode(ea.value + eb.value);
        } else {
            ea = new CalcGrammarNode("#+", ea, eb);
        }
    }

    return ea;
}

function drive_render_view(ele, env) {
    var txt = ele.textContent;

    var expr = drive_get_view_expr(txt);

    if (expr === null) {
        return;
    } else if (expr.type === 'constant') {
        ele.textContent = expr.value;
        return;
    }

    var listener = environment_watch_expression(env, expr, drive_view_observer, {
        ele: ele
    }, 10);

    ele.textContent = listener.cur_value;
}

function drive_view_observer(change_list, data) {
    data.ele.textContent = change_list[0].cur_value;
}


jing = {};


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

jing.ready = $ready;

jing.env = module_get_root_env;

jing.JSONStringify = $JSONStringify;
jing.JSONParse = $JSONParse;
jing.each = $each;
jing.map = $map;
jing.filter = $filter;
jing.defineProperty = $defineProperty;
jing.defineGetterSetter = $defineGetterSetter;


})();