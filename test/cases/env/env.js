describe('test', function () {
  this.timeout(0);

  it.skip('test1', function () {
    var env = new Environment('test');
    var env2 = new Environment('t2');
    var tt = {
      q : {
        p : 32
      }
    };

    env.a = env.b = env2.t = tt;
    env.$watch('a', function () {
      log('a:', arguments);
    });
    env.$watch('a.q.p', function () {
      log('a.q.p:', arguments);
    });
    env.$watch('a.q', function () {
      log('a.q:', arguments);
    });
    env2.$watch('t.q.p', function () {
      log('t.q.p:', arguments);
    });

    setTimeout(function () {
      env.a = 4323;
      log('----')
      setTimeout(function () {
        env.a = 898;
        env2.t.q.p = 323;

        log('-----')
        setTimeout(function () {
          env.a = {
            q : {
              p : 999
            }
          };
          log('-----')

        })
      });

    });




    log(env);
  });

  it('test2', function () {
    var env = new Environment('t1');
    var env2 = new Environment('t2');

    var arr = [1,2,{
      k : 4,
      t : [5,6,7]
    }];

    env.o = {
      m : arr
    };
    env2.a = arr;

    env.$watch('o.m[1]', function () {
      log('o.m[1]', arguments);
    });
    env.$watch('o.m[5].k', function () {
      log('o.m[5].k', arguments);
    });
    env.$watch('o.m[2].k', function () {
      log('o.m[2].k', arguments);
    });
    env.$watch('o.m[2].t[2]', function () {
      log('o.m[2].t[2]', arguments);
    });
    env2.$watch('a[2].t[2]', function () {
      log('a[2].t[2]', arguments);
    });

    log(env);
    env.o.m[2] = {};
  })
});