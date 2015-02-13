function FunctionCallGrammarNode(func_node, argv_node, context) {
    this.base('function', [func_node, argv_node]);
    this.context = context ? context : null;
}
parse_inherit_node(FunctionCallGrammarNode, function(env) {
    var fn = this.nodes[0].exec(env), func, ctx;
    if(this.context === null) {
        func = fn;
        ctx = env;
    } else {
        ctx = this.context.exec(env);
        func = ctx[fn];
    }
    if(!$isFunction(func)) {
        return;
    }
    var args = this.nodes[1].exec(env);
    return func.apply(ctx, args);
}, {
    toString : function() {
        return 'func';
    }
});