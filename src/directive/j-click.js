directive_create('j-click', function() {
    return function(module, scope, element, attr_value, attr_name) {
        $on(element, 'click', attr_value);
    }
});