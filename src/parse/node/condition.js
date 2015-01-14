function ConditionGrammarNode(left_node, right_node) {
    var nodes = [left_node];
    if(right_node.type === 'condition') {
        [].push.apply(nodes, right_node.nodes);
    } else {
        nodes.push(right_node);
    }
    this.base('condition', nodes);
}
parse_inherit_node(ConditionGrammarNode, function(scope) {
    var ns = this.nodes;
    return ns[0] ? ns[1] : ns[2];
});