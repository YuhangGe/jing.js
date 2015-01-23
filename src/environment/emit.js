function Emitter(id) {
    this.id = id;
    this.listeners = [];
    this.children = {};
}
Emitter.prototype = {
    tell : function(type, value) {
        var ls = this.listeners,
            chs = this.children;
        for(var i=0;i<ls.length;i++) {
            ls[i].tell(new EmitEvent(this.id, type, value));
        }
        for(var k in chs) {
            chs[k].tell(type, value);
        }
    }
};

function EmitEvent(id, type, value) {
    this.id = id;
    this.type = type;
    this.value = value;
}