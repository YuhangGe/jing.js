directive_register('j-repeat', function($module) {

    return function(ele, $scope, $value, $var_name) {

        /**
         * todo
         * 1. 使用更高效率的createDocumentFragment一类的函数。避免多次appendChild和removeChild。
         * 2. parse
         */

        if(!$value instanceof Array) {
            log('j-repeat need Array!');
            return;
        }
        $css(ele, 'display', 'none');
        $data(ele, []);

        setTimeout(function() {
            render(ele, $value);
        }, 0);

        $scope.watch($var_name, function(var_name, new_value, element) {
            update(element, new_value);
        }, ele);

        function render(element, array) {
            var pn = element.parentNode, ne,
                e_arr = $data(element);
            for(var i=0;i<array.length;i++) {
                ne = element.cloneNode(true);
                $css(ne, 'display', 'block');
                pn.appendChild(ne);
                e_arr.push(ne);
            }
        }
        function update(element, new_array) {
            var arr = $data(element);
            for(var i=0;i<arr.length;i++) {
                arr[i].parentNode.removeChild(arr[i]);
            }
            arr.length = 0;
            render(element, new_array);
        }

    };
});