function Directive(module, name, func) {
    this.name = name;
    this.module = module;
    this.state = 0;
    this.func = func;
    this.link_func = null;
}
var __directive_prototype = Directive.prototype;
