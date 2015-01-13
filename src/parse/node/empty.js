function EmptyGrammarNode() {
    this.base('empty');
}
parse_inherit_node(EmptyGrammarNode, function() {
    return null;
});