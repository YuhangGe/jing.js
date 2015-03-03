/**
 * j-style可以使用两种方式。
 *   一种是使用嵌入表达式，
 *   比如<div j-style="background: {{bg-color}}; font-size:{{size}}"></div>。
 *   一种是使用完整表达式，
 *   比如<div j-style="st"></div>，其中st是在environment里定义的变量，可以是字符串也可以是json
 */
directive_create('j-style', function() {
    var pE = document.createElement('div');
    var pF = ['-webkit-', '-moz-', '-ms-'];
    var cF = ['Webkit', 'Moz', 'ms'];
    var imRegex = /!important;?$/;
    function prefix(key) {
        var camel = key.replace(/[-_](\w)/g, function(_, f) {
            return f.toUpperCase();
        });
        if (camel in pE.style) {
            return key;
        }
        var upper = camel.charAt(0).toUpperCase() + camel.slice(1);

        var i = cF.length;
        var prefixed;
        while (i--) {
            prefixed = cF[i] + upper;
            if (prefixed in pE.style) {
                return pF[i] + key;
            }
        }

        return false;
    }

    function apply_style(ele, style_value) {
        var s_key, c_key, c_val, im;
        if($isObject(style_value)) {
            for(s_key in style_value) {
                c_key = prefix(s_key);
                if(!c_key) {
                    return;
                }
                c_val = style_value[s_key];
                im = imRegex.test(c_val);
                if(im) {
                    c_val = c_val.replace(imRegex, '');
                    ele.style.setProperty(c_key, c_val, 'important');
                } else {
                    ele.style.setProperty(c_key, c_val, '');
                }
            }
        } else if($isArray(style_value)) {
            ele.style = style_value.join(';');
        } else {
            ele.style = style_value;
        }
    }
    return function(drive_module, directive_module, env, element, attr_value) {
        var expr = drive_get_view_expr(attr_value);
        if(expr === null) {
            expr = parse_expression(attr_value, true);
        }


        var listener = environment_watch_expression(env, expr, function(change_list, data) {
            apply_style(data.ele, change_list[0].cur_value);
        }, {
            ele : element
        }, 10);

        apply_style(element, listener.cur_value);

    }
});