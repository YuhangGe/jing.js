/*
 * 目前对于数组的处理方式为：
 *   将数组封装为自定义的JArray类，实际数组存在JArray的__.array成员变量里，
 *   通过给JArray定义属性，来实现jarray[index]访问单个元素。这样做的缺点
 *   包括，
 *   1.当数组巨大时，该JArray实例也会有巨大数量的属性；
 *   2.想要访问的元素位置超出数组元素的个数时，也会无效；
 *   3.每一个元素修改时，都要遍历所有的emit_node。
 *   4.为了简化，数组数量减少时，JArray的属性数量不变。
 *   以及如下问题：
 *     'slice'函数返回了新的 JArray对象，
 *     并且诸如 {{array.slice(4, 5)[0].name}}这样的表达式无法正确处理双向绑定。
 *
 * 当前的处理方式还需要进一步地斟酌和改进。
 *
 */
function jarray_up(jarray) {
    var i, e_tree, len = jarray.__.array.length;
    if(len === 0) {
        return;
    }
    e_tree = jarray.__.en.children;
    for(i=0;i<len;i++) {
        if(!$hasProperty(e_tree, i)) {
            e_tree[i] = new EmitNode(i, jarray.__.en, jarray.__.en.env);
        }
        if(!$hasProperty(jarray, i)) {
            (function(idx) {
                $defineGetterSetter(jarray, idx, function() {
                    return this.__.array[idx];
                }, function(val) {
                    var ov = this.__.array[idx];
                    if(ov !== val) {
                        this.__.array[idx] = val;
                        this.__.en.notify();
                    }
                    //这里的参数true很重要，使得该属性可以被重写覆盖。
                }, true, true);
            })(i);
        }

    }
}

function JArray(array, emit_node) {
    $defineProperty(this, '__', {
        array : array,
        en : emit_node
    });
    $defineProperty(this, __env_emit_name, {});
    jarray_up(this);
}
var __jarray_prototype = JArray.prototype;

$each(['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'], function(med) {
    $defineProperty(__jarray_prototype, med, function() {
        var rtn = Array.prototype[med].apply(this.__.array, arguments);
        jarray_up(this);
        this.__.en.notify();
        return rtn;
    });
});


$each(['join', 'indexOf', 'fill', 'find'], function(med) {
    $defineProperty(__jarray_prototype, med, function() {
        return Array.prototype[med].apply(this.__.array, arguments);
    });
});

$defineProperty(__jarray_prototype, 'slice', function() {
    return new JArray(Array.prototype.slice.apply(this.__.array, arguments), new EmitNode('emp', this.__.en));
});

$defineProperty(__jarray_prototype, 'set', function(idx, val) {
    if($hasProperty(this, idx)) {
        this[idx] = val;
    } else {
        this.__.array[idx] = val;
        this.__.en.notify();
    }
});

$defineProperty(__jarray_prototype, 'get', function(idx) {
    return this.__.array[idx];
});

$defineGetterSetter(__jarray_prototype, 'length', function() {
    return this.__.array.length;
}, function(len) {
    this.__.array.length = len;
    jarray_up(this);
    this.__.en.notify();
});

$defineProperty(__jarray_prototype, 'destroy', function() {
    this.__.array.length = 0;
    this.__.en = null;
});