function ImmListener(handler, data) {
    this.handler = handler;
    this.data = data;
}
ImmListener.prototype = {
    notify : function(var_name, cur_value, pre_value) {
        this.handler([{
            var_name : var_name,
            pre_value : pre_value,
            cur_value : cur_value
        }], this.data);
    }
};

function ImmExprListener(var_tree, expr, env, handler, data, lazy_time) {
    this.handler = handler;
    this.data = data;
    this.expr = expr;
    this.var_tree = var_tree;
    this.env = env;
    this.pre_value = expr.exec(env);
    this.cur_value = this.pre_value;
}
ImmExprListener.prototype = {
    notify : function(var_name, cur_value, pre_value) {
        var n = this.var_tree[var_name];
        if(!n) {
            return;
        }
        listen_refresh_expr_node(n);
        this.cur_value = this.expr.exec(this.env);
        if(this.cur_value === this.pre_value) {
            return;
        }
        this.handler([{
            expr : this.expr,
            env : this.env,
            pre_value : this.pre_value,
            cur_value : this.cur_value
        }], this.data);

        this.pre_value = this.cur_value;

    }
};

function LazyListener(handler, data, lazy_time) {
    this.handler = handler;
    this.data = data;
    this.lazy = $isNumber(lazy_time) ? ((lazy_time = Math.floor(lazy_time)) >=0 ? lazy_time : 0) : 0;
    this.timeout = null;
    this.delegate = $bind(this, this.deal);
    this.changes = [];
}
LazyListener.prototype = {
    notify : function(var_name, cur_value, pre_value) {
        if(this.timeout !== null) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
        this.changes.push({
            var_name : var_name,
            pre_value : pre_value,
            cur_value : cur_value
        });
        this.timeout = setTimeout(this.delegate, this.lazy);
    },
    deal : function() {
        this.handler(this.changes, this.data);
        this.changes.length = 0;
    }
};

function LazyExprListener(var_tree, expr, env, handler, data, lazy_time) {
    this.base(handler, data, lazy_time);
    this.expr = expr;
    this.var_tree = var_tree;
    this.env = env;
    this.pre_value = expr.exec(env);
    this.cur_value = this.pre_value;
}
function listen_refresh_expr_node(node) {
    /*
     * 如果node.cached===false，说明当前node及其父亲树都已经被refresh过了，
     *   不需要再次遍历。这是一个简单的优化。
     */
    if(node.cached === false) {
        return;
    }
    if(node.parent) {
        listen_refresh_expr_node(node.parent);
    }
    node.cached = false;
}

LazyExprListener.prototype = {
    deal : function() {
        var i, c, n, k;
        for(i=0;i<this.changes.length;i++) {
            c = this.changes[i];
            n = this.var_tree[c.var_name];
            if(!n) {
                continue;
            }
            n.cached = false;
        }
        for(k in this.var_tree) {
            listen_refresh_expr_node(this.var_tree[k]);
        }
        this.changes.length = 0;
        this.cur_value = this.expr.exec(this.env);
        if(this.cur_value === this.pre_value) {
            return;
        }
        this.handler([{
            expr : this.expr,
            env : this.env,
            pre_value : this.pre_value,
            cur_value : this.cur_value
        }], this.data);

        this.pre_value = this.cur_value;
    }
};
$inherit(LazyExprListener, LazyListener);