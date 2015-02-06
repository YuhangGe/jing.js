function ImmListener(handler, data) {
    this.handler = handler;
    this.data = data;
}
ImmListener.prototype = {
    notify : function(var_name, cur_value, pre_value) {
        this.handler([{
            var_name : var_name,
            pre_value : pre_value,
            cur_value : cur_value
        }], this.data);
    }
};

function LazyListener(handler, data, lazy_time) {
    this.handler = handler;
    this.data = data;
    this.lazy = $isNumber(lazy_time) ? ((lazy_time = Math.floor(lazy_time)) >=0 ? lazy_time : 0) : 0;
    this.timeout = null;
    this.delegate = $bind(this, this.deal);
    this.changes = [];
}
LazyListener.prototype = {
    notify : function(var_name, cur_value, pre_value) {
        if(this.timeout !== null) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
        this.changes.push({
            var_name : var_name,
            pre_value : pre_value,
            cur_value : cur_value
        });
        this.timeout = setTimeout(this.delegate, this.lazy);
    },
    deal : function() {
        this.handler(this.changes, this.data);
        this.changes.length = 0;
    }
};