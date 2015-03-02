describe('watch expressions', function() {
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
                    name : 'unknown'
                }
            },
            age : 24
        };
        env.T = [{
            name : 'xiaoge'
        }, {
            name : 'jing'
        }];

        env.$prop = {
            num1 : 10,
            num2 : 10,
            str : 'hello'
        };

        return env;
    }

    it.skip('immediate watch simple expression', function() {
        var env = create_test_env();
        var expr = parse_expression('xiaoge.name +" love " + xiaoge.girl.name', true);
        var c_times = 0;
        environment_watch_expression(env, expr, function(change_list, data) {
            log(change_list[0].cur_value);
            c_times++;
        }, {}, false);

        env.xiaoge.girl.name = "BigFace";
        env.xiaoge.name = "Ge";
        env.xiaoge = {
            name : 'cc',
            girl : {
                name : 'yy'
            }
        };

        assert(c_times, 4);
        assert(expr.cached, true);
        assert(expr.value, 'cc love yy');

    });

    it.skip('lazy watch simple expression', function(done) {
        var env = create_test_env();
        var expr = parse_expression('xiaoge.name +" love " + xiaoge.girl.name', true);
        var c_times = 0;
        var tm = null;
        environment_watch_expression(env, expr, function(change_list, data) {
            //log(change_list[0].cur_value);
            c_times++;

            if(tm !== null) {
                clearTimeout(tm);
            }
            //tm = setTimeout(function() {
                assert(c_times, 1);
                assert(expr.cached, true);
                assert(expr.value, 'cc love yy');
                done();
            //}, 1000);
        });

        env.xiaoge.girl.name = "BigFace";
        env.xiaoge.name = "Ge";
        env.xiaoge = {
            name : 'cc',
            girl : {
                name : 'yy'
            }
        };

    });

    it('property of array item', function() {
        var expr = parse_expression('T[T.length-1].name'),
            env = create_test_env();

        var lis = environment_watch_expression(env, expr, function(change_list) {
            log(change_list[0].cur_value);
        }, null, false);

        //log(lis.cur_value);

        env.T = [{
            name : 'new'
        }];

        env.T.push({
            name : 'dsdd'
        })
    })
});