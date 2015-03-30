
function Emitter(env, route, handler, is_deep, data) {
  this.id = $uid();
  this.route = route;
  this.path = route.join('.');
  this.env = env;
  this.deep = is_deep;
  this.array = false;
  this.handler = handler;
  this.tm = null;
  this.deal = $bind(this, this._deal);
  this.data = data;
  /*
   * current_value
   * previous_value
   */
  this.cv = null;
  this.pv = null;
}
Emitter.prototype = {
  _init : function () {
    this.cv = this.pv = this._val();
  },
  _val: function () {
    var r = this.route;
    var v = this.env.$get(r[0]);
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
    if (!this.deep && !this.array && this.cv === this.pv) {
      return;
    }
    if ($isFunction(this.handler)) {
      this.handler(this.cv, this.pv, this.data);
    } else {
      this.handler.notify(this.cv, this.pv, this.path);
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
    this.handler = null;
    this.pv = null;
    this.cv = null;
    this.env = null;
  }
};
//
//
//function Emitter(deep) {
//  this.deep = deep ? true : false;
//  this.nodes = {};
//  this.indexes = {};
//}
//Emitter.prototype = {
//  add: function (emit_node, index) {
//    var id = emit_node.id;
//    if (!$hasProperty(this.nodes, id)) {
//      this.nodes[id] = emit_node;
//      this.indexes[id] = index;
//    }
//    else {
//      /*
//       * 单个emit_node对于某个节点而言，是唯一的。
//       * 如果出现不唯一，说明逻辑上有问题。这里捕获这种异常，供调试。
//       */
//      $assert($hasProperty(this.indexes, id) && this.indexes[id] === index);
//    }
//  },
//  remove: function (e_id) {
//    if ($hasProperty(this.nodes, e_id)) {
//      $assert($hasProperty(this.indexes, e_id));
//      delete this.nodes[e_id];
//      delete this.indexes[e_id];
//    }
//  },
//  merge: function (another_emitter) {
//    for (var eid in another_emitter.nodes) {
//
//    }
//  },
//  notify: function () {
//    //for (var env_id in this.map) {
//    //  this.map[env_id].notify();
//    //}
//    for (var emit_node_id in this.nodes) {
//      this.nodes[emit_node_id].notify();
//    }
//  }
//};