var __AM = ['push', 'pop', 'reverse', 'shift', 'sort', 'unshift', 'splice'];
var __AProto = Array.prototype;
var __env_counter = 0;
var __root_env_table = {};

function Environment(name, parent) {
    /**
     * $$用来保存用户定义的变量。
     * __用来保存支撑逻辑的内部变量。
     * 通过这个方式，使用Scope的实例尽可能信息隐藏；
     *   通过for in只能取到通过用户定义的变量。
     */
    var __ = {};
    $defineProperty(this, '__', __);
    $defineProperty(__, 'watchers', {});

    $defineProperty(this, '$$', {});

    $defineProperty(this, '$name', name);
    $defineProperty(this, '$children', {});
    $defineProperty(this, '$parent', parent ? parent : null);

}

var __env_prototype = Environment.prototype;

$defineGetterSetter(__env_prototype, '$root', function() {
    return this.$parent ? this.$parent.$root : this;
});

$defineProperty(__env_prototype, '$declare', function(var_name, var_value) {
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

        if(var_value instanceof DataSource) {

            $defineGetterSetter($me, var_name, function() {
                return $me.$$[var_name].get();
            }, function(val) {
                if($me.$$[var_name].get() === val) {
                    return;
                }
                $me.$$[var_name].update(val);
                $me.$emit(var_name);
            }, true, true);
        } else {
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
    }
});


$defineProperty(__env_prototype, '$child', function(name) {
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

$defineProperty(__env_prototype, '$get', function(var_name) {
    if($hasProperty(this, var_name)) {
        return this[var_name];
    } else if(this.$parent) {
        return this.$parent.$get(var_name);
    } else {
        return null;
    }
});

$defineProperty(__env_prototype, '$has', function(var_name) {
    if($hasProperty(this, var_name)) {
        return true;
    } else if(this.$parent) {
        return this.$parent.$has(var_name);
    } else {
        return false;
    }
});

$defineProperty(__env_prototype, '$set', function(var_name, value) {
    if($hasProperty(this, var_name)) {
        this[var_name] = value;
    } else if(this.$parent) {
        this.$parent.set(var_name, value);
    }
});

function environment_create(parent) {
    var name = this.$parent ? this.$parent.name + '.' + __env_counter++ : 'jing.scope.' + __env_counter++;
    var cs = new Environment(name, parent);
    if(parent) {
        $defineProperty(parent.$children, name, cs, false, true);
    }
    return cs;
}