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
    return this.__.arr[idx];
  }, function (val) {
    this.__.arr[idx] = val;
  }, true, true);
}

function JArray(array) {
  if ($isJArray(array)) {
    array = array.__.arr;
  } else if (!$isArray(array)) {
    array = [];
  }
  $defineProperty(this, '__', {
    arr: array
  });
  for (var i = 0; i < array.length; i++) {
    jarray_define_prop(this, i);
  }
  $defineProperty(this, __ENV_EMIT__, {});
}
var __jarray_prototype = JArray.prototype;
var __array_prototype = Array.prototype;

$defineProperty(__jarray_prototype, 'push', function () {
  if (arguments.length === 0) {
    return;
  }
  var fn = __array_prototype.push;
  var arr = this.__.arr;
  var old_len = arr.length;
  var new_len = old_len + arguments.length;
  var host_emitter = this[__ENV_EMIT__];
  var host_nodes = host_emitter.nodes;
  var props = this[__ENV_PROP__];

  fn.apply(arr, arguments);

  var val, old_emitter;
  for (var i = old_len; i < new_len; i++) {
    val = arr[i];
    old_emitter = props[i];
    if (!old_emitter) {
      continue;
    }
    if (!$isObject(val)) {
      continue;
    }
    environment_delete_old_nodes(old_emitter, host_nodes);

    environment_add_new_nodes(this, host_emitter, val, i, true);

  }
});

$defineProperty(__jarray_prototype, 'removeAt', function () {
  var index = arguments[0];
  var del_count = arguments[1];
  var del_items = __array_prototype['splice'].call(this.__.arr, index, del_count);
  var props = this[__ENV_PROP__];
  var host_emitter = this[__ENV_EMIT__];
  var host = this;
  $each(del_items, function (val, idx) {
    var emitter, old_emitter;
    if ($isObject(val) && (old_emitter = val[__ENV_EMIT__])) {
      emitter = props[index + idx];
      if (!emitter) {
        emitter = props[index + idx] = new Emitter();
      }
      emitter.deep = old_emitter.deep;
      environment_delete_old_nodes(old_emitter, host_emitter.nodes);

    }
  });
});

$defineProperty(__jarray_prototype, 'splice', function () {
  var idx = arguments[0];
  var del_count = arguments[1];

});

$each(['join', 'indexOf', 'fill', 'find'], function (med) {
  $defineProperty(__jarray_prototype, med, function () {
    return Array.prototype[med].apply(this.__.array, arguments);
  });
});

$defineProperty(__jarray_prototype, 'slice', function () {
  return new JArray(Array.prototype.slice.apply(this.__.array, arguments));
});

$defineGetterSetter(__jarray_prototype, 'length', function () {
  return this.__.array.length;
}, function (len) {
  this.__.array.length = len;
  jarray_up(this, true);
});
$defineProperty(__jarray_prototype, 'filter', function (fn) {
  var src = this.__.array;
  if (!fn || src.length === 0) {
    return this;
  }
  var dst = $filter(src, fn);
  if (dst.length === src.length) {
    return this;
  }
  return new JArray(dst, this.__.en);
});

$defineProperty(__jarray_prototype, 'sort', function (fn) {
  var dst = this.__.array.sort(fn);
  return new JArray(dst);
});

$defineProperty(__jarray_prototype, 'destroy', function () {
  this.__.array.length = 0;
  this.__.emit_map = null;
});

$defineProperty(__jarray_prototype, 'forEach', function (fn) {
  var i, arr = this.__.array, len = arr.length;
  for (i = 0; i < len; i++) {
    fn(arr[i], i);
  }
});