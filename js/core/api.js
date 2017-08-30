;(function (app) {

    app.service('$api', ['$resource', function ($resource) {
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
    app.service('viewMask', function () {
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
            if (bool) {
                this.loading++
            } else {
                if (closeAll) {
                    this.loading = 0
                } else {
                    this.loading--
                }
            }
            if (this.loading) {
                $('#viewMask').attr('style', 'display:block');
            } else {
                $('#viewMask').attr('style', 'display:none');
            }
            setTimeout(callback || angular.noop, 0);
        });
    });

})(angular.module('app'));