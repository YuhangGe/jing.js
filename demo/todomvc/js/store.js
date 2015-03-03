jing.module('Database').factory('Todos', function() {
    var STORAGE_KEY = 'todos-jingjs';
    return {
        fetch: function () {
            return jing.JSONParse(localStorage.getItem(STORAGE_KEY) || '[]');
        },
        save: function (todos) {
            var todos_str = jing.JSONStringify(todos);
            localStorage.setItem(STORAGE_KEY, todos_str);
        }
    }
});