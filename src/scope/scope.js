var __AM = ['push', 'pop', 'reverse', 'shift', 'sort', 'unshift', 'splice'];
var __AProto = Array.prototype;
var __scope_counter = 0;
var __root_scope_table = {};

function Scope(name, parent) {
    /**
     * $$用来保存通过$declare定义的变量。
     * __用来保存支撑逻辑的内部变量。
     * 通过这个方式，使用Scope的实例尽可能信息隐藏；
     *   通过for in只能取到通过$declare定义的变量。
     */
    var __ = {};
    $defineProperty(this, '__', __);
    $defineProperty(__, 'watch', {});

    $defineProperty(this, '$$', {});

    $defineProperty(this, '$name', name);
    $defineProperty(this, '$children', {});
    $defineProperty(this, '$parent', parent ? parent : null);

}

var __scope_prototype = Scope.prototype;

$defineGetterSetter(__scope_prototype, '$root', function() {
    return this.$parent ? this.$parent.$root : this;
});

$defineProperty(__scope_prototype, '$declare', function(var_name, var_value) {
    var $me = this;

    if(typeof var_name === 'object') {
        for(var vn in var_name) {
            $me.$declare(vn, var_name[vn]);
        }
    } else if(typeof var_value !== 'function') {
        if(var_value instanceof Array) {
            $each(__AM, function(item) {
                var_value[item] = function() {
                    var rtn = __AProto[item].apply(this, arguments);
                    $me.$emit(var_name);
                    return rtn;
                }
            });
            /*
             * 由于js不能重载[]运算符。因此要修改元素，只能使用set函数才能影响。
             * ES6里面会引入新的Proxy方式，可以实现重载[]运算符的功能。未来的版本可以修改。
             */
            var_value.$set = function(idx, val) {
                this[idx] = val;
                $me.$emit(var_name);
            };
        }

        $me.$$[var_name] = var_value;

        $defineGetterSetter($me, var_name, function() {
            return $me.$$[var_name];
        }, function(val) {
            if($me.$$[var_name] === val) {
                return;
            }
            $me.$$[var_name] = val;
            $me.$emit(var_name);
        }, true, true);

    }
});

$defineProperty(__scope_prototype, '$watch', function(var_name, callback, data) {
    if(typeof callback !== 'function') {
        log('$watch need function');
        return;
    }
    if(!$hasProperty(this.$$, var_name)) {
        if(!$hasProperty(this, var_name)) {
            log('"'+var_name+'" of scope:' + this.name + ' not found!');
            return;
        }
        var val = this[var_name];
        delete this[var_name];
        this.$declare(var_name, val);
    }
    var __watch = this.__.watch;
    if(!$hasProperty(__watch, var_name)) {
        __watch[var_name] = [];
    }
    __watch[var_name].push({
        cb : callback,
        data : data
    });
});
$defineProperty(__scope_prototype, '$emit', function(var_name) {
    var __watch = this.__.watch;
    var w_arr = __watch[var_name];
    if(!w_arr || w_arr.length === 0) {
        return;
    }
    //may be replace by setImmediate in future
    //todo 当连续几行代码改变是的同一个变量时，不应该每一行代码都更新一次。目前还只是demo初期版本。
    $timeout($bind(this, function() {
        for(var i=0;i<w_arr.length;i++) {
            w_arr[i].cb(var_name, this.$$[var_name], w_arr[i].data);
        }
    }), 0);
});
$defineProperty(__scope_prototype, '$child', function(name) {
    if(!name) {
        name = this.$parent ? this.$parent.name + '.' + __scope_counter++ : 'jing.scope.' + __scope_counter++;
    }
    var cd = this.$children;
    if($hasProperty(cd, name)) {
        return cd[name];
    } else {
        var cs = new Scope(name, this);
        $defineProperty(cd, name, cs, false, true);
        return cs;
    }
});

$defineProperty(__scope_prototype, '$get', function(var_name) {
    if($hasProperty(this, var_name)) {
        return this[var_name];
    } else if(this.$parent) {
        return this.$parent.$get(var_name);
    } else {
        throw 'scope does not have declare var:' + var_name;
    }
});

$defineProperty(__scope_prototype, '$set', function(var_name, value) {
    if($hasProperty(this, var_name)) {
        this[var_name] = value;
    } else if(this.$parent) {
        this.$parent.set(var_name, value);
    } else {
        throw 'scope does not have declare var:' + var_name;
    }
});

function scope_create(parent) {
    var name = this.$parent ? this.$parent.name + '.' + __scope_counter++ : 'jing.scope.' + __scope_counter++;
    var cs = new Scope(name, parent);
    if(parent) {
        $defineProperty(parent.$children, name, cs, false, true);
    }
    return cs;
}