
jing = {};

jing.scope_types = {
    INHERIT : __ENV_TYPE_INHERIT,
    CREATE : __SCOPE_TYPE_CREATE,
    PARENT : __SCOPE_TYPE_PARENT
};

jing.module = module_create;
jing.require = module_require;

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
jing.environment = function(name, func) {

};