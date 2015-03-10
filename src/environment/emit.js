function EmitNode(id, parent) {
    this.id = id;
    this.children = {};
    this.parent = parent;
    this.path = (parent.path ? parent.path + '.' : '') + id;
    this.I_emitter = new ImmEmitter(this.path);
    this.L_emitter = new LazyEmitter(this.path);
}
EmitNode.prototype = {
    /*
     * _notify_emitter
     */
    _ne : function(emit_type) {
        this.I_emitter.notify(emit_type);
        this.L_emitter.notify(emit_type);
    },
    notify : function() {
        this._ne("self");
        this._nc();
        if(this.parent) {
            this.parent._nu();
        }
    },
    item_notify : function(index) {
        var cn = this.children[index];
        if(cn) {
            cn._ne('self');
            cn._nc();
        }
        this._nu();
    },
    /*
     * _notify_down
     * @private
     */
    _nd : function() {
        this._ne("parent");
        this._nc();
    },
    /*
     * _notify_children
     * @private
     */
    _nc : function() {
        for(var k in this.children) {
            this.children[k]._nd();
        }
    },
    /**
     * _notify_up
     * @private
     */
    _nu : function() {
        this._ne("child");
        if(this.parent) {
            this.parent._nu();
        }
    },
    destroy : function() {
        this.I_emitter.destroy();
        this.L_emitter.destroy();
        for(var k in this.children) {
            this.children[k].destroy();
            delete this.children[k];
        }
        this.I_emitter = null;
        this.L_emitter = null;
        this.parent = null;
    }
};

function RootEmitNode() {
    this.children = {};
}
RootEmitNode.prototype = {
    destroy : function() {
        for(var k in this.children) {
            this.children[k].destroy();
            this.children[k] = null;
        }
    }
};

function ImmEmitter(path) {
    this.listeners = [];
    this.path = path;
}
ImmEmitter.prototype = {
    reset : function() {
        /*
         * 这里我们并不需要destroy每一个listener，因为我们认为destroy某个listener
         * 是该listener所在environment的API职责，因为listener并不知道自己是属于哪个Env的。
         *
         * 在jing.js内部，目前只在jarray.js文件中，当数组元素减少时调用了这个函数。
         *   数组元素减少时，相应的子Env在j-repeat.js中会被$destroy，这时候这些listener就被destroy了。
         */
        this.listeners.length = 0;
    },
    notify : function(emit_type) {
        for(var i=0;i<this.listeners.length;i++) {
            this.listeners[i].notify(emit_type, this.path);
        }
    },
    addListener : function(listener) {
        if(this.listeners.indexOf(listener)<0) {
            this.listeners.push(listener);
            listener.emitters.push(this);
        }
    },
    destroy : function() {
        for(var i=0;i<this.listeners.length;i++) {
            this.listeners[i].destroy();
        }
        this.listeners.length = 0;
    }
};

function LazyEmitter(path) {
    this.base(path);
    this.handler = $bind(this, this.deal);
    this.tm = null;
    this.et = '';
}
LazyEmitter.prototype = {
    notify : function(emit_type) {
        if(this.tm !== null) {
            clearTimeout(this.tm);
            this.tm = null;
        }
        this.et = emit_type; //只记录最后一次的变化类型。
        this.tm = setTimeout(this.handler, 0);
    },
    deal : function() {
        this.tm = null;
        this.callBase('notify', this.et);
    },
    destroy : function() {
        if(this.tm !== null) {
            clearTimeout(this.tm);
            this.tm = null;
        }
        this.callBase('destroy');
    }
};
$inherit(LazyEmitter, ImmEmitter);