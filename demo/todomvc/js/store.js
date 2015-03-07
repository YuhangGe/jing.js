jing.module('Database').factory('Todos', function() {
    var STORAGE_KEY = 'todos-jingjs';
    return {
        fetch: function () {
            return jing.JSONParse(localStorage.getItem(STORAGE_KEY) || '[]');
        },
        save: function (todos) {
            localStorage.setItem(STORAGE_KEY, jing.JSONStringify(todos));
        }
    }
});