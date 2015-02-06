/**
 * j-style可以使用两种方式。
 *   一种是使用嵌入表达式，
 *   比如<div j-style="background: {{bg-color}}; font-size:{{size}}"></div>。
 *   一种是使用完整表达式，
 *   比如<div j-style="st"></div>，其中st是在environment里定义的变量，可以是字符串也可以是json
 */
directive_create('j-style', function() {
    return function(drive_module, directive_module, env, element, attr_value) {
        var expr_pieces = drive_get_expr_pieces(attr_value);
        if(expr_pieces.length === 0) {

        } else {

        }
    }
});