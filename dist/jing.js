(function(){
__jing_config = {
  debug: false
};

function $config(options) {
  $merge(__jing_config, options);
}

function $inherit(inheritClass, baseClass) {
  if (typeof inheritClass === 'undefined' || typeof baseClass === 'undefined') {
    console.trace();
    throw "inherit error!";
  }
  //首先把父类的prototype中的函数继承到子类中
  for (var pFunc in baseClass.prototype) {
    var sp = inheritClass.prototype[pFunc];
    //如果子类中没有这个函数，添加
    if (typeof sp === 'undefined') {
      inheritClass.prototype[pFunc] = baseClass.prototype[pFunc];
    }
    //如果子类已经有这个函数，则忽略。以后可使用下面的callBase函数调用父类的方法

  }
  //保存继承树，当有多级继承时要借住继承树对父类进行访问
  inheritClass.__base_objects__ = [];
  inheritClass.__base_objects__.push(baseClass);

  if (typeof baseClass.__base_objects__ !== 'undefined') {
    for (var i = 0; i < baseClass.__base_objects__.length; i++)
      inheritClass.__base_objects__.push(baseClass.__base_objects__[i]);
  }

  /**
   * 执行父类构造函数，相当于java中的this.super()
   * 不使用super是因为super是ECMAScript保留关键字.
   * @param {arguments} args 参数，可以不提供
   */
  inheritClass.prototype.base = function (args) {

    var baseClass = null, rtn = undefined;
    if (typeof this.__inherit_base_deep__ === 'undefined') {
      this.__inherit_base_deep__ = 0;
    } else {
      this.__inherit_base_deep__++;
    }

    baseClass = inheritClass.__base_objects__[this.__inherit_base_deep__];

    if (typeof args === "undefined" || args == null) {
      rtn = baseClass.call(this);
    } else if (args instanceof Array === true) {
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
  inheritClass.prototype.callBase = function (method, args) {

    var baseClass = null, rtn = undefined;

    if (typeof this.__inherit_deep__ === 'undefined') {
      this.__inherit_deep__ = 0;

    } else {
      this.__inherit_deep__++;
      //$.dprint("d+:"+this.__inherit_deep__);
    }

    //$.dprint(this.__inherit_deep__);
    baseClass = inheritClass.__base_objects__[this.__inherit_deep__];

    var med = baseClass.prototype[method];
    if (typeof med === 'function') {
      if (typeof args === "undefined" || args === null) {
        rtn = med.call(this);
      } else if (args instanceof Array === true) {
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
  for (var kn in src) {
    dst[kn] = src[kn];
  }
}
function $bind(instance, func) {
  return function () {
    func.apply(instance, arguments);
  };
}

function $defineProperty(obj, prop, value, writable, enumerable) {
  //debug模式下enumerable都为true，方便调试。
  Object.defineProperty(obj, prop, {
      value : value,
      writable : writable ? true : false,
      enumerable : __jing_config.debug ? true : (enumerable ? true : false)
  });
}
function $hasProperty(obj, prop) {
  return obj.hasOwnProperty(prop);
}

function $defineGetterSetter(obj, prop, getter, setter, configurable, enumerable) {
  var desc = {
    configurable: configurable ? true : false,
    enumerable: enumerable ? true : false
  };
  if (getter) {
    desc['get'] = getter;
  }
  if (setter) {
    desc['set'] = setter;
  }
  Object.defineProperty(obj, prop, desc);
}


function $timeout(func, time) {
  setTimeout(func, time);
}
function log() {
  console.log.apply(console, arguments);
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
  if (!condition) {
    if (__jing_config.debug) {
      debugger;
      console.trace();
    }
    throw '$assert failure!';
  }
}


function $JSONStringify(obj, replacer, number) {

  function get_origin_obj(obj) {
    var rtn_obj = obj;
    var i, k, tmp;
    if ($isJArray(obj) || $isArray(obj)) {
      rtn_obj = [];
      tmp = $isArray(obj) ? obj : obj[__ENV_INNER__].arr;
      for (i = 0; i < tmp.length; i++) {
        rtn_obj.push(get_origin_obj(tmp[i]));
      }
    } else if ($isObject(obj)) {
      rtn_obj = {};
      for (k in obj) {
        if (k !== __ENV_EMIT__ && k !== __ENV_INNER__) {
          rtn_obj[k] = get_origin_obj(obj[k]);
        }
      }
    }

    return rtn_obj;
  }

  function get_obj(obj) {
    if ($isJArray(obj)) {
      obj = obj[__ENV_INNER__].arr;
    }
    if ($isArray(obj)) {
      for (var i = 0; i < obj.length; i++) {
        obj[i] = get_obj(obj[i]);
      }
    } else if ($isObject(obj)) {
      for (var k in obj) {
        obj[k] = get_obj(obj[k]);
      }
    }
    return obj;
  }

  obj = __jing_config.debug ? get_origin_obj(obj) : get_obj(obj);

  return __origin_stringify(obj, replacer, number);

}
//替换掉原来的stringify
var __origin_stringify = JSON.stringify;
JSON.stringify = $JSONStringify;

function $JSONParse(str) {
  return JSON.parse(str);
}

function $ajax(options) {
  var ops = $merge(options, {
    method: 'get',
    type: 'json',
    data: {}
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
        if(func(arr[i], i)===false) {
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
    return arr.slice();
}
function $setArray(dst_arr, src_arr) {
    for(var i=0;i<src_arr.length;i++) {
        dst_arr[i] = src_arr[i];
    }
}

function $$swap(ele1, ele2) {
    var p1 = ele1.parentNode, left, s_ele;
    if(p1 !== ele2.parentNode) {
        return;
    }
    s_ele = ele2.previousElementSibling;
    if(!s_ele) {
        s_ele = ele2.nextElementSibling;
        left = false;
    } else {
        left = true;
    }
    p1.insertBefore(ele2, ele1);
    if(s_ele === ele1) {
        return;
    }
    if(left) {
        p1.insertBefore(ele1, s_ele);
    } else {
        p1.appendChild(ele1);
    }

}

function $on(ele, event_name, event_handler) {
    ele.addEventListener(event_name, event_handler);
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


function $$id(id) {
    return document.getElementById(id);
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

function $removeAttr(ele, attr_name) {
    ele.removeAttribute(attr_name);
}

function $isEmit(obj) {
    return obj instanceof EmitNode;
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

function $isEnv(obj) {
    return obj instanceof Environment;
}

function $isArray(obj) {
    return Array.isArray(obj); // obj instanceof Array; which one is better?
}
function $isJArray(obj) {
    return obj instanceof JArray;
}



var __util_global_id = 0;

function $uid() {
    return (__util_global_id++).toString(36);
}

var __ENV_INNER__ = '__$jing0210$__';

var __env_Empty = {
  $find: function () {
    return null;
  },
  $get: function () {
    return undefined;
  },
  $has: function () {
    return false;
  },
  $set: function () {

  },
  $parent: function () {
    return null;
  }
};

function Environment(name, parent) {
  $defineProperty(this, __ENV_INNER__, {
    prop: $bind(this, environment_reg_props),

    listeners: {},
    id: $uid(),
    name: name,
    children: {},
    parent: parent ? parent : __env_Empty

  });

  $defineProperty(this, __ENV_EMIT__, {});
}

var __env_prototype = Environment.prototype;
$defineGetterSetter(__env_prototype, '$id', function () {
  return this[__ENV_INNER__].id;
});
$defineGetterSetter(__env_prototype, '$name', function () {
  return this[__ENV_INNER__].name;
});
$defineGetterSetter(__env_prototype, '$children', function () {
  return this[__ENV_INNER__].children;
});

$defineProperty(__env_prototype, '$parse', function (expression_string) {
  return parse_expression(expression_string);
});
$defineGetterSetter(__env_prototype, '$root', function () {
  return this[__ENV_INNER__].parent === __env_Empty ? this : this[__ENV_INNER__].parent.$root;
});


$defineProperty(__env_prototype, '$destroy', function () {

  var inner_p = this[__ENV_INNER__], k, cd = inner_p.children;
  for (k in cd) {
    cd[k].$destroy();
    cd[k] = null;
  }
  inner_p.children = null;
  inner_p.parent = null;

  var props = this[__ENV_EMIT__];
  for (var v in props) {
    var emit_map = props[v];
    var val = this[v];

    for (var eid in emit_map) {
      var item = emit_map[eid];
      if ($isObject(val)) {
        environment_deep_rm_emitter(val, item.emitter);
      }
      emit_map[eid] = null;
    }

    props[v] = null;
  }

  for (var l in inner_p.listeners) {
    environment_unwatch_listener(inner_p.listeners[l]);
  }

});

$defineProperty(__env_prototype, '$child', function (name) {
  var cd = this[__ENV_INNER__].children;
  var cs = new Environment(name, this);
  cd[cs.$id] = cs;
  return cs;
});
$defineProperty(__env_prototype, '$parent', function (name) {
  var ip = this[__ENV_INNER__];
  if (ip.parent === __env_Empty) {
    return null;
  }
  if ($isUndefined(name)) {
    return ip.parent;
  } else {
    return ip.parent.name === name ? ip.parent : ip.parent.$parent(name);
  }
});
$defineProperty(__env_prototype, '$require', function (name) {
  var parent = this.$parent(name);
  if (!parent) {
    throw new Error('Environment ' + name + ' not found.');
  } else {
    return parent;
  }
});

/*
 * 取得变量名对应的值，会循环检索父亲env
 */
$defineProperty(__env_prototype, '$get', function (var_name) {
  if ($hasProperty(this, var_name)) {
    return this[var_name];
  } else {
    $assert(this[__ENV_INNER__].parent);
    return this[__ENV_INNER__].parent.$get(var_name);
  }
});
/*
 * 检测是否存在变量名对应的值，会循环检索父亲env
 */
$defineProperty(__env_prototype, '$has', function (var_name) {
  if ($hasProperty(this, var_name)) {
    return true;
  } else {
    return this[__ENV_INNER__].parent.$has(var_name);
  }
});

/*
 * 取得变量名所在的env，会循环检索父亲env
 */
$defineProperty(__env_prototype, '$find', function (var_name) {
  if ($hasProperty(this, var_name)) {
    return this;
  } else {
    return this[__ENV_INNER__].parent.$find(var_name);
  }
});
/*
 * 设置变量名对应的值，会循环检索父亲env。
 */
$defineProperty(__env_prototype, '$set', function (var_name, value) {
  if ($hasProperty(this, var_name)) {
    this[var_name] = value;
  } else {
    this[__ENV_INNER__].parent.$set(var_name, value);
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
$defineGetterSetter(__env_prototype, '$prop', function () {
  return this[__ENV_INNER__].prop;
}, function () {
  environment_reg_props.apply(this, arguments);
});
//
//$defineProperty(__env_prototype, '$bind', function() {
//    return this.__.bind;
//}, function() {
//    environment_reg_binds.apply(this, arguments);
//});

function environment_reg_props(name, value) {
  if ($isObject(name)) {
    for (var kn in name) {
      this[kn] = name[kn];
    }
  } else {
    this[name] = value;
  }
}
//
//function environment_reg_binds(name, var_str) {
//
//    function reg_bind(name, var_name) {
//        if($hasProperty(this, name)) {
//            throw new Error('variable' + name + ' has been registered');
//        }
//        var var_array = environment_split_var(var_name);
//        var env = this.$find(var_array[0]);
//        if(!env || env === this) {
//            throw new Error('variable ' + var_array[0] + ' not found in $bind');
//        }
//        /*
//         * 构建emit_tree
//         */
//        var listener = new ImmListener();
//        environment_watch_items(env, var_array[0], listener, false);
//        environment_unwatch_listener(listener);
//        /*
//         *
//         */
//        var e_node = env.__.emit_tree;
//        for(var i=0;i<var_array.length;i++) {
//            e_node = e_node.children[var_array[i]];
//        }
//
//        $defineGetterSetter(this, name, function() {
//            var p = env[var_array[0]];
//            for(var i=1;i<var_array.length;i++) {
//                p = p[var_array[i]];
//            }
//            return p;
//        }, function(val) {
//            var p = env, v = var_array[0];
//            for(var i=0;i<var_array.length-1;i++) {
//                p = p[var_array[i]];
//                v = var_array[i+1];
//            }
//            p[v] = val;
//        });
//
//        var new_e_node = new EmitNode(name, this.__.emit_tree);
//        new_e_node.L_emitter = e_node.L_emitter;
//        new_e_node.I_emitter = e_node.I_emitter;
//
//        this.__.emit_tree.children[name] = new_e_node;
//        this[__env_emit_name][name] = new_e_node;
//
//
//    }
//
//    if($isObject(name)) {
//        for(var kn in name) {
//            reg_bind.call(this, kn, name[kn]);
//        }
//    } else {
//        reg_bind.call(this, name, var_str);
//    }
//}

function environment_create_child(env, c_name) {
  var cd = env[__ENV_INNER__].children;
  var cs = new Environment(c_name, env);
  cd[c_name] = cs;
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

function environment_remove_listeners(env) {
  var ls = env[__ENV_INNER__].listeners, k;
  for (k in ls) {
    environment_unwatch_listener(ls[k]);
    delete ls[k];
  }
  for (k in env[__ENV_INNER__].children) {
    environment_remove_listeners(env[__ENV_INNER__].children[k]);
  }
}



function Emitter(env, route, handler, is_deep, data) {
  this.id = $uid();
  this.route = route;
  this.path = route.join('.');
  this.env = env;
  this.deep = is_deep;
  this.array = false;
  this.handler = handler;
  this.tm = null;
  this.deal = $bind(this, this._deal);
  this.data = data;
  this.destroied = false;
  /*
   * current_value
   * previous_value
   */
  this.cv = null;
  this.pv = null;
}
Emitter.prototype = {
  _init : function () {
    this.cv = this.pv = this._val();
  },
  _val: function () {
    var r = this.route;
    var v = this.env.$get(r[0]);
    for (var i = 1, len = r.length; i < len; i++) {
      if ($isObject(v)) {
        v = v[r[i]];
      } else {
        return undefined;
      }
    }
    return v;
  },
  _deal: function () {
    this.cv = this._val();
    if (!this.deep && !this.array && this.cv === this.pv) {
      return;
    }
    if ($isFunction(this.handler)) {
      this.handler(this.cv, this.pv, this.data);
    } else {
      this.handler.notify(this.cv, this.pv, this.path);
    }
    this.pv = this.cv;
  },
  notify: function () {
    if (this.id === '13') {
      debugger;
    }
    this._ctm();
    this.tm = setTimeout(this.deal, 0);
  },
  _ctm: function () {
    if (this.tm !== null) {
      clearTimeout(this.tm);
      this.tm = null;
    }
  },
  destroy: function () {
    if (this.destroied) {
      return;
    }
    this.destroied = true;
    this._ctm();
    this.handler = null;
    this.pv = null;
    this.cv = null;
    environment_walk_add_or_delete_emitter(this, 0, this.route, this.env, false);
    this.env = null;
  }
};


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

function jarray_define_prop(jarray, idx) {
  $defineGetterSetter(jarray, idx, function () {
    return this[__ENV_INNER__].arr[idx];
  }, function (val) {
    this[__ENV_INNER__].arr[idx] = val;
  }, true, true);
}

function jarray_up_bound(jarray) {
  var arr = jarray[__ENV_INNER__].arr;
  var up = jarray[__ENV_INNER__].up;
  var ets = jarray[__ENV_INNER__].ets;
  var props = jarray[__ENV_EMIT__];
  var has_deep = false;
  for (var k in ets) {
    has_deep = true;
    break;
  }
  for (var i = arr.length - 1; i >= up; i--) {
    if (props && has_deep && !$hasProperty(props, i)) {
      var em = props[i] = {};
      for(var eid in ets) {
        em[eid] = {
          index: __ENV_DEEP__,
          emitter: ets[eid]
        };
      }
    }
    environment_define_arr_prop(jarray, i);
  }

  jarray[__ENV_INNER__].up = arr.length;
}

function jarray_emit_map(jarray, emit_map, is_add) {
  //var ets = jarray[__ENV_INNER__].ets;
  for (var eid in emit_map) {
    var item = emit_map[eid];
    //var index = item.index;
    //var emitter = item.emitter;
    jarray_emitter(jarray, item.index, item.emitter, is_add);
    //var len = emitter.route.length;
    //if (index === len - 1 || (index === len - 2 && emitter.route[len - 1] === 'length')) {
    //  emitter.array = is_add;
    //  if (is_add) {
    //    ets[eid] = emitter;
    //  } else {
    //    delete ets[eid];
    //  }
    //}
  }
}

function jarray_emitter(jarray, index, emitter, is_add) {
  var ets = jarray[__ENV_INNER__].ets;
  var len = emitter.route.length;
  var eid = emitter.id;
  if (index === __ENV_DEEP__ || index === len - 1 || (index === len - 2 && emitter.route[len - 1] === 'length')) {
    emitter.array = is_add;
    if (is_add) {
      ets[eid] = emitter;
    } else {
      delete ets[eid];
    }
  }
}

function jarray_deep_add_or_rm_emitter(jarray, idx, val, is_add) {
  if (!$isObject(val)) {
    return;
  }
  var ets = jarray[__ENV_INNER__].ets;
  for (var eid in ets) {
    var emitter = ets[eid];
    if (!emitter.deep) {
      continue;
    }
    if (is_add) {
      environment_deep_add_emitter(val, emitter);
    } else {
      environment_deep_rm_emitter(val, emitter.id);
    }
  }

  //jarray[__ENV_INNER__].ets.forEach(function (emit_map) {
  //  for(var eid in emit_map) {
  //    var item = emit_map[eid];
  //    if (item.index === item.emitter.route.length - 1 && item.emitter.deep) {
  //      if (is_add) {
  //        environment_deep_add_emitter(val, item.emitter);
  //      } else {
  //        environment_deep_rm_emitter(val, item.emitter.id, item.index);
  //      }
  //    }
  //  }
  //});
}
function jarray_emit_self(jarray) {
  var ets = jarray[__ENV_INNER__].ets;
  for (var eid in ets) {
    ets[eid].notify();
  }
}

function jarray_notify(jarray, idx) {
  var props = jarray[__ENV_EMIT__];
  var emit_map = props[idx];
  if (!emit_map) {
    return;
  }
  for (var eid in emit_map) {
    var item = emit_map[eid];
    item.emitter.notify();
  }
}

function JArray(array) {
  if ($isJArray(array)) {
    array = array[__ENV_INNER__].arr;
  } else if (!$isArray(array)) {
    array = [];
  }
  $defineProperty(this, __ENV_INNER__, {
    arr: array,
    ets: {},
    up: 0
  });
  jarray_up_bound(this);
  $defineProperty(this, __ENV_EMIT__, {});
}
var __jarray_prototype = JArray.prototype;
var __array_prototype = Array.prototype;

$defineProperty(__jarray_prototype, 'push', function () {
  if (arguments.length === 0) {
    return;
  }
  //var fn = __array_prototype.push;
  //var arr = this[__ENV_INNER__].arr;
  //var old_len = arr.length;
  //var new_len = old_len + arguments.length;
  //var props = this[__ENV_EMIT__];
  //
  //fn.apply(arr, arguments);
  //
  //var val, emit_map, eid, item;
  //for (var i = old_len; i < new_len; i++) {
  //  val = arr[i];
  //  if (!$isObject(val)) {
  //    continue;
  //  }
  //  emit_map = props[i];
  //  if (!emit_map) {
  //    continue;
  //  } else {
  //    jarray_notify(this, i);
  //  }
  //  if ($isArray(val)) {
  //    val = new JArray(val);
  //  }
  //  if ($isJArray(val)) {
  //    jarray_emit_map(val, emit_map, true);
  //  }
  //  for (eid in emit_map) {
  //    item = emit_map[eid];
  //    if (item.index < item.emitter.route.length - 1) {
  //      environment_walk_add_or_delete_emitter(item.emitter, item.index + 1, item.emitter.route, val, true);
  //    }
  //    if (item.emitter.deep) {
  //      environment_deep_add_emitter(val, item.emitter);
  //    }
  //    jarray_deep_add_or_rm_emitter(this, i, val, true);
  //  }
  //}
  //jarray_up_bound(this);
  //jarray_emit_self(this);
  var args = [this.length, 0].concat(__array_prototype.slice.call(arguments));
  __jarray_prototype.splice.apply(this, args);
});

$defineProperty(__jarray_prototype, 'unshift', function () {
  var args = [0, 0].concat(__array_prototype.slice.call(arguments));
  __jarray_prototype.splice.apply(this, args);
});

$defineProperty(__jarray_prototype, 'remove', function (item) {
  var i = this[__ENV_INNER__].arr.indexOf(item);
  if (i >= 0) {
    __jarray_prototype.splice.call(this, i, 1);
  }
});

$defineProperty(__jarray_prototype, 'splice', function () {
  var idx = arguments[0];
  var del_count = arguments[1];
  var add_count = arguments.length - 2;
  var arr = this[__ENV_INNER__].arr;
  var len = arr.length;
  if (len - idx < del_count) {
    del_count = len - idx;
  }
  var delta = add_count - del_count;
  var i;
  var props = this[__ENV_EMIT__];
  //if (delta === 0) {
  //  for (i = 0; i < arguments.length; i++) {
  //    add(i + idx, arguments[i]);
  //  }
  //} else if (delta > 0) {
  //  for (i = idx + del_count; i<len; i++) {
  //    remove(i, arr[i]);
  //    add(i + delta, arr[i]);
  //  }
  //  for (i = idx; i < idx + del_count; i++) {
  //    remove(i, arr[i])
  //  }
  //  for (i = 0; i < arguments.length; i++) {
  //    add(i + idx, arguments[i]);
  //  }
  //} else {
  //  for (i = idx + del_count; i<len; i++) {
  //    remove(i, arr[i]);
  //    add(i + delta, arr[i]);
  //  }
  //  for (i = idx; i < idx + del_count; i++) {
  //    remove(i, arr[i])
  //  }
  //  for (i = 0; i < arguments.length; i++) {
  //    add(i + idx, arguments[i]);
  //  }
  //}

  function walk(idx, val, is_add) {
    if(!$hasProperty(props, idx) || !$isObject(val)) {
      return;
    }
    var emit_map = props[idx];
    if (is_add) {
      if ($isArray(val)) {
        val = new JArray(val);
      }
      if ($isJArray(val)) {
        jarray_emit_map(val, emit_map, true);
      }
    } else if ($isJArray(val)) {
      jarray_emit_map(val, emit_map, false);
    }
    for (var eid in emit_map) {
      var item = emit_map[eid];
      //if (item.index < item.emitter.route.length - 1) {
      //  environment_walk_add_or_delete_emitter(item.emitter, item.index + 1, item.emitter.route, val, is_add);
      //}
      environment_deep_rm_emitter(val, item.emitter);
    }

  }


  if (delta !== 0) {
    for (i = idx + del_count; i<len; i++) {
      walk(i, arr[i], false);
      walk(i + delta, arr[i], true);
      jarray_notify(this, i);
    }
  }

  for (i = idx; i < idx + del_count; i++) {
    walk(i, arr[i], false);
    jarray_deep_add_or_rm_emitter(this, i, arr[i], false);
    jarray_notify(this, i);
  }
  for (i = 0; i < add_count; i++) {
    walk(i + idx, arguments[i + 2], true);
    jarray_deep_add_or_rm_emitter(this, i + idx, arguments[i + 2], true);
  }

  var items = __array_prototype.splice.apply(arr, arguments);

  jarray_up_bound(this);
  jarray_emit_self(this);

  return new JArray(items);
});

['join', 'indexOf', 'fill', 'find'].forEach(function (med) {
  $defineProperty(__jarray_prototype, med, function () {
    return __array_prototype[med].apply(this[__ENV_INNER__].arr, arguments);
  });
});

$defineProperty(__jarray_prototype, 'slice', function () {
  return new JArray(__array_prototype.slice.apply(this[__ENV_INNER__].arr, arguments));
});

$defineGetterSetter(__jarray_prototype, 'length', function () {
  return this[__ENV_INNER__].arr.length;
}, function (len) {
  throw 'todo';
  //this[__ENV_INNER__].arr.length = len;
  //jarray_up(this, true);
});

$defineProperty(__jarray_prototype, 'filter', function (fn) {
  var arr = this[__ENV_INNER__].arr;
  var items = $filter(arr, fn);
  return new JArray(items);
});

$defineProperty(__jarray_prototype, 'sort', function (fn) {
  var dst = __array_prototype.sort.apply(this[__ENV_INNER__].arr, arguments);
  return new JArray(dst);
});

$defineProperty(__jarray_prototype, 'destroy', function () {
  this[__ENV_INNER__].arr.length = 0;
});

$defineProperty(__jarray_prototype, 'forEach', function (fn) {
  __array_prototype.forEach.apply(this[__ENV_INNER__].arr, arguments);
});

function LazyListener(emitters, handler, data) {
  this.id = $uid();
  this.handler = handler;
  this.emitters = emitters;
  this.data = data;
  this.pv = null;
  this.cv = null;
  this.tm = null;
  this.destroied = false;
  this.dg = $bind(this, this._deal);
  this.changes = [];
}
LazyListener.prototype = {
  _ctm: function () {
    if (this.tm !== null) {
      clearTimeout(this.tm);
      this.tm = null;
    }
  },
  notify: function (cur_value, pre_value, var_path) {
    this._ctm();
    this.tm = setTimeout(this.dg, 0);
    this._notify(cur_value, pre_value, var_path);
  },
  destroy: function () {
    if (this.destroied) {
      return;
    }
    this.destroied = true;
    this.handler = null;
    this.data = null;
    this._ctm();
    this.dg = null;
    this.pv = null;
    this.cv = null;
    for(var eid in this.emitters) {
      this.emitters[eid].destroy();
      this.emitters[eid] = null;
    }
    this.emitters = null;
  },
  _deal: function () {
    //abstract method
  },
  _notify: function () {
    //abstract method
  }
};

/*
 * StrListener用于连接只带属性访问的字符串的监听。比如 <p>{{boy.name}},{{boy.age}}</p>
 * 但对于更复杂的情况比如带函数调用的情况，需要使用ExprListener，比如<p>boys.slice(3,4)[0].name</p>
 */
function StrListener(emitters, var_cache, str_items, handler, data) {
  this.base(emitters, handler, data);
  this.cache = var_cache;
  this.items = str_items;
  this.vc = false;
}
StrListener.prototype = {
  notify: function (cur_value, pre_value, var_path) {
    if(this.cache[var_path] === cur_value) {
      return;
    }
    this.callBase('notify', cur_value, pre_value, var_path);
  },
  _notify: function (cur_value, pre_value, var_path) {
    this.cache[var_path] = cur_value;
    this.vc = true;
  },
  _val: function () {
    var text = '', me = this;
    this.items.forEach(function (it) {
      var val = it.is_var ? me.cache[it.value] : it.value;
      text += val ? val : '';
    });
    return text;
  },
  _init: function () {
    this.cv = this.pv = this._val();
  },
  _deal: function () {
    if (!this.vc) {
      return;
    }
    this.vc = false;
    this.cv = this._val();
    if (this.cv === this.pv) {
      return;
    }
    this.handler(this.cv, this.pv, this.data);
    this.pv = this.cv;
  },
  destroy: function () {
    this.callBase('destroy');
    this.items.length = 0;
    for (var k in this.cache) {
      this.cache[k] = null;
    }
    this.cache = null;
  }
};
$inherit(StrListener, LazyListener);

function ExprListener(emitters, var_tree, expr, env, handler, data) {
  this.base(emitters, handler, data);
  this.expr = expr;
  this.var_tree = var_tree;
  this.env = env;
  this.changes = [];
}

ExprListener.prototype = {
  _notify: function (cur_value, pre_value, var_path) {
    this.changes.push(var_path);
  },
  _deal: function () {
    var i, c, n_arr, j;
    for (i = 0; i < this.changes.length; i++) {
      c = this.changes[i];
      n_arr = this.var_tree[c];
      if (!n_arr) {
        continue;
      }
      for (j = 0; j < n_arr.length; j++) {
        n_arr[j].cached = false;
        listen_refresh_expr_node(n_arr[j]);
      }
    }

    this.changes.length = 0;
    this.cv = this.expr.exec(this.env);
    if (!$isJArray(this.cv) && this.cv === this.pv) {
      return;
    }
    this.handler(this.cv, this.pv, this.data);

    this.pv = this.cv;

  },
  destroy: function () {
    this.callBase('destroy');
    this.changes.length = 0;
    this.env = null;
    for (var k in this.var_tree) {
      this.var_tree[k] = null;
    }
    this.var_tree = null;
    this.expr.destroy();
    this.expr = null;

  }
};
$inherit(ExprListener, LazyListener);

function listen_refresh_expr_node(node) {
  /*
   * 如果node.cached===false，说明当前node及其父亲树都已经被refresh过了，
   *   不需要再次遍历。这是一个简单的优化。
   */
  function re_loop(node) {
    if (!node || node.cached === false) {
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
var __ENV_EMIT__ = '__$jing0210emit$__';
var __ENV_DEEP__ = 0xfffffff0;

function environment_define_obj_prop(obj, prop, val) {
  /**
   * 这里我们用闭包来将数据绑定到该属性prop上。
   * 这样可以方便地处理非Object类型的数据，而不需要像【prepare】分支里使用的复杂方法。
   */
  $defineGetterSetter(obj, prop, function () {
    return val;
  }, function (new_val) {
    if (val === new_val) {
      return;
    }


    $assert($hasProperty(this, __ENV_EMIT__));
    var emit_map = this[__ENV_EMIT__][prop];
    $assert(emit_map);

    if ($isArray(new_val)) {
      new_val = new JArray(new_val);
    }

    var is_nj = $isJArray(new_val);
    var is_oj = $isJArray(val);

    //if ($isJArray(new_val)) {
    //  jarray_emit_map(new_val, emit_map, true);
    //}
    //if ($isJArray(val)) {
    //  jarray_emit_map(val, emit_map, false);
    //}

    var eid, item, i, emitter;
    for (eid in emit_map) {
      item = emit_map[eid];
      i = item.index;
      emitter = item.emitter;
      emitter.notify();

      if (is_nj) {
        jarray_emitter(new_val, i, emitter, true);
      }
      if (is_oj) {
        jarray_emitter(val, i, emitter, false);
      }
      environment_update_prop(i, emitter, val, new_val);
    }

    val = new_val;
  }, true, true);
}

function environment_walk_add_or_delete_emitter(emitter, idx, route, host, is_add) {

  for (; idx < route.length; idx++) {
    var r = route[idx];
    var ets, emit_map;
    var val;
    if (is_add) {
      //add emitter
      ets = __get_ets(host);
      emit_map = __get_emap(ets, r);
      $assert(!$hasProperty(emit_map, emitter.id));
      emit_map[emitter.id] = {
        index: idx,
        emitter: emitter
      };
      val = host[r];
      if ($isArray(val)) {
        val = new JArray(val);
      }
      if ($isJArray(val)) {
        //jarray_emit_map(val, emit_map, true);
        jarray_emitter(val, idx, emitter, true);
      }
      environment_define_obj_prop(host, r, val);
    } else if ((ets = host[__ENV_EMIT__])
      && (emit_map = ets[r])
      && ($hasProperty(emit_map, emitter.id))) {
      //remove emitter
      delete emit_map[emitter.id];
    }
    if (!$hasProperty(host, r) || !$isObject(host = host[r])) {
      return undefined;
    }
  }

  return host;

}
function __get_emap(ets, r) {
  var emit_map = ets[r];
  if (!emit_map) {
    emit_map = ets[r] = {};
  }
  return emit_map;
}

function __get_ets(obj) {
  var ets = obj[__ENV_EMIT__];
  if (!ets) {
    ets = {};
    $defineProperty(obj, __ENV_EMIT__, ets);
  }
  return ets;
}


function environment_deep_add_emitter(obj, emitter) {
  var props = obj[__ENV_EMIT__];
  if (!props) {
    props = {};
    $defineProperty(obj, __ENV_EMIT__, props);
  }
  var is_array = $isJArray(obj);
  if (is_array) {
    //todo 深层次的Array的deep watch需要完善 !important
    //jarray_emit_map(obj, )
  }
  for (var k in obj) {
    if (k === __ENV_EMIT__ || k === __ENV_INNER__ || (is_array && !/^\d+$/.test(k))) {
      continue;
    }
    var val = obj[k];
    var emit_map = __get_emap(props, k);
    $assert(!$hasProperty(emit_map, emitter.id));
    emit_map[emitter.id] = {
      index: __ENV_DEEP__,
      emitter: emitter
    };
    if ($isArray(val)) {
      val = new JArray(val);
    }
    environment_define_obj_prop(obj, k, val);

    if ($isObject(val)) {
      environment_deep_add_emitter(val, emitter);
    }
  }
}

function environment_deep_rm_emitter(obj, emitter) {
  var props = obj[__ENV_EMIT__];
  var eid = emitter.id;
  if (props) {
    for (var v in props) {
      var em = props[v];
      delete em[eid];
    }
  }
  if ($isJArray(obj)) {
    //jarray_emit_map(obj, emit_map, false);
    jarray_emitter(obj, __ENV_DEEP__,  emitter, false);
  }
  for (var k in obj) {
    if (k === __ENV_EMIT__) {
      continue;
    }
    var val = obj[k];
    if ($isObject(val)) {
      environment_deep_rm_emitter(val, emitter);
    }
  }
}
function environment_update_prop(emit_index, host_emitter, old_val, new_val) {


  var emit_route = host_emitter.route;
  var obj = new_val;

  if (emit_index < emit_route.length - 1) {
    if ($isObject(old_val)) {
      environment_walk_add_or_delete_emitter(host_emitter, emit_index + 1, emit_route, old_val, false);
    }
    if ($isObject(new_val)) {
      obj = environment_walk_add_or_delete_emitter(host_emitter, emit_index + 1, emit_route, new_val, true);
    }
  }

  if (host_emitter.deep && $isObject(old_val)) {
    environment_deep_rm_emitter(old_val, host_emitter.id);
  }

  if (host_emitter.deep && $isObject(obj)) {
    environment_deep_add_emitter(obj, host_emitter);
  }

}

function environment_define_arr_prop(p, idx) {

  $defineGetterSetter(p, idx, function () {
    return this[__ENV_INNER__].arr[idx];
  }, function (new_val) {
    var pv = this[__ENV_INNER__].arr[idx];
    if (pv === new_val) {
      return;
    }
    if ($isArray(new_val)) {
      new_val = new JArray(new_val);
    }
    $assert($hasProperty(this, __ENV_EMIT__));

    if ($hasProperty(this[__ENV_EMIT__], idx)) {
      var emitter = this[__ENV_EMIT__][idx];
      $assert(emitter);
      emitter.notify();
      environment_update_prop(idx, emitter, pv, new_val, true);
    }

    this[__ENV_INNER__].arr[idx] = new_val;

  }, true, true);

}

function environment_watch_items(env, var_array, emitter) {

  var i, v, val, is_array;
  var props, emit_map;
  var p = env;

  for (i = 0; i < var_array.length; i++) {
    if (!$isObject(p)) {
      break;
    }
    v = var_array[i];
    is_array = $isJArray(p);
    val = is_array ? p[__ENV_INNER__].arr[v] : p[v];
    if ($isArray(val)) {
      val = new JArray(val);
      if (is_array) {
        p[__ENV_INNER__].arr[v] = val;
      }
    }
    props = p[__ENV_EMIT__];
    if (!props) {
      props = {};
      $defineProperty(p, __ENV_EMIT__, props);
    }
    emit_map = props[v];
    if (!emit_map) {
      emit_map = props[v] = {};
    }

    emit_map[emitter.id] = {
      index: i,
      emitter: emitter
    };

    if ($isJArray(val)) {
      jarray_emitter(val, i, emitter, true);
    }

    if (is_array) {
      environment_define_arr_prop(p, v);
    } else {
      environment_define_obj_prop(p, v, val);
    }

    p = val;
  }

  if (i === var_array.length && emitter.deep && $isObject(p)) {
      environment_deep_add_emitter(p, emitter);
  }
  emitter._init();

}

/*
 * 将a.b[4][3][7].c.d[9]转成a.b.4.3.7.c.d.9的形式。
 */
function environment_var2format(var_name) {
  return var_name.replace(/\s*\]\s*\[\s*/g, '.')
    .replace(/\s*\]\s*\.\s*/g, '.').replace(/\s*\[\s*/g, '.').replace(/\s*\]\s*/g, '');
}

$defineProperty(__env_prototype, '$unwatch', function (listener_id) {
  var lt = this[__ENV_INNER__].listeners,
      listener = lt[listener_id];
  if(!listener) {
      return;
  }
  environment_unwatch_listener(listener);
  delete lt[listener_id];
});
$defineProperty(__env_prototype, '$watch', function (expression, callback, is_deep, data) {

  if (typeof callback !== 'function') {
    throw new Error('$watch need function');
  }

  if ($isObject(expression)) {
    return environment_watch_expression(this, expression, callback, data);
  } else if ($isString(expression)) {
    if (__jing_regex_var.test(expression)) {
      return environment_watch_var_str(this, expression, callback, is_deep, data);
    } else if (__drive_view_expr_REG.test(expression)){
      //todo
    }
  } else {
    throw new Error('$watch wrong format');
  }

});

function environment_watch_var_str(env, var_name, callback, is_deep, data) {
  var v_str = environment_var2format(var_name);
  var v_items = $map(v_str.split('.'), function (item) {
    item = item.trim();
    return /^\d+$/.test(item) ? parseInt(item) : item;
  });


  if (v_items.length === 0) {
    throw new Error('$watch wrong format');
  }

  env = env.$find(v_items[0]);
  if (!env) {
    debugger;
    throw new Error('variable ' + v_items[0] + ' not found!');
  }

  var emitter = new Emitter(env, v_items, callback, is_deep ? true : false, data);
  environment_watch_items(env, v_items, emitter);
  env[__ENV_INNER__].listeners[emitter.id] = emitter;
  return emitter;
}

function environment_unwatch_listener(listener) {
  listener.destroy(); //todo $watch函数直接返回了listener，但其destroy接口不应该暴露给用户。
  //$each(listener.emitters, function(emitter) {
  //    var idx = emitter.listeners.indexOf(listener);
  //    if(idx>=0) {
  //        emitter.listeners.splice(idx, 1);
  //    }
  //});
  //listener.destroy();
}

function environment_watch_expr_loop(expr_node, watch_array, var_tree) {
  //代码有些丑
  //todo 梳理逻辑和代码。

  function expr_prop(expr, v_arr) {
    var nb = expr.nodes[1];
    if (nb.type === 'constant') {
      v_arr.push(nb.value);
      if (expr.parent && expr.parent.type === 'property') {
        expr_prop(expr.parent, v_arr);
        return;
      }
    }

    watch_array.push(vn);

  }

  if (expr_node.type === 'variable') {
    var vn = [expr_node.var_name];
    if (expr_node.parent && expr_node.parent.type === 'property') {
      expr_prop(expr_node.parent, vn);
    }
    watch_array.push(vn);
    var path = vn.join('.'), n_arr = var_tree[path];
    if (!n_arr) {
      n_arr = var_tree[path] = [];
    }
    if (n_arr.indexOf(expr_node) < 0) {
      n_arr.push(expr_node);
    }
  } else {
    for (var i = 0; i < expr_node.nodes.length; i++) {
      environment_watch_expr_loop(expr_node.nodes[i], watch_array, var_tree);
    }
  }

}

function environment_watch_expression(env, expr, callback, data) {
  var watch_array = [];
  var var_tree = {};
  var emitters = {};

  environment_watch_expr_loop(expr, watch_array, var_tree);

  if (watch_array.length === 0) {
    return;
  }

  var listener = new ExprListener(emitters, var_tree, expr, env, callback, data);

  var emitter, act_env;
  for (var i = 0; i < watch_array.length; i++) {
    var v_items = watch_array[i];
    act_env = env.$find(v_items[0]);
    if (!act_env) {
      debugger;
      throw new Error('variable ' + v_items[0] + ' not found!');
    }
    emitter = new Emitter(act_env, v_items, listener);
    environment_watch_items(act_env, v_items, emitter);
    emitters[emitter.id] = emitter;
  }

  listener.cv = listener.pv = expr.exec(env);
  env[__ENV_INNER__].listeners[listener.id] = listener;
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

$defineProperty(__module_prototype, 'directive', function directive(name, func) {
        if(!$isFunction(func)) {
            throw new Error('directive need function');
        }
        directive_create(name, func);
        return this;
});


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


directive_create('j-bind', function() {
  return function(drive_module, directive_module, env, element, attr_value) {
    //todo 支持除了<input>外的单向绑定
    directive_data_bind(drive_module, directive_module, env, element, attr_value, false);
  };
});

directive_create('j-class', function () {
  function apply_class(ele, pre, cur) {
    ele.className = (ele.className.replace(pre.trim(), '') + ' ' + cur).trim();
  }

  return function (drive_module, directive_module, env, element, attr_value) {
    var listener;
    if (__jing_regex_var.test(attr_value)) {
      listener = env.$watch(attr_value, on_change, false, element);
    } else {
      var expr = parse_expression(attr_value, true);
      listener = environment_watch_expression(env, expr, on_change, element);
    }
    function on_change(cur_value, pre_value, ele) {
      apply_class(ele, pre_value, cur_value);
    }
    apply_class(element, '', listener.cv);
  }
});

/*
 * j-cloak并不是一个独立的directive，其功能在drive/dirve.js中的drive_parse_element函数中实现
 */

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

    var listener = environment_watch_expression(env, expr, function(cur_value, pre_value, j_model) {
        j_model.update(cur_value);
    }, this);

    this.val = listener.cv;
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
            }, 0);
        });
    }
});

function JRepeatReuseItem(ele, env, val) {
  this.ele = ele;
  this.used = false;
  this.env = env;
  this.val = val;
}

function JRepeat(ele, attr, drive_module, key, env, expr) {
  this.ele = ele;
  this.cmt = document.createComment(ele.outerHTML);
  this.env = env;
  this.expr = expr;
  this.attr = attr;
  this.key = key;
  this.module = drive_module;
  this.frag = document.createDocumentFragment();
  var listener = environment_watch_expression(env, expr, function (cur_value, pre_value, repeater) {
    repeater.update(cur_value);
  }, this);

  this.items = [];
  this.index_map = new Map();

  $$before(this.cmt, ele);
  $$remove(ele);

  this.render(listener.cv);
}
var __jrepeate_prototype = JRepeat.prototype;
__jrepeate_prototype.update = function (new_value) {

  if (!$isJArray(new_value)) {
    throw new Error('only support Array in j-repeat.');
  }

  var _array = new_value[__ENV_INNER__].arr;
  var i;
  var old_items = this.items;
  if (_array.length === 0 && old_items.length === 0) {
    return;
  }

  var _same;
  if (old_items.length > 0 && _array.length === old_items.length) {
    _same = true;
    for (i = 0; i < _array.length; i++) {
      if (_array[i] !== old_items[i].val) {
        _same = false;
        break;
      }
    }
    if (_same) {
      return;
    }
  }

  var map = this.index_map;
  var new_map = new Map();

  var idx, item;

  function get_index(item) {
    var index_array = map.get(item);
    if (!index_array || index_array.length === 0) {
      return -1;
    }
    return index_array.pop();
  }


  var items_tip = new Int32Array(_array.length);


  for (i = 0; i < _array.length; i++) {
    idx = get_index(_array[i]);
    if (idx >= 0) {
      //可复用元素
      items_tip[i] = idx + 1;
      old_items[idx].used = true;
    }
  }


  for (i = 0; i < old_items.length; i++) {
    item = old_items[i];
    if (!item.used) {
      $$remove(item.ele);
      item.env.$destroy();
      item.ele = null;
      item.env = null;

      delete old_items[i];
    }
  }


  function get_old_idx(pre) {
    for (var i = pre + 1; i < old_items.length; i++) {
      if (old_items[i]) {
        return i;
      }
    }
    return -1;
  }


  function swap(idx, old_idx) {
    var i1 = old_items[idx],
      i2 = old_items[old_idx];
    $$swap(i1.ele, i2.ele);
    old_items[idx] = i2;
    old_items[old_idx] = i1;
  }

  var env, ele;
  var old_idx = get_old_idx(-1);
  var pos_ele = old_idx < 0 ? this.cmt : old_items[old_idx].ele;
  var new_items = new Array(_array.length);
  var frag = null;

  for (i = 0; i < _array.length; i++) {
    idx = items_tip[i] - 1;
    if (idx < 0) {
      env = environment_create_child(this.env, i);
      ele = this.ele.cloneNode(true);
      item = new JRepeatReuseItem(ele, env, _array[i]);
      j_repeat_set_prop(env, i, _array.length);
      env[this.key] = _array[i];

      drive_render_element(ele, this.attr, this.module, env);
      drive_insert_before();

      /*
       * 将多个连续的插入，使用Fragment合并后再insert，可以提升性能。
       */
      frag = frag ? frag : document.createDocumentFragment();
      frag.appendChild(ele);
    } else {
      if (frag) {
        $$before(frag, pos_ele);
        frag = null;
      }
      if (idx > old_idx) {
        swap(idx, old_idx);
      }
      old_idx = get_old_idx(old_idx);
      pos_ele = old_idx < 0 ? this.cmt : old_items[old_idx].ele;
      item = old_items[idx];
      j_repeat_set_prop(item.env, i, _array.length);
    }
    item.used = false;
    new_items[i] = item;
    j_repeat_set_index(new_map, _array[i], i);
  }
  if (frag) {
    $$before(frag, pos_ele);
    frag = null;
  }
  map.clear();
  old_items.length = 0;
  this.items = new_items;
  this.index_map = new_map;

};

function j_repeat_set_prop(env, i, len) {
  env.$prop = {
    '$index': i,
    '$first': i === 0,
    '$odd': i % 2 !== 0,
    '$even': i % 2 === 0,
    '$last': i === len - 1,
    '$middle': i !== 0 && i !== len - 1
  };
}
__jrepeate_prototype.render = function (val) {
  if (!$isJArray(val)) {
    throw new Error('only support Array in j-repeat.');
  }
  var array = val[__ENV_INNER__].arr;
  var r_ele, r_env;
  var frag = document.createDocumentFragment();
  for (var i = 0; i < array.length; i++) {
    r_ele = this.ele.cloneNode(true);
    r_env = environment_create_child(this.env, i);
    j_repeat_set_prop(r_env, i, array.length);
    r_env[this.key] = array[i];

    drive_render_element(r_ele, this.attr, this.module, r_env);

    frag.appendChild(r_ele);
    this.items.push(new JRepeatReuseItem(r_ele, r_env, array[i]));
    j_repeat_set_index(this.index_map, array[i], i);
  }

  __drive_insert_b.push({
    ele: frag,
    pos: this.cmt
  });
};

function j_repeat_set_index(map, item, idx) {
  var index_array = map.get(item);
  if (!index_array) {
    index_array = [];
    map.set(item, index_array);
  }
  index_array.push(idx);
}

function directive_deal_j_repeat(ele, attr, drive_module, env) {
  var item = attr.removeNamedItem('j-repeat'),
    expr_str = item.value;

  var expr = parse_expression(expr_str, true);
  if (expr.type !== 'in') {
    throw 'j-repeat format wrong!';
  }

  new JRepeat(ele, attr, drive_module, expr.nodes[0], env, expr.nodes[1]);
}


(function () {

  function apply_show_hide(ele, show) {
    ele.style.setProperty('display', show ? '' : 'none', '');
  }

  function directive_show_hide(drive_module, directive_module, env, element, attr_value, show) {
    var listener;
    if (__jing_regex_var.test(attr_value)) {
      listener = env.$watch(attr_value, on_change, false, element);
    } else {
      var expr = parse_expression(attr_value, true);
      listener = environment_watch_expression(env, expr, on_change, element);
    }

    function on_change(val, pre_value, ele) {
      apply_show_hide(ele,  show ? (val ? true : false) : (val ? false : true));
    }
    var val = listener.cv;

    apply_show_hide(element,  show ? (val ? true : false) : (val ? false : true));


  }

  directive_create('j-show', function () {
    return function (drive_module, directive_module, env, element, attr_value) {
      directive_show_hide(drive_module, directive_module, env, element, attr_value, true);
    }
  });

  directive_create('j-hide', function () {
    return function (drive_module, directive_module, env, element, attr_value) {
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


        var listener = environment_watch_expression(env, expr, function(new_value, pre_value, ele) {
            apply_style(ele, new_value);
        }, element);

        apply_style(element, listener.cv);

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
parse_inherit_node(PropertyGrammarNode, function (scope) {
  var variable = this.nodes[0].exec(scope);
  var prop_name = this.nodes[1].exec(scope);
  return $isObject(variable) ? variable[prop_name] : undefined;
}, {
  increment: function (scope, is_add, is_prefix) {
    var variable = this.nodes[0].exec(scope),
      prop_name = this.nodes[1].exec(scope);
    if (variable === null || !$hasProperty(variable, prop_name)) {
      return null
    } else {
      var val = variable[prop_name],
        new_val = val + (is_add ? 1 : -1);
      variable[prop_name] = new_val;
      return is_prefix ? new_val : val;
    }
  },
  set: function (scope, value) {
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
    var items = __drive_insert_b, it;
    for(var i=0;i<items.length;i++) {
        it = items[i];
        it.pos.parentNode.insertBefore(it.ele, it.pos);
        it.pos = null; //防止潜在的内存泄露，采取尽可能显示地回收策略（虽然说在js里很多地方是不必要的）。
        it.ele = null;
        delete items[i];
    }
    items.length = 0;
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
            if($hasAttr(ele, 'j-cloak')) {
                $removeAttr(ele, 'j-cloak');
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


function drive_get_view_expr(txt) {
  var piece_start = 0;
  var piece_array = [];
  var piece;
  var expr;
  var is_str_expr = true;
  while ((piece = __drive_view_expr_REG.exec(txt)) !== null) {
    if (piece.index > piece_start) {
      piece_array.push(txt.substring(piece_start, piece.index));
    }
    piece_start = piece.index + piece[0].length;
    expr = piece[1];
    if (__jing_regex_var.test(expr)) {
      var v_str = environment_var2format(expr);
      var v_items = $map(v_str.split('.'), function (item) {
        item = item.trim();
        return /^\d+$/.test(item) ? parseInt(item) : item;
      });
      piece_array.push(v_items);
    } else {
      is_str_expr = false;
      piece_array.push(parse_expression(piece[1], true));
    }
  }

  if (piece_array.length === 0) {
    return null;
  } else {
    if (piece_start < txt.length) {
      piece_array.push(txt.substring(piece_start));
    }
  }

  if (is_str_expr) {
    return piece_array;
  }
  if (piece_array.length === 1) {
    return piece_array[0];
  }

  function get_piece_expr(idx) {

    function create_node(arr, i) {
      return i === 0 ? new VariableGrammarNode(arr[i]) : new PropertyGrammarNode(create_node(arr, i - 1), new ConstantGrammarNode(arr[i]));
    }
    var ea = piece_array[idx];
    var node;
    if ($isArray(ea)) {
      node = create_node(ea, ea.length - 1);
    } else if ($isObject(ea)) {
      node = ea;
    } else {
      node = new ConstantGrammarNode(ea);
    }
    return node;
  }

  var ea = get_piece_expr(0), eb;
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
    eb = get_piece_expr(i);
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
  /*
   * 下面这一段代码有些丑
   * todo 重新梳理逻辑整理代码。
   */
  var expr = drive_get_view_expr(txt);
  var listener;
  if (!expr) {
    return;
  } else if ($isArray(expr)) {
    if (expr.length === 1) {
      var v_items = expr[0];
      env = env.$find(v_items[0]);
      if (!env) {
        debugger;
        throw new Error('variable ' + v_items[0] + ' not found!');
      }
      listener = new Emitter(env, v_items, drive_view_observer, false, ele);
      environment_watch_items(env, v_items, listener);
    } else {
      var e_items = [];
      var e_cache = {};
      var e_emitters = {};
      listener = new StrListener(e_emitters, e_cache, e_items, drive_view_observer, ele);

      expr.forEach(function (ex) {
        if ($isString(ex)) {
          e_items.push({
            is_var: false,
            value: ex
          });
        } else {
          var p = ex.join('.');
          e_items.push({
            is_var: true,
            value: p
          });
          var emitter = new Emitter(env, ex, listener);
          environment_watch_items(env, ex, emitter);
          e_cache[p] = emitter.cv;
          e_emitters[emitter.id] = emitter;
        }
      });
      listener._init();
    }
  } else if (expr.type === 'constant') {
    ele.textContent = expr.value;
    return;
  } else {
    listener = environment_watch_expression(env, expr, drive_view_observer, ele);
  }
  ele.textContent = listener.cv;
}

function drive_view_observer(cur_value, pre_value, ele) {
  ele.textContent = cur_value;
}


jing = {};

jing.module = module_create;
jing.require = module_require;
jing.config = $config;

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

jing.each = $each;
jing.map = $map;
jing.filter = $filter;
jing.defineProperty = $defineProperty;
jing.defineGetterSetter = $defineGetterSetter;
jing.JArray = JArray;

(function () {
  var __jing_style = document.createElement('style');
  document.head.appendChild(__jing_style);
  var __jing_sheet = __jing_style.sheet;
  __jing_sheet.insertRule("[j-cloak] { display : none !important;}", 0);
})();



var __jing_regex_var = /^\s*[\w\d\$\_]+\s*(?:(?:\.[\w\d\$\_]+\s*)|(?:\[\s*\d+\s*\]\s*))*\s*$/;
var __drive_view_expr_REG = /\{\{(.+?)\}\}/g;



})();