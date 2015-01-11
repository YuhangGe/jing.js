directive_create('j-ctrl', __SCOPE_TYPE_PARENT, function() {

    return function(drive_module, directive_module, scope, element, attr_value) {
        var ctrl;
        if(attr_value.indexOf('.') >= 0) {
            var ms = module_get(attr_value, false);
            if(!ms) {
                throw 'j-ctrl: controller "'+attr_value+'" not found. module not found.';
            }
            ctrl = ms[0].controller(ms[1]);
        } else {
            ctrl = drive_module.controller(attr_value.trim());
        }
        if(!ctrl) {
            throw 'j-ctrl: controller "' + attr_value + '" not found.';
        }
        ctrl.bind_scope(drive_module, scope);
    }

});