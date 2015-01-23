var __directive_short_table = {};
var __directive_full_table = {};
var __directive_inner_table = {};

function directive_put_inner(ele, inner) {
    var jid = event_jid(ele),
        inner_array;
    if(!$hasProperty(__directive_inner_table, jid)) {
        inner_array = __directive_inner_table[jid] = [];
    } else {
        inner_array = __directive_inner_table[jid];
    }
    inner_array.push(inner);
}

function directive_destroy_inner(ele) {
    var jid = ele.id,
        inner_array;
    if(!$hasProperty(__directive_inner_table, jid)) {
        return;
    }
    inner_array = __directive_inner_table[jid];
    for(var i=0;i<inner_array.length;i++) {
        inner_array[i].destroy();
        inner_array[i] = null;
    }
    inner_array.length = 0;
    delete __directive_inner_table[jid];
}

function directive_initialize(dire) {
    if(!dire) {
        debugger;
    }
    if(dire.state === 0) {
        dire.state = 999;
        var df = dire.func(dire.module);
        dire.state = 1;
        dire.link_func = df;
    }
}

function directive_register(directive) {
    __directive_short_table[directive.name] = directive;
    __directive_full_table[directive.module.path + '.' + directive.name] = directive;
}

function directive_create(name, scope_type, func) {
    directive_register(new Directive(__root_module, name, scope_type, func));
}