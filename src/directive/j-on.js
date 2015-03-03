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

directive_create('j-enter', function() {
    return function(drive_module, directive_module, env, element, attr_value) {
        var expr = parse_expression(attr_value);
        event_on(element, 'keydown', function(e) {
            if(e.keyCode === 13) {
                expr.exec(env);
            }
        });
    }
});

$each(['j-click', 'j-dblclick', 'j-mousedown'], function(d_name) {
    var e_name = d_name.substring(2);
    directive_create(d_name, function() {
        return function(drive_module, directive_module, env, element, attr_value) {
            var expr = parse_expression(attr_value);
            if(e_name==='blur') {
                debugger;
            }
            event_on(element, e_name, function(e) {
                expr.exec(env);
            });
        }
    });
});

$each(['j-blur', 'j-focus', 'j-change'], function(d_name) {
    var e_name = d_name.substring(2);
    directive_create(d_name, function() {
        return function(drive_module, directive_module, env, element, attr_value) {
            var expr = parse_expression(attr_value);
            $on(element, e_name, function(e) {
                expr.exec(env);
            });
        }
    });
});
