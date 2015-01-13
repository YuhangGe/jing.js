function GrammarNode(type, child_nodes, properties) {
    this.type = type;
    this.nodes = child_nodes ? child_nodes : [];
    this.props = $merge({
        writable : false //是否是可以写入的类型。比如 ng-model=''这种指令就需要writable为true
    }, properties);
}
GrammarNode.prototype = {
    increment : function(scope, is_add) {
        return this.exec(scope);
    },
    exec : function(scope) {
        return this.nodes[0].exec(scope);
    }
};

function parse_inherit_node(node, exec_func, other_proto) {
    node.prototype.exec = exec_func;
    if(other_proto) {
        $extend(node.prototype, other_proto);
    }
    $inherit(node, GrammarNode);
}


var __parse_text = '';
var __parse_idx = 0;
var __parse_end = 0;
var __parse_chr = '';

function parse_is_space(char) {
    //空字符其实还有很多，但考虑代码中可能出现的情况，基本就下面四种。
    return char === ' ' || char === '\r' || char === '\t' || char === '\n';
}
function parse_read_char(ignore_space) {
    if(__parse_idx === __parse_end) {
        __parse_chr = null;
        return __parse_chr;
    }
    __parse_chr = __parse_text.charAt(__parse_idx++);
    ignore_space = ignore_space ? true : false;
    while(ignore_space && parse_is_space(__parse_chr)) {
        if(__parse_idx === __parse_end) {
            __parse_chr = null;
            return __parse_chr;
        }
        __parse_chr = __parse_text.charAt(__parse_idx++);
    }

    return __parse_chr;
}

function parse_is_number_char(chr) {
    return chr >= '0' && chr <= '9';
}
function parse_is_variable_char(chr) {
    return (chr >= 'a' && chr <= 'z')
        ||(chr>='A' && chr<= 'Z')
        || (chr >= '0' && chr <= '9')
        || chr === '_' || chr === '$';
}


function parse_error() {
    throw 'parse error: ' + __parse_text;
}

function parse_read_when(condition_func) {
    var start_idx = __parse_idx- 1,
        idx = start_idx;
    var chr;
    while((chr=idx<__parse_end ? __parse_text[idx] : null) !== null && condition_func(chr)) {
        idx++;
    }
    __parse_chr = chr;
    __parse_idx = idx;
    return __parse_text.substring(start_idx, idx);
}

function parse_number() {
    return parse_read_when(function(chr) {
        return (chr >= '0' && chr <= '9') || chr === '.'
    });
}

function parse_variable() {
   return parse_read_when(parse_is_variable_char);
}

function parse_read_until(char) {
    var start_idx = __parse_idx-1,
        idx = __parse_idx-1;
    var chr;
    while((chr = idx<__parse_end ? __parse_text[idx] : null) !== null
    && chr !== char) {
        idx++;
    }
    __parse_idx = idx;
    return __parse_text.substring(start_idx, idx);
}

function parse_string(quote) {
    return parse_read_until(quote);
}
function parse_init(text) {
    __parse_text = text;
    __parse_idx = 0;
    __parse_end = text.length;
}

function parse_look_after(count) {
    return __parse_text.substring(__parse_idx,__parse_idx + count);
}
function parse_look_before(count) {
    return __parse_text.substring(__parse_idx - count - 1, __parse_idx-1);
}
function parse_skip_space() {
    while(__parse_chr !== null && parse_is_space(__parse_chr)) {
        __parse_idx++;
        __parse_chr = __parse_idx < __parse_end ? __parse_text[__parse_idx] : null;
    }
}