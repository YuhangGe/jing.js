directive_register('j-model', function(ele, $scope, $value, $var_name) {
    if(ele.nodeName !== 'INPUT') {
        return;
    }
    $data(ele, $scope);
    $on(ele, 'input', function() {
        $data(this)[$attr(this, 'j-model')] = this.value;
    });
    ele.value = $value;
    log($var_name);
    $scope.watch($var_name, function(var_name, new_value, input_ele) {
        input_ele.value = new_value;
        log('update input');
    }, ele);
});