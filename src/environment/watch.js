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
    function items2expr(items) {
        var expr = build_node_loop(items, items.length-1);
        var_tree[items.join('.')] = expr;
        return expr;
    }

    function build_node_loop(items, idx) {
        return idx === 0 ?
            new VariableGrammarNode(items[0]) :
            new PropertyGrammarNode(build_node_loop(items, idx - 1), new ConstantGrammarNode(items[idx]));
    }

    if (typeof callback !== 'function') {
        throw new Error('$watch need function');
    }

    if (!$isString(var_name) ||! /^[\w\d]+(?:(?:\.[\w\d]+)|(?:\[\s*\d+\s*\]))*$/.test(var_name)) {
        throw new Error('$watch wrong format');
    }

    var is_lazy = lazy_time !== false;
    var v_items = environment_var2items(var_name),
        expr = build_node_loop(v_items, v_items.length-1),
        var_tree = {};

    var_tree[v_items.join('.')] = [expr];

    var listener = is_lazy ? new LazyExprListener(var_tree, expr, this, callback, data, $isNumber(lazy_time) ? lazy_time : 0) : new ImmExprListener(var_tree, expr, env, callback, data);

    environment_watch_items(this, v_items, listener, is_lazy);

    this.__.listeners[listener.id] = listener;

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

    var is_lazy = lazy_time !== false;
    var listener = is_lazy ? new LazyExprListener(var_tree, expr, env, callback, data, $isNumber(lazy_time) ? lazy_time : 0) : new ImmExprListener(var_tree, expr, env, callback, data);

    for (var i = 0; i < watch_array.length; i++) {
        environment_watch_items(env, watch_array[i], listener, is_lazy);
    }

    env.__.listeners[listener.id] = listener;

    listener.cur_value = listener.pre_value = expr.exec(env);

    return listener;
}