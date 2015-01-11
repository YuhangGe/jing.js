directive_create('j-repeat', function() {

    return function(drive_module, directive_module, scope, element, attr_value) {

        /**
         * todo 还有很多问题需要解决。
         * 1. 使用更高效率的createDocumentFragment一类的函数。避免多次appendChild和removeChild。
         * 2. parse
         */
        var scope_value = scope[attr_value];
        if(!scope_value instanceof Array) {
            log('j-repeat need Array!');
            return;
        }
        $css(element, 'display', 'none');
        $data(element, []);

        render(element, scope_value);

        scope.$watch(attr_value, function(var_name, new_value, element) {
            update(element, new_value);
        }, element);

        function render(element, array) {
            var pn = element.parentNode, ne,
                e_arr = $data(element);
            for(var i=0;i<array.length;i++) {
                ne = element.cloneNode(true);
                $css(ne, 'display', 'block');
                ne.removeAttribute('j-repeat');
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