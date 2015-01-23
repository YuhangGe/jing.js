function Listener(id, handler, data, lazy_time) {
    this.id = id;
    this.lazy = $isNumber(lazy_time) ? ((lazy_time = Math.floor(lazy_time)) >=0 ? lazy_time : 0) : 0;
    this.handler  = handler;
    this.data = data;
    this.timeout = null;
    this.emit_events = [];
    this.delegate = $bind(this, this.deal);
}
Listener.prototype = {
    tell : function(emit_event) {
        if(this.timeout !== null) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
        this.emit_events.push(emit_event);
        this.timeout = setTimeout(this.delegate, this.lazy);
    },
    deal : function() {
        this.handler(this.emit_events, this.data);
        this.emit_events.length = 0;
        this.timeout = null;
    }
};