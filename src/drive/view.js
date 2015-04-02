function drive_get_view_expr(txt) {
  var piece_start = 0;
  var piece_array = [];
  var piece;
  var expr;
  var is_str_expr = true;
  while ((piece = __drive_view_expr_REG.exec(txt)) !== null) {
    if (piece.index > piece_start) {
      piece_array.push(txt.substring(piece_start, piece.index));
    }
    piece_start = piece.index + piece[0].length;
    expr = piece[1];
    if (__jing_regex_var.test(expr)) {
      var v_str = environment_var2format(expr);
      var v_items = $map(v_str.split('.'), function (item) {
        item = item.trim();
        return /^\d+$/.test(item) ? parseInt(item) : item;
      });
      piece_array.push(v_items);
    } else {
      is_str_expr = false;
      piece_array.push(parse_expression(piece[1], true));
    }
  }

  if (piece_array.length === 0) {
    return null;
  } else {
    if (piece_start < txt.length) {
      piece_array.push(txt.substring(piece_start));
    }
  }

  if (is_str_expr) {
    return piece_array;
  }
  if (piece_array.length === 1) {
    return piece_array[0];
  }

  function get_piece_expr(idx) {

    function create_node(arr, i) {
      return i === 0 ? new VariableGrammarNode(arr[i]) : new PropertyGrammarNode(create_node(arr, i - 1), new ConstantGrammarNode(arr[i]));
    }
    var ea = piece_array[idx];
    var node;
    if ($isArray(ea)) {
      node = create_node(ea, ea.length - 1);
    } else if ($isObject(ea)) {
      node = ea;
    } else {
      node = new ConstantGrammarNode(ea);
    }
    return node;
  }

  var ea = get_piece_expr(0), eb;
  /*
   * 当前的处理方式，是把内容转成相加的表达式，
   *   比如<p>hello {{name}}</p>会转成  "Hello" + name。
   *   这样会存在一个小问题，比如<p>{{age}}{{year}}</p>
   *   转成  age + year，如果age和year都是数字，就会被以数学的方式加起来。
   *   为了简单起见，采取的解决方法是，在最左边添加一个空字符串，
   *   这样相加的时候会从左往右计算，javascript会以字符串形式链接 '' + age + year
   */
  if (ea.type !== 'constant' || !$isString(ea.value)) {
    piece_array.unshift(new ConstantGrammarNode(''));
    ea = piece_array[0];
  }

  for (var i = 1; i < piece_array.length; i++) {
    eb = get_piece_expr(i);
    if (ea.type === 'constant' && eb.type === 'constant') {
      ea = new ConstantGrammarNode(ea.value + eb.value);
    } else {
      ea = new CalcGrammarNode("#+", ea, eb);
    }
  }

  return ea;
}

function drive_render_view(ele, env) {
  var txt = ele.textContent;
  /*
   * 下面这一段代码有些丑
   * todo 重新梳理逻辑整理代码。
   */
  var expr = drive_get_view_expr(txt);
  var listener;
  if (!expr) {
    return;
  } else if ($isArray(expr)) {
    if (expr.length === 1) {
      var v_items = expr[0];
      env = env.$find(v_items[0]);
      if (!env) {
        debugger;
        throw new Error('variable ' + v_items[0] + ' not found!');
      }
      listener = new Emitter(env, v_items, drive_view_observer, false, ele);
      environment_watch_items(env, v_items, listener);
    } else {
      var e_items = [];
      var e_cache = {};
      var e_emitters = {};
      listener = new StrListener(e_emitters, e_cache, e_items, drive_view_observer, ele);

      expr.forEach(function (ex) {
        if ($isString(ex)) {
          e_items.push({
            is_var: false,
            value: ex
          });
        } else {
          var p = ex.join('.');
          e_items.push({
            is_var: true,
            value: p
          });
          var emitter = new Emitter(env, ex, listener);
          environment_watch_items(env, ex, emitter);
          e_cache[p] = emitter.cv;
          e_emitters[emitter.id] = emitter;
        }
      });
      listener._init();
    }
  } else if (expr.type === 'constant') {
    ele.textContent = expr.value;
    return;
  } else {
    listener = environment_watch_expression(env, expr, drive_view_observer, ele);
  }
  ele.textContent = listener.cv;
}

function drive_view_observer(cur_value, pre_value, ele) {
  ele.textContent = cur_value;
}