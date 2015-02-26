var __module_dom_ready = false;
var __module_drive_queue = {};

function module_apply_drive() {
    var id, d_item, r_list, j;
    for(id in __module_drive_queue) {
        d_item = __module_drive_queue[id];
        if(d_item.init) {
            continue;
        }
        r_list = d_item.module.__.runs;
        for(j=0;j<r_list.length;j++) {
            r_list[j](d_item.module, d_item.env);
        }
        drive_parse_element(d_item.ele, d_item.module, d_item.env);
        d_item.init = true;
    }
}

$on(document, 'DOMContentLoaded', function() {
    if(!__module_dom_ready) {
        __module_dom_ready = true;
        module_apply_drive();
    }
});

$defineProperty(__module_prototype, 'drive', function drive(element) {
    if(this.parent) {
        throw 'function "drive" can only be applied to root Module';
    }
    var id = event_jid(element), d_item = __module_drive_queue[id];
    if(d_item) {
        throw 'element can\'t be driven more than once';
    } else {
        d_item = {
            init : false,
            env : new Environment(id),
            ele : element,
            module : this
        };
        __module_drive_queue[id] = d_item;
    }

    if(__module_dom_ready) {
        module_apply_drive();
    }

    return this;
});

$defineProperty(__module_prototype, 'init', function(func) {
    if(this.parent) {
        throw 'function "init" can only be applied to root Module';
    }
    if(typeof func === 'function') {
        this.__.runs.push(func);
    }
    return this;
});

$defineProperty(__module_prototype, 'conf', function(options) {
    for(var kn in options) {
        this.__.config[kn] = options[kn];
    }
    return this;
});
