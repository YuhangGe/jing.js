function Environment(name, parent) {
    $defineProperty(this, '__', {
        prop : $bind(this, environment_reg_props),
        //bind : $bind(this, environment_reg_binds),
        name : name,
        children : {},
        parent : parent ? parent : null,

        emit_tree : RootEmitNode(),
        emit_map : {},
        listeners : {},
        //以下字段是给j-repeat的子Env用的。
        jarray : null,
        index : 0
    });
    $defineProperty(this, __env_emit_name, {});
    $defineProperty(this, __env_prop_name, {});
    $defineProperty(this, __env_env_name, this);

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
$defineProperty(__env_prototype, '$parse', function(expression_string) {
    return parse_expression(expression_string);
});
$defineGetterSetter(__env_prototype, '$root', function() {
    return this.__.parent ? this.__.parent.$root : this;
});


$defineProperty(__env_prototype, '$destroy', function() {
    function destroy_obj(obj) {
        for(var k in obj) {
            obj[k] = null;
        }
    }
    var k, cd = this.__.children;
    for(k in cd) {
        cd[k].$destroy();
        cd[k] = null;
    }
    this.__.children = null;
    this.__.parent = null;
    //这里不要调用this.__.emit_tree.destroy()
    //因为它的子emit_node可能在其它environment被使用。
    this.__.emit_tree = null;
    var ls = this.__.listeners;
    for(k in ls) {
        environment_unwatch_listener(ls[k]);
        ls[k] = null;
    }
    this.__.listeners = null;
    destroy_obj(this[__env_emit_name]);
    destroy_obj(this[__env_prop_name]);
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

function environment_remove_listeners(env) {
    var ls = env.__.listeners, k;
    for(k in ls) {
        environment_unwatch_listener(ls[k]);
        delete ls[k];
    }
    for(k in env.__.children) {
        environment_remove_listeners(env.__.children[k]);
    }
}

function environment_notify_change(env, emit_keys) {
    var i;
    for(i=0;i<emit_keys.length;i++) {
        notify_each(env, emit_keys[i]);
    }

    function notify_each(env, key) {
        var em = env.__.emit_map,
            e_node = em[key];
        if(!e_node) {
            throw new Error('emit node not found!');
        }
        e_node.notify();
    }
}