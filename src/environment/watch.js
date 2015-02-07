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
function environment_declare_var(p, var_name, value, emit_node) {
    p[__env_prop_name][var_name] = value;
    p[__env_emit_name][var_name] = emit_node;
    $defineGetterSetter(p, var_name, function () {
        return this[__env_prop_name][var_name];
    }, function (val) {
        var props = this[__env_prop_name];
        if($isObject(props[var_name]) && $isObject(val)) {
            var en = this[__env_emit_name][var_name];
            environment_redeclare_var(en, val);
            props[var_name] = val;
        } else {
            props[var_name] = val;
        }
        this[__env_emit_name][var_name].notify();
    });
}

function environment_redeclare_var(emit_node, obj) {
    var k, cs = emit_node.children, val, ps;
    for(k in cs) {
        if (!$hasProperty(obj, __env_prop_name)) {
            ps = {};
            $defineProperty(obj, __env_prop_name, ps);
        } else {
            ps = obj[__env_prop_name];
        }
        if(!$hasProperty(obj, __env_emit_name)) {
            $defineProperty(obj, __env_emit_name, {});
        }
        if($hasProperty(obj, k)) {
            val = obj[k];
            delete obj[k];
            environment_declare_var(obj, k, val, cs[k]);
            environment_redeclare_var(cs[k], val);
        }
    }
}

function environment_declare_array(p, var_name, arr, emit_node) {
    p[__env_prop_name][var_name] = new JArray(arr);
    p[__env_emit_name][var_name] = emit_node;
    $defineGetterSetter(p, var_name, function () {
        return this[__env_prop_name][var_name];
    }, function (val) {
        //if(!$isArray(val)) {
        //    //如果把一个本来的Array类型又变成其它类型，则不被允许。
        //    throw "can't set array to other type.";
        //} else {
        //    val = new JArray(val);
        //}
        ////对原来的JArray进行消毁
        //struct_destroy_jarray(this[__env_prop_name][var_name]);
        //this[__env_prop_name][var_name] = val;
        //this[__env_emit_name][var_name].notify(val);
        log('不允许覆盖array');
    });
}
function environment_watch_each_var(p, var_name, emit_node) {
    var ps, val;
    if (!$hasProperty(p, __env_prop_name)) {
        ps = {};
        $defineProperty(p, __env_prop_name, ps);
    } else {
        ps = p[__env_prop_name];
    }
    if(!$hasProperty(p, __env_emit_name)) {
        $defineProperty(p, __env_emit_name, {});
    }

    if (!$hasProperty(ps, var_name)) {
        if (!$hasProperty(p, var_name)) {
            throw 'property ' + var_name + ' not found.'
        }
        val = p[var_name];
        delete p[var_name];
        if($isArray(val)) {
            environment_declare_array(p, var_name, new JArray(val));
        } else {
            environment_declare_var(p, var_name, val, emit_node);
        }
    }
    return ps[var_name];
}

function environment_watch_var_str(env, var_name, listener, is_lazy) {
    /*
     * 将a.b[4][3][7].c.d[9]转成a.b.4.3.7.c.d.9的形式。
     */
    var v_arr = var_name.replace(/\[\s*(\d+)\s*\]/g, ".$1.").replace(/\.{2}/g, '.').split('.');

    environment_watch_items(env, v_arr, listener, is_lazy);


}

function environment_get_emit_node(env, var_array) {

    function get_node(parent, name) {
        var n = parent.children[name];
        if(!n) {
            n = parent.children[name] = new EmitNode(name, parent);
        }
        return n;
    }
    var root = env.__.emit_tree, //root emit node
        e_node = get_node(root, var_array[0]);
    var i;
    for(i=1;i<var_array.length;i++) {
        e_node = get_node(e_node, var_array[i]);
    }
    return e_node;
}

function environment_watch_items(env, var_array, listener, is_lazy) {
    var e_node = environment_get_emit_node(env, var_array);
    var emitter = is_lazy ? e_node.L_emitter : e_node.I_emitter;
    if(emitter === null) {
        if(is_lazy) {
            emitter = new LazyEmitter(e_node);
            e_node.L_emitter = emitter;
        } else {
            emitter = new ImmEmitter(e_node);
            e_node.I_emitter = emitter;
        }
    }
    emitter.listeners.push(listener);
    var p = env, vn, i, et = env.__.emit_tree;
    var en, cp;
    for (i = 0; i < var_array.length; i++) {
        if (!$isObject(p)) {
            throw('$watch need object.');
        }
        vn = var_array[i];
        en = et.children[vn];
        cp = environment_watch_each_var(p, vn, en);
        p = cp;
        et = en;
    }
}


$defineProperty(__env_prototype, '$watch', function (var_name, callback, data, lazy_time) {
    if (typeof callback !== 'function') {
        log('$watch need function');
        return;
    }

    var i, listener, imm = lazy_time === false;

    listener = imm ? new ImmListener(callback, data) : new LazyListener(callback, data, $isNumber(lazy_time) ? lazy_time : 0);

    if ($isString(var_name)) {
        environment_watch_var_str(this, var_name.trim(), listener, !imm);
    } else if ($isArray(var_name)) {
        for (i = 0; i < var_name.length; i++) {
            environment_watch_var_str(this, var_name[i].trim(), listener, !imm);
        }
    } else {
        log('$watch wrong format');
    }
});


function environment_watch_expr_loop(expr_node, watch_array, var_tree) {
    function expr_prop(expr, v_arr) {
        var nb = expr.nodes[1];
        if(nb.type === 'constant') {
            v_arr.push(nb.value);
        }
        if(expr.parent && expr.parent.type === 'property') {
            expr_prop(expr.parent, v_arr);
        }
    }

    if(expr_node.type === 'variable') {
        var vn = [expr_node.var_name];
        if(expr_node.parent.type === 'property') {
            expr_prop(expr_node.parent, vn);
        }
        watch_array.push(vn);
        var_tree[vn.join('.')] = expr_node;
    } else {
        for(var i=0;i<expr_node.nodes.length;i++) {
            environment_watch_expr_loop(expr_node.nodes[i]);
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
    var listener = is_lazy ? new LazyExprListener(var_tree, expr, callback, data, $isNumber(lazy_time) ? lazy_time : 0) : new ImmListener(callback, data);

    for (var i = 0; i < watch_array.length; i++) {
        environment_watch_items(env, watch_array[i], listener, is_lazy);
    }





}