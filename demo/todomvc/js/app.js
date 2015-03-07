jing.module('TodoApp')
    .init(function (module, env) {
        var Todo = module.require('Model.Todo');
        var Storage = module.require('Database.Todos');
        var Router = module.require('Router');
        var filters = {
            all : {},
            active : {
                completed : false
            },
            completed : {
                completed : true
            }
        };

        env.$prop = {
            new_todo: '',
            all_checked: false,
            todos: Storage.fetch(),
            edited_todo: null,
            remaining_count: 0,
            completed_count: 0,
            status: 'all',
            cur_filter : filters.all
        };

        env.$prop = {
            _calcCompleted : function() {
                var todos = this.todos,
                    cn = jing.filter(todos, {completed : true}).length,
                    rn = todos.length - cn;
                this.all_checked = rn === 0;
                this.remaining_count = rn;
                this.completed_count = cn;
            },
            setStatus : function(status) {
                env.status = status;
                env.cur_filter = filters[status];
            },
            clearCompletedTodos: function () {
                for(var i=0;i<env.todos.length;i++) {
                    if(env.todos[i].completed) {
                        env.todos.splice(i, 1);
                        i--;
                    }
                }
            },
            addTodo: function () {
                var tn = env.new_todo.trim();
                if (tn !== '') {
                    env.todos.push(new Todo(tn));
                }
                env.new_todo = '';
            },
            editTodo: function (todo) {
                env.edited_todo = todo;
            },
            toggleComplete : function(todo) {
                todo.completed =  !todo.completed;
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
                }
            }
        };

        env.$watch('all_checked', function(change_list) {
            var checked = change_list[0].cur_value;
            $each(env.todos, function(todo) {
                todo.completed = checked;
            });
        });

        env.$watch('todos', function(change_list) {
            var c = change_list[0];
            if(c.type !== 'child') {
                env._calcCompleted();
            }
            Storage.save(env.todos);
        });
        env._calcCompleted();
        Router.run(env, filters);

    });