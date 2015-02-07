function ArgumentGrammarNode(args_node) {
    this.base('argument', args_node instanceof Array ? args_node : [args_node]);
}
parse_inherit_node(ArgumentGrammarNode, function(env) {
    var argvs = [];
    for(var i=0;i<this.nodes.length;i++) {
        argvs.push(this.nodes[i].exec(env));
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