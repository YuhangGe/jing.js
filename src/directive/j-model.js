function JInputModel(ele, env, expr) {
    this.ele = ele;
    this.env = env;
    this.expr = expr;

    var listener = environment_watch_expression(env, expr, function(change_list, j_model) {
        j_model.update(change_list[0].cur_value);
    }, this, 10);

    this.val = listener.cur_value;
    this.val_key = 'value';
    this.val_event = 'input';

    var type = $attr(ele, 'type');
    switch (type) {
        case 'checkbox':
            this.val_key = 'checked';
            this.val_event = 'change';
            break;
    }

    this.ele[this.val_key] = this.val;
    $on(ele, this.val_event, $bind(this, this.change));

}
var __jimodel_prototype = JInputModel.prototype;

__jimodel_prototype.change = function() {
    this.val = this.ele[this.val_key];
    this.expr.set(this.env, this.val);
};

__jimodel_prototype.update = function(new_value) {
    if(this.val !== new_value) {
        this.ele[this.val_key] = new_value;
        this.val = new_value;
    }
};
__jimodel_prototype.destroy = function() {
    this.ele = null;
    //todo unwatch
    this.expr.destroy();
    this.expr = null;
};

directive_create('j-model', function() {

    return function(drive_module, directive_module, env, element, attr_value) {
        if(element.nodeName !== 'INPUT') {
            return;
        }
        //todo 支持checkbox, radio等各种类型。

        var expr = parse_expression(attr_value);

        if(expr.type !== 'variable' && expr.type !== 'property') {
            throw 'j-model only support settable expression';
        }

        new JInputModel(element, env, expr);
    };
});