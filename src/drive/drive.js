/*
 * require scope
 */
var __JDN = 'j-directive-name';
var __JDV = 'j-directive-value';

function drive_directive_name_value(ele, scope) {
    var dn = $attr(ele, __JDN).split(','),
        dv = $attr(ele, __JDV).split(',');
    if(dn.length === 0 || dn.length !== dv.length) {
        throw 'j-directive-name and j-directive-value format wrong.'
    }
    var i, ns, val, dire, link_scope, parent_scope;
    for(i=0;i<dn.length;i++) {
        ns = dn[i].trim();
        val = dv[i].trim();
        dire = __directive_full_table[ns];
        if(!dire) {
            throw 'directive "' + ns + '" not found!';
        }
        link_scope = drive_run_directive(ele, dire, scope, val);
        if(dire.scope_type === __SCOPE_TYPE_PARENT) {
            if(parent_scope) {
                throw 'directive with scope_type:jing.scope_types.PARENT can be occur once on one element!';
            } else {
                parent_scope = link_scope;
            }
        }
    }
    return parent_scope;
}

function drive_run_directive(element, directive, scope, val) {
    directive_initialize(directive);
    var scope_type = directive.scope_type,
        link_func = directive.link_func;
    var link_scope = (scope_type === __SCOPE_TYPE_CREATE
    || scope_type === __SCOPE_TYPE_PARENT) ? scope.$child() : scope;
    //todo parse value such as 'test(name) | toUpper'
    link_func(directive.module, link_scope, element, val, directive.name);
    return link_scope;
}

function drive_parse_element(ele, parent_scope) {
    var i, an;
    var attr_array, directive, link_scope, new_parent_scope;
    if($hasAttr(ele, [__JDN, __JDV])) {
        new_parent_scope = drive_directive_name_value(ele, parent_scope);
    } else if(ele.hasAttributes()) {
        attr_array = ele.attributes;
        for(i=0;i<attr_array.length;i++) {
            an = attr_array[i];
            if(an.name === __JDN || an.name === __JDV) {
                continue;
            }
            directive = __directive_short_table[an.name];
            if(!directive) {
                log('directive not found!');
            }
            link_scope = drive_run_directive(ele, directive, parent_scope, an.value);
            if(directive.scope_type === __SCOPE_TYPE_PARENT) {
                if(new_parent_scope) {
                    throw 'directive with scope_type:jing.scope_types.PARENT can be occur once on one element!';
                } else {
                    new_parent_scope = link_scope;
                }
            }
        }
    } else {
        throw 'hasAttributes() not support!';
    }

    drive_render_view(ele, new_parent_scope ? new_parent_scope : parent_scope);

    //这里使用递归的方法来遍历所有元素。当一个页面有海量的元素时，递归有可能存在内存问题。
    var c_ele = ele.children;
    for(i=0;i<c_ele.length;i++) {
        drive_parse_element(c_ele[i], new_parent_scope ? new_parent_scope : parent_scope);
    }

}
