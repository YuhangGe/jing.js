var __parse_node_stack = [];
var __parse_op_stack = [];
var __parse_expr_stack = [];

var __parse_op_priority = {

    '#' : 50, //用这个字符表示函数调用。函数调用的优先级小于属性获取"."和“[]”以及参数“,”，高于其它运算符。

    '.' : 100,
    '[]' : 100,



    '++' : 90,
    '--' : 90,
    '!' : 80,
    '~' : 80,

    '*' : 70,
    '/' : 70,
    '%' : 70,

    '+' : 60,
    '-' : 60,

    '<<': 50,
    '>>': 50,
    '>>>': 50,

    '<' : 40,
    '>' : 40,
    '<=':40,
    '>=':40,

    '==': 30,
    '===': 30,
    '!=' : 30,
    '!==' : 30,

    '&' : 20,
    '^' : 19,
    //'|' : 18, 这里本来是有|运算符，但为了方便起见，我们把它用作了filter
    '&&' : 17,
    '||' : 16,

    '?' : 15,
    ':' : 15,

    '=' : 10,

    '|' : -10, //过滤器filter的优先级也很低
    ',' : -20 //函数调用参数列表的优先级低于其它。

};

/**
 * 以下代码使用逆波兰表达式生成语法树。
 */

function parse_expression(expr_str) {
    parse_token_init(expr_str);

    parse_expr();

    parse_reduce_op();

    if(__parse_node_stack.length > 0) {
        __parse_expr_stack.push(__parse_node_stack.pop());
        if(__parse_node_stack.length > 0) {
            parse_error();
        }
    }

    if(__parse_expr_stack.length === 0) {
        return new EmptyGrammarNode();
    }

    var root_node = __parse_expr_stack.length>1 ? new GrammarNode('root', $copyArray(__parse_expr_stack)) : __parse_expr_stack[0];

    __parse_expr_stack.length = 0;

    return root_node;

}

function parse_error() {
    throw 'parse error';
}

function parse_meet_op(op) {
    switch (op) {
        case ';':
            parse_reduce_op();
            if(__parse_node_stack.length > 0) {
                __parse_expr_stack.push(__parse_node_stack.pop());
                if(__parse_node_stack.length > 0) {
                    parse_error();
                }
            }
            break;
        case '(':
            //if(parse_is_variable_char(pre_chr)) {
                //这种情况下是函数调用，额外放入一个#符。
                //__parse_op_stack.push('#');
            //}
            __parse_op_stack.push(op);
            break;
        case '[':
            //这种情况是属性获取。当然也包括数组访问。
            __parse_op_stack.push('[]');
            __parse_op_stack.push(op);
            break;
        case ')':
        case ']':
            parse_reduce_op(op === ')' ? '(' : '[');
            break;
        default :
            var last_op;

            while((last_op = parse_op_last()) !== null && __parse_op_priority[op] <= __parse_op_priority[last_op]) {
                __parse_op_stack.pop();
                parse_deal_op(last_op);
            }
            __parse_op_stack.push(op);
            break;
    }
}

function parse_expr() {

    while(!__parse_token_EOF) {
        parse_token_lex();
        if(__parse_token_type === 'op' && ( __parse_token_value === '\'' || __parse_token_value==='"')) {
            __parse_token_value = parse_token_string(__parse_token_type);
            __parse_token_type = 'str';
        }
        switch (__parse_token_type) {
            case 'var':
                if(__parse_token_value === 'true' || __parse_token_value === 'false') {
                    parse_push_node(new VariableGrammarNode(__parse_token_value));
                } else {
                    parse_push_node(new ConstantGrammarNode(__parse_token_value === 'true'));
                }
                break;
            case 'num':
                parse_push_node(new ConstantGrammarNode(Number(__parse_token_value)));
                break;
            case 'str':
                parse_push_node(new ConstantGrammarNode(__parse_token_value));
                break;
            case 'op':
                parse_meet_op(__parse_token_value);
                break;
            default :
                break;
        }
    }
}

function parse_reduce_op(op) {
    var cur_op = null;
    while(__parse_op_stack.length > 0) {
        cur_op = __parse_op_stack.pop();
        if(op && cur_op === op) {
            break; //important!!
        } else {
            parse_deal_op(cur_op);
        }
    }
    if(op && cur_op === null) {
        parse_error('括号不匹配');
    }
}

function parse_deal_op(op) {
    var node_a, node_b, tmp;
    switch (op) {
        case '#':
            node_b = parse_pop_node();
            //if(node_b.type !== 'argument') {
            //    node_a = node_b;
            //    tmp = new EmptyGrammarNode();
            //} else {
            //    tmp = node_b;
            //    node_a = parse_pop_node();
            //}

            parse_push_node(new FunctionCallGrammarNode(node_a, tmp));
            break;
        case ',':
            node_b = parse_pop_node();
            node_a = parse_pop_node();
            if(node_a.type === 'argument') {
                tmp = node_a;
            } else {
                tmp = new ArgumentGrammarNode(node_a);
            }
            tmp.merge(node_b);
            parse_push_node(tmp);
            break;
        case '.':
            node_b = parse_pop_node();
            node_a = parse_pop_node();
            tmp = node_b.type==='variable' ? new StringGrammarNode(node_b.var_name):node_b;
            parse_push_node(new PropertyGrammarNode(node_a, tmp));
            break;
        case '[]':
            node_b = parse_pop_node();
            node_a = parse_pop_node();
            parse_push_node(new PropertyGrammarNode(node_a, node_b));
            break;
        case '?' :
        case ':' :
            //todo
            break;
        case '++':
        case '--':
        case '!':
        case '~':

            node_a = parse_pop_node();
            tmp = new CalcGrammarNode(op, node_a, node_b);
            if(node_a.type === 'number') {
                tmp = new ConstantGrammarNode(tmp.exec());
            }
            parse_push_node(tmp);
            break;

        case '+':
        case '-':
        case '*':
        case '/':
        case '%':
        case '<<':
        case '>>':
        case '>>>':
        case '==':
        case '===':
        case '>':
        case '<':
        case '&':
        case '&&':
        case '|':
        case '||':
        case '!=':
        case '!==':
        case '^':
            node_b = parse_pop_node();
            node_a = parse_pop_node();
            tmp = new CalcGrammarNode(op, node_a, node_b);
            if(node_a.type === 'constant' && node_b.type === 'constant') {
                /*
                 * 如果是两个常数运算，在parse期间就把数据算出来。这是一个很小的优化。
                 */
                tmp = new ConstantGrammarNode(tmp.exec());
            }
            parse_push_node(tmp);
            break;
    }

}

function parse_op_last() {
    return __parse_op_stack.length > 0 ? __parse_op_stack[__parse_op_stack.length-1] : null;
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