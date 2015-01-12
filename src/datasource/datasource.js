function DataSource(name, options) {

    $defineProperty(this, 'name', name);
    $defineProperty(this, 'options', {
        direct : 's2c', // 'c2s', 'both'
        type : 'array'
    });

    $extend(this.options, options);

    var __ = {};
    $defineProperty(this, '__', __);
    __.listeners = {
        change : []
    };

    var tp = this.options.type;
    __.value = tp === 'object' ? {} : (tp === 'array' ? [] : '');

}
var __data_source_prototype =  DataSource.prototype;

$defineProperty(__data_source_prototype, 'get', function() {
    return this.__.value;
});

$defineProperty(__data_source_prototype, 'ping', function() {

});
$defineProperty(__data_source_prototype, 'update', function(value) {

});
$defineProperty(__data_source_prototype, 'on', function(event_name, handler) {
    if(typeof handler !== 'function') {
        throw 'DataSource on need function';
    }
    if(event_name === 'change') {
        this.listeners.change.push(handler);
    }
});
$defineProperty(__data_source_prototype, 'bind', function(scope, var_name) {

});
