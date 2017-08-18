;(function (app) {

    app.config(['$stateProvider', '$urlRouterProvider', '$ocLazyLoadProvider', '$httpProvider', '$locationProvider',
        function ($stateProvider, $urlRouterProvider, $ocLazyLoadProvider, $httpProvider, $locationProvider) {

            var config = {
                localTest: true,
                version: '?v=0.1.2',
                apps: [
                    {
                        name: 'test'
                    },
                    {
                        name: 'hi'
                    }
                ],
                lazyLoadModules: []
            };

            angular.forEach(config.apps, function (item) {
                item.serie = true;
                item.files = [];
                item.files.push('/dist/' + item.name + '.js' + config.version);
                config.lazyLoadModules.push(item);
            });

            $ocLazyLoadProvider.config({
                debug: false,
                modules: config.lazyLoadModules
            });

            $stateProvider
                .state('test', {
                    abstract: true,
                    url: '/test',
                    templateUrl: '/views/core/main.html',
                    resolve: {
                        loadApp: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load('test');
                        }]
                    }
                }).state('test.test1', {
                    url: '/test1',
                    templateUrl: '/views/app/test/test1.html',
                    controller: 'test.test1Controller'
                }).state('test.test2', {
                        url: '/test2',
                        templateUrl: '/views/app/test/test2.html',
                        controller: 'test.test2Controller'
                    })

                .state('hi', {
                    abstract: true,
                    url: '/hi',
                    templateUrl: '/views/core/main.html',
                    resolve: {
                        loadApp: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load('hi');
                        }]
                    }
                }).state('hi.test1', {
                    url: '/test1',
                    templateUrl: '/views/app/hi/test1.html',
                    controller: 'hi.test1Controller'
                }).state('hi.test2', {
                    url: '/test2',
                    templateUrl: '/views/app/hi/test2.html',
                    controller: 'hi.test2Controller'
                });

            //$locationProvider.html5Mode(true);

            $urlRouterProvider.otherwise('/hi/test1');
        }]);


    app.run(['$rootScope', '$state', '$ocLazyLoad', function ($rootScope, $state, $ocLazyLoad) {

        $rootScope.$state = $state;
        console.log('test');
    }]);

})(angular.module('app'));