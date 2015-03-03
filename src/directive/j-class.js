directive_create('j-class', function() {
    function apply_class(ele, pre, cur) {
        ele.className = (ele.className.replace(pre.trim(), '') + ' ' + cur).trim();
    }
    return function(drive_module, directive_module, env, element, attr_value) {

        var expr = parse_expression(attr_value, true);

        var listener = environment_watch_expression(env, expr, function(change_list, ele) {
            apply_class(ele, change_list[0].pre_value, change_list[0].cur_value);
        }, element, 10);

        apply_class(element, '', listener.cur_value);
    }
});