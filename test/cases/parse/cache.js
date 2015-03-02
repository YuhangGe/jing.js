describe('cache', function() {
    function create_test_env() {
        var env = new Environment();
        env.A = {
            B : 10
        };
        env.C = 20;
        return env;
    }

    it('expression need cache', function() {
        var env = create_test_env(),
            expr = parse_expression('A.B + C', true);

        assert(expr.exec(env), 30);

        env.C = 50;

        assert(expr.exec(env), 30);

    });

    it('expression do not need cache', function() {
        var env = create_test_env(),
            expr = parse_expression('A.B + C', false);

        assert(expr.exec(env), 30);

        env.C = 50;

        assert(expr.exec(env), 60);
    });
});