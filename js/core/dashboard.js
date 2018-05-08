;(function (app) {
    app.config(['$stateProvider', '$urlRouterProvider', '$ocLazyLoadProvider', '$httpProvider', '$provide',
        function ($stateProvider, $urlRouterProvider, $ocLazyLoadProvider, $httpProvider, $provide) {
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

            (function initAip() {
                $provide.service('$api', ['$resource', function ($resource) {
                    var fullUrl = function (url) {
                        return (/(^http:\/\/)|(^https:\/\/)|(^\/)/.test(url) ? url : (location.protocol + '//' + location.host + '/' + url));
                    };
                    this.$apply = function (serivce) {
                        angular.forEach(serivce, function (item, name) {
                            var url = item[0], option = item[1] || {method: 'GET'};
                            this[name] = $resource(fullUrl(url), {}, {getData: option}).getData;
                        }, this);
                        return this;
                    }
                }]);
                /*  view mask  */
                $provide.service('viewMask', function () {
                    ~function (self, mask) {
                        self.open = self.show = function (callback) {
                            self.loading = self.loading || 0;
                            mask.call(self, callback, true);
                        };
                        self.close = self.hide = function (callback, closeAll) {
                            if (!(callback instanceof Function)) {
                                callback = null;
                                closeAll = arguments[0];
                            }
                            self.loading = self.loading || 0;
                            mask.call(self, callback, false, closeAll)
                        };
                    }(this, function (callback, bool, closeAll) {
                        var context = this;
                        if (bool) {
                            context.loading++
                        } else {
                            if (closeAll) {
                                context.loading = 0
                            } else {
                                context.loading--
                            }
                        }
                        // 请求响应时间小于100ms没有必要打开遮罩层
                        // setTimeout(function () {
                        if (context.loading) {
                            $('#viewMask').attr('style', 'display:block');
                        } else {
                            $('#viewMask').attr('style', 'display:none');
                        }
                        // }, 100);
                        setTimeout(callback || angular.noop, 0);
                    });
                });
            })();

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
                    templateUrl: '/views/app/test/test1.html'
                }).state('test.test2', {
                        url: '/test2',
                        templateUrl: '/views/app/test/test2.html'
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
                    templateUrl: '/views/app/hi/test1.html'
                }).state('hi.test2', {
                    url: '/test2',
                    templateUrl: '/views/app/hi/test2.html'
                });

                //$locationProvider.html5Mode(true);

                $urlRouterProvider.otherwise('/hi/test1');
            })();
        }
    ]);

    app.run(['$rootScope', '$state', '$api', function ($rootScope, $state, $api) {
        $rootScope.$state = $state;
        $api.$apply(Duoshou.service);
    }]);

})(angular.module('app', ['ui.router', 'oc.lazyLoad', 'ngResource']));