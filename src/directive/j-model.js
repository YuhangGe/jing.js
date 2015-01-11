directive_create('j-model', function() {
    return function(drive_module, directive_module, scope, element, attr_value) {
        if(element.nodeName !== 'INPUT') {
            return;
        }
        $data(element, scope);
        $on(element, 'input', function() {
            $data(this)[$attr(this, 'j-model')] = this.value;
        });
        element.value = scope[attr_value];
        scope.$watch(attr_value, function(var_name, new_value, input_ele) {
            input_ele.value = new_value;
        }, element);
    };
});