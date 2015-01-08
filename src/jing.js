function global_component(name, type) {
    var ns = name.split('.');
    var m = module_extract(ns);
    if(!m) {
        log(name , ': ' + type + ' not found. no module.');
        return null;
    } else {
        return m[type](ns[ns.length-1]);
    }
}

jing = {};
jing.module = module_create;
jing.require = module_require;
jing.controller = function(name) {
    return global_component(name, 'controller');
};
jing.directive = function(name) {
    return global_component(name, 'directive');
};
jing.factory = function(name) {
    return global_component(name, 'factory');
};