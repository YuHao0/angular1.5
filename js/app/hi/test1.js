;(function (app) {
    app.controller('hi.test1Controller', ['$scope',
        function ($scope) {

            var $this = this;
            $this.msg = 'hi-test1';


        }]);
})(angular.module('app'));