function EmptyGrammarNode() {
    this.base('emp');
}
parse_inherit_node(EmptyGrammarNode, function() {
    return null;
});