function StringGrammarNode(value) {
    this.base('string');
    this.value = value;
}
parse_inherit_node(StringGrammarNode, function() {
    return this.value;
});

function NumberGrammarNode(value) {
    this.base('number');
    this.value = typeof value !== 'number' ? Number(value) : value;
}
parse_inherit_node(NumberGrammarNode, function() {
    return this.value;
});