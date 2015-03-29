/*
 * 尽可能使用一个不会被使用的名称来作为内部成员。
 */
var __ENV_EMIT__ = '__$jing0210emit$__';

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
    if ($isArray(new_val)) {
      new_val = new JArray(new_val);
    }

    $assert($hasProperty(this, __ENV_EMIT__));
    var emitter = this[__ENV_EMIT__][prop];
    $assert(emitter);
    emitter.notify();

    environment_update_prop(emitter, val, new_val, prop, false);

    val = new_val;
  }, true, true);
}

function environment_update_prop(host_emitter, old_val, new_val, var_name, is_array) {

  function walk_remove(eid, idx, route, host) {
    for (; idx < route.length; idx++) {
      var r = route[idx];
      var ets = host[__ENV_EMIT__];
      var n;
      if (ets && (n = ets[r])) {
        delete n.nodes[eid];
        delete n.indexes[eid];
      }
      if (!$hasProperty(host, r) || !$isObject(host = host[r])) {
        return;
      }
    }
  }

  function walk_add(enode, idx, route, host) {
    for (; idx < route.length; idx++) {
      var r = route[idx];
      var ets = host[__ENV_EMIT__];
      if (!ets) {
        ets = {};
        $defineProperty(host, __ENV_EMIT__, ets);
      }
      var n = ets[r];
      if (!n) {
        n = ets[r] = new Emitter();
      }
      n.add(enode, idx);
      if (!$hasProperty(host, r) || !$isObject(host = host[r])) {
        return;
      }
    }
  }

  var host_nodes = host_emitter.nodes;
  var host_indexes = host_emitter.indexes;
  var eid, enode, eidx;

  for (eid in host_nodes) {
    enode = host_nodes[eid];
    eidx = host_indexes[eid];
    if (eidx < enode.route.length - 1) {
      if ($isObject(old_val)) {
        walk_remove(enode.id, eidx + 1, enode.route, old_val);
      }
      if ($isObject(new_val)) {
        walk_add(enode, eidx + 1, enode.route, new_val);
      }
    }
  }
}

function environment_define_arr_prop(p, idx) {

  $defineGetterSetter(p, idx, function () {
    return this.__.arr[idx];
  }, function (new_val) {
    var pv = this.__.arr[idx];
    if (pv === new_val) {
      return;
    }
    if ($isArray(new_val)) {
      new_val = new JArray(new_val);
    }
    $assert($hasProperty(this, __ENV_EMIT__));
    var emitter = this[__ENV_EMIT__][idx];
    $assert(emitter);
    emitter.notify();

    environment_update_prop(emitter, pv, new_val, idx, true);

    this.__.arr[idx] = new_val;

  }, true, true);

}

function environment_watch_items(env, var_array, is_deep) {
  /*
   * build emit tree
   */
  var i, v, n, env_props = env[__ENV_INNER__];
  var e_node = env_props.nodes;
  var ch = e_node.children;
  for (i = 0; i < var_array.length; i++) {
    v = var_array[i];
    n = ch[v];
    if (!n) {
      n = ch[v] = new EmitNode(v, e_node, env);
    }
    e_node = n;
    ch = e_node.children;
  }

  var val, emitter, is_array;
  var props;
  var p = env;

  for (i = 0; i < var_array.length; i++) {
    if (!$isObject(p)) {
      break;
    }
    v = var_array[i];
    is_array = $isJArray(p);
    val = is_array ? p.__.arr[v] : p[v];
    if ($isArray(val)) {
      val = new JArray(val);
      if (is_array) {
        p.__.arr[v] = val;
      }
    }
    props = p[__ENV_EMIT__];
    if (!props) {
      props = {};
      $defineProperty(p, __ENV_EMIT__, props);
    }
    emitter = props[v];
    if (!emitter) {
      emitter = props[v] = new Emitter();
    }

    emitter.add(e_node, i);

    if (is_array) {
      environment_define_arr_prop(p, v);
    } else {
      environment_define_obj_prop(p, v, val);
    }

    p = val;
  }

  return e_node;
}

/*
 * 将a.b[4][3][7].c.d[9]转成a.b.4.3.7.c.d.9的形式。
 */
function environment_var2format(var_name) {
  return var_name.replace('][', '.', 'g').replace('].', '.', 'g').replace('[', '.', 'g').replace(']', '');
}

$defineProperty(__env_prototype, '$unwatch', function (listener_id) {
  //var lt = this.__.listeners,
  //    listener = lt[listener_id];
  //if(!listener) {
  //    return;
  //}
  //delete lt[listener_id];
  //environment_unwatch_listener(listener);
});

$defineProperty(__env_prototype, '$watch', function (var_name, callback, data, is_deep) {

  if (typeof callback !== 'function') {
    throw new Error('$watch need function');
  }

  if ($isObject(var_name)) {
    return environment_watch_expression(this, var_name, callback, data);
  }

  if (!$isString(var_name) || !__jing_regex_var.test(var_name)) {
    throw new Error('$watch wrong format');
  }

  var v_str = environment_var2format(var_name);
  var v_items = $map(v_str.split('.'), function (item) {
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

  var listener = new Listener(callback, data);
  env[__ENV_INNER__].listeners[listener.id] = listener;
  var emit_node = environment_watch_items(this, v_items, is_deep);
  emit_node.pv = emit_node.cv = emit_node._val(); //initialize value
  emit_node.addListener(listener);

  return listener;
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
  function expr_prop(expr, v_arr) {
    var nb = expr.nodes[1];
    if (nb.type === 'constant') {
      v_arr.push(nb.value);
      if (expr.parent && expr.parent.type === 'property') {
        expr_prop(expr.parent, v_arr);
      }
    }
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

  var is_lazy = lazy_time !== false;
  var listener = new ExprListener(var_tree, expr, env, callback, data, lazy_time);

  for (var i = 0; i < watch_array.length; i++) {
    environment_watch_items(env, watch_array[i], listener);
  }

  env.__.listeners[listener.id] = listener;

  listener.cur_value = listener.pre_value = expr.exec(env);

  return listener;
}