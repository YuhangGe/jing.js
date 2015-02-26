function SetGrammarNode(op, left_node, right_node) {
    this.op = op;
    this.base('set', [left_node, right_node]);
}
parse_inherit_node(SetGrammarNode, function(env) {
    var r = this.nodes[1].exec(env),
        l = this.nodes[0].exec(env);
    var val = r;
    switch (this.op) {
        case '=':
            break;
        case '>>=':
            val = l>>r;
            break;
        case '<<=':
            val = l<<r;
            break;
        case '>>>=':
            val = l>>>r;
            break;
        case '+=':
            val = l+r;
            break;
        case '-=':
            val = l-r;
            break;
        case '*=':
            val = l*r;
            break;
        case '%=':
            val = l%r;
            break;
        case '/=':
            val = l/r;
            break;
        case '&=':
            val = l&r;
            break;
        case '^=':
            val = l^r;
            break;
        case '|=':
            val = l | r;
            break;
    }

    this.nodes[0].set(env, val);
    return val;
});