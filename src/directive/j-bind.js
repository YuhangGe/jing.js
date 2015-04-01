
directive_create('j-bind', function() {
  return function(drive_module, directive_module, env, element, attr_value) {
    //todo 支持除了<input>外的单向绑定
    directive_data_bind(drive_module, directive_module, env, element, attr_value, false);
  };
});