;(function (app) {
    app.controller('mainController', ['$scope', '$rootScope', '$state', '$api', '$q', 'tips',
        function ($scope, $rootScope, $state, $api, $q, tips) {

            var $this = this;
            $this.msg = 'hello';
            $this.menu = [
                {
                    name: 'test',
                    nav: [
                        {name: 'test.test1'},
                        {name: 'test.test2'}
                    ]
                },
                {
                    name: 'hi',
                    nav: [
                        {name: 'hi.test1'},
                        {name: 'hi.test2'}
                    ]
                }
            ];
            $this.stateGo = function () {
                console.log($state.current);
            };

            (function () {
                console.log('init');
                console.log($api);
            })();
            tips.error('ok',50000);
            $api.index_tab({apiv:9});
            $api.active({
                apiv:3,
                limit:999,
                page:1,
                token:'ARg9weCtTS2qRjE7KeegH4M'
            });
        }]);
})(angular.module('app'));