var __drive_insert_b = [];

function drive_insert_before() {
    $each(__drive_insert_b, function(it) {
        it.pos.parentNode.insertBefore(it.ele, it.pos);
    });
    __drive_insert_b.length = 0;
}

function drive_run_directive(element, drive_module, directive, env, val) {
    directive_initialize(directive);
    var link_func = directive.link_func;
    link_func(drive_module, directive.module, env, element, val, directive.name);
}

function drive_render_element(ele, attr, drive_module, env) {
    var i, item, directive, cur_env = env;


    item = attr.getNamedItem('j-async-env');
    if(item !== null) {
        directive_deal_j_async_env(ele, attr, drive_module, cur_env);
        /*
         * 由于j-async-env是异步加载的Environment，因此直接返回，等待加载。
         */
        return;
    }


    item = attr.getNamedItem('j-include');
    if(item !== null) {
        directive_deal_j_include(ele, attr, drive_module, cur_env);
        /*
         * j-include也是直接返回，等待加载。
         * 注意j-include要放在j-env之后检测。
         */
        return;
    }


    item = attr.getNamedItem('j-repeat');
    if(item !== null) {
        directive_deal_j_repeat(ele, attr, drive_module, cur_env);
        /*
         * j-repeat里面会生成重复的元素，再对这些重复的元素进行drive_render_element.
         * 因此这里直接返回，不再进行接下来的操作。
         */
        return;
    }

    /*
     * 代码执行到这里的时候，attr里面已经不再有以上的j-env, j-async-env, j-repeat
     * 这也是为什么drive_render_element这个函数接受attr参数，
     * 而不是在函数内部通过ele.attributes来取得的原因。
     */

    item = attr.getNamedItem('j-directive-name');
    if(item !== null) {
        //todo
    }

    for(i=0;i<attr.length;i++) {
        item = attr[i];
        directive = __directive_short_table[item.name];
        if(directive) {
            drive_run_directive(ele, drive_module, directive, cur_env, item.value);
        }
    }

    item = attr.getNamedItem('j-env');
    if(item !== null) {
        cur_env = env.$child(item.value);
        directive_deal_j_env(ele, attr, drive_module, cur_env);
    }

    /*
     * 使用递归的方式遍历DOM树。目前来看性能是可以保障的。
     */
    var chs = ele.childNodes;
    for(i=0;i<chs.length;i++) {
        var ce = chs[i];
        //if(ele.nodeName==='UL' && ce.nodeType === 1) {
        //    log(ce);
        //}
        drive_parse_element(ce, drive_module, cur_env);
    }

}

function drive_parse_element(ele, drive_module, env) {
    /*
     * check nodeType. see https://developer.mozilla.org/zh-CN/docs/Web/API/Node.nodeType
     */
    switch (ele.nodeType) {
        case 1:
            // Element
            drive_render_element(ele, ele.attributes, drive_module, env);
            break;
        case 3:
            // #text
            drive_render_view(ele, env);
            break;
        default:
            //ignore other.
            break;
    }
}
