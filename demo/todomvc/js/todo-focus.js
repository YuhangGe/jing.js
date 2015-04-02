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
        var expr = env.$parse(attr_value, true);

        var listener = env.$watch(expr, function(cv, pv, ele) {
            apply_focus(ele, cv);
        }, false, element);

        apply_focus(element, listener.cv);

    }
});