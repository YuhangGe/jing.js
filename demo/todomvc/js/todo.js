jing.module('Model').factory('Todo', function () {
    function Todo(title) {
        this.title = title;
        this.completed = false;
    }

    return Todo;
});