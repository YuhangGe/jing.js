function ConstantGrammarNode(value) {
    this.base('constant');
    this.value = value;
}
parse_inherit_node(ConstantGrammarNode, function() {
    return this.value;
}, {
    increment : function(scope, is_add, is_prefix) {
        return this.value +(is_add? 1:0);
    }
});