directive_create('j-class', function() {
    function apply_class(ele, pre, cur) {
        ele.className = (ele.className.replace(pre, '') + ' ' + cur).trim();
    }
    return function(drive_module, directive_module, env, element, attr_value) {
        var expr = parse_expression(attr_value, true);
        log(expr);
        var listener = environment_watch_expression(env, expr, function(change_list, data) {
            apply_class(data.ele, change_list[0].pre_value, change_list[0].cur_value);
        }, {
            ele : element
        }, 10);

        apply_class(element, '', listener.cur_value);
    }
});