jing.module('TodoApp')

    .factory('Todo', function () {
        function Todo(title) {
            this.title = title;
            this.completed = false;
        }

        return Todo;
    })
    .init(function (module, env) {
        var Todo = module.require('Todo');

        env.$prop = {
            new_todo: '',
            all_checked: false,
            todos: [new Todo('Say hello to Xiao Ge')],
            edited_todo: null,
            remaining_count: 1,
            completed_count: 0,
            status: ''
        };



        env.$prop = {
            markAll: function (all_checked) {
                for(var i=0;i<env.todos.length;i++) {
                    env.todos[i].completed = !all_checked;
                }
                env.all_checked = !all_checked;
                env.remaining_count = all_checked ? env.todos.length : 0;
                env.completed_count = !all_checked ? env.todos.length : 0;
            },
            clearCompletedTodos: function () {
                for(var i=0;i<env.todos.length;i++) {
                    if(env.todos[i].completed) {
                        env.todos.splice(i, 1);
                        i--;
                    }
                }
                this.toggleComplete();

            },
            addTodo: function () {
                var tn = this.new_todo.trim();
                if (tn !== '') {
                    this.todos.push(new Todo(tn));
                    this.toggleComplete();
                }
                this.new_todo = '';
            },
            editTodo: function (todo) {
                env.edited_todo = todo;
            },
            toggleComplete : function(todo) {
                if(todo) {
                    todo.completed =  !todo.completed;
                }
                var r = 0, c = 0;
                for(var i=0;i<env.todos.length;i++) {
                    if(env.todos[i].completed) {
                        c++;
                    } else {
                        r++;
                    }
                }
                env.all_checked = r === 0;
                env.remaining_count = r;
                env.completed_count = c;
            },
            doneEditing: function (todo) {
                if (todo.title.trim() === '') {
                    env.removeTodo(todo);
                }
                env.edited_todo = null;
            },
            removeTodo: function (todo) {
                var idx = env.todos.indexOf(todo);
                if(idx>=0) {
                    env.todos.splice(idx, 1);
                    env.toggleComplete();
                }
            }
        };

    });