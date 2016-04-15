/**
 * public goUrl 服务
 * 15/11/18 */
define(function (require) {
    var g = require('../../controller/public/g.js');
    var tools = require('../../controller/public/tools.js');


    g.app.factory('publicServer', function () {
        var _this = this;

        /**
         * url跳转监听错误页面,预加载页面不在此跳转方法内
         * 15/11/12 */
        this.goUrl = function (url, obj) {
            if (url) {
                if (url == '../../../../../aTpl/login.html') {
                    var id = 'HBuilder';
                    if (plus.webview.getWebviewById(id)) {//判断指定id的 webView 是否被打开
                        mui.openWindow({
                                url: url,
                                id: id,
                                show: {
                                    autoShow: true
                                }
                            }
                        )
                        console.log('存在home');
                        _this.closeLeftNav(true);
                    }
                }

                if (plus.webview.getWebviewById(url)) {//判断指定id的 webView 是否被打开
                    mui.openWindow({
                            url: url,
                            id: url,
                            extras: obj,
                            createNew:false,
                            show: {
                                autoShow: true
                            }
                        }
                    );
                    console.log('存在1');
                    _this.closeLeftNav(true);
                }

                var newView = mui.openWindow({
                    url: url,
                    id: url,
                    extras: obj,
                    createNew:true,
                    show: {
                        autoShow: false
                    }
                });


                var countTime = false;//声明统计时间变量
                plus.nativeUI.closeWaiting();//hack ios  无法获取 waiting对象
                var waiting = plus.nativeUI.showWaiting();//获取系统等待waiting对象
                waiting.onclose = function () {//waiting对象关闭事件
                    countTime = true;
                }

                //超时之后执行 方法，
                setTimeout(function () {
                    if (!countTime) {
                        overTimeFun();
                    }
                }, g.overTime);


                /**
                 * 超时之后执行的方法,关闭waiting，跳转到错误提示页面
                 * 15/11/11 */
                var overTimeFun = function () {
                    console.log('url',url);

                    _this.closeLeftNav();//关闭侧栏

                    plus.nativeUI.toast('访问页面出错,或请求网络超时');
                }
            }
        };

        /**
         * 预加载页面跳转方法
         * 15/12/14 */
        this.beforeGoUrl = function (url) {
            mui.openWindow({
                    url: url,
                    id: url,
                    show: {
                        autoShow: true
                    }
                }
            )
        };

        /**
         * 判断网络
         * 15/11/12 */
        this.trueNet = function () {
            if (tools.driver.noNet()) {//如果未联网
                _this.closeLeftNav();//关闭侧栏
                console.log('网络无连接');
                return false;
            } else {
                return true;
            }
        };

        /**
         * 关闭侧栏 有参数传入 就不关闭其他页面
         * 15/11/26 */
        this.closeLeftNav = function (isSet) {
            //判断侧栏当前是测栏
            var thisV = plus.webview.currentWebview();
            if (thisV.id == "leftNav") {//如果侧栏
                thisV = plus.webview.currentWebview().opener();//获取创建者
                mui.fire(thisV, 'new');//关闭侧栏
            }
            plus.nativeUI.closeWaiting();
            if (!isSet) {
//                tools.tools.closeOtherView(thisV);
            }
        };

        return {
            goUrl: _this.goUrl,
            beforeGoUrl: _this.beforeGoUrl,
            trueNet: _this.trueNet,
            closeLeftNav: _this.closeLeftNav
        };

    })
});