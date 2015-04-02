function JRepeatReuseItem(ele, env, val) {
  this.ele = ele;
  this.used = false;
  this.env = env;
  this.val = val;
}

function JRepeat(ele, attr, drive_module, key, env, expr) {
  this.ele = ele;
  this.cmt = document.createComment(ele.outerHTML);
  this.env = env;
  this.expr = expr;
  this.attr = attr;
  this.key = key;
  this.module = drive_module;
  this.frag = document.createDocumentFragment();
  var listener = environment_watch_expression(env, expr, function (cur_value, pre_value, repeater) {
    window.__TTTT = cur_value;
    repeater.update(cur_value);
  }, this);

  this.items = [];
  this.index_map = new Map();

  $$before(this.cmt, ele);
  $$remove(ele);

  this.render(listener.cv);
}
var __jrepeate_prototype = JRepeat.prototype;
__jrepeate_prototype.update = function (new_value) {

  if (!$isJArray(new_value)) {
    throw new Error('only support Array in j-repeat.');
  }

  var _array = new_value[__ENV_INNER__].arr;
  var i;
  var old_items = this.items;
  if (_array.length === 0 && old_items.length === 0) {
    return;
  }

  var old_array, _same;
  if (old_items.length > 0 && _array.length === old_items.length) {
    _same = true;
    for (i = 0; i < _array.length; i++) {
      if (_array[i] !== old_items[i].val) {
        _same = false;
        break;
      }
    }
    if (_same) {
      return;
    }
  }

  var map = this.index_map;
  var new_map = new Map();

  var idx, item;

  function get_index(item) {
    var index_array = map.get(item);
    if (!index_array || index_array.length === 0) {
      return -1;
    }
    return index_array.pop();
  }


  var items_tip = new Int32Array(_array.length);


  for (i = 0; i < _array.length; i++) {
    idx = get_index(_array[i]);
    if (idx >= 0) {
      //可复用元素
      items_tip[i] = idx + 1;
      old_items[idx].used = true;
    }
  }


  for (i = 0; i < old_items.length; i++) {
    item = old_items[i];
    if (!item.used) {
      $$remove(item.ele);
      item.env.$destroy();
      item.ele = null;
      item.env = null;

      delete old_items[i];
    }
  }


  function get_old_idx(pre) {
    for (var i = pre + 1; i < old_items.length; i++) {
      if (old_items[i]) {
        return i;
      }
    }
    return -1;
  }


  function swap(idx, old_idx) {
    var i1 = old_items[idx],
      i2 = old_items[old_idx];
    $$swap(i1.ele, i2.ele);
    old_items[idx] = i2;
    old_items[old_idx] = i1;
  }

  var env, ele;
  var old_idx = get_old_idx(-1);
  var pos_ele = old_idx < 0 ? this.cmt : old_items[old_idx].ele;
  var new_items = new Array(_array.length);
  var frag = null;

  for (i = 0; i < _array.length; i++) {
    idx = items_tip[i] - 1;
    if (idx < 0) {
      env = environment_create_child(this.env, i);
      ele = this.ele.cloneNode(true);
      item = new JRepeatReuseItem(ele, env, _array[i]);
      j_repeat_set_prop(env, i, _array.length);
      env[this.key] = _array[i];

      drive_render_element(ele, this.attr, this.module, env);
      drive_insert_before();

      /*
       * 将多个连续的插入，使用Fragment合并后再insert，可以提升性能。
       */
      frag = frag ? frag : document.createDocumentFragment();
      frag.appendChild(ele);
    } else {
      if (frag) {
        $$before(frag, pos_ele);
        frag = null;
      }
      if (idx > old_idx) {
        swap(idx, old_idx);
      }
      old_idx = get_old_idx(old_idx);
      pos_ele = old_idx < 0 ? this.cmt : old_items[old_idx].ele;
      item = old_items[idx];
      j_repeat_set_prop(item.env, i, _array.length);
    }
    item.used = false;
    new_items[i] = item;
    j_repeat_set_index(new_map, _array[i], i);
  }
  if (frag) {
    $$before(frag, pos_ele);
    frag = null;
  }
  map.clear();
  old_items.length = 0;
  this.items = new_items;
  this.index_map = new_map;

};

function j_repeat_set_prop(env, i, len) {
  env.$prop = {
    '$index': i,
    '$first': i === 0,
    '$odd': i % 2 !== 0,
    '$even': i % 2 === 0,
    '$last': i === len - 1,
    '$middle': i !== 0 && i !== len - 1
  };
}
__jrepeate_prototype.render = function (val) {
  if (!$isJArray(val)) {
    throw new Error('only support Array in j-repeat.');
  }
  var array = val[__ENV_INNER__].arr;
  var r_ele, r_env;
  var frag = document.createDocumentFragment();
  for (var i = 0; i < array.length; i++) {
    r_ele = this.ele.cloneNode(true);
    r_env = environment_create_child(this.env, i);
    j_repeat_set_prop(r_env, i, array.length);
    r_env[this.key] = array[i];

    drive_render_element(r_ele, this.attr, this.module, r_env);

    frag.appendChild(r_ele);
    this.items.push(new JRepeatReuseItem(r_ele, r_env, array[i]));
    j_repeat_set_index(this.index_map, array[i], i);
  }

  __drive_insert_b.push({
    ele: frag,
    pos: this.cmt
  });
};

function j_repeat_set_index(map, item, idx) {
  var index_array = map.get(item);
  if (!index_array) {
    index_array = [];
    map.set(item, index_array);
  }
  index_array.push(idx);
}

function directive_deal_j_repeat(ele, attr, drive_module, env) {
  var item = attr.removeNamedItem('j-repeat'),
    expr_str = item.value;

  var expr = parse_expression(expr_str, true);
  if (expr.type !== 'in') {
    throw 'j-repeat format wrong!';
  }

  new JRepeat(ele, attr, drive_module, expr.nodes[0], env, expr.nodes[1]);
}
