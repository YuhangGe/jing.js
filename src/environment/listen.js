var __environment_listen_counter = 0;

function Listener(handler, data) {
    this.id = (__environment_listen_counter++).toString(36);
    this.handler = handler;
    this.data = data;
    this.emitters = [];
}
Listener.prototype = {
    destroy : function() {
        this.handler = null;
        this.data = null;
        this.emitters.length = 0;
        this.emitters = null;
    },
    notify : function() {
        //throw 'abstract method Listener.notify';
    },
    _deal : function() {
        //throw 'abstract method Listener.deal';
    }
};

function LazyListener(handler, data, lazy_time) {
    this.base(handler, data);
    this.lazy = $isNumber(lazy_time) ? ((lazy_time = Math.floor(lazy_time)) >=0 ? lazy_time : 0) : 0;
    this.tm = null;
    this.dg = $bind(this, this._deal);
    this.changes = [];
}
LazyListener.prototype = {
    notify : function(emit_type, var_path) {
        if(this.tm !== null) {
            clearTimeout(this.tm);
            this.tm = null;
        }
        this.changes.push(var_path);
        this.tm = setTimeout(this.dg, this.lazy);
    },
    destroy : function() {
        this.callBase('destroy');
        this.changes = null;
        if(this.tm !== null) {
            clearTimeout(this.tm);
            this.tm = null;
        }
        this.dg = null;
    }
};
$inherit(LazyListener, Listener);

function ImmExprListener(var_tree, expr, env, handler, data) {
    this.base(handler, data);
    this._init(var_tree, expr, env);
}
ImmExprListener.prototype = {
    _init : function(var_tree, expr, env) {
        this.expr = expr;
        this.var_tree = var_tree;
        this.env = env;
        this.pre_value = null;
        this.cur_value = null;
        this.compare = true;
    },
    notify : function(emit_type, var_name) {
        var n = this.var_tree[var_name];
        if(!n) {
            return;
        }
        listen_refresh_expr_node(n);

        this._deal();
    },
    /*
     * notify_change
     */
    _deal : function() {

        this.cur_value = this.expr.exec(this.env);
        if(this.compare && this.cur_value === this.pre_value) {
            return;
        }
        this.handler([{
            type : 'expr',
            pre_value : this.pre_value,
            cur_value : this.cur_value
        }], this.data);
        this.pre_value = this.cur_value;

    },
    destroy : function() {
        this.callBase('destroy');
        destroy_expr_listener(this);
    }
};

$inherit(ImmExprListener, Listener);

function LazyExprListener(var_tree, expr, env, handler, data, lazy_time) {
    this.base(handler, data, lazy_time);
    ImmExprListener.prototype._init.call(this, var_tree, expr, env);
}

LazyExprListener.prototype = {
    _deal : function() {
        var i, c, n_arr, j;
        for(i=0;i<this.changes.length;i++) {
            c = this.changes[i];
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
        /*
         * 这样写只是为了省一点代码。
         * LazyExprListener不仅继承了LazyListener的性质，也继承了ImmExprListener的一些性质。
         */
        ImmExprListener.prototype._deal.call(this);

    },
    destroy : function() {
        this.callBase('destroy');
        destroy_expr_listener(this);
    }
};
$inherit(LazyExprListener, LazyListener);

function destroy_expr_listener(listener) {
    listener.expr.destroy();
    listener.expr = null;
    listener.env = null;
    for(var k in listener.var_tree) {
        delete listener.var_tree[k];
    }
    listener.var_tree = null;
    listener.pre_value = null;
    listener.cur_value = null;
}

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
