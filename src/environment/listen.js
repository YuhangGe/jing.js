function LazyListener(emitters, handler, data) {
  this.id = $uid();
  this.handler = handler;
  this.emitters = emitters;
  this.data = data;
  this.pv = null;
  this.cv = null;
  this.tm = null;
  this.destroied = false;
  this.dg = $bind(this, this._deal);
  this.changes = [];
}
LazyListener.prototype = {
  _ctm: function () {
    if (this.tm !== null) {
      clearTimeout(this.tm);
      this.tm = null;
    }
  },
  notify: function (cur_value, pre_value, var_path) {
    this._ctm();
    this.tm = setTimeout(this.dg, 0);
    this._notify(cur_value, pre_value, var_path);
  },
  destroy: function () {
    if (this.destroied) {
      return;
    }
    this.destroied = true;
    this.handler = null;
    this.data = null;
    this._ctm();
    this.dg = null;
    this.pv = null;
    this.cv = null;
    for(var eid in this.emitters) {
      this.emitters[eid].destroy();
      this.emitters[eid] = null;
    }
    this.emitters = null;
  },
  _deal: function () {
    //abstract method
  },
  _notify: function () {
    //abstract method
  }
};

/*
 * StrListener用于连接只带属性访问的字符串的监听。比如 <p>{{boy.name}},{{boy.age}}</p>
 * 但对于更复杂的情况比如带函数调用的情况，需要使用ExprListener，比如<p>boys.slice(3,4)[0].name</p>
 */
function StrListener(emitters, var_cache, str_items, handler, data) {
  this.base(emitters, handler, data);
  this.cache = var_cache;
  this.items = str_items;
  this.vc = false;
}
StrListener.prototype = {
  notify: function (cur_value, pre_value, var_path) {
    if(this.cache[var_path] === cur_value) {
      return;
    }
    this.callBase('notify', cur_value, pre_value, var_path);
  },
  _notify: function (cur_value, pre_value, var_path) {
    this.cache[var_path] = cur_value;
    this.vc = true;
  },
  _val: function () {
    var text = '', me = this;
    this.items.forEach(function (it) {
      var val = it.is_var ? me.cache[it.value] : it.value;
      text += val ? val : '';
    });
    return text;
  },
  _init: function () {
    this.cv = this.pv = this._val();
  },
  _deal: function () {
    if (!this.vc) {
      return;
    }
    this.vc = false;
    this.cv = this._val();
    if (this.cv === this.pv) {
      return;
    }
    this.handler(this.cv, this.pv, this.data);
    this.pv = this.cv;
  },
  destroy: function () {
    this.callBase('destroy');
    this.items.length = 0;
    for (var k in this.cache) {
      this.cache[k] = null;
    }
    this.cache = null;
  }
};
$inherit(StrListener, LazyListener);

function ExprListener(emitters, var_tree, expr, env, handler, data) {
  this.base(emitters, handler, data);
  this.expr = expr;
  this.var_tree = var_tree;
  this.env = env;
  this.changes = [];
}

ExprListener.prototype = {
  _notify: function (cur_value, pre_value, var_path) {
    this.changes.push(var_path);
  },
  _deal: function () {
    var i, c, n_arr, j;
    for (i = 0; i < this.changes.length; i++) {
      c = this.changes[i];
      n_arr = this.var_tree[c];
      if (!n_arr) {
        continue;
      }
      for (j = 0; j < n_arr.length; j++) {
        n_arr[j].cached = false;
        listen_refresh_expr_node(n_arr[j]);
      }
    }

    this.changes.length = 0;
    this.cv = this.expr.exec(this.env);
    if (!$isJArray(this.cv) && this.cv === this.pv) {
      return;
    }
    this.handler(this.cv, this.pv, this.data);

    this.pv = this.cv;

  },
  destroy: function () {
    this.callBase('destroy');
    this.changes.length = 0;
    this.env = null;
    for (var k in this.var_tree) {
      this.var_tree[k] = null;
    }
    this.var_tree = null;
    this.expr.destroy();
    this.expr = null;

  }
};
$inherit(ExprListener, LazyListener);

function listen_refresh_expr_node(node) {
  /*
   * 如果node.cached===false，说明当前node及其父亲树都已经被refresh过了，
   *   不需要再次遍历。这是一个简单的优化。
   */
  function re_loop(node) {
    if (!node || node.cached === false) {
      return;
    }
    node.cached = false;
    re_loop(node.parent);
  }

  node.cached = false;
  re_loop(node.parent);

}
