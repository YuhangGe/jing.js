jing.module('TodoApp').factory('Router', function() {
    var router = new Router();



    return {
        run : function(env) {

            jing.each(env.filters, function(filter) {
                router.on(filter, function () {
                    env.setCurFilter(filter);
                });
            });

            router.configure({
                notfound: function () {
                    window.location.hash = '';
                    env.setCurFilter('all');
                }
            });

            router.init();
        }
    }

});