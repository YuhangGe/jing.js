function CalcGrammarNode(operator, left_node, right_node) {
    this.base('calc', [left_node, right_node]);
    this.operator = operator;
}
parse_inherit_node(CalcGrammarNode, function(scope) {
    var nodes = this.nodes;
    switch (this.operator) {
        case '+':
            return nodes[0].exec(scope) + nodes[1].exec(scope);
            break;
        case '-':
            return nodes[0].exec(scope) - nodes[1].exec(scope);
            break;
        case '*':
            return nodes[0].exec(scope) * nodes[1].exec(scope);
            break;
        case '/':
            return nodes[0].exec(scope) / nodes[1].exec(scope);
            break;
        case '++':
            return nodes[0].increment(scope, true);
            break;
        case '--':
            return nodes[0].increment(scope, false);
            break;
        case '!':
            return !nodes[0].exec(scope);
            break;
        case '>':
            return nodes[0].exec(scope) > nodes[1].exec(scope);
            break;
        case '<':
            return nodes[0].exec(scope) < nodes[1].exec(scope);
            break;
        case '>>':
            return nodes[0].exec(scope) >> nodes[1].exec(scope);
            break;
        case '>>>':
            return nodes[0].exec(scope) >>> nodes[1].exec(scope);
            break;
        case '<<':
            return nodes[0].exec(scope) << nodes[1].exec(scope);
            break;
        case '==':
            return nodes[0].exec(scope) == nodes[1].exec(scope);
            break;
        case '===':
            return nodes[0].exec(scope) === nodes[1].exec(scope);
            break;
    }
});