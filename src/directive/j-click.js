directive_create('j-click', function() {
    return function(drive_module, directive_module, scope, element, attr_value, attr_name) {
        var handler = scope[attr_value];
        if(typeof handler !== 'function') {
            //当前版本暂时只能直接j-click=scope.function
            throw 'j-click need function.'
        }
        $on(element, 'click', $bind(scope, handler));
    }
});