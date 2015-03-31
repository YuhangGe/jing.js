
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
