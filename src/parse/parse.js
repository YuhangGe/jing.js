function GrammarNode(type, child_nodes, properties) {
    this.type = type;
    this.nodes = child_nodes ? child_nodes : [];
    this.props = $merge({
        writable : false //是否是可以写入的类型。比如 ng-model=''这种指令就需要writable为true
    }, properties);
}
GrammarNode.prototype = {
    increment : function(scope, is_add) {
        return this.exec(scope);
    },
    exec : function(scope) {
        return this.nodes[0].exec(scope);
    }
};

function parse_inherit_node(node, exec_func, other_proto) {
    node.prototype.exec = exec_func;
    if(other_proto) {
        $extend(node.prototype, other_proto);
    }
    $inherit(node, GrammarNode);
}