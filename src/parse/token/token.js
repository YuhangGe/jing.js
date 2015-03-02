var __parse_token_type = '';
var __parse_token_value = '';
var __parse_token_EOF = false;
var __parse_token_src = '';

var __parse_token_regex = new RegExp(
        //加减乘除，包括单目和双目预算以及赋值运算, +, ++, +=, -, --, -=, *, *=, /, /=, %, %=
        "(?:\\+(?:\\+?)(?:=?))|(?:\\-(?:\\-?)(?:=?))|(?:\\*(?:=?))|(?:\\/(?:=?))|(?:%(?:=?))"
        //逻辑运算, !, !=, !==, ~, ~=, &, &&, &=, |, ||, |=, ^, ^=
        + "|(?:\\!(?:={0,2}))|(?:~(?:=?))|(?:&(?:&|=)?)|(?:\\|(?:\\||=)?)|(?:\\^(?:=?))"
        //比较运算和逻辑运算，包括>, >>, >>>, >=, >>=, >>>=, <, <<, <=, <<=
        + "|(?:>(?:>{0,2})(?:=?))|(?:<(?:<?)(?:=?))"
        //等号，包括=, ==, ===
        + "|(?:=(?:={0,2}))"
        //括号和点号
        + "|\\(|\\)|\\[|\\]|\\{|\\}|\\.|\\?|\\:|;|,"
        //字符串
        + "|(?:\"[^\"]+\")|(?:'[^']+')"
        //数字
        + "|(?:\\d+(?:\\.\\d+)?)"
        //变量
        + "|(?:[a-zA-Z$_][a-zA-Z0-9$_]*)"
    , "g");

function parse_token_lex() {
    if (__parse_token_EOF) {
        return;
    }
    var token = __parse_token_regex.exec(__parse_token_src);
    if(!token) {
        __parse_token_EOF = true;
        return;
    }

    __parse_token_value = token[0];
    var fc = __parse_token_value.charCodeAt(0);

    if(fc === 39 || fc === 34) {
        __parse_token_type = 'str';
    } else if(fc>=48 && fc<=57) {
        __parse_token_type = 'num';
    } else if((fc>=97 && fc<=122) || (fc>=65 && fc<=90) || fc===36 || fc===95) {
        __parse_token_type = 'var';
    } else {
        __parse_token_type = 'op';
    }
}

function parse_token_init(src) {
    __parse_token_src = src;
    __parse_token_regex.exec(''); //clear state
    __parse_token_EOF = false;
}