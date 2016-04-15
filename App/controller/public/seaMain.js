/**
 * 全局SeaMain, 公共方法
 * 15-7-29 */

define(function (require) {
    //取消浏览器的所有事件，使得active的样式在手机上正常生效
    document.addEventListener('touchstart', function () {
        return false;
    }, true);

    //载入全局
    var g = require('./g.js');

    //载入public directive
    require('../../directive/js/default/public.js');

    //载入统计服务
    require('../../server/default/count.js');

    //bodyAll 绑定到 body 控制器
    g.app.controller('bodyAll', function ($scope, count) {
        $scope.$watch('$viewContentLoaded', function () { //angular 载入完成后。显示modle值
            $('.angularEnd').show();
            /**
             * 统计开始动作,包括监听页面关闭事件
             * 15/11/16 */
            count.startPostCount();
        });
    });

});