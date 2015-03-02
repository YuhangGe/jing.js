describe('parse', function() {

    it('in', function() {
        var expr = parse_expression('boy in list.slice(1, list.length-2)');
        log(expr);
    });
});