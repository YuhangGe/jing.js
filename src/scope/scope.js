
var __scope_table = {};
var __scope_stack = [];

__scope_table['0'] = scope_create();
__scope_stack.push(__scope_table['0']);

var __AM = ['push', 'pop', 'reverse', 'shift', 'sort', 'unshift', 'splice'];
var __AProto = Array.prototype;

function scope_create() {
    var __props = {};
    var __scope = {};
    var __watch = {};

    function declare_variables(var_name, var_value) {
        if(var_value instanceof Array) {
            $each(__AM, function(item) {
                var_value[item] = function() {
                    var rtn = __AProto[item].apply(this, arguments);
                    emit(var_name);
                    return rtn;
                }
            });
            /*
             * 由于js不能重载[]运算符。因此要修改元素，只能使用set函数才能影响。
             * ES6里面会引入新的Proxy方式，可以实现重载[]运算符的功能。未来的版本可以修改。
             */
            var_value.set = function(idx, val) {
                this[idx] = val;
                emit(var_name);
            };
        }

        __props[var_name] = var_value;

        //if(Object.defineProperty) {
            Object.defineProperty(__scope, var_name, {
                enumerable : true,
                configurable : true,
                get : function() {
                    return __props[var_name];
                },
                set : function(val) {
                    if(__props[var_name] === val) {
                        return;
                    }
                    __props[var_name] = val;
                    emit(var_name);
                }
            });
        //} else {
        //    alert('browser not support!');
        //    throw 'browser not support!'
        //}
        //if(__scope.__defineGetter__) {
        //    __scope.__defineGetter__(var_name, function() {
        //        return __props[var_name];
        //    });
        //    __scope.__defineSetter__(var_name, function(val) {
        //        if(__props[var_name] === val) {
        //            return;
        //        }
        //        __props[var_name] = val;
        //        emit(var_name);
        //    });
        //}
    }

    function declare(var_name, var_value) {
        if(typeof var_name === 'object') {
            for(var vn in var_name) {
                declare(vn, var_name[vn]);
            }
        } else if(typeof var_value !== 'function') {
            declare_variables(var_name, var_value);
        } else {
            if(['declare', 'watch'].indexOf(var_name) >= 0) {
                log('can not use "' + var_name + '" in declare.');
            } else {
                __scope[var_name] = $bind(__scope, var_value);
            }
        }
    }

    function emit(var_name) {
        var w_arr = __watch[var_name];
        if(!w_arr || w_arr.length === 0) {
            return;
        }
        //may be replace by setImmediate in future
        $timeout(function() {
            for(var i=0;i<w_arr.length;i++) {
                w_arr[i].cb(var_name, __props[var_name], w_arr[i].data);
            }
        }, 0);
    }

    function watch(var_name, callback, data) {
        if(typeof callback !== 'function') {
            return;
        }
        if(!__watch[var_name]) {
            __watch[var_name] = [];
        }
        __watch[var_name].push({
            cb : callback,
            data : data
        });
    }

    __scope.declare = declare;
    __scope.watch = watch;
    return __scope;
}

function scope_exists(scope_name) {
    return __scope_table.hasOwnProperty(scope_name);
}
function scope_push(scope_name) {
    var scope = __scope_table[scope_name];
    if(typeof scope !== 'undefined') {
        __scope_stack.push(scope);
        return true;
    } else {
        return false;
    }
}
function scope_pop() {
    return __scope_stack.pop();
}
function scope_last() {
    return __scope_stack[__scope_stack.length-1];
}
function scope_add(scope_name, scope) {
    __scope_table[scope_name] = scope;
}
