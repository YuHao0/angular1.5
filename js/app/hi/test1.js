;(function (app) {
    app.controller('hi.test1Controller', ['$scope',
        function ($scope) {

            var $this = this;
            $this.msg = 'hi-test1';
            console.log($scope);
            $scope.test = 1;
            $('#c').click(function () {
                console.log($scope.test);
                $scope.test++;
            });
            $scope.t = function () {

                setTimeout(function () {
                    console.log($scope.test);

                    $scope.test++;
                }, 1000);
            }

        }]);
})(angular.module('app'));