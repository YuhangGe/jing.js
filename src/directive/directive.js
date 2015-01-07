/*
 * require scope
 */
var __dire= [];
var __dire_names = [];

function directive_register(name, directive) {
    __dire_names.push(name);
    __dire.push(directive);
}

function directive_run(ele) {
    $each(__dire_names, function(name, idx) {
        var $val,
            dn = $attr(ele, name),
            $scope = scope_last();
        if(!dn) {
            return;
        }
        $val = $scope[dn];
        if(typeof $val !== 'undefined') {
            __dire[idx](ele, $scope, $val, dn);
        }
    });
}
