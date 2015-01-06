/**
 * Created by Yuhang Ge on 15/1/6.
 */
jing = function(id) {
    return document.getElementById(id);
};
jing.extend = function(dst, src) {
    for(var fn in src) {
        dst[fn] = src[fn];
    }
};
jing.bind = function(instance, func) {
    return function() {
        func.apply(instance, arguments);
    };
};

var log = function() {
    console.log.apply(this, arguments);
};

function create_scope() {
    var __props = {};
    var __scope = {};
    var __watch = {};

    function declare_variables(var_name, var_value) {
        __props[var_name] = var_value;
        if(Object.defineProperty) {
            Object.defineProperty(__scope, var_name, {
                enumerable : false,
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
        } else if(__scope.__defineGetter__) {
            __scope.__defineGetter__(var_name, function() {
                return __props[var_name];
            });
            __scope.__defineSetter__(var_name, function(val) {
                if(__props[var_name] === val) {
                    return;
                }
                __props[var_name] = val;
                emit(var_name);
            });
        }
    }

    function declare(var_name, var_value) {
        if(typeof var_name === 'object') {
            for(var vn in var_name) {
                declare(vn, var_name[vn]);
            }
        } else if(typeof var_value !== 'function') {
            declare_variables(var_name, var_value);
        } else {
            __scope[var_name] = jing.bind(this, var_value);
        }
    }

    function emit(var_name) {
        var w_arr = __watch[var_name];
        if(w_arr && w_arr.length > 0) {
            for(var i=0;i<w_arr.length;i++) {
                w_arr[i].cb(var_name, __props[var_name], w_arr[i].data);
            }
        }
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

var $ctrl_table = {};
var $ctrl_stack = [];

$ctrl_table['JING_ROOT_CTRL'] = create_scope();
$ctrl_stack.push($ctrl_table['JING_ROOT_CTRL']);

jing.controller = function(name, func) {
    var $ctrl = create_scope();
    func.call(this, $ctrl);
    $ctrl_table[name] = $ctrl;
};



function drive_element(ele) {
    directive(ele);
    text(ele);
    var j_ctrl = ele.getAttribute('j-ctrl');
    var p_ctrl = false;
    if(j_ctrl && $ctrl_table[j_ctrl]) {
        $ctrl_stack.push($ctrl_table[j_ctrl]);
        p_ctrl = true;
    }
    var c_ele = ele.children;
    if(c_ele.length > 0) {
        for(var i=0;i<c_ele.length;i++) {
            drive_element(c_ele[i]);
        }
    }
    if(p_ctrl) {
        $ctrl_stack.pop();
    }
}

function directive(ele) {
    var $cur_ctrl = $ctrl_stack[$ctrl_stack.length-1];

    var j_click = ele.getAttribute('j-click');
    if(j_click && typeof $cur_ctrl[j_click] === 'function') {
        ele.__jing_ctrl__ = $cur_ctrl;
        ele.addEventListener('click', function() {
            this.__jing_ctrl__[this.getAttribute('j-click')]();
        });
    }
    var j_model = ele.getAttribute('j-model');

    if(j_model && ele.nodeName === 'INPUT' && $cur_ctrl.hasOwnProperty(j_model)) {
        ele.__jing_ctrl__ = $cur_ctrl;
        ele.addEventListener('input', function() {
            this.__jing_ctrl__[this.getAttribute('j-model')] = this.value;
        });
        ele.value = $cur_ctrl[j_model];
        $cur_ctrl.watch(j_model, function(var_name, new_value, data) {
            data.ele.value = new_value;
        }, {
            ele : ele
        });
    }
}

function text(ele) {
    var $cur_ctrl = $ctrl_stack[$ctrl_stack.length-1];
    var cn = ele.childNodes;
    if(cn.length === 0) {
        return;
    }
    for(var i=0;i<cn.length;i++) {
        if(cn[i].nodeName !== '#text'){
            continue;
        }
        var txt = cn[i].textContent;
        var m = txt.match(/\{\{\s*([\w\d_]+)\s*\}\}/);
        if(!m || !$cur_ctrl.hasOwnProperty(m[1])) {
            continue;
        }
        cn[i].textContent = txt.replace(m[0], $cur_ctrl[m[1]]);
        $cur_ctrl.watch(m[1], function(var_name, new_value, data) {
            data.ele.textContent = new_value;
        }, {
            ele : cn[i]
        });
    }
}

jing.drive = function(root_element) {
    drive_element(root_element);
};