function ConstantGrammarNode(value) {
    this.base('constant', []);
    this.value = value;
    this.cached = true;
}
parse_inherit_node(ConstantGrammarNode, function() {
    return this.value;
}, {
    exec : function() {
        return this.value;
    },
    increment : function(scope, is_add, is_prefix) {
        return this.value +(is_add? 1:0);
    }
});