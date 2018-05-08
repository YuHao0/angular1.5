;(function (app) {
    app.controller('test.test2Controller', ['$scope',
        function ($scope) {

            var $this = this;
            $this.msg = 'test-test2';
            $scope.startOrderTime = '';
            $scope.t = function () {
                console.log($scope.startOrderTime)
            }
        }]);

})(angular.module('app'));