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
            cur_filter : filters.all,
            A : {
                B : {
                    C : 45,
                    D : 90
                },
                E : "dsd"
            }
        };

        env.$watch('all_checked', function(change_list) {
            var checked = change_list[0].cur_value;
            $each(env.todos, function(todo) {
                todo.completed = checked;
            });
        });

        env.$watch('todos', function(change_list) {
            //log('todos change');
            //log(change_list);
            //log('todos change');
            //var todos = change_list[0].cur_value,
            //    cn = jing.filter(todos, {completed : true}).length,
            //    rn = todos.length - cn;
            //env.all_checked = rn === 0;
            //env.remaining_count = rn;
            //env.completed_count = cn;
            //Storage.save(env.todos);
        });


        env.$prop = {
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

        Router.run(env, filters);

    });