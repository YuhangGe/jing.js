$defineProperty(__env_prototype, '$watch', function(var_name, callback, data) {
    if(typeof callback !== 'function') {
        log('$watch need function');
        return;
    }

    var names = var_name instanceof  Array ? var_name : var_name.split('.');


    if(!$hasProperty(this.$$, var_name)) {
        if(!$hasProperty(this, var_name)) {
            log('"'+var_name+'" of environment:' + this.name + ' not found!');
            return;
        }
        var val = this[var_name];
        delete this[var_name];
        this.$declare(var_name, val);
    }
    var watchers = this.__.watchers;
    if(!$hasProperty(watchers, var_name)) {
        watchers[var_name] = new Watcher(this, var_name, null);
    }
    __watch[var_name].push({
        cb : callback,
        data : data
    });
});

$defineProperty(__env_prototype, '$emit', function(var_name) {
    var __watch = this.__.watch;
    var w_arr = __watch[var_name];
    if(!w_arr || w_arr.length === 0) {
        return;
    }
    //may be replace by setImmediate in future
    //todo 当连续几行代码改变是的同一个变量时，不应该每一行代码都更新一次。目前还只是demo初期版本。
    $timeout($bind(this, function() {
        for(var i=0;i<w_arr.length;i++) {
            w_arr[i].cb(var_name, this.$$[var_name], w_arr[i].data);
        }
    }), 0);
});