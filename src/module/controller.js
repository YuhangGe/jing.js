function Controller(module, name, func) {
    this.name = name;
    this.module = module;
    this.func = func;
}
var __controller_prototype = Controller.prototype;

__controller_prototype.bind_scope = function(module, scope) {
    /**
     * bind_scope里面传入的module不一定和该controller的this.module一样。
     * bind_scope传入的module是驱动根元素(.drive函数)函数所属于的module，
     *    scope是该根元素向下传递的scope.
     * this.module是该controller定义时所属于的module(.controller函数的调用者)
     */
    this.func(module, scope);
};