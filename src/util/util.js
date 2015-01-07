function $extend(dst, src) {
    for(var kn in src) {
        dst[kn] = src[kn];
    }
}
function $bind(instance, func) {
    return function() {
        func.apply(instance, arguments);
    };
}
function $css(ele, name, value) {
    //todo name如果是'background-color'这样的带短横线的，要转成'backgroundColor'
    if(typeof name === 'object') {
        for(var kn in name) {
            ele.style[kn] = name[kn];
        }
    } else {
        ele.style[name] = value;
    }
}
function $attr(ele, attr_name, attr_value) {
    if(typeof attr_value !== 'undefined') {
        ele.setAttribute(attr_name, attr_value);
    } else {
        return ele.getAttribute(attr_name);
    }
}
function $data(ele, data) {
    if(typeof data !== 'undefined') {
        ele['__JING_BIND_DATA__'] = data;
    } else {
        return ele['__JING_BIND_DATA__'];
    }
}
function $each(arr, func) {
    for(var i=0;i<arr.length;i++) {
        if(func.call(arr[i], arr[i], i)===false) {
            return;
        }
    }
}
function $on(ele, event_name, event_handler) {
    ele.addEventListener(event_name, event_handler);
}
function $timeout(func, time) {
    setTimeout(func, time);
}
function log() {
    console.log.apply(console, arguments);
}
function $(id) {
    return document.getElementById(id);
}