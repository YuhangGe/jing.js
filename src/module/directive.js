function Directive(module, name, scope_type, func) {
    this.name = name;
    this.module = module;
    this.state = 0;
    this.scope_type = typeof scope_type === 'function' ? __SCOPE_TYPE_INHERIT : scope_type;
    this.func = typeof scope_type === 'function' ? scope_type :func;
    this.link_func = null;
}
var __directive_prototype = Directive.prototype;
