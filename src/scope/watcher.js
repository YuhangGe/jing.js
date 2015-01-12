function Handler(func, data) {
    this.handler = func;
    this.data = data;
}

function Watcher(scope, var_name, parent) {
    $defineProperty(this, 'scope', scope);
    $defineProperty(this, 'children', {});
    $defineProperty(this, 'parent', parent ? parent : null);
    $defineProperty(this, 'listeners', []);
    $defineProperty(this, 'name', var_name);

    this.old_value = scope[var_name];
}
var __watcher_prototype = Watcher.prototype;

$defineProperty(__watcher_prototype, 'emit', function(new_value) {
    var ls_arr = this.listeners, ls;
    for(var i=0;i<ls_arr.length;i++) {
        ls = ls_arr[i];
        ls.handler(this.old_value, new_value, ls.data);
    }
    var children = this.children;
    for(var cn in children) {
        children[cn].emit(new_value[cn]);
    }
    this.old_value = new_value;
});