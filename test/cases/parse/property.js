describe('property', function() {
    function create_test_env() {
        var env = new Environment();
        env.A = {
            B : {
                C : 10
            }
        };
        env.T = [{
            name : 'xiaoge'
        }, {
            name : 'jing'
        }];

        env.xiaoge = {
            name : 'xiaoge',
            age : 25
        };

        return env;
    }

    it('check property', function() {
        var env = create_test_env(),
            expr = parse_expression('A.B.C + xiaoge.age');

        expect(expr.exec(env), 35);
    });

    it('property of array item', function() {
        var expr = parse_expression('T[0].name'),
            env = create_test_env();
        log(expr);
        log(expr.exec(env));
        assert.equal(expr.exec(env), 'xiaoge');
    })
});