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
