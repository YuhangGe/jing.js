function ConstantGrammarNode(value) {
    this.base('constant', []);
    this.value = value;
}
parse_inherit_node(ConstantGrammarNode, function() {
    return this.value;
});