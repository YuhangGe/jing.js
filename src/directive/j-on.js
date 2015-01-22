directive_create('j-on', function() {
    return function(drive_module, directive_module, env, element, attr_value) {
        var m = event_check_directive(attr_value);
        if(!m) {
            throw 'j-on format wrong.';
        }
        var expr = parse_expression(m.expr);
        element.__JING_ENV__ = env;
        event_on(element, m.on, function() {
            expr.exec(this.__JING_ENV__);
        });
    }
});