describe('function', function() {
    function create_test_env() {
        var env = new Environment();
        env.A = {
            B : {
                C : 10
            },
            ax : 'ax'
        };
        env.xiaoge = {
            name : 'xiaoge',
            girl : {
                age : 23,
                name : 'jing'
            },
            age : 25,
            hi : function() {
                var msg = "Hi, I'm " + this.name;
                env.log(msg);
                return msg;
            },
            max : function() {
                return Math.max.apply(Math, arguments);
            }
        };

        env.log = function() {
            console.log.apply(console, arguments);
        };

        env.pp = function() {
            this.log('hello, world');
            return 'pp';
        };

        return env;
    }

    it.skip('function with no argument', function() {
        var env = create_test_env(),
            expr = parse_expression('pp() + "  " + xiaoge.hi()');
        log(expr.exec(env));
        expect(typeof expr.exec(env) === 'string');
    });

    it('function with arguments', function () {
        var env = create_test_env(),
            expr = parse_expression('xiaoge["m" + A.ax](xiaoge.age, xiaoge["girl"].age, A.B.C + 99)');
        log(expr);
        log(expr.exec(env));
        assert.equal(expr.exec(env), 109);

        expr = parse_expression('[3,4,5,6,7].join(",")');
        log(expr);
    })
});