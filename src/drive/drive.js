/*
 * require scope.js
 */
function drive_element(ele) {
    directive_run(ele);
    directive_parse(ele);
    var j_ctrl = $attr(ele, 'j-ctrl');
    var p_ctrl = false;
    if(j_ctrl && scope_push(j_ctrl)) {
        p_ctrl = true;
    }
    //这里使用递归的方法来遍历所有元素。当一个页面有海量的元素时，递归有可能存在内存问题。
    var c_ele = ele.children;
    if(c_ele.length > 0) {
        for(var i=0;i<c_ele.length;i++) {
            drive_element(c_ele[i]);
        }
    }
    if(p_ctrl) {
        scope_pop();
    }
}


