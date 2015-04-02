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
  var props = jarray[__ENV_EMIT__];
  var deep_emitters = [];
  jarray[__ENV_INNER__].ets.forEach(function (emit_map) {
    for(var eid in emit_map) {
      var item = emit_map[eid];
      if (item.index === item.emitter.route.length - 1 && item.emitter.deep) {
        deep_emitters.push(item.emitter);
      }
    }
  });
  for (var i = arr.length - 1; i >= up; i--) {
    //jarray_define_prop(jarray, i);
    if (props && deep_emitters.length > 0 && !$hasProperty(props, i)) {
      var em = props[i] = {};
      deep_emitters.forEach(function (emitter) {
        em[emitter.id] = {
          index: __ENV_DEEP__,
          emitter: emitter
        };
      });
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
      if (item.index < item.emitter.route.length - 1) {
        environment_walk_add_or_delete_emitter(item.emitter, item.index + 1, item.emitter.route, val, is_add);
      }
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