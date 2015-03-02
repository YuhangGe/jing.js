describe('expression', function() {
    this.timeout(0);

    function create_test_env() {
        var env = new Environment('jing.env.test');
        env.A = {
            B : 'ok',
            '0' : '0'
        };
        env.C = {
            D : {
                E : 88,
                '2' : '2'
            },
            '1' : '1'
        };
        env.xiaoge = {
            name : 'xiaoge',
            girl : {
                name : 'jing',
                age : 24,
                child : {
                    name : 'unknown',
                    age : 8
                }
            },
            age : 24
        };

        env.$prop = {
            num1 : 10,
            num2 : 10,
            a : 4,
            b : 2,
            c : 90,
            str : 'hello'
        };

        env.doubleAge = function(person) {
            log(person.name);
            person.age *= 2;
            return person.age;
        };

        return env;
    }

    function create_test_expr() {
        //var str = '"Age: " + (xiaoge.age + xiaoge.girl.child.age)';
        var str = "a + (b+c)";
        return parse_expression(str, true);
    }

    it('get variable array and tree', function() {
        var expr = create_test_expr();
        var env = create_test_env();

        log(expr);

        log(expr.exec(env));

    });
});