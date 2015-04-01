function JInputModel(ele, env, expr, two_way) {
    this.ele = ele;
    this.env = env;
    this.expr = expr;

    var listener = environment_watch_expression(env, expr, function(cur_value, pre_value, j_model) {
        j_model.update(cur_value);
    }, this);

    this.val = listener.cv;
    this.val_key = 'value';
    this.val_event = 'input';

    var type = $attr(ele, 'type');
    //todo 支持checkbox, radio等各种类型。

    switch (type) {
        case 'checkbox':
            this.val_key = 'checked';
            this.val_event = 'change';
            break;
    }

    this.ele[this.val_key] = this.val;

    if(two_way) {
        $on(ele, this.val_event, $bind(this, this.change));
    }

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

function directive_data_bind(drive_module, directive_module, env, element, attr_value, two_way) {
    if(element.nodeName !== 'INPUT') {
        return;
    }
    //todo 支持checkbox, radio等各种类型。

    var expr = parse_expression(attr_value, false);

    if(expr.type !== 'variable' && expr.type !== 'property') {
        throw 'j-model only support settable expression';
    }

    new JInputModel(element, env, expr, two_way);
}

directive_create('j-model', function() {

    return function(drive_module, directive_module, env, element, attr_value) {
        directive_data_bind(drive_module, directive_module, env, element, attr_value, true);
    };
});

directive_create('j-value', function() {
    return function(drive_module, directive_module, env, element, attr_value) {
        directive_data_bind(drive_module, directive_module, env, element, attr_value, false);
    };
});