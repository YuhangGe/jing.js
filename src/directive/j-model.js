function JInputModel(ele, env, expr) {
    this.ele = ele;
    this.env = env;
    this.expr = expr;
    this.val = null;
}
var __jimodel_prototype = JInputModel.prototype;
__jimodel_prototype.run = function() {
    this.render();

    this.env.$watch(this.expr, function(jmodel) {

        jmodel.render();
        //todo deal watch
    }, this);
};
__jimodel_prototype.render = function() {
    var new_val = this.expr.exec(this.env);
    if(this.val === new_val) {
        return;
    }
    this.ele.value = new_val;
    this.val = new_val;
};

directive_create('j-model', function() {

    return function(drive_module, directive_module, env, element, attr_value) {
        if(element.nodeName !== 'INPUT') {
            return;
        }
        var expr = parse_expression(attr_value);

        //todo check expr can be set. That is, expr.type is 'variable' or 'property'

        new JInputModel(element, env, expr).run();


    };
});