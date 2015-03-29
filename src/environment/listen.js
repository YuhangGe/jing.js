function Listener(handler, data) {
    this.id = $uid();
    this.handler = handler;
    this.data = data;
    this.emitters = {};
}
Listener.prototype = {
    destroy : function() {
        this.handler = null;
        this.data = null;
        for(var k in this.emitters) {
            this.emitters[k] = null;
        }
        this.emitters = null;
    },
    notify : function(var_path, cur_value, pre_value) {
        this.handler(cur_value, pre_value);
    }
};


function LazyListener(handler, data, lazy_time) {
    this.base(handler, data);
    this.lazy = $isUndefined(lazy_time) ? 0 : lazy_time;

    this.pv = null;
    this.cv = null;

    this.tm = null;
    this.dg = $bind(this, this._deal);
    this.changes = [];
}
LazyListener.prototype = {
    _ctm : function() {
        if(this.tm !== null) {
            clearTimeout(this.tm);
            this.tm = null;
        }
    },
    notify : function(var_path, cur_value, pre_value) {
        this._ctm();
        this.tm = setTimeout(this.dg, this.lazy);
        this._notify(var_path, cur_value, pre_value);
    },
    destroy : function() {
        this.callBase('destroy');
        this._ctm();
        this.dg = null;
        this.pv = null;
        this.cv = null;
    },
    _deal : function() {
        //abstract method
    }
};
$inherit(LazyListener, Listener);

/*
 * StrListener用于连接只带属性访问的字符串的监听。比如 <p>{{boy.name}},{{boy.age}}</p>
 * 但对于更复杂的情况比如带函数调用的情况，需要使用ExprListener，比如<p>boys.slice(3,4)[0].name</p>
 */
function StrListener(var_cache, str_items, handler, data, lazy_time) {
    this.base(handler, data);
    this.lazy = $isUndefined(lazy_time) ? 0 : lazy_time;
    this.cache = var_cache;
    this.items = str_items;
    this.vc = false;
}
StrListener.prototype = {
    notify : function(var_path, cur_value, pre_value) {
        if(!$hasProperty(this.cache, var_path) || this.cache[var_path] === cur_value) {
            return;
        }
        this.callBase('notify', var_path, cur_value, pre_value);
    },
    _notify : function(var_path, cur_value, pre_value) {
        this.cache[var_path] = cur_value;
        this.vc = true;
    },
    _val : function() {
        var text = '', me = this;
        this.items.forEach(function(it) {
            text += it.type === 'var' ? me.cache[it.value] : it.value;
        });
        return text;
    },
    _deal : function() {
        if(!this.vc) {
            return;
        }
        this.vc = false;
        this.cv = this._val();
        if(this.cv === this.pv) {
            return;
        }
        this.handler(this.cv, this.pv, this.data);
        this.pv = this.cv;
    },
    destroy : function() {
        this.callBase('destroy');
        this.items.length = 0;
        for(var k in this.cache) {
            this.cache[k] = null;
        }
        this.cache = null;
    }
};
$inherit(StrListener, Listener);

function ExprListener(var_tree, expr, env, handler, data, lazy_time) {
    this.base(handler, data, lazy_time);
    this.expr = expr;
    this.var_tree = var_tree;
    this.env = env;
    this.changes = [];
}

ExprListener.prototype = {
    _notify : function() {
        this.changes.push(new EmitChange(var_path, cur_value, pre_value));
    },
    _deal : function() {
        var i, c, n_arr, j;
        for(i=0;i<this.changes.length;i++) {
            c = this.changes[i].pa;
            n_arr = this.var_tree[c];
            if(!n_arr) {
                continue;
            }
            for(j=0;j<n_arr.length;j++) {
                n_arr[j].cached = false;
                listen_refresh_expr_node(n_arr[j]);
            }
        }

        this.changes.length = 0;
        this.cv = this.expr.exec(this.env);
        if(!$isJArray(this.cv) && this.cv === this.pv) {
            return;
        }
        this.handler(this.cv, this.pv, this.data);

        this.pv = this.cv;

    },
    destroy : function() {
        this.callBase('destroy');
        this.changes.length = 0;
        this.expr.destroy();
        this.expr = null;
        this.env = null;
        for(var k in this.var_tree) {
            delete this.var_tree[k];
        }
        this.var_tree = null;
    }
};
$inherit(ExprListener, LazyListener);

function listen_refresh_expr_node(node) {
    /*
     * 如果node.cached===false，说明当前node及其父亲树都已经被refresh过了，
     *   不需要再次遍历。这是一个简单的优化。
     */
    function re_loop(node) {
        if(!node || node.cached === false) {
            return;
        }
        node.cached = false;
        re_loop(node.parent);
    }

    node.cached = false;
    re_loop(node.parent);

}
