describe('parse', function() {
    this.timeout(0);

    var test_scope = {
        'xiaoge' : {
            name : 'xiaoge',
            age : 24,
            'click' : function() {
                log('click from xiaoge');
            },
            tag : {
                'girl' : {
                    name : 'jing.js',
                    age : 24
                },
                'books' : [{
                    name : 'bk1'
                }, {
                    name : 'bk2'
                }]
            }
        },
        'var' : 'name',
        'tick' : 10,
        'message' : 'hello world',
        'click' : function() {
            log('click from scope');
        },
        '$get' : function(var_name) {
            return this.hasOwnProperty(var_name) ? this[var_name] : null;
        },
        '$set' : function(var_name, val) {
            this[var_name] = val;
        }
    };

    it('34 + 56 should return : ConstantGrammarNode, 90', function() {

        $(document.body).append(__html_get__('parse.html'));

        assert.notEqual($('#btn_parse').length, 0);

        log($('#txt'));

        var gn = parse_expression('34+56');
        assert.equal(gn.exec(test_scope), 90);
    });
});