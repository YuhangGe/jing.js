jing.module('TodoApp')
    .init(function (module, env) {
        var Todo = module.require('Model.Todo');
        var Storage = module.require('Database.Todos');
        var Router = module.require('Router');

        env.$prop = {
            new_todo: '',
            all_checked: false,
            todos: [],
            edited_todo: null,
            remaining_count: 0,
            completed_count: 0,
            status: 'all',

            filters : ['all', 'active', 'completed']
        };


        env.setCurFilter = function(filter) {

            switch (filter) {
                case 'active':
                    env.status = 'active';
                    break;
                case 'completed':
                    env.status = 'completed';
                    break;
                default:
                    env.status = 'all';
                    break;
            }
        };

        env.todos = Storage.fetch();
        if(env.todos.length === 0) {
            env.todos.push(new Todo('Say hello to Xiao Ge'))
        }
        calc_todos();

        Router.run(env);

        function save_todos() {
            Storage.save(env.todos);
        }


        function calc_todos() {
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
        }

        env.$prop = {
            markAll: function (all_checked) {
                for(var i=0;i<env.todos.length;i++) {
                    env.todos[i].completed = !all_checked;
                }
                env.all_checked = !all_checked;
                env.remaining_count = all_checked ? env.todos.length : 0;
                env.completed_count = !all_checked ? env.todos.length : 0;
                save_todos();
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
                calc_todos();
                save_todos();
            },
            doneEditing: function (todo) {
                if (todo.title.trim() === '') {
                    env.removeTodo(todo);
                }
                env.edited_todo = null;
                save_todos();
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