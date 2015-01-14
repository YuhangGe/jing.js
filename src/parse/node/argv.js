function ArgumentGrammarNode(args_node) {
    this.base('argument', args_node instanceof Array ? args_node : [args_node]);
}
parse_inherit_node(ArgumentGrammarNode, function(scope) {
    for(var i=0;i<this.nodes.length;i++) {
        this.nodes[i].exec(scope);
    }
}, {
    merge : function(expr_node, left) {
        var nodes = expr_node.type === 'argument' ? expr_node.nodes : [expr_node];
        if(left) {
            [].unshift.apply(this.nodes, nodes);
        } else {
            [].push.apply(this.nodes, nodes);
        }
    }
});