function FunctionCallGrammarNode(context, func_node, argv_node) {
    this.base('function', [context ? context : new EmptyGrammarNode(), func_node, argv_node]);
}
parse_inherit_node(FunctionCallGrammarNode, function(env) {
    var fn = this.nodes[1].exec(env), func, ctx;
    if(this.nodes[0].type === 'empty') {
        func = fn;
        ctx = env;
    } else {
        ctx = this.nodes[0].exec(env);
        func = ctx[fn];
    }
    if(!$isFunction(func)) {
        return;
    }
    var args = this.nodes[2].exec(env);
    return func.apply(ctx, args);
}, {
    toString : function() {
        return 'func';
    }
});