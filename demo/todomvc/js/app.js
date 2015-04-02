jing.config({
  //debug: true
});

jing
  .module('TodoApp')
  .init(function (module, env) {
    var Todo = module.require('Model.Todo');
    var Storage = module.require('Database.Todos');
    var Router = module.require('Router');
    var filters = {
      all: null,
      active: {
        completed: false
      },
      completed: {
        completed: true
      }
    };

    env.$prop = {
      new_todo: '',
      all_checked: false,
      todos: [], //Storage.fetch(),
      edited_todo: null,
      remaining_count: 0,
      completed_count: 0,
      status: 'all',
      cur_filter: filters.all
    };

    function calcCompleted() {
      var todos = env.todos;
      var cn = todos.filter({completed: true}).length;
      var rn = todos.length - cn;
      env.all_checked = rn === 0;
      env.remaining_count = rn;
      env.completed_count = cn;
    }

    env.$prop = {
      toggleCheckAll: function (checked) {
        env.todos.forEach(function (todo) {
          todo.completed = !checked;
        });
      },
      setStatus: function (status) {
        env.status = status;
        env.cur_filter = filters[status];
      },
      clearCompletedTodos: function () {
        for (var i = 0; i < env.todos.length; i++) {
          if (env.todos[i].completed) {
            env.todos.splice(i, 1);
            i--;
          }
        }
      },
      addTodo: function () {
        var tn = env.new_todo.trim();
        if (tn !== '') {
          env.todos.unshift(new Todo(tn));
        }
        env.new_todo = '';
      },
      editTodo: function (todo) {
        env.edited_todo = todo;
      },
      toggleComplete: function (todo) {
        todo.completed = !todo.completed;
      },
      doneEditing: function (todo) {
        if (todo.title.trim() === '') {
          env.removeTodo(todo);
        }
        env.edited_todo = null;
      },
      removeTodo: function (todo) {
        var idx = env.todos.indexOf(todo);
        if (idx >= 0) {
          env.todos.splice(idx, 1);
        }
      }
    };

    env.$watch('todos', function () {
      calcCompleted();
      Storage.save(env.todos);
    }, true);

    calcCompleted();
    Router.run(env, filters);

    setTimeout(function () {
      var ttt = env.todos;
      window.__DDD = ttt;
      //console.log(ttt instanceof jing.JArray);
      ttt.push(new Todo('dsds'));
      //console.log(ttt);
    }, 200);
  });