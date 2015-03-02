describe('calc', function() {

    function create_test_env() {
        var env = new Environment();
        env.$prop =  {
            a : 10,
            b: 5,
            c : 3
        };
        return env;
    }

    it('34 + 56 * 67 >> 3 should return ' +  (34 + 56 * 67 >> 3), function() {
        var gn = parse_expression('34 + 56 * 67 >> 3');
        expect(gn.type === 'constant');
        assert.equal(gn.exec({}), 34 + 56 * 67 >> 3);
    });

    it('a + (b + c) should return 18', function() {
        var gn = parse_expression('a + (b + c)', true);
        var env = create_test_env();
        expect(gn.type === 'calc');
        expect(gn.op === '#+');
        expect(gn.nodes[0].type === 'variable');
        expect(gn.nodes[1].type === 'calc');
        expect(gn.nodes[1].op === '#+');
        expect(gn.nodes[1].nodes[0].type === 'variable');
        expect(gn.nodes[1].nodes[0].var_name === 'b');

        assert.equal(gn.exec(env), 18);
    });

    it('a * (b + c) should return 80', function() {
        var gn = parse_expression('a * (b + c)', true);
        var env = create_test_env();
        expect(gn.type === 'calc');
        expect(gn.op === '#*');
        expect(gn.nodes[0].type === 'variable');
        expect(gn.nodes[1].type === 'calc');
        expect(gn.nodes[1].op === '#+');
        expect(gn.nodes[1].nodes[0].type === 'variable');
        expect(gn.nodes[1].nodes[0].var_name === 'b');

        assert.equal(gn.exec(env), 80);
    })
});