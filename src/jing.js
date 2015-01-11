function global_component(name, type) {

}

jing = {};

jing.scope_types = {
    INHERIT : __SCOPE_TYPE_INHERIT,
    CREATE : __SCOPE_TYPE_CREATE,
    PARENT : __SCOPE_TYPE_PARENT
};

jing.module = module_create;
jing.require = module_require;
jing.controller = function(name) {
    var ms = module_get(name, false);
    if(!ms) {
        log(name , ': controller not found. no module.');
        return null;
    } else {
        return ms[0].controller(ms[1]);
    }
};
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
jing.scope = function(name) {
    if(name) {
        return __root_scope_table[name];
    } else {
        return scope_create();
    }
};