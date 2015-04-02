directive_create('j-class', function () {
  function apply_class(ele, pre, cur) {
    ele.className = (ele.className.replace(pre.trim(), '') + ' ' + cur).trim();
  }

  return function (drive_module, directive_module, env, element, attr_value) {
    var listener;
    if (__jing_regex_var.test(attr_value)) {
      listener = env.$watch(attr_value, on_change, false, element);
    } else {
      var expr = parse_expression(attr_value, true);
      listener = environment_watch_expression(env, expr, on_change, element);
    }
    function on_change(cur_value, pre_value, ele) {
      apply_class(ele, pre_value, cur_value);
    }
    apply_class(element, '', listener.cv);
  }
});