/**
 * 从新绑定leftDiv (废弃)
 * Created by rockblus on 16/2/5.
 */

define(function (require) {
    var g = require('../../../../../controller/public/g.js');
    g.app.factory('resBindTouchLeftNav', resBindTouchLeftNav);

    function resBindTouchLeftNav() {

        return function resBindTouchLeftNav() {

            var leftWebView = plus.webview.getWebviewById('leftNav');

            try {
                var touchLeftNavObj = document.getElementById('touchLeftNav');
                touchLeftNavObj.addEventListener('swiperight', openMenu);

                //主界面向左滑动，若菜单已显示，则关闭菜单；否则，不做任何操作；
                window.addEventListener("swipeleft", closeMenu);


            } catch (e) {
                console.log(e);
            }

            function openMenu() {
                preventDefault();
                mui.fire(leftWebView, 'resBindTouchLeftNav');
            }

            function closeMenu() {
                mui.fire(leftWebView, 'swipeleft');
            }

            /**
             * ji禁止滚动
             * 15/12/22 */

            function preventDefault(e) {
                e = e || window.event;
                if (e.preventDefault)
                    e.preventDefault();
                e.returnValue = false;
            }
        }
    }


});
