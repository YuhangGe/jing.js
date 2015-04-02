jing.module('Database').factory('Todos', function () {
  var STORAGE_KEY = 'todos-jingjs';
  return {
    fetch: function () {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    },
    save: function (todos) {
      console.log(JSON.stringify(todos));
      //localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    }
  }
});