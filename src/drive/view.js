var __drive_view_REG = /\{\{.+?\}\}/g;

function RenderPiece(type, value) {
    this.type = type;
    this.value = value;
}

function drive_render_view(ele, scope) {
    var txt = ele.textContent;
    var expr = null;
    var piece_start = 0;
    var piece_array = [];
    while((expr = __drive_view_REG.exec(txt))!==null) {
        if(expr.index > piece_start) {
            piece_array.push(new RenderPiece(0, txt.substring(piece_start, expr.index)));
        }
        piece_start = expr.index + expr[0].length;
        piece_array.push(new RenderPiece(1, parse_expression(expr[0])));
    }
    if(expr === null) {
        return;
    } else if(piece_start < txt.length) {
        piece_array.push(new RenderPiece(0, txt.substring(piece_start)));
    }

    for(var i=0;i<piece_array.length;i++) {
        if(piece_array[i].type === 1) {
            scope.$watch(piece_array[i].value, drive_view_observer, {
                element : ele,
                pieces : piece_array,
                piece_idx : i
            });
        }
    }

    var val = scope.$get(m[1]);
    if(!val) {
        log('"'+m[1]+'" not found in scope: ' + scope.$name);
    }
    cn[i].textContent = txt.replace(m[0], val);
    var template = txt.replace(m[0], "{{0}}");



    //todo 一个textNode里面可能有多个{{var_name}}，并且{{var_name}}可能有重复。
}

function drive_view_observer( var_name, new_value, data) {
    //data.element.textContent =
}