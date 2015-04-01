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
        var emitter = emit_map[eid];
        if ($isObject(val)) {
          environment_deep_rm_emitter(val, emitter.id, emit_map);
        }
        emit_map[eid] = null;
      }

    props[v] = null;
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
