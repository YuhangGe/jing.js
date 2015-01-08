var __AM = ['push', 'pop', 'reverse', 'shift', 'sort', 'unshift', 'splice'];
var __AProto = Array.prototype;

function scope_create(name, module, parent) {
    var __props = {};
    var __scope = {};
    var __watch = {};

    $defineProperty(__scope, '$name', name);
    $defineProperty(__scope, '$children', {});
    $defineProperty(__scope, '$parent', parent ? parent : null);
    $defineProperty(__scope, '$module', module);
    $defineGetterSetter(__scope, '$root', function() {
        return this.$module.$root.$scope;
    });


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
        $defineGetterSetter(__scope, var_name, function() {
            return __props[var_name];
        }, function(val) {
            if(__props[var_name] === val) {
                return;
            }
            __props[var_name] = val;
            emit(var_name);
        }, true, true);

            //Object.defineProperty(__scope, var_name, {
            //    enumerable : true,
            //    configurable : true,
            //    get : function() {
            //        return __props[var_name];
            //    },
            //    set : function(val) {
            //        if(__props[var_name] === val) {
            //            return;
            //        }
            //        __props[var_name] = val;
            //        emit(var_name);
            //    }
            //});
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

    __scope.$declare = declare;
    __scope.$watch = watch;
    __scope.$require = function(name) {
        return module_require(name, this.$module);
    };
    __scope.$child = function(name) {
        if(!name) {
            name = 'jing.scope.' + __scope_counter++;
        }
        var cd = this.$children;
        if(cd.hasOwnProperty(name)) {
            return cd[name];
        } else {
            var cs = scope_create(name, this.$module, this);
            cd[name] = cs;
            return cs;
        }
    };
    __scope.$get = function(var_name) {
        if(this.hasOwnProperty(var_name)) {
            return this[var_name];
        } else if(this.$parent) {
            return this.$parent.$get(var_name);
        } else {
            throw 'scope does not have declare var:' + var_name;
        }
    };
    __scope.$set = function(var_name, value) {
        if(this.hasOwnProperty(var_name)) {
            this[var_name] = value;
        } else if(this.$parent) {
            this.$parent.set(var_name, value);
        } else {
            throw 'scope does not have declare var:' + var_name;
        }
    };

    return __scope;
}

