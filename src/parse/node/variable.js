function VariableGrammarNode(var_name) {
    this.base('variable', [], {
        writable : true
    });
    this.var_name = var_name;
}
parse_inherit_node(VariableGrammarNode, function(scope) {
    return scope.$get(this.var_name);
}, {
    increment : function(scope, is_add) {
        var val = this.exec(scope);
        scope.$set(this.var_name, val+(is_add ? 1 : -1));
        return val;
    }
});