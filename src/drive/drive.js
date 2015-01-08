/*
 * require scope
 */
function drive_element(ele, module, scope) {

    drive_directive(ele, module, scope);
    drive_parse(ele, module, scope);

    var j_ctrl = $attr(ele, 'j-ctrl');
    var ctrl = j_ctrl ? module.controller(j_ctrl) : null;

    //这里使用递归的方法来遍历所有元素。当一个页面有海量的元素时，递归有可能存在内存问题。
    var c_ele = ele.children;
    for(var i=0;i<c_ele.length;i++) {
        drive_element(c_ele[i], module, ctrl ? ctrl.$scope : scope);
    }
}


