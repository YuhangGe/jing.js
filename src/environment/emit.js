/*
 * name : 当前节点对应的变量名。比如 boy.name 对应两个EmitNode的var_id分别是boy和name
 */
function EmitNode(var_name, parent, env) {
  this.id = $uid();
  this.name = var_name;
  this.children = {};
  this.parent = parent;
  this.path = ((!parent || parent.path === '') ? '' : parent.path + '.') + var_name;
  this.route = parent ? $copyArray(parent.route) : [];
  this.route.push(var_name);

  this.listeners = [];
  this.tm = null;
  this.deal = $bind(this, this._deal);
  this.env = env;
  /*
   * current_value
   * previous_value
   */
  this.cv = null;
  this.pv = null;
}
EmitNode.prototype = {
  addListener: function (listener) {
    if (this.listeners.indexOf(listener) < 0) {
      this.listeners.push(listener);
      listener.emitters[this.id] = this;
    }
  },
  _val: function () {
    var r = this.route,
      v = this.env.$get(r[0]);
    for (var i = 1, len = r.length; i < len; i++) {
      if ($isObject(v)) {
        v = v[r[i]];
      } else {
        return undefined;
      }
    }
    return v;
  },
  _deal: function () {
    this.cv = this._val();
    if (this.cv === this.pv) {
      return;
    }
    for (var i = 0; i < this.listeners.length; i++) {
      this.listeners[i].notify(this.path, this.cv, this.pv);
    }
    this.pv = this.cv;
  },
  notify: function () {
    this._ctm();
    this.tm = setTimeout(this.deal, 0);
  },
  _ctm: function () {
    if (this.tm !== null) {
      clearTimeout(this.tm);
      this.tm = null;
    }
  },
  destroy: function () {
    this._ctm();
    for (var k in this.children) {
      this.children[k].destroy();
      this.children[k] = null;
    }
    for (var i = 0; i < this.listeners.length; i++) {
      var es = this.listeners[i].emitters;
      if ($hasProperty(es, this.id)) {
        delete es[this.id];
      }
    }
    this.listeners.length = 0;
    this.parent = null;
    this.pv = null;
    this.cv = null;
    this.env = null;
  }
};

function RootEmitNode(env) {
  this.env = env;
  this.children = {};
  this.path = '';
  this.route = [];
}
RootEmitNode.prototype = {
  destroy: function () {
    this.env = null;
    for (var k in this.children) {
      this.children[k].destroy();
      this.children[k] = null;
    }
  }
};
//
//function EmitMap() {
//  this.nodes = {};
//  this.indexes = {};
//}
//EmitMap.prototype = {
//  add : function(emit_node, emit_index) {
//    var id = emit_node.id;
//    if (!$hasProperty(this.nodes, id)) {
//      this.nodes[id] = emit_node;
//      this.indexes[id] = emit_index;
//    }
//    else {
//      /*
//       * 单个emit_node对于某个节点而言，是唯一的。
//       * 如果出现不唯一，说明逻辑上有问题。这里捕获这种异常，供调试。
//       */
//      $assert($hasProperty(this.indexes, id) && this.indexes[id] === emit_index);
//    }
//  },
//  notify : function() {
//    for(var emit_node_id in this.nodes) {
//      this.nodes[emit_node_id].notify();
//    }
//  }
//};

function Emitter(deep) {
  this.deep = deep ? true : false;
  this.nodes = {};
  this.indexes = {};
}
Emitter.prototype = {
  add: function (emit_node, index) {
    //var emit_map = this.map[env_id];
    //if(!emit_map) {
    //  emit_map = this.map[env_id] = new EmitMap();
    //}
    //emit_map.add(emit_node, index);
    var id = emit_node.id;
    if (!$hasProperty(this.nodes, id)) {
      this.nodes[id] = emit_node;
      this.indexes[id] = index;
    }
    else {
      /*
       * 单个emit_node对于某个节点而言，是唯一的。
       * 如果出现不唯一，说明逻辑上有问题。这里捕获这种异常，供调试。
       */
      $assert($hasProperty(this.indexes, id) && this.indexes[id] === index);
    }
  },
  remove: function (e_id) {
    if($hasProperty(this.nodes, e_id)) {
      $assert($hasProperty(this.indexes, e_id));
      delete this.nodes[e_id];
      delete this.indexes[e_id];
    }
  },
  merge: function (another_emitter) {
    for (var eid in another_emitter.nodes) {

    }
  },
  notify: function () {
    //for (var env_id in this.map) {
    //  this.map[env_id].notify();
    //}
    for(var emit_node_id in this.nodes) {
      this.nodes[emit_node_id].notify();
    }
  }
};