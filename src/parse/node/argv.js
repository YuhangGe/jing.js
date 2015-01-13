function ArgumentGrammarNode(expr_node) {
    this.base('argument', [expr_node]);
}
parse_inherit_node(ArgumentGrammarNode, function(scope) {
    for(var i=0;i<this.nodes.length;i++) {
        this.nodes[i].exec(scope);
    }
}, {
    merge : function(expr_node) {
        if(expr_node.type === 'argument') {
            [].push.apply(this.nodes, expr_node.nodes);
        } else {
            this.nodes.push(expr_node);
        }
    }
});