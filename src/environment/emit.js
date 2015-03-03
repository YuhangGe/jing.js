function EmitNode(id, env, parent) {
    this.id = id;
    this.env = env;
    this.I_emitter = null;
    this.L_emitter = null;
    this.children = {};
    this.parent = parent;
    this.path = (parent.path ? parent.path + '.' : '') + id;
}
EmitNode.prototype = {
    val : function(var_name) {

        var p = this.parent.val(this.id);
        if(p && !$isUndefined(var_name)) {
            return p[var_name];
        } else {
            return p;
        }
    },
    notify : function() {
        if(this.I_emitter !== null) {
            this.I_emitter.notify();
        }
        if(this.L_emitter !== null) {
            this.L_emitter.notify();
        }
        for(var k in this.children) {
            this.children[k].notify();
        }
    },
    destroy : function() {
        if(this.I_emitter !== null) {
            this.I_emitter.destroy();
        }
        if(this.L_emitter !== null) {
            this.L_emitter.destroy();
        }
        for(var k in this.children) {
            this.children[k].notify();
        }
        this.I_emitter = null;
        this.L_emitter = null;
        this.parent = null;
    }
};

function RootEmitNode(env) {
    this.children = {};
    this.env = env;
    this.path = null;
}
RootEmitNode.prototype = {
    val : function(var_name) {
        return this.env.$get(var_name);
    },
    destroy : function() {
        for(var k in this.children) {
            this.children[k].destroy();
        }
        this.env = null;
    }
};

function ImmEmitter(node) {
    this.node = node;
    this.pre_value = node.val();
    this.cur_value = this.pre_value;
    this.listeners = [];
}
ImmEmitter.prototype = {
    notify : function() {
        this.cur_value = this.node.val();
        if(!this.cur_value instanceof JArray && this.cur_value === this.pre_value) {
            return;
        }
        for(var i=0;i<this.listeners.length;i++) {
            this.listeners[i].notify(this.node.path, this.cur_value, this.pre_value);
        }
        this.pre_value = this.cur_value;
    },
    destroy : function() {
        this.node = null;
        this.pre_value = null;
        this.cur_value = null;
        for(var i=0;i<this.listeners.length;i++) {
            this.listeners[i].destroy();
        }
        this.listeners.length = 0;
    }
};

function LazyEmitter(node) {
    this.base(node);
    this.handler = $bind(this, this.deal);
    this.tm = null;
}
LazyEmitter.prototype = {
    notify : function() {
        if(this.tm !== null) {
            clearTimeout(this.tm);
            this.tm = null;
        }
        this.tm = setTimeout(this.handler, 0);
    },
    deal : function() {
        this.tm = null;
        this.callBase('notify');
    }
};
$inherit(LazyEmitter, ImmEmitter);