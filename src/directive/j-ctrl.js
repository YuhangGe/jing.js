directive_create('j-ctrl', __SCOPE_TYPE_PARENT, function() {

    return function(module, scope, element, attr_value) {
        var ctrl = module.controller(attr_value);
        ctrl.bind_scope(scope);
    }

});