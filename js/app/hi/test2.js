;(function (app) {
    app.controller('hi.test2Controller', ['$scope',
        function ($scope) {
            var $this = this;
            $this.msg = 'hi-test2';
        }]);
})(angular.module('app'));