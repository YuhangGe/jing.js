var __drive_expr_REG = /\{\{.+?\}\}/g;

function RenderPiece(type, value) {
    this.type = type;
    this.value = value;
}

function drive_get_view_expr(txt) {
    var piece_start = 0;
    var piece_array = [];
    var piece;

    while((piece = __drive_expr_REG.exec(txt))!==null) {
        if(piece.index > piece_start) {
            piece_array.push(new ConstantGrammarNode(txt.substring(piece_start, piece.index)));
        }
        piece_start = piece.index + piece[0].length;
        piece_array.push(parse_expression(piece[0], true));
    }
    if(piece && piece_start < txt.length) {
        piece_array.push(new ConstantGrammarNode(txt.substring(piece_start)));
    }

    if(piece_array.length === 0) {
        return null;
    } else if(piece_array.length === 1) {
        return piece_array[0];
    }

    var ea = piece_array[0], eb;
    /*
     * 当前的处理方式，是把内容转成相加的表达式，
     *   比如<p>hello {{name}}</p>会转成  "Hello" + name。
     *   这样会存在一个小问题，比如<p>{{age}}{{year}}</p>
     *   转成  age + year，如果age和year都是数字，就会被以数学的方式加起来。
     *   为了简单起见，采取的解决方法是，在最左边添加一个空字符串，
     *   这样相加的时候会从左往右计算，javascript会以字符串形式链接 '' + age + year
     */
    if(ea.type !== 'constant' || !$isString(ea.value)) {
        piece_array.unshift(new ConstantGrammarNode(''));
        ea = piece_array[0];
    }

    for(var i=1;i<piece_array.length;i++) {
        eb = piece_array[i];
        if(ea.type === 'constant' && eb.type === 'constant') {
            ea = new ConstantGrammarNode(ea.value + eb.value);
        } else {
            ea = new CalcGrammarNode("#+", ea, eb);
        }
    }

    return ea;
}

function drive_render_view(ele, env) {
    var txt = ele.textContent;
    var expr = drive_get_view_expr(txt);

    if(expr === null) {
        return;
    } else if(expr.type === 'constant') {
        ele.textContent = expr.value;
        return;
    }

        var listener = environment_watch_expression(env, expr, drive_view_observer, {
            ele : ele
        }, 10);



    ele.textContent = listener.cur_value;
}

function drive_view_observer(change_list, data) {
    data.ele.textContent = change_list[0].cur_value;
}