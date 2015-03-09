function Directive(module, name, func) {
    this.name = name;
    this.module = module;
    this.state = 0;
    this.func = func;
    this.link_func = null;
}
var __directive_prototype = Directive.prototype;

$defineProperty(__module_prototype, 'directive', function directive(name, func) {
        if(!$isFunction(func)) {
            throw new Error('directive need function');
        }
        directive_create(name, func);
        return this;
});
