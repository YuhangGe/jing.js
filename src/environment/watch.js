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
    if ($isJArray(new_val)) {
      jarray_emit_map(new_val, emit_map, true);
    }
    if ($isJArray(val)) {
      jarray_emit_map(val, emit_map, false);
    }

    var eid, item;
    for (eid in emit_map) {
      item = emit_map[eid];
      item.emitter.notify();
      environment_update_prop(item.index, item.emitter, val, new_val);
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
        jarray_emit_map(val, emit_map, true);
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

function environment_deep_rm_emitter(obj, emit_id) {
  var props = obj[__ENV_EMIT__];
  if (props) {
    for (var v in props) {
      var em = props[v];
      delete em[emit_id];
    }
  }
  for (var k in obj) {
    if (k === __ENV_EMIT__) {
      continue;
    }
    var val = obj[k];
    if ($isObject(val)) {
      environment_deep_rm_emitter(val, emit_id);
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
      environment_update_prop(emitter, pv, new_val, idx, true);
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
      jarray_emit_map(val, emit_map, true);
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
  //var lt = this[__ENV_INNER__].listeners,
  //    listener = lt[listener_id];
  //if(!listener) {
  //    return;
  //}
  //delete lt[listener_id];
  //environment_unwatch_listener(listener);
});

$defineProperty(__env_prototype, '$watch', function (var_name, callback, is_deep, data) {

  if (typeof callback !== 'function') {
    throw new Error('$watch need function');
  }

  if ($isObject(var_name)) {
    return environment_watch_expression(this, var_name, callback, is_deep, data);
  }

  if (!$isString(var_name) || !__jing_regex_var.test(var_name)) {
    throw new Error('$watch wrong format');
  }

  var v_str = environment_var2format(var_name);
  var v_items = $map(v_str.split('.'), function (item) {
    item = item.trim();
    return /^\d+$/.test(item) ? parseInt(item) : item;
  });


  if (v_items.length === 0) {
    throw new Error('$watch wrong format');
  }

  var env = this.$find(v_items[0]);
  if (!env) {
    debugger;
    throw new Error('variable ' + v_items[0] + ' not found!');
  }

  var emitter = new Emitter(env, v_items, callback, is_deep ? true : false, data);
  environment_watch_items(this, v_items, emitter);

  return emitter;
});

function environment_unwatch_listener(listener) {
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

function environment_watch_expression(env, expr, callback, data, lazy_time) {
  var watch_array = [];
  var var_tree = {};

  environment_watch_expr_loop(expr, watch_array, var_tree);

  if (watch_array.length === 0) {
    return;
  }

  var listener = new ExprListener(var_tree, expr, env, callback, data);

  var emitter;
  for (var i = 0; i < watch_array.length; i++) {
    var v_items = watch_array[i];
    env = env.$find(v_items[0]);
    if (!env) {
      debugger;
      throw new Error('variable ' + v_items[0] + ' not found!');
    }
    emitter = new Emitter(env, v_items, listener);
    environment_watch_items(env, v_items, emitter);
  }

  //env[__ENV_INNER__].listeners[listener.id] = listener;

  listener.cv = listener.pv = expr.exec(env);

  return listener;
}