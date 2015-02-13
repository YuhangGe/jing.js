function ArrayGrammarNode(args_node) {
    this.base('array', $isArray(args_node) ? args_node : [args_node]);
}
parse_inherit_node(ArrayGrammarNode, function(env) {
    var array = [];
    for(var i=0;i<this.nodes.length;i++) {
        array.push(this.nodes[i].exec(env));
    }
    return array;
}, {
    concat : function(expr_node, left) {
        var nodes = expr_node.type === 'array' ? expr_node.nodes : [expr_node];
        if(left) {
            [].unshift.apply(this.nodes, nodes);
        } else {
            [].push.apply(this.nodes, nodes);
        }
    }
});