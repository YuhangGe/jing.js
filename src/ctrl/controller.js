/*
 * require scope.js
 */
function controller_create(name, func) {
    var $scope = scope_create();
    func.call(this, $scope);
    log($scope.hasOwnProperty('message'));
    scope_add(name, $scope);
}