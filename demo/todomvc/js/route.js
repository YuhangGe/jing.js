jing.module('TodoApp').factory('Router', function() {
    var router = new Router();

    return {
        run : function(env, filters) {
            jing.each(Object.keys(filters), function(filter) {
                router.on(filter, function () {
                    env.setStatus(filter);
                });
            });

            router.configure({
                notfound: function () {
                    window.location.hash = '#/all';
                    env.setStatus('all');
                }
            });

            router.init();
        }
    }

});