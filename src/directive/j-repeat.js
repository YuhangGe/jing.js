function j_repeat_env(env, key, jarray, index) {

    env.__.jarray = jarray;
    env.__.index = index;

    var jen = jarray.__.en.children[index];
    if(!jen) {
        jen = jarray.__.en.children[index] = new EmitNode(index, jarray.__.en);
    }
    env.__.emit_tree.children[key] = jen;

    $defineProperty(env, __env_emit_name, {});
    $defineProperty(env, __env_prop_name, {});
    env[__env_prop_name][key] = null;
    env[__env_emit_name][key] = jen;

    $defineGetterSetter(env, key, function() {
        return this.__.jarray[this.__.index];
    }, function(val) {
        this.__.jarray[this.__.index] = val;
    }, false, true);
}

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
        var c = change_list[0];
        if(c.type !== 'child') {
            log('j-repeat update. todo: use diff strategy');
            repeater.update(change_list[0].cur_value);
        }
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
        it.env.$destroy();
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

    function replace_env_listener_var_key(env, org_key, org_reg, dst_key) {
        /*
         * todo 检查<li j-repeat><p j-env><li j-repeat><p j-env></p></li></p></li>这种复杂的嵌套情况，
         *
         */
        var ls = env.__.listeners, k, var_tree, t;
        for(k in ls) {
            var_tree = ls[k].var_tree;
            for(t in var_tree) {
                if(t === org_key) {
                    var_tree[dst_key] = var_tree[t];
                } else if(org_reg.test(t)) {
                    var_tree[t.replace(org_key, dst_key)] = var_tree[t];
                }
            }
        }
        for(var c in env.__.children) {
            replace_env_listener_var_key(env.__.children[c], org_key, dst_key);
        }
    }

    var array = this.val;
    if(!(array instanceof JArray)) {
        throw new Error('only support Array in j-repeat.');
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
        j_repeat_env(r_env, this.key, array, i);
        /*
         * 目前是对每一次复制的元素进行render，包括解析directive和view。
         * todo 可以考虑复用directive和view，这样就不需要每次循环都去drive_render_view. destroy之前的元素的已经$watch的表达式。
         */
        drive_render_element(r_ele, this.attr, this.module, r_env);

        replace_env_listener_var_key(r_env, this.key, new RegExp('^'+this.key+'\\.'), array.__.en.children[i].path);
        //log(r_env);

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