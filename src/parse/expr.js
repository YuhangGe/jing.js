var __parse_node_stack = [];
var __parse_op_stack = [];
var __parse_expr_stack = [];

var __parse_op_priority = {

    '#' : 50, //用这个字符表示函数调用。函数调用的优先级小于属性获取"."和“[]”以及参数“,”，高于其它运算符。

    '.' : 100,
    '[]' : 100,

    '+' : 0,
    '-' : 0,
    '*' : 1,
    '/' : 1,
    '++' : 10,
    '--' : 10,
    '!' : 5,

    ',' : -20, //函数调用参数列表的优先级低于其它。
    '|' : -10 //过滤器filter的优先级也很低
};

/**
 * 以下代码使用逆波兰表达式生成语法树。
 */

function parse_expression(expr_str) {
    parse_init(expr_str);
    parse_read_char(true);

    if(__parse_chr === null) {
        return new EmptyGrammarNode();
    }

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

function parse_expr() {
    var last_op;
    var pre_chr;
    var cur_op;

    while(__parse_chr !== null) {
        //if(__parse_chr === '+' || __parse_chr === '-') {
        // todo prefix ++a
        //} else
        if(parse_is_number_char(__parse_chr)) {
            parse_push_node(new NumberGrammarNode(parse_number()));
            parse_read_char(true);
        } else if(parse_is_variable_char(__parse_chr)) {
            parse_push_node(new VariableGrammarNode(parse_variable()));
            parse_read_char(true);
        } else  if(__parse_chr === ';') {
            parse_reduce_op();
            if(__parse_node_stack.length > 0) {
                __parse_expr_stack.push(__parse_node_stack.pop());
                if(__parse_node_stack.length > 0) {
                    parse_error();
                }
            }
            parse_read_char(true);
            break;
        } else if(__parse_chr==='"' || __parse_chr==='\'') {
            pre_chr = __parse_chr;
            parse_read_char(false);
            parse_push_node(new StringGrammarNode(parse_string(pre_chr)));
            parse_read_char(true);
            break;
        } else if(__parse_chr === '(' || __parse_chr === '[') {
            pre_chr = parse_look_before(1);
            if(__parse_chr === '[') {
                if(!parse_is_variable_char(pre_chr)) {
                    parse_error();
                } else {
                    //这种情况是属性获取。当然也包括数组访问。
                    __parse_op_stack.push('[]');
                }
            }
            if(__parse_chr === '(' && parse_is_variable_char(pre_chr)) {
                //这种情况下是函数调用，额外放入一个#符。
                __parse_op_stack.push('#');
            }

            __parse_op_stack.push(__parse_chr);
            parse_read_char(true);


        } else if(__parse_chr === ')' || __parse_chr === ']') {

            parse_reduce_op(__parse_chr===')' ? '(' : '[');
            parse_read_char(true);

        } else if($hasProperty(__parse_op_priority, __parse_chr)) {
            last_op = parse_op_last();
            cur_op = parse_look_after(1);
            if((__parse_chr === '+' || __parse_chr === '-') && __parse_chr === cur_op) {
                cur_op = __parse_chr + cur_op;
                parse_read_char();
            } else {
                cur_op = __parse_chr;
            }
            if(last_op !== null && __parse_op_priority[cur_op] <= __parse_op_priority[last_op]) {
                __parse_op_stack.pop();
                parse_deal_op(last_op);
            }
            __parse_op_stack.push(cur_op);
            parse_read_char(true);

        } else {
            parse_error();
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
        case '++':
        case '--':
        case '!':
            node_a = parse_pop_node();
            tmp = new CalcGrammarNode(op, node_a, node_b);
            if(node_a.type === 'number') {
                tmp = new NumberGrammarNode(tmp.exec());
            }
            parse_push_node(tmp);
            break;
        case '+':
        case '-':
        case '*':
        case '/':
            node_b = parse_pop_node();
            node_a = parse_pop_node();
            tmp = new CalcGrammarNode(op, node_a, node_b);
            if(node_a.type === 'number' && node_b.type === 'number') {
                /*
                 * 如果是两个常数运算，在parse期间就把数据算出来。这是一个很小的优化。
                 */
                tmp = new NumberGrammarNode(tmp.exec());
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