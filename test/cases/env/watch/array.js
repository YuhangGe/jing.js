describe('watch array', function() {
    this.timeout(0);

    function create_test_env() {
        var env = new Environment('jing.env.test');
        var list = [];
        for(var i=0;i<2;i++) {
            list.push({
                name : 'xiaoge:' + i,
                age : 24 + i,
                girls : []
            })
        }
        env.list = list;

        return env;
    }

    it('immediate watch simple array', function() {
        var env = create_test_env(),
            expr = parse_expression('list');

        log(expr.exec(env));

        environment_watch_expression(env, expr, function(change_list) {
            log(change_list[0].cur_value);
        }, null, false);

        env.list.push({
            name : 'dsdsd'
        });

    });
});