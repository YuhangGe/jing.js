function JRepeat(ele, attr, drive_module, key, env, expr) {
    this.ele = ele;
    this.cmt = document.createComment(ele.outerHTML);
    this.env = env;
    this.expr = expr;
    this.attr = attr;
    this.key = key;
    this.module = drive_module;
    this.frag = null;
    var listener = environment_watch_expression(env, expr, function(change_list, repeater) {
        repeater.update(change_list[0].cur_value);
    }, this, 10);
    listener.compare = false;

    this.val = listener.cur_value;

    ele.parentNode.insertBefore(this.cmt, ele);
    ele.parentNode.removeChild(ele);

    this.render();
}
var __jrepeate_prototype = JRepeat.prototype;
__jrepeate_prototype.update = function() {

};
__jrepeate_prototype.render = function() {
    var array = this.val;
    if(!(array instanceof JArray)) {
        throw 'only support Array in j-repeat.';
    }
    var frag = document.createDocumentFragment();
    var r_ele, r_env;
    for(var i=0;i<array.length;i++) {
        r_ele = this.ele.cloneNode(true);
        r_env = this.env.$child(i);
        r_env.$prop = {
            '@index' : i,
            '@item' : array[i],
            '@first' : i===0,
            '@last' : i===array.length-1,
            '@middle' : i!==0 && i!==array.length-1,
            '@key' : i
        };
        r_env[this.key] = array[i];
        drive_render_element(r_ele, this.attr, this.module, r_env);
        frag.appendChild(r_ele);
    }
    if(this.frag !== null) {
        this.cmt.parentNode.removeChild(this.frag);
        this.frag = null;
    }

    __drive_insert_b.push({
        ele : frag,
        pos : this.cmt
    });

    this.frag = frag;
};

function directive_deal_j_repeat(ele, attr, drive_module, env) {
    var item = attr.removeNamedItem('j-repeat'),
        expr_str = item.value;

    var expr = parse_expression(expr_str);
    if(expr.type !== 'in') {
        throw 'j-repeat format wrong!';
    }

    new JRepeat(ele, attr, drive_module, expr.nodes[0], env, expr.nodes[1]);
}