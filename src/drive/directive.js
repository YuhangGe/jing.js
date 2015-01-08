/*
 * require scope
 */
function drive_directive(ele, module, scope) {
    module.__directive_enum(function(name, directive) {
        var val,
            dn = $attr(ele, name);
        if(!dn) {
            return;
        }
        val = scope[dn];
        if(typeof val !== 'undefined') {
            directive(ele, scope, val, dn);
        }
    });
}
