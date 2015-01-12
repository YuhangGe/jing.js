var __parse_node_stack = [];
var __parse_expr_stack = [];

function parse_view_expression(expr_str) {
    parse_init(expr_str);
    parse_read_char(true);

    if(__parse_chr === null) {
        return new ConstantGrammarNode("");
    }

    parse_expr();

}

function parse_expect(chr) {
    if(__parse_chr !== chr) {
        parse_error();
    }
}

function parse_expr() {
    var node_a, node_b;
    var save_chr;

    while(__parse_chr !== null) {

        if(parse_is_number_char(__parse_chr)) {
            parse_push_node(new ConstantGrammarNode(Number(parse_number())));
            parse_skip_space();
            continue;
        } else if(parse_is_variable_char(__parse_chr)) {
            parse_push_node(new VariableGrammarNode(parse_variable()));
            parse_skip_space();
            continue;
        }
        switch (__parse_chr) {
            case ';' :
                if(__parse_node_stack.length > 0) {
                    __parse_expr_stack.push(__parse_node_stack.pop());
                }
                parse_read_char(true);
                break;
            case '(' :
                parse_read_char(true);

                if(__parse_node_stack.length > 0) {
                    //说明当前的括号是函数调用

                } else {
                    //说明当前的括号只是表达式优先级括号
                    parse_expr();
                    parse_expect(')');
                    parse_read_char(true);
                }

                break;
            case '"':
            case '\'':
                parse_read_char(false);
                parse_push_node(new ConstantGrammarNode(parse_string(__parse_chr)));
                parse_read_char(true);
                break;
            case '.':
                node_a = parse_pop_node();
                parse_read_char(false);
                parse_property();
                node_b = parse_pop_node();

                parse_pop_node(new PropertyGrammarNode(node_a, node_b));
                break;
            case '[':
                node_a = parse_pop_node();
                parse_read_char(true);
                parse_expr();
                parse_expect(']');
                parse_read_char(true);
                node_b = parse_pop_node();
                parse_push_node(new PropertyGrammarNode(node_a, node_b));
                break;
            case '+':
            case '-':
                save_chr = __parse_chr;
                if(parse_look_after(1) === save_chr) {
                    parse_read_char();
                    node_a = parse_pop_node();
                    parse_push_node(new CalcGrammarNode(save_chr+save_chr, node_a));
                } else {
                    node_a = parse_pop_node();
                    parse_read_char(true);
                    parse_expr();
                    node_b = parse_pop_node();
                    parse_push_node(new CalcGrammarNode(save_chr, node_a, node_b))
                }
                break;
            case '!':
                parse_read_char(true);
                parse_expr();
                node_a = parse_pop_node();
                parse_push_node(new CalcGrammarNode('!', node_a));
                break;
            case '*':
            case '/':
                save_chr = __parse_chr;
                node_a = parse_pop_node();
                parse_read_char(true);
                parse_expr();
                node_b = parse_pop_node();
                parse_push_node(new CalcGrammarNode(save_chr, node_a, node_b));
                break;
        }

    }
}

function parse_property() {
    if(parse_is_number_char(__parse_chr)) {
        parse_error();
    } else if(parse_is_variable_char(__parse_chr)) {
        parse_push_node(PropertyGrammarNode(parse_variable()));
    } else {
        parse_error();
    }
}

function parse_pop_node() {
    if(__parse_node_stack.length===0) {
        parse_error();
    }
    return __parse_node_stack.pop();
}

function parse_push_node(node) {
    __parse_node_stack.push(node);
}