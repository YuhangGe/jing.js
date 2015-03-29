function $isEmit(obj) {
    return obj instanceof EmitNode;
}

function $isString(str) {
    return typeof str === 'string';
}
function $isFunction(func) {
    return typeof func === 'function';
}
function $isNumber(num) {
    return typeof num === 'number';
}
function $isObject(obj) {
    return obj !== null && typeof obj === 'object';
}
function $isNull(nl) {
    return nl === null;
}
function $isUndefined(obj) {
    return typeof obj === 'undefined';
}

function $isEnv(obj) {
    return obj instanceof Environment;
}

function $isArray(obj) {
    return Array.isArray(obj); // obj instanceof Array; which one is better?
}
function $isJArray(obj) {
    return obj instanceof JArray;
}

