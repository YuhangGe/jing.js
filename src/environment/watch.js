/*
 * 尽可能使用一个不会被使用的名称来作为内部成员。
 */
var __environment_watch_inner_prop_name = '__$ge.jing.0210.prop$__';
var __environment_watch_inner_emit_name = '__$ge.jing.0210.emit$__';
var __environment_emit_type_value = 0;
var __environment_emit_type_array = 1;

/*
 * __environment_watch_inner_prop_name和__environment_watch_inner_emit_name在压缩时，
 *   会被检测到未被改写过，也就是常数，从而被替换为常数，避免闭包。
 *
 * 但var_name还是难以避免地成为闭包变量。
 *   通过Object.defineProperty定义的getter和setter如果能取得当前getter/setter的名称，
 *   就可以解决var_name的闭包问题。
 *
 */
function environment_declare_var(p, var_name, value) {
    if($isArray(value)) {

    } else {
        $defineGetterSetter(p, var_name, function() {
            return this[__environment_watch_inner_prop_name][var_name];
        }, function(val) {
            var prop = this[__environment_watch_inner_prop_name],
                pre_val = prop[var_name];
            if(pre_val === val) {
                return;
            }
            prop[var_name] = val;
            this[__environment_watch_inner_emit_name][var_name].tell(__environment_emit_type_value, val);
        });
    }
}

function environment_watch_each_var(p, var_name, et) {
    var ps, val, e_tree;
    if(!$hasProperty(p, __environment_watch_inner_prop_name)) {
        ps = {};
        $defineProperty(p, __environment_watch_inner_prop_name, ps);
    } else {
        ps = p[__environment_watch_inner_prop_name];
    }
    if(!$hasProperty(p, __environment_watch_inner_emit_name)) {
        e_tree = {};
        $defineProperty(p, __environment_watch_inner_emit_name, e_tree);
    } else {
        e_tree = p[__environment_watch_inner_emit_name];
    }

    if(!$hasProperty(ps, var_name)) {
        if(!$hasProperty(p, var_name)) {
            throw 'property '+ var_name + ' not found.'
        }
        val = p[var_name];
        delete p[var_name];
        ps[var_name] = val;
        environment_declare_var(p, var_name, val);
    }

    if(!$hasProperty(e_tree, var_name)) {
        e_tree[var_name] = new Emitter(var_name);
    }

    if(et && !$hasProperty(et.children, var_name)) {
        et.children[var_name] = e_tree[var_name];
    }
}

function environment_watch_vars(env, var_name, listener) {
    var var_array = var_name.split('.');
    var p = env, vn, i, et = null;
    for(i=0;i<var_array;i++) {
        vn = var_array[i];
        environment_watch_each_var(p, vn, et);
        p = p[__environment_watch_inner_prop_name][vn];
        et = p[__environment_watch_inner_emit_name][vn];
        if(!$isObject(p)) {
            throw('watch need object.');
        }
    }
    if(i>0) {
        ps[__environment_watch_inner_emit_name][vn].listeners.push(listener);
    }
}

$defineProperty(__env_prototype, '$watch', function(var_name, callback, data, lazy_time) {
    if(typeof callback !== 'function') {
        log('$watch need function');
        return;
    }
    var i, listener;
    var lazy = ($isUndefined(lazy_time) && $isNumber(data)) ? data : ($isNumber(lazy_time)?lazy_time:0);
    listener = new Listener(var_name, callback, data, lazy);
    if($isString(var_name)) {
        environment_watch_vars(this, var_name.trim(), listener);
    } else if($isArray(var_name)) {
        for(i=0;i<var_name.length;i++) {
            environment_watch_vars(this, var_name[i].trim(), listener);
        }
    } else if($isObject(var_name)) {
        //watch expression

    }

});