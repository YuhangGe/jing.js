function PropertyGrammarNode(var_node, prop_node) {
    this.base('property', [var_node, prop_node], {
        writable : true
    });
}
parse_inherit_node(PropertyGrammarNode, function() {
    var variable = this.nodes[0].exec(),
        prop_name = this.nodes[1].exec();
    if(variable === 'null') {
        return null
    } else {
        return $hasProperty(variable, prop_name) ? variable[prop_name] : null;
    }
});