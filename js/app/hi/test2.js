;(function (app) {
    app.controller('hi.test2Controller', ['$scope',
        function ($scope) {
            var c = 309;
            var $this = this;
            $this.msg = 'hi-test2';
            $this.test = [];
            var href = 'http://180f.ysts8.com:8000/%E6%81%90%E6%80%96%E5%B0%8F%E8%AF%B4/%E5%9C%B0%E5%BA%9C%E6%88%91%E5%BC%80%E7%9A%84/258.mp3';
            for(var i=c;i<=359;i++){
                $this.test.push({
                    id:i,
                    name:i+'mp3',
                    href:'http://180f.ysts8.com:8000/%E6%81%90%E6%80%96%E5%B0%8F%E8%AF%B4/%E5%9C%B0%E5%BA%9C%E6%88%91%E5%BC%80%E7%9A%84/' + i +'.mp3'
                })
            }
            console.log($this);
            $this.download = function(){
                for(var i=c;i<=359;i++){
                  document.getElementById(i).click();
                }
            }
        }]);
})(angular.module('app'));