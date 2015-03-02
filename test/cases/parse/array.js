describe('array', function() {

    var env = new Environment();
    env.$prop = {
        a : 43,
        t : [3,4,5,'d', 'o', 'p',6],
        f : function() {
            log(this);
            var rtn = [];
            for(var i=0;i<arguments.length;i++) {
                rtn.push(arguments[i]);
            }
            return rtn;
        }
    };
    env.b = {
        f : function() {
            return env.f;
        },
        c : {
            f2 : env.f
        }
    };

    it.skip('array construct', function() {
        var expr = parse_expression('[4, 5, a, "d", [1,2,3]]');
        log(expr.exec(env));

    });

    it.skip('array functions', function() {
        var expr = parse_expression('[4, 5, a, "d", [1,2,3]].slice(3,4)');
        log(expr);
        log(expr.exec(env));
    });

    it('array expression', function() {
        //var expr1 = parse_expression('b.f()(4, a)');
        //var expr2 = parse_expression('b.c.f2(4, a)');
        var expr3 = parse_expression('[4,5,6,7,8,9,10].slice(2).join(["-",a,"-"].join(""))');
        log(expr3);
        log(expr3.exec(env));

        function as(arr) {
            assert.equal(arr.length, 2);
            assert.equal(arr[0], 4);
            assert.equal(arr[1], 43);
        }

        //as(expr1);
        //as(expr2);
    })
});