function drive_render_view(ele, scope) {
    var cn = ele.childNodes;
    if(cn.length === 0) {
        return;
    }
    for(var i=0;i<cn.length;i++) {
        if(cn[i].nodeName !== '#text'){
            continue;
        }
        var txt = cn[i].textContent;
        var m = txt.match(/\{\{\s*([\w\d_]+)\s*\}\}/);
        if(!m) {
            continue;
        }

        var val = $scope.$get(m[1]);
        if(!val) {
            console.log('"'+m[1]+'" not found in scope: ' + $scope.$name);
            continue;
        }
        cn[i].textContent = txt.replace(m[0], val);
        var template = txt.replace(m[0], "{{0}}");

        $scope.$watch(m[1], function(var_name, new_value, data) {
            data.ele.textContent = data.tem.replace("{{0}}", new_value);
        }, {
            ele : cn[i],
            tem : template
        });

        //todo 一个textNode里面可能有多个{{var_name}}，并且{{var_name}}可能有重复。
    }
}
