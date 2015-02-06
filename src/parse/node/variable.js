function VariableGrammarNode(var_name) {
    this.base('variable', []);
    this.var_name = var_name;
}
parse_inherit_node(VariableGrammarNode, function(env) {
    return env.$get(this.var_name);
}, {
    increment : function(env, is_add, is_prefix) {
        var val = this.exec(env),
            new_val = val + (is_add ? 1 : -1);
        env.$set(this.var_name, new_val);
        return is_prefix ?  new_val : val;
    },
    set : function(env, value) {
        env.$set(this.var_name, value);
    }
});