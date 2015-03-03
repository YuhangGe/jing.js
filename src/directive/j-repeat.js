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

    this.items = [];

    $$before(this.cmt, ele);
    $$remove(ele);


    this.render();
}
var __jrepeate_prototype = JRepeat.prototype;
__jrepeate_prototype.update = function(new_value) {
    /*
     * 目前是简单地重新全部更新元素。是一种很低效率的方式。
     * 同时，已经$watch的表达式没有被destroy
     * todo 采用diff的思想，只更新发生变化的元素。
     */
    for(var i=0;i<this.items.length;i++) {
        var it = this.items[i];
        $$remove(it.ele);
        var env = it.env,
            v = it.val;

        var et = v[__env_emit_name];
        if(!et) {
            continue;
        }
        for(var k in et) {
            if(et[k].env === env) {
                //log(k);
                delete et[k];
            }
        }
        //env.$destroy(); //todo $destroy previous environment
        it.env = null;
        it.ele = null;
        it.val = null;
    }
    this.items.length = 0;
    this.val = new_value;
    this._get();
    __drive_insert_b.push({
        ele : this.frag,
        pos : this.cmt
    });
    drive_insert_before();
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
        /*
         * 目前是对每一次复制的元素进行render，包括解析directive和view。
         * todo 可以考虑复用directive和view，这样就不需要每次循环都去drive_render_view. destroy之前的元素的已经$watch的表达式。
         */
        drive_render_element(r_ele, this.attr, this.module, r_env);
        frag.appendChild(r_ele);
        this.items.push({
            ele : r_ele,
            env : r_env,
            val : array[i]
        });
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