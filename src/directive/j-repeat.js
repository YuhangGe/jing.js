function JRepeat(ele, attr, drive_module, key, env, expr) {
    this.ele = ele;
    this.cmt = document.createComment(ele.outerHTML);
    this.env = env;
    this.expr = expr;
    this.attr = attr;
    this.key = key;
    this.module = drive_module;
    this.frag = null; // document.createDocumentFragment();
    var listener = environment_watch_expression(env, expr, function(change_list, repeater) {
        repeater.update(change_list[0].cur_value);
    }, this, 10);
    listener.compare = false;

    this.val = listener.cur_value;

    this.dom_items = [];

    $$before(this.cmt, ele);
    $$remove(ele);


    this.render();
}
var __jrepeate_prototype = JRepeat.prototype;
__jrepeate_prototype.update = function() {
    /*
     * 目前是简单地重新全部更新元素。是一种很低效率的方式。
     * todo 采用diff的思想，只更新发生变化的元素。
     */
    for(var i=0;i<this.dom_items.length;i++) {
        $$remove(this.dom_items[i]);
    }
    this.dom_items.length = 0;
    this._get();
    $$before(this.frag, this.cmt);
};
__jrepeate_prototype._get = function() {
    var array = this.val;
    if(!(array instanceof JArray)) {
        throw 'only support Array in j-repeat.';
    }
    var r_ele, r_env;
    var frag = document.createDocumentFragment();
    for(var i=0;i<array.length;i++) {
        r_ele = this.ele.cloneNode(true);
        r_env = environment_create_child(this.env, i);
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
        this.dom_items.push(r_ele);
    }
    this.frag = frag;
};

__jrepeate_prototype.render = function() {
    this._get();
    __drive_insert_b.push({
        ele : this.frag,
        pos : this.cmt
    });

};

function directive_deal_j_repeat(ele, attr, drive_module, env) {
    var item = attr.removeNamedItem('j-repeat'),
        expr_str = item.value;

    var expr = parse_expression(expr_str, true);
    if(expr.type !== 'in') {
        throw 'j-repeat format wrong!';
    }

    new JRepeat(ele, attr, drive_module, expr.nodes[0], env, expr.nodes[1]);
}