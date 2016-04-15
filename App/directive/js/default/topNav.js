/**
 * 公共topNav 组件
 * Created by rockblus on 15/10/30.
 */
define(function (require) {
    //全局对象，包括angular bodyAll 控制器
    var g = require('../../../controller/public/g.js');

    //请求本地数据localData。js
    require('../../../server/default/localData.js');


    g.app.directive('topnav', function (localData) {
        return {
            restrict: 'E',//E:包裹标签  A:属性 C:class
            //require:其他directive,
            replace: true,
            //此处可以引用外部html文件,添加对象名 templateUrl  todo (新架构路径不对)
            templateUrl: plus.io.convertLocalFileSystemURL("_www/App/directive/html/default/topNav.html"),
            controller: function ($scope) {
                $scope.item = localData.topNav.item;
                //返回图标
                $scope.backImg = plus.io.convertLocalFileSystemURL("_www/Public/images/icon/icon_arrow_left_gray.png");
            },
            link: function (scope, element, attrs, rCtrl) {
            }
        };
    });
});
