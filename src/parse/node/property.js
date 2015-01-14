function PropertyGrammarNode(var_node, prop_node) {
    this.base('property', [var_node, prop_node], {
        writable : true
    });
}
parse_inherit_node(PropertyGrammarNode, function(scope) {
    var variable = this.nodes[0].exec(scope),
        prop_name = this.nodes[1].exec(scope);
    if(variable === null) {
        return null
    } else {
        return $hasProperty(variable, prop_name) ? variable[prop_name] : null;
    }
}, {
    increment : function(scope, is_add, is_prefix) {
        var variable = this.nodes[0].exec(scope),
            prop_name = this.nodes[1].exec(scope);
        if(variable === null || !$hasProperty(variable, prop_name)) {
            return null
        } else {
            var val = variable[prop_name],
                new_val = val+(is_add ? 1 : -1);
            variable[prop_name] = new_val;
            return is_prefix ? new_val : val;
        }
    }
});