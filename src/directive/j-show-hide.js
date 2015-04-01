(function () {

  function apply_show_hide(ele, show) {
    ele.style.setProperty('display', show ? '' : 'none', '');
  }

  function directive_show_hide(drive_module, directive_module, env, element, attr_value, show) {
    var listener;
    if (__jing_regex_var.test(attr_value)) {
      listener = env.$watch(attr_value, on_change, false, element);
    } else {
      var expr = parse_expression(attr_value, true);
      listener = environment_watch_expression(env, expr, on_change, element);
    }


    function on_change(val, pre_value, ele) {
      apply_show_hide(ele,  show ? (val ? true : false) : (val ? false : true));
    }
    var val = listener.cv;

    apply_show_hide(element,  show ? (val ? true : false) : (val ? false : true));


  }

  directive_create('j-show', function () {
    return function (drive_module, directive_module, env, element, attr_value) {
      directive_show_hide(drive_module, directive_module, env, element, attr_value, true);
    }
  });

  directive_create('j-hide', function () {
    return function (drive_module, directive_module, env, element, attr_value) {
      directive_show_hide(drive_module, directive_module, env, element, attr_value, false);
    }
  })
})();