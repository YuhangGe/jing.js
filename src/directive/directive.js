var __directive_short_table = {};
var __directive_full_table = {};

function directive_register(directive) {
    var name = directive.name;
    if($isArray(name)) {
        for(var i=0;i<name.length;i++) {
            r(name[i], directive);
        }
    } else {
        r(name, directive);
    }

    function r(n, d) {
        __directive_short_table[n] = d;
        __directive_full_table[d.module.path + '.' + n] = d;
    }
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

function directive_create(name, func) {
    directive_register(new Directive(__root_module, name, func));
}