define(function (require) {

    //全局对象，包括angular bodyAll 控制器
    var g = require('../../../../controller/public/g.js');
    //publicServer
    require('../../../../server/default/publicServer.js');

    g.app.directive('goBaiduMap', goBaiduMap);
    g.app.$inject = ['$scope', 'publicServer'];

    function goBaiduMap() {
        return {
            restrict: 'A',//E:包裹标签  A:属性 C:class
            scope: {},
            controller: function ($scope, publicServer) {
                var url = plus.io.convertLocalFileSystemURL("_www/App/aTpl/default/baiduMap.html");

                /**
                 * 跳转方法
                 * 16/2/2 */
                $scope.goUrl = function (gps) {
                    publicServer.goUrl(url, gps);
                };
            },
            link: function (scope, element, attrs) {

                console.log(element);
                /**
                 * 监听点击事件
                 * 16/2/2 */
                element.click(function () {
                    var gps = {lat: attrs.lat, lng: attrs.lng};
                    scope.goUrl(gps);
                });
            }
        };
    }
});