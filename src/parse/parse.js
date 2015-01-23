function GrammarNode(type, child_nodes, properties) {
    this.type = type;
    this.nodes = child_nodes ? child_nodes : [];
    this.props = $merge({
        writable : false //是否是可以写入的类型。比如 ng-model=''这种指令就需要writable为true
    }, properties);
}
GrammarNode.prototype = {
    increment : function(scope, is_add, is_prefix) {
        return this.exec(scope);
    },
    exec : function(scope) {
        return this.nodes[0].exec(scope);
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

function parse_inherit_node(node, exec_func, other_proto) {
    node.prototype.exec = exec_func;
    if(other_proto) {
        $extend(node.prototype, other_proto);
    }
    $inherit(node, GrammarNode);
}