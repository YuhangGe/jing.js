/**
 * Created by abraham on 15/3/9.
 */
jing.module('TodoApp').directive('todo-focus', function() {
    function apply_focus(ele, focus) {
        if(focus) {
            setTimeout(function() {
                ele.focus();
            }, 0);
        }
    }
    return function(drive_module, directive_module, env, element, attr_value) {
        var expr = parse_expression(attr_value, true);

        var listener = environment_watch_expression(env, expr, function(change_list, ele) {
            apply_focus(ele, change_list[0].cur_value);
        }, element, 10);

        apply_focus(element, listener.cur_value);

    }
});