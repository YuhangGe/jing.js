function FunctionCallGrammarNode(func_node, argv_nodes) {
    var nodes = [func_node];
    if(!$isArray(argv_nodes)) {
        argv_nodes = [argv_nodes];
    }
    [].push.apply(nodes, argv_nodes);
    this.base('function', nodes, {
        readable : false
    });
}
parse_inherit_node(FunctionCallGrammarNode, function() {

}, {
    toString : function() {
        return 'func';
    }
});