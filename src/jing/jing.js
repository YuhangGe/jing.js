
jing = {};

jing.module = module_create;
jing.require = module_require;
jing.config = $config;

jing.directive = function(name) {
    var ms = module_get(name, false);
    if(!ms) {
        log(name , ': directive not found. no module.');
        return null;
    } else {
        return ms[0].directive(ms[1]);
    }
};
jing.factory = function(name) {
    var ms = module_get(name, false);
    if(!ms) {
        log(name , ': factory not found. no module.');
        return null;
    } else {
        return ms[0].factory(ms[1]);
    }
};

jing.ready = $ready;

jing.env = module_get_root_env;

jing.each = $each;
jing.map = $map;
jing.filter = $filter;
jing.defineProperty = $defineProperty;
jing.defineGetterSetter = $defineGetterSetter;
jing.JArray = JArray;