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
    env.$watch('a.q', function () {
      log('deep a.q', arguments);
    }, true);

    //env.$watch('a.t.y', function () {
    //  log('a.t.y', arguments);
    //});
    //env.$watch('a.q.p', function () {
    //  log('a.q.p:', arguments);
    //});
    //env.$watch('a.q', function () {
    //  log('a.q:', arguments);
    //});
    //env2.$watch('t.q.p', function () {
    //  log('t.q.p:', arguments);
    //});


    setTimeout(function () {
      env.a = 4323;
      log('----')
      setTimeout(function () {
        env.a = {
          q : {
            p : 323,
            oo : 323
          }
        };
        log('----')
        setTimeout(function() {
          env.a.q.p = {
            r : 323
          };
          log('----');
          setTimeout(function() {
            env.a.q.oo.r = 39;
          })
        });
        //env.a = {
        //  q : {
        //    p : 434
        //  }
        //};
        //env2.t.q.p = 323;
        //
        //log(env);
        //log('----')

      });

    });




    log(env);
  });

  it('test2', function () {
    var env = new Environment('t1');
    var env2 = new Environment('t2');

    var arr = new JArray([1,2,{
      k : 4,
      t : new JArray([5,6,7])
    }]);

    env.o = {
      m : arr
    };
    env2.a = [1,2,3];

    env.$watch('o.m', function () {
      log('o.m', arguments);
    }, true);
    //env.$watch('o.m[3].k', function () {
    //  log('o.m[3].k', arguments);
    //});
    //env2.$watch('a[3].k', function() {
    //  log('a[3].k', arguments);
    //})
    //var a = {
    //  k : 323
    //}
    //env.o.m.push(a);
    //env2.a.push(a);
    env.o.m[2].k = {
      t : 32
    };
    log(env);
    return;
    setTimeout(function () {
      log('----');

      setTimeout(function () {
        log('----');
        env.o.m.splice(3, 1);

        setTimeout(function() {
          log('----')
          a.k = 32323;
        })
      })
    });


  })
});