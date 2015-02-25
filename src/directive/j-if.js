/**
 * Created by abraham on 15/2/25.
 */
directive_create('j-if', function() {
    function apply_insert(ele, parent, insert) {
    }
    return function(drive_module, directive_module, env, element, attr_value) {
        var expr = parse_expression(attr_value);
        var insert = expr.exec(env);

    }
});