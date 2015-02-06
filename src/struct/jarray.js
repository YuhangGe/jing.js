function struct_up_jarray(jarray) {
    var up = jarray.__.up;
    var len = jarray.__.array.length;
    if(len <= up) {
        return;
    }
    for(var i=up;i<len;i++) {
        /*
         * 这里使用闭包来存储当前索引。不排除有性能问题。
         * todo #check performance
         */
        (function(idx) {
            $defineGetterSetter(jarray, idx, function() {
                log(this.__.array);
                log(idx);
                return this.__.array[idx];
            }, function(val) {
                this.__.array[idx] = val;
            });
        })(i);
    }
    jarray.__.up = len;
}

function struct_emit_jarray(jarray) {

}

function struct_destroy_jarray(jarray) {

}

function JArray(array) {
    var _array = $isUndefined(array) ? [] : ($isArray(array) ? array : ($isNumber(array) ? new Array(array) : [array]));
    var __ = {
        array :  _array,
        up : 0
    };
    $defineProperty(this, '__', __, true, true);
    struct_up_jarray(this);
}
var __jarray_prototype = JArray.prototype;

$defineProperty(__jarray_prototype, 'push', function(item) {

});
$defineGetterSetter(__jarray_prototype, 'length', function() {
    return this.__.array.length;
}, function(len) {
    this.__.array.length = len;
});