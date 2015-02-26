directive_create('j-on', function() {
    return function(drive_module, directive_module, env, element, attr_value) {
        var m = event_check_directive(attr_value);
        if(!m) {
            throw 'j-on format wrong.';
        }
        var expr = parse_expression(m.expr);
        event_on(element, m.on, function() {
            expr.exec(env);
        });
    }
});
directive_create('j-click', function() {
    /*
     * todo j-click应该进一步考虑触屏。
     */
    return function(drive_module, directive_module, env, element, attr_value) {
        var expr = parse_expression(attr_value);
        event_on(element, 'click', function() {
            expr.exec(env);
        });
    }
});
directive_create(['j-mousedown', 'j-md', 'j-mouse-down'], function() {
    return function(drive_module, directive_module, env, element, attr_value) {
        var expr = parse_expression(attr_value);
        event_on(element, 'mousedown', function() {
            expr.exec(env);
        });
    }
});