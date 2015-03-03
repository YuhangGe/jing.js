(function() {

    function apply_show_hide(ele, show) {
        ele.style.setProperty('display', show ? '' : 'none', '');
    }

    function directive_show_hide(drive_module, directive_module, env, element, attr_value, show) {
        var expr = parse_expression(attr_value);



        var listener = environment_watch_expression(env, expr, (show ? function(change_list, data) {
            apply_show_hide(data.ele, change_list[0].cur_value ? true : false);
        } : function(change_list, data) {
            apply_show_hide(data.ele, change_list[0].cur_value ? false : true);
        }), {
            ele : element
        }, 10);

        var val = listener.cur_value,
            is_show = show ? (val ? true : false) : (val ? false : true);

        apply_show_hide(element, is_show);


    }

    directive_create('j-show', function() {
        return function(drive_module, directive_module, env, element, attr_value) {
            directive_show_hide(drive_module, directive_module, env, element, attr_value, true);
        }
    });

    directive_create('j-hide', function() {
        return function(drive_module, directive_module, env, element, attr_value) {
            directive_show_hide(drive_module, directive_module, env, element, attr_value, false);
        }
    })
})();