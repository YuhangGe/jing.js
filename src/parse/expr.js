var __parse_node_stack = [];
var __parse_op_stack = [];
var __parse_token_pre_type = 'emp';

/*
 * 运算符优先级。第一个数字是优先级，第二个数字表示是从左到右还是从右到左。
 */
var __parse_op_priority = {
    '(' : [9000, 0],

    '[' : [300, 0],
    '.' : [300, 0],

    'F' : [200, 0], //用这个字符表示函数调用。函数调用的优先级小于属性获取"."和“[]”，高于其它运算符。


    '#++' : [90, 0], //自增(运算符在后)
    '#--' : [90, 0], //自减(运算符在后)



    '!' : [80, 1],
    '~' : [80, 1],
    '+#' : [80, 1], //一元加(正号)
    '-#' : [80, 1], //一元减(负号)
    '++#' : [80, 1], //自增(运算符在前)
    '--#' : [80, 1], //自减(运算符在前)

    '*' : [70, 0],
    '/' : [70, 0],
    '%' : [70, 0],

    '#+' : [60, 0],
    '#-' : [60, 0],

    '<<': [50, 0],
    '>>': [50, 0],
    '>>>': [50, 0],

    '<' : [40, 0],
    '>' : [40, 0],
    '<=':[40, 0],
    '>=':[40, 0],

    '==': [30, 0],
    '===': [30, 0],
    '!=' : [30, 0],
    '!==' : [30, 0],

    '&' : [20, 0],
    '^' : [19, 0],
    '|' : [18, 0],
    '&&' : [17, 0],
    '||' : [16, 0],

    '?' : [15, 1],
    ':' : [15, 1],

    '=' : [10, 1],
    '>>=' : [10, 1],
    '<<=' : [10, 1],
    '>>>=' : [10, 1],
    '+=': [10, 1],
    '-=' : [10, 1],
    '*=' : [10, 1],
    '/=' : [10, 1],
    '%=' : [10, 1],
    '&=' : [10, 1],
    '^=' : [10, 1],
    '|=' : [10, 1],

    '->' : [-10, 0], //过滤器filter的优先级也很低

    ',' : [-20, 0] //函数调用参数列表的优先级低于其它。

};

/**
 * 以下代码使用逆波兰表达式生成语法树。
 */

function parse_expression(expr_str) {
    __parse_token_pre_type = 'emp';
    parse_token_init(expr_str);

    parse_expr();

    parse_reduce_op();


    var root_node;
    if(__parse_node_stack.length === 0) {
        root_node =  new EmptyGrammarNode();
    } else if(__parse_node_stack.length === 1) {
        root_node = __parse_node_stack[0];
    } else {
        root_node = new GrammarNode('root', $copyArray(__parse_node_stack));
    }

    __parse_node_stack.length = 0;

    return root_node;

}

function parse_error() {
    throw 'parse error';
}

function parse_meet_op(op) {
    switch (op) {
        case ';':
            parse_reduce_op();
            break;
        case '(':
            if(__parse_token_pre_type === 'var') {
                __parse_op_stack.push('F');
                __parse_node_stack.push(new ArgumentGrammarNode([]));
            }
            __parse_op_stack.push(op);
            break;
        case ')':
        case ']':
            parse_reduce_op(op === ')' ? '(' : '[');
            break;
        case '+':
        case '-':
        case '++':
        case '--':
            parse_check_op(__parse_token_pre_type === 'op' ? op + '#' : '#' + op);
            break;
        default :
            parse_check_op(op);
            break;
    }
}

function parse_check_op(op) {
    var last_op, last_pri;
    var pri = __parse_op_priority[op];
    while(__parse_op_stack.length > 0) {
        last_op = __parse_op_stack[__parse_op_stack.length-1];
        last_pri = __parse_op_priority[last_op];
        if(pri[0] < last_pri[0] || (pri[0] === last_pri[0] && pri[1]===0)) {
            __parse_op_stack.pop();
            parse_deal_op(last_op);
        } else {
            break; //important!
        }
    }
    __parse_op_stack.push(op);
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
                    parse_push_node(new ConstantGrammarNode(__parse_token_value === 'true'));
                } else {
                    parse_push_node(new VariableGrammarNode(__parse_token_value));
                }
                __parse_token_pre_type = 'var';
                break;
            case 'num':
                parse_push_node(new ConstantGrammarNode(Number(__parse_token_value)));
                __parse_token_pre_type = 'num';
                break;
            case 'str':
                parse_push_node(new ConstantGrammarNode(__parse_token_value));
                __parse_token_pre_type = 'str';
                break;
            case 'op':
                parse_meet_op(__parse_token_value);
                __parse_token_pre_type = 'op';
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
    var last_node, last_pre_node;
    if(op === '('
        && cur_op === '('
        && parse_op_last() === 'F') {
        last_node =  __parse_node_stack[__parse_node_stack.length-1];
        if(last_node && last_node.type !== 'argument' || last_node.nodes.length >0) {
            last_pre_node = __parse_node_stack[__parse_node_stack.length-2];
            if(!last_pre_node || last_pre_node.type === 'argument' || last_pre_node.nodes.length) {
                throw 'something strange wrong';
            }
            last_pre_node.merge(last_node);
            parse_pop_node();
        }
    }
}

function parse_deal_op(op) {
    var node_a, node_b, tmp;
    switch (op) {
        case 'F':
            node_b = parse_pop_node();
            node_a = parse_pop_node();
            parse_push_node(new FunctionCallGrammarNode(node_a, node_b));
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
            tmp = node_b.type==='variable' ? new ConstantGrammarNode(node_b.var_name) : node_b;
            parse_push_node(new PropertyGrammarNode(node_a, tmp));
            break;
        case '[]':
            node_b = parse_pop_node();
            node_a = parse_pop_node();
            parse_push_node(new PropertyGrammarNode(node_a, node_b));
            break;
        case '?' :
        case ':' :
            node_b = parse_pop_node();
            node_a = parse_pop_node();
            parse_push_node(new ConditionGrammarNode(op, node_a, node_b));
            break;
            break;

        case '++#':
        case '--#':
        case '#++':
        case '#--':
        case '+#':
        case '-#':
        case '!':
        case '~':
            node_a = parse_pop_node();
            tmp = new CalcGrammarNode(op, node_a, node_b);
            if(node_a.type === 'number') {
                tmp = new ConstantGrammarNode(tmp.exec());
            }
            parse_push_node(tmp);
            break;
        case '=':
        case '+=':
        case '-=':
        case '*=':
        case '/=':
        case '%=':
        case '>>=':
        case '>>>=':
        case '<<=':
        case '&=':
        case '^=':
        case '|=':
            node_b = parse_pop_node();
            node_a = parse_pop_node();
            tmp = new SetGrammarNode(op, node_a, node_b);
            parse_push_node(tmp);
            break;
        case '#+':
        case '#-':
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