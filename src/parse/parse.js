function GrammarNode(type, child_nodes) {
    this.type = type;
    this.nodes = child_nodes ? child_nodes : [];
    this.parent = null;
    for(var i=0;i<this.nodes.length;i++) {
        //try{
            this.nodes[i].parent = this;
        //} catch(e){
        //    debugger;
        //}
    }
    /*
     * 以下成员用来对表达式的值进行缓存。
     * need_cached如果为false，则不缓存。用于 j-click 等情况。
     * need_cached如果为true，则缓存，用于{{expr}}等情况。
     */
    this.value = null;
    this.cached = false;
    this.need_cached = true;
}
GrammarNode.prototype = {
    increment : function(scope, is_add, is_prefix) {
        return this.exec(scope);
    },
    _exec : function(scope) {
        return this.nodes[0].exec(scope);
    },
    exec : function(scope) {
        if(!this.need_cached) {
            return this._exec(scope);
        } else {
            var val;
            if(this.cached) {
                val = this.value;
            } else {
                val = this._exec(scope);
                this.value = val;
                this.cached = true;
            }
            return val;
        }
    },
    set : function(scope) {
    },
    destroy : function() {
        var ns = this.nodes;
        for(var i=0;i<ns.length;i++) {
            ns[i].destroy();
            ns[i] = null;
        }
        ns.length = 0;
        this.nodes = null;
    }
};

function parse_inherit_node(node, do_exec_func, other_proto) {
    node.prototype._exec = do_exec_func;
    if(other_proto) {
        $extend(node.prototype, other_proto);
    }
    $inherit(node, GrammarNode);
}