jing.module('Database').factory('Todos', function () {
  var STORAGE_KEY = 'todos-jingjs';
  var cache = '';

  return {
    fetch: function () {
      cache = localStorage.getItem(STORAGE_KEY) || '[]';
      return JSON.parse(cache);
    },
    save: function (todos) {
      var val = JSON.stringify(todos);
      if (val !== cache) {
        localStorage.setItem(STORAGE_KEY, val);
      }
    }
  }
});