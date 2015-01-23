function struct_init_jarray(jarray) {

}

function JArray(array, env) {
    var _array = $isUndefined(array) ? [] : ($isArray(array) ? array : ($isNumber(array) ? new Array(array) : [array]));
    var __ = {
        array :  _array,
        length : _array.length,
        env : env
    };
    $defineProperty(this, '__', __);

}
var __jarray_prototype = JArray.prototype;
$defineProperty(__jarray_prototype, 'push', function(item) {

});
$defineGetterSetter(__jarray_prototype, 'length', function() {
    return this.__.length;
}, function(len) {
    if(!$isNumber(len) || (len = Math.floor(len)) < 0) {
        return;
    }
    this.__.array.length = len;
});