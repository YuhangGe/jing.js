var __parse_node_stack = [];
var __parse_op_stack = [];
var __parse_is_pre_token_var = false;
var __parse_in_node = null;
var __parse_node_need_cache = true;

/*
 * 运算符优先级。第一个数字是优先级，第二个数字表示是从左到右还是从右到左。
 */
var __parse_op_priority = {

    'A' : [400, 0], //Array的构造函数，优先级最高
    '.' : [200, 0],
    'F' : [300, 0], //用字符F表示函数调用。


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

    ',' : [-20, 0], //多个元素分隔（包括函数调用参数列表）优先级

    '(' : [-1000, 0] //括号并算是严格的运算符。


};

/**
 * 以下代码生成语法树。
 */

function parse_expression(expr_str, node_need_cache) {
    __parse_is_pre_token_var = false;
    __parse_in_node = null;
    __parse_node_need_cache = node_need_cache ? true : false;
    parse_token_init(expr_str);

    try {
        parse_expr();
        parse_reduce_op();
    } catch(ex) {
        console.log(ex.message);
        console.log(ex.stack);
    }



    var root_node;
    if(__parse_node_stack.length === 0) {
        root_node =  new EmptyGrammarNode();
    } else if(__parse_node_stack.length === 1) {
        root_node = __parse_node_stack[0];
    } else {
        root_node = new GrammarNode('root', $copyArray(__parse_node_stack));
        root_node.need_cached = __parse_node_need_cache;
    }

    __parse_node_stack.length = 0;

    if(__parse_in_node !== null) {
        if(root_node.type === 'emp' || root_node.type === 'root') {
            parse_error();
        } else {
            root_node = new InGrammarNode(__parse_in_node, root_node);
        }
    }



    return root_node;

}

function parse_error() {
    __parse_node_stack = [];
    __parse_op_stack = [];
    throw 'parse error';
}

function parse_meet_op(op) {
    switch (op) {
        case ';':
            parse_reduce_op();
            break;
        case '(':
            if(__parse_is_pre_token_var) {
                parse_check_op('F');
                __parse_op_stack.push('A');
                parse_push_node(new EmptyGrammarNode());
            }
            __parse_op_stack.push('(');
            break;
        case '[':
            if(__parse_is_pre_token_var) {
                /*
                 * 中括号相当于 .() ，也就是先运算括号内，再取Property
                 */
                parse_check_op('.');
                __parse_op_stack.push('(');
            } else {
                /*
                 * 中括号是数组
                 */
                __parse_op_stack.push('A');
                parse_push_node(new EmptyGrammarNode());

                __parse_op_stack.push('(');
            }
            break;
        case ')':
        case ']':
            parse_reduce_op('(');
            break;
        case '+':
        case '-':
        case '++':
        case '--':
            parse_check_op(__parse_is_pre_token_var ? '#' + op : op + '#');
            break;
        default :
            parse_check_op(op);
            break;
    }
    __parse_is_pre_token_var = (op === ')' || op === ']');
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
            __parse_token_value = parse_token_string(__parse_token_value);
            __parse_token_type = 'str';
        }
        switch (__parse_token_type) {
            case 'var':
                switch(__parse_token_value) {
                    case 'true':
                    case 'false':
                        parse_push_node(new ConstantGrammarNode(__parse_token_value === 'true'));
                        __parse_is_pre_token_var = true;
                        break;
                    case 'in':
                        if(__parse_op_stack.length !== 0
                            || __parse_node_stack.length !== 1
                            || __parse_node_stack[0].type !== 'variable'
                            || __parse_in_node !== null) {
                            throw 'grammar wrong: in';
                        }
                        __parse_in_node = __parse_node_stack.pop().var_name;
                        __parse_is_pre_token_var = false;
                        break;
                    default:
                        parse_push_node(new VariableGrammarNode(__parse_token_value));
                        __parse_is_pre_token_var = true;
                        break;
                }
                break;
            case 'num':
                parse_push_node(new ConstantGrammarNode(Number(__parse_token_value)));
                __parse_is_pre_token_var = true;
                break;
            case 'str':
                parse_push_node(new ConstantGrammarNode(__parse_token_value));
                __parse_is_pre_token_var = true;
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
}

function parse_deal_op_F() {
    var node_b = parse_pop_node();
    var node_a = parse_pop_node();
    var ctx = parse_op_last() === '.';
    if(node_b.type === 'array') {
        var cont = true;
        for(var i=0;i<node_b.nodes.length;i++) {
            if(!parse_is_constant(node_b.nodes[i])) {
                cont = false;
                break;
            }
        }
        if(cont) {
            //如果参数列表全部是常数，则转成常数Node
            node_b = new ConstantGrammarNode(node_b._exec());
        }
    } else if(!parse_is_constant(node_b)) {
        throw 'parse_deal_op_F: something strange wrong.'
    }

    if(ctx && node_a.type === 'variable') {
        node_a = new ConstantGrammarNode(node_a.var_name);
    }
    var tmp = new FunctionCallGrammarNode(null, node_a, node_b);
    /*
     * tmp.nodes是函数调用的三个部分：
     *    nodes[0]是调用上下文，caller
     *    nodes[1]是函数名，callee
     *    nodes[2]是函数调用参数，arguments
     */
    if(ctx) {
        __parse_op_stack.pop();
        node_b = parse_pop_node();
        if(parse_is_constant(node_b) && parse_is_constant(tmp.nodes[1]) && parse_is_constant(tmp.nodes[2])) {
            //诸如 '[1,2,3,4,5,6].slice(2,5).join("")'这样可以直接计算的函数调用，则直接计算。
            tmp = new ConstantGrammarNode(node_b.value[tmp.nodes[1].value].apply(node_b.value, tmp.nodes[2].value));
        } else {
            tmp.nodes[0] = node_b;
            node_b.parent = tmp;
        }
    }
    parse_push_node(tmp);
}

function parse_deal_op(op) {
    var node_a, node_b, tmp;
    switch (op) {
        case 'F':
            parse_deal_op_F();
            break;
        case 'A':
            node_a = parse_pop_node();
            tmp = new ArrayGrammarNode([]);
            node_b = true;
            while(node_a.type !== 'empty') {
                tmp.nodes.unshift(node_a);
                if(!parse_is_constant(node_a)) {
                    node_b = false;
                }
                node_a = parse_pop_node();
            }
            if(node_b) {
                //如果所有元素都是常数，则优化成ConstantGrammarNode。
                tmp = new ConstantGrammarNode(tmp._exec());
            }
            parse_push_node(tmp);
            break;
        case ',':
            //node_b = parse_pop_node();
            //node_a = parse_pop_node();
            //if(node_a.type === 'array') {
            //    tmp = node_a;
            //} else {
            //    tmp = new ArrayGrammarNode(node_a);
            //}
            //tmp.concat(node_b);
            //parse_push_node(tmp);
            //元素分隔不作任何处理。
            break;
        case '.':
            node_b = parse_pop_node();
            node_a = parse_pop_node();
            node_b = node_b.type==='variable' ? new ConstantGrammarNode(node_b.var_name) : node_b;
            if(parse_is_constant(node_a) && parse_is_constant(node_b)) {
                tmp = new ConstantGrammarNode(node_a.value[node_b.value]);
            } else {
                tmp = new PropertyGrammarNode(node_a, node_b);
            }
            parse_push_node(tmp);
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
            if(parse_is_constant(node_a) && parse_is_constant(node_b)) {
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
    node.need_cached = __parse_node_need_cache;
    __parse_node_stack.push(node);
}

function parse_is_constant(node) {
    return node.type === 'constant';
}