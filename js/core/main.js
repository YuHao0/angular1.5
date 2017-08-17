;(function (app) {
    app.controller('mainController', ['$scope', '$rootScope', '$state',
        function ($scope, $rootScope, $state) {

            var $this = this;
            $this.msg = 'hello';
            $this.menu = [
                {
                    parent:'test',
                    name: 'test.test1'
                },
                {
                    parent:'test',
                    name: 'test.test2'
                },
                {
                    parent:'hi',
                    name: 'hi.test1'
                },
                {
                    parent:'hi',
                    name: 'hi.test2'
                }
            ];
            $this.stateGo = function () {
                console.log($state.current);
            };

            (function () {
                console.log('init');
            })();

        }]);
})(angular.module('app', ['ui.router', 'oc.lazyLoad']));