function FunctionCallGrammarNode(func_node, argv_node) {
    this.base('function', [func_node, argv_node]);
}
parse_inherit_node(FunctionCallGrammarNode, function(env) {
    var f = this.nodes[0].exec(env);
    if(!$isFunction(f)) {
        return;
    }
    var args = this.nodes[1].exec(env);
    return f.apply(env, args);
}, {
    toString : function() {
        return 'func';
    }
});