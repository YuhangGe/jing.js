directive_create('j-model', function() {
    return function(ele, $scope, $value, $var_name) {
        if(ele.nodeName !== 'INPUT') {
            return;
        }
        $data(ele, $scope);
        $on(ele, 'input', function() {
            $data(this)[$attr(this, 'j-model')] = this.value;
        });
        ele.value = $value;
        $scope.$watch($var_name, function(var_name, new_value, input_ele) {
            input_ele.value = new_value;
        }, ele);
    };
});