function directive_deal_j_env(ele, attr, drive_module, env) {
    var env_def;
    var item = attr.removeNamedItem('j-env'),
        env_value = item.value.trim();
    if (env_value.indexOf('.') >= 0) {
        var ms = module_get(env_value, false);
        if (!ms) {
            throw 'j-env: environment "' + env_value + '" not found. module not found.';
        }
        env_def = ms[0].env(ms[1]);
    } else {
        env_def = drive_module.env(env_value);
    }
    if (!env_def) {
        throw 'j-env: environment "' + env_value + '" not found.';
    }
    env_def.func.call(env, drive_module);
}