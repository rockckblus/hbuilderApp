/**
 * leftNav 控制器
 * Created by rockblus on 15/11/13.
 */
define(function (require) {

    var g = require('../../../../../controller/public/g.js');

    //载入侧滑directive
    require('../../../../../directive/js/default/webView/leftNav/leftNavDirective.js');


    /**
     * 侧滑导航对象相关
     * 15/11/16 */
    var startNavFun = function () {
//获得侧滑主窗口webview对象
        var main = null;
        mui.plusReady(function () {
            main = plus.webview.currentWebview().opener();
        });
        function closeMenu() {
            mui.fire(main, "menu:swipeleft");
        }

//优化显示出来的侧滑菜单，只需监听该菜单的左滑事件，然后将其关闭即可；在菜单上右滑，不做任何操作；
        window.addEventListener("swipeleft", closeMenu);
//        监听关闭点击事件
//        document.getElementById("close-btn").addEventListener('tap', closeMenu);
        mui.menu = closeMenu;


    };
    startNavFun();

});
