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

function jarray_emit_map(jarray, emit_map, is_add) {
  var ets = jarray.__.ets;
  var idx = ets.indexOf(emit_map);
  if (idx < 0 && is_add) {
    ets.push(emit_map);
  } else if (idx >=0 && !is_add) {
    ets.splice(idx, 1);
  }
}

function JArray(array) {
  if ($isJArray(array)) {
    array = array.__.arr;
  } else if (!$isArray(array)) {
    array = [];
  }
  $defineProperty(this, '__', {
    arr: array,
    ets: []
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
  var props = this[__ENV_EMIT__];

  fn.apply(arr, arguments);

  var val, emit_map, eid, item;
  for (var i = old_len; i < new_len; i++) {
    val = arr[i];
    if (!$isObject(val)) {
      continue;
    }
    emit_map = props[i];
    if (!emit_map) {
      continue;
    }
    if ($isArray(val)) {
      val = new JArray(val);
    }
    if ($isJArray(val)) {
      jarray_emit_map(val, emit_map, true);
    }
    for (eid in emit_map) {
      item = emit_map[eid];
      if (item.index < item.emitter.route.length - 1) {
        environment_walk_add_or_delete_emitter(item.emitter, item.index + 1, item.emitter.route, val, true);
      }
    }
  }
});

$defineProperty(__jarray_prototype, 'removeAt', function () {

});

$defineProperty(__jarray_prototype, 'splice', function () {
  var idx = arguments[0];
  var del_count = arguments[1];
  var add_count = arguments.length - 2;
  var arr = this.__.arr;
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
      if (item.index < item.emitter.route.length - 1) {
        environment_walk_add_or_delete_emitter(item.emitter, item.index + 1, item.emitter.route, val, is_add);
      }
    }

  }

  function notify(idx) {
    var emit_map = props[idx];
    if (!emit_map) {
      return;
    }
    for (var eid in emit_map) {
      var item = emit_map[eid];
      item.emitter.notify();
    }
  }
  if (delta !== 0) {
    for (i = idx + del_count - 1; i<len; i++) {
      walk(i, arr[i], false);
      walk(i + delta, arr[i], true);
      notify(i);
    }
  }

  for (i = idx; i < idx + del_count; i++) {
    walk(i, arr[i], false);
    notify(i);
  }
  for (i = 0; i < add_count; i++) {
    walk(i + idx, arguments[i + 2], true);
  }

  var items = __array_prototype.splice.apply(arr, arguments);

  return new JArray(items);
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