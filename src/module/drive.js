var __module_drive_queue = {};
var __module_doc_ready = false;

function module_apply_drive() {
    console.time('ttt');
    var id, d_item, r_list, j;
    for(id in __module_drive_queue) {
        d_item = __module_drive_queue[id];
        if(d_item.init) {
            continue;
        }
        r_list = d_item.module.__.runs;
        for(j=0;j<r_list.length;j++) {
            r_list[j].call(d_item.env, d_item.module, d_item.env);
        }

        drive_parse_element(d_item.ele, d_item.module, d_item.env);

        drive_insert_before();

        d_item.init = true;
    }
    console.timeEnd('ttt');
}

$ready(function() {
   if(!__module_doc_ready) {
       __module_doc_ready = true;
   }
});

function module_get_root_env(element) {
    var id = event_jid(element),
        d_item = __module_drive_queue[id];
    if(!d_item) {
        return null;
    } else {
        return d_item.env;
    }
}

function module_drive_add(module, element) {
    var id = event_jid(element),
        d_item = __module_drive_queue[id];
    if(d_item) {
        throw 'element can\'t be driven more than once';
    } else {
        d_item = {
            init : false,
            env : new Environment(id),
            ele : element,
            module : module
        };
        __module_drive_queue[id] = d_item;
    }
}
$defineProperty(__module_prototype, 'drive', function drive(element) {
    if(this.parent) {
        throw 'function "drive" can only be applied to root Module';
    }
    if($isString(element)) {
        element = document.querySelector(element);
    }
    module_drive_add(element);

    if(__module_doc_ready) {
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
