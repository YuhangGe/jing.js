/*
 * Auto Generate by jslex
 */
var __parse_token_no_action = -1;
var __parse_token_unknow_char = -2;
var __parse_token_unmatch_char = -3;

var __parse_token_type = '';
var __parse_token_value = '';

var __parse_int_array = Int32Array;
var __parse_token_TABLE = {
    b: new __parse_int_array(18),
    d: new __parse_int_array(18),
    c: new __parse_int_array(29),
    n: new __parse_int_array(29),
    a: new __parse_int_array(18),
    e: new __parse_int_array(256)
};
function __parse_token_str2arrs(strs, arrs) {
    for(var j = 0; j < strs.length; j++) {
        var str = strs[j], arr = arrs[j], t = str.charCodeAt(0), len = str.length, c = 0;
        for(var i = 1; i < len; i++) {
            if(t === 0)
                arr[i - 1] = str.charCodeAt(i) - 1;
            else {
                var n = str.charCodeAt(i) - 1, v = str.charCodeAt(i + 1) - 1;
                for(var k = 0; k < n; k++) {
                    arr[c] = v;
                    c++;
                }
                i++;
            }
        }
    }
}
__parse_token_str2arrs(["\1\10\1\5\3\2\6\2\16", "\1\15\0\2\5", "\0\0\0\6\7\3\4\10\11\12\13\5\13\14\14\15\15\15\15\15\15\15\15\15\0","\0\0\0\1\1\1\1\3\4\1\13\5\13\14\14\2\6\7\10\11\12\14\2\13\0", "\0\2\1\2\2\5\1\1\1\1\1\3\4\0", "\1\12\1\5\13\24\1\2\13\3\2\2\1\2\12\3\1\5\2\2\3\2\1\2\4\2\11\2\2\13\10\3\2\2\7\2\5\2\6\2\2\2\1\33\12\2\2\2\1\2\2\2\1\2\12\2\1\33\12\x86\1"], [__parse_token_TABLE.b, __parse_token_TABLE.d, __parse_token_TABLE.c, __parse_token_TABLE.n, __parse_token_TABLE.a, __parse_token_TABLE.e]);

var MAIN______DEFAULT = 12;

var __parse_token_src = null,
    __parse_token_idx = 0,
    __parse_token_end = 0,
    __parse_token_chr = -1;

var __parse_token_state = 12;
var __parse_token_EOF = true;
var __parse_token_yystack = [];

function parse_token_init(src) {
    __parse_token_src = src;
    __parse_token_end = src.length;
    __parse_token_idx = 0;
    __parse_token_chr = -1;
    __parse_token_EOF = false;
}

function parse_token_lex() {
    if(__parse_token_EOF) {
        return;
    }

    var _yylen = 0;
    var state = __parse_token_state, action = __parse_token_no_action;
    var pre_idx = __parse_token_idx, pre_action = __parse_token_no_action, pre_act_len = 0;

    while (true) {
        if (__parse_token_read_ch() < 0) {
            if (pre_action >= 0) {
                action = pre_action;
                _yylen = pre_act_len;
                __parse_token_idx = pre_idx + pre_act_len;
            } else if (pre_idx < __parse_token_end) {
                action = __parse_token_unmatch_char;
                __parse_token_idx = pre_idx + 1;
            }
            if (pre_idx >= __parse_token_end) {
                __parse_token_EOF = true;
            }
            break;
        } else {
            _yylen++;
        }
        var eqc = __parse_token_TABLE.e[__parse_token_chr];
        if (eqc === undefined) {
            if (pre_action >= 0) {
                action = pre_action;
                _yylen = pre_act_len;
                __parse_token_idx = pre_idx + pre_act_len;
            } else
                action = __parse_token_unknow_char;
            break;
        }
        var offset, next = -1, s = state;

        while (s >= 0) {
            offset = __parse_token_TABLE.b[s] + eqc;
            if (__parse_token_TABLE.c[offset] === s) {
                next = __parse_token_TABLE.n[offset];
                break;
            } else {
                s = __parse_token_TABLE.d[s];
            }
        }

        if (next < 0) {
            if (pre_action >= 0) {
                action = pre_action;
                _yylen = pre_act_len;
                __parse_token_idx = pre_idx + pre_act_len;
            } else {
                action = __parse_token_unmatch_char;
                __parse_token_idx = pre_idx + 1;
            }
            //跳出内层while，执行对应的action动作
            break;
        } else {
            state = next;
            action = __parse_token_TABLE.a[next];
            if (action >= 0) {
                /**
                 * 如果action>=0，说明该状态为accept状态。
                 */
                pre_action = action;
                pre_act_len = _yylen;
            }
        }
    }
    __parse_token_value = __parse_token_src.substr(pre_idx, _yylen);

    parse_token_action(action);

}

function __parse_token_read_ch() {
    if (__parse_token_idx >= __parse_token_end)
        return __parse_token_chr = -1;
    else {
        __parse_token_chr = __parse_token_src[__parse_token_idx++].charCodeAt(0);
        return __parse_token_chr;
    }
}

function parse_token_action (action) {
    switch (action) {
        case __parse_token_unknow_char:
            break;
        case __parse_token_unmatch_char:
            break;

        case 1:

            __parse_token_type = 'op';

            break;
        case 4:

            __parse_token_type = 'emp';

            break;
        case 2:

            __parse_token_type = 'var';

            break;
        case 3:

            __parse_token_type = 'num';

            break;
        case 0:

            __parse_token_type = 'op';

            break;
        default:
            break;
    }
}

function parse_token_string(quote) {
    var chr, idx = __parse_token_idx, e_idx = idx;
    while((chr = __parse_token_src[e_idx++]) && chr !== quote) {

    }
    var not_end = chr === quote;
    __parse_token_idx = not_end ? e_idx+1:e_idx;
    __parse_token_EOF = not_end ? __parse_token_EOF : true;
    return __parse_token_src.substring(idx, not_end ? e_idx-1: e_idx);
}
