;(function (app) {
    app.controller('test.test1Controller', ['$scope', '$state',
        function ($scope, $state) {

            var $this = this;
            $this.msg = 'test-test1';
            $this.hi = 123;
        }]);
})(angular.module('app'));