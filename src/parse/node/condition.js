function ConditionGrammarNode(op, left_node, right_node) {
    var nodes = [left_node];
    if(op === '?' && right_node.type === 'condition') {
        [].push.apply(nodes, right_node.nodes);
    } else { // op === ':'
        nodes.push(right_node);
    }
    this.base('condition', nodes);
}
parse_inherit_node(ConditionGrammarNode, function(env) {
    var ns = this.nodes;
    return ns[0].exec(env) ? ns[1].exec(env) : ns[2].exec(env);
});