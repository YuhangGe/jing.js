describe('Set', function(){
    this.timeout(0);

    var test_scope = jing.scope();
    jQuery.extend(test_scope, {
        'a' : 3,
        'b' : 6,
        'c' : {
            d : 89
        }
    });


    it('a = b should set a = 6', function() {
        var gn = parse_expression('a=b');
        gn.exec(test_scope);
        expect(test_scope.a, 6);
    });
    it('a=b=c.d++ should set a=b=89, c.d=90', function() {
        var gn = parse_expression('a =b= c.d++');
        gn.exec(test_scope);
        console.log(test_scope);

        expect(test_scope.a, 89);
        expect(test_scope.b, 89);
        expect(test_scope.c.d, 90);
    });
});