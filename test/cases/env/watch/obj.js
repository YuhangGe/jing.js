describe('watch', function() {
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

        env.$prop = {
            num1 : 10,
            num2 : 10,
            str : 'hello'
        };

        return env;
    }
    it('immediate watch simple value', function() {
        var env = create_test_env();
        var c_times = 0;
        env.$watch('num1', function (change_list, data) {
            c_times++;
            assert.equal(change_list.length, 1, 'change_list length');
            assert.equal(change_list[0].var_name, 'num1', 'var_name');
            switch (c_times) {
                case 1:
                    assert.equal(change_list[0].pre_value, 10, '1 pre_value');
                    assert.equal(change_list[0].cur_value, 80, '1 cur_value');
                    break;
                case 2:
                    assert.equal(change_list[0].pre_value, 80, '2 pre_value');
                    assert.equal(change_list[0].cur_value, 90, '2 cur_value');
                    break;
                case 3:
                    assert.equal(change_list[0].pre_value, 90, '3 pre_value');
                    assert.equal(change_list[0].cur_value, 100, '3 cur_value');
                    break;
            }
        }, {}, false);

        env.num1 = 80;
        env.num1 = 80;
        env.num1 = 90;
        env.num1 = 100;

        assert.equal(c_times, 3, "emit changes 3 times");
    });

    it('lazy watch simple value', function(done) {
        var env = create_test_env();
        var c_times = 0;
        env.$watch('num2', function(change_list) {
            c_times++;
            assert.equal(change_list[0].pre_value, 10, 'pre_value');
            assert.equal(change_list[0].cur_value, 100, 'cur_value');
            done();
        }, {});
        env.num2 = 80;
        env.num2 = 80;
        env.num2 = 90;
        env.num2 = 100;
    });

    it('immediate watch object value', function () {
        var c_times = 0;
        var env = create_test_env();
        env.$watch('C.D.E', function(change_list, data) {
            c_times++;
        }, {}, false);

        env.C = {
            D : {
                E : 88
            }
        };
        env.C.D = {
            E : 70
        };
        env.C.D.E = 90;
        env.C.D.E = 90;

        env.C.D.E = 88;

        assert.equal(c_times, 3, 'change trigger times');
    });

    it('immediate watch sub object', function () {
        var env = create_test_env();
        var c_times = 0;

        env.$watch('C.D', function(change_list, data) {
            c_times++;
        }, {}, false);

        env.C = {
            D : {
                E : 88
            }
        };
        env.C.D = {
            E : 70
        };

        env.C.D.E = 88;

        assert.equal(c_times, 2, 'change trigger times');
    });

    it('lazy watch object value', function (done) {
        var env = create_test_env();
        var c_times = 0;

        env.$watch('C.D.E', function(change_list) {
            c_times++;
            assert.equal(c_times, 1, 'change trigger times');
            done();
        });

        env.C = {
            D : {
                E : 88
            }
        };
        env.C.D = {
            E : 70
        };
        env.C.D.E = 90;
        env.C.D.E = 90;

        env.C.D.E = 72;

    });

    it('lazy watch sub object', function (done) {
        var env = create_test_env();

        var c_times = 0;

        env.$watch('C.D', function(change_list, data) {
            c_times++;
            assert.equal(c_times, 1, 'change trigger times');
            done();
        }, {});

        env.C = {
            D : {
                E : 88
            }
        };
        env.C.D = {
            E : 70
        };

        env.C.D.E = 88;

    });

});