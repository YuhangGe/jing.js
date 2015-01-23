var __event_table = {
    on : {}, //on
    be : {}, //before
    af : {}  //after
};

var __event_jid_counter = 0;

function event_jid(ele) {
    if(!ele.id) {
        ele.id = 'j.ele.' + (__event_jid_counter++).toString(36);
    }
    return ele.id;
}

function event_bind_stop(ev) {
    ev.__is_p_stoped = false;
    ev.stopPropagation = function() {
        this.__is_p_stoped = true;
    };
}
function event_is_stop(ev) {
    return ev.__is_p_stoped === true;
}

function event_global_handler(event) {

    var event_name = event.type;
    var event_ele = event.target || event.srcElement || event.originalTarget;

    var et, ls, jid, i;
    var table = __event_table.on;
    if(!$hasProperty(table, event_name)) {
        return;
    }
    et = table[event_name];

    event_bind_stop(event);


    while(!event_is_stop(event) && event_ele) {
        jid = $attr(event_ele, 'id');
        if(jid && $hasProperty(et, jid)) {
            ls = et[jid];
            for(i=0;i<ls.length;i++) {
                ls[i].call(event_ele, event);
            }
        }
        event_ele = event_ele.parentElement;
    }

}

function event_before(ele, event_name, handler) {

}

function event_on(ele, event_name, handler) {
    var jid = event_jid(ele);
    var table = __event_table.on,
        et;
    if(!$hasProperty(table, event_name)) {
        et = table[event_name] = {};
        $on(document.body, event_name, event_global_handler);
    } else {
        et = table[event_name];
    }
    var ls;
    if(!$hasProperty(et, jid)) {
        ls = et[jid] = [];
    } else {
        ls = et[jid];
    }
    ls.push(handler);
}

function event_on_remove() {

}

function event_check_directive(value) {
    var m = /^\s*(\w+)\s*:(.+)$/.match(value);
    if(m === null) {
        return null;
    }
    return {
        on : m[1],
        expr : m[2]
    }
}