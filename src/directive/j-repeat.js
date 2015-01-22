function JRepeat(ele, attr, drive_module, env, expr) {
    this.ele = ele;
    this.env = env;
    this.expr = expr;
    this.attr = attr;
    this.module = drive_module;
    this.r_envs = [];
    this.r_eles = [];
    this.frag = null;
}
var __jrepeate_prototype = JRepeat.prototype;
__jrepeate_prototype.run = function() {
    $css(this.ele, 'display', 'none');

    this.render();



    this.env.$watch(this.expr, function(var_name, new_value, j_repeat) {
        //todo watch j-repeat
    }, this);
};
__jrepeate_prototype.render = function() {
    var array = this.expr[1].exec(this.env);
    var frag = document.createDocumentFragment();
    var r_ele, r_env, r_props;
    if(array instanceof Array) {
        for(var i=0;i<array.length;i++) {
            r_ele = this.ele.cloneNode(true);
            r_env = this.env.$child();
            r_props = {
                '@index' : i,
                '@item' : array[i],
                '@first' : i===0,
                '@last' : i===array.length-1,
                '@middle' : i!==0 && i!==array.length-1,
                '@key' : i
            };
            r_props[this.expr[0].value] = array[i];
            r_env.$props = r_props;
            drive_render_element(r_ele, this.attr, this.module, r_env);
            frag.appendChild(r_ele);
        }
    } else if(typeof array === 'object') {
        //todo j-repeat for key-value Object
        throw 'TODO: j-repeat for object.';
        //for(var kn in array) {
        //
        //}
    } else {
        log('value of j-repeat is not Array or key-value Object.');
        return;
    }
    if(this.frag !== null) {
        this.ele.parentNode.removeChild(this.frag);
        this.frag = null;
    }
    this.ele.parentNode.insertBefore(frag, this.ele);
    this.frag = frag;
};

function directive_deal_j_repeat(ele, attr, drive_module, env) {
    var item = attr.removeNamedItem('j-repeat'),
        expr_str = item.value;

    var expr = parse_expression(expr_str);
    if(expr.type !== 'in') {
        throw 'j-repeat format wrong!';
    }

    /*
     * 把逻辑放在Class里面，不使用函数的闭包。
     */
    new JRepeat(ele, attr, drive_module, env, expr).run();
}