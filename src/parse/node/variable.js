function VariableGrammarNode(var_name) {
    this.base('variable', [], {
        writable : true
    });
    this.var_name = var_name;
}
parse_inherit_node(VariableGrammarNode, function(scope) {
    return scope.$get(this.var_name);
}, {
    increment : function(scope, is_add, is_prefix) {
        var val = this.exec(scope),
            new_val = val + (is_add ? 1 : -1);
        scope.$set(this.var_name, new_val);
        return is_prefix ?  new_val : val;
    },
    set : function(scope, value) {
        scope.$set(this.var_name, value);
    }
});