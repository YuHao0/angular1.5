;(function (app) {
    app.config(['$stateProvider', '$urlRouterProvider', '$ocLazyLoadProvider', '$httpProvider', '$locationProvider',
        function ($stateProvider, $urlRouterProvider, $ocLazyLoadProvider, $httpProvider, $locationProvider) {
            var config = Duoshou.config;
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

            (function init() {
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
            })();


            $httpProvider.interceptors.push(['$q', 'tips', 'viewMask', function ($q, tips, viewMask) {
                // $httpProvider 拦截器
                return {
                    request: function (request) {
                        var $data = function (data) {
                            angular.forEach(['autoMask', 'autoTips'], function (key) {
                                request[key] = data[key] === undefined ? true : data[key];
                                delete data[key];
                            });
                            return data;
                        };

                        if (request.url && !!~request.url.indexOf('h5api') && request.method) {
                            console.log(request);
                            if (request.method.toUpperCase() === 'GET') {
                                request.params = $data(request.params || {});
                            } else {
                                request.data = $data(request.data || {});
                                request.headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
                                request.transformRequest = [function (data) {
                                    return angular.isObject(data) ? $.param(angular.forEach(data = angular.copy(data), function (item, key) {
                                        data[key] = (angular.isArray(item) || angular.isObject(item)) ? JSON.stringify(item) : item
                                    })) : data
                                }];
                            }
                            request.autoMask && viewMask.open();
                            request.url = decodeURIComponent(request.url);
                        }
                        return request
                    },
                    requestError: function (request) {
                        return $q.reject(request)
                    },
                    response: function (response) {
                        console.log(response);
                        if (response.config) {
                            response.config.autoMask && viewMask.close();
                            response.data.message && response.config.autoTips && tips.success(response.data.message);
                        }
                        return response
                    },
                    responseError: function (response) {
                        if (response.config) {
                            response.config.autoMask && viewMask.close();
                            response.data && response.data.message && response.config.autoTips && !$(".messenger-message-inner").length && tips.error(response.data.message);
                        }
                        if (response.data && response.data.code == '') {
                            //去登陆
                            location.href = '/login?go=' + encodeURIComponent(location.href);
                        }
                        return $q.reject(response)
                    }
                }
            }]);
        }
    ]);

    app.run(['$rootScope', '$state', '$api', function ($rootScope, $state, $api) {
        $rootScope.$state = $state;
        $api.$apply(Duoshou.service);
    }]);

})(angular.module('app', ['ui.router', 'oc.lazyLoad', 'ngResource']));