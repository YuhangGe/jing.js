directive_register('j-click', function(ele, $scope, $value) {
    if(typeof $value !== 'function') {
        log('j-click need function.');
        return;
    }
    $on(ele, 'click', $value);
});