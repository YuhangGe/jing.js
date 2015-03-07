function $map(array, func) {
    var len = array.length,
        new_array = new Array(len);
    for(var i=0;i<len;i++) {
        new_array[i] = func(array[i], i);
    }
    return new_array;
}

function $in(obj, func) {
    for(var kn in obj) {
        if(func(obj[kn], kn) === false) {
            return;
        }
    }
}


function $each(arr, func) {
    for(var i=0;i<arr.length;i++) {
        if(func(arr[i], arr[i], i)===false) {
            return;
        }
    }
}


function $filter(arr, fn) {

    function apply_filter(item, obj) {
        for(var k in obj){
            if(item[k] !== obj[k]) {
                return false;
            }
        }
        return true;
    }

    var new_arr =  arr, i;
    if($isFunction(fn)) {
        new_arr = arr.filter(fn);
    } else if($isObject(fn)) {
        new_arr = [];
        for(i=0;i<arr.length;i++) {
            if(apply_filter(arr[i], fn)) {
                new_arr.push(arr[i]);
            }
        }
    }
    return new_arr;
}