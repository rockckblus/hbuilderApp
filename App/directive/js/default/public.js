/**
 * Created by rockblus on 15/11/11.
 * 公共public directive
 */
define(function (require) {
    var g = require('../../../controller/public/g.js');
    var tools = require('../../../controller/public/tools.js');

    require('../../../server/default/publicServer.js');
    /**
     *
     * 15/11/11 */
    g.app.directive('public', function (publicServer) {
        return {
            controller: function ($scope) {
                var _this = this;

                /**
                 * url跳转监听错误页面
                 * 15/11/12 */
                this.goUrl = function (url) {
                    publicServer.goUrl(url);
                };

                /**
                 * 预加载url跳转事件
                 * 15/11/12 */
                this.beforeGoUrl = function (url) {
                    publicServer.beforeGoUrl(url);
                };

                /**
                 * 判断网络
                 * 15/11/12 */
                this.trueNet = publicServer.trueNet;
                

                /**
                 * 关闭侧栏 有参数传入 就不关闭其他页面
                 * 15/11/26 */
                this.closeLeftNav = publicServer.closeLeftNav();


            }
        };
    })
    ;

    /**
     * 公用点击事件 跳转预加载窗口
     * directive标示：public beforegourl
     * attr值：直接beforegourl=‘__path__’
     * 15-7-31 */
    g.app.directive('beforegourl', function () {
        return {
            require: 'public',
            link: function (scope, element, attr, ctrl) {
                if (attr.beforegourl) {
                    var t = element[0];
                    t.addEventListener('tap', function () {
                        ctrl.beforeGoUrl(attr.beforegourl);
                    });
                }
            }
        };
    });

    /**
     * 公用点击事件 跳转新窗口
     * directive标示：public gourl
     * attr值：直接gourl=‘__path__’ truenet=‘true’(可选,有此attr就判断是否联网，再跳转)
     * 例子：<button  public gourl="http://baidu.com" truenet='true'>button</button>
     * 15-7-31 */
    g.app.directive('gourl', function () {
        return {
            require: 'public',
            link: function (scope, element, attr, ctrl) {
                if (attr.gourl) {
                    var t = element[0];
                    t.addEventListener('tap', function () {
                        if (attr.truenet) { //如果有truenet值，就判断联网
                            var trueRe = ctrl.trueNet();
                            console.log('trueRe', trueRe);
                            if (trueRe) {
                                ctrl.goUrl(attr.gourl);
                            }
                        } else {
                            ctrl.goUrl(attr.gourl);
                        }
                    });
                }
            }
        };
    });


    /**
     * 公用图片，图标点击事件，更换点击图标效果 ，如果有url attr 值 跳转对应 url
     * class标示：tapImg
     * attr值标示：clickImg , url ,srcImg,(trueNet)
     * 可选参数:trueNet 如果是true就判断是否联网来跳转还是提示联网不跳转
     * 例子：<img public tapimg src="img/home_btn_c1.png" clickImg='img/home_btn_c1_d.png' url='Member/car/index.html' trueNet = 'true' />
     * 15-7-31 */
    g.app.directive('tapimg', function () {
        return{
            require: 'public',
            link: function (scope, element, attr, ctrl) {
                var t = element[0];
                t.addEventListener('tap', function () {
                    var imgSrc = attr.src;
                    var clickImgPath = attr.clickimg;

                    if (clickImgPath) {
                        setTimeout(function () {
                            element.attr('src', clickImgPath);
                            setTimeout(function () {
                                element.attr('src', imgSrc);
                            }, 200);
                        }, 100);
                    }
                    var url = attr.url;
                    if (url) {
                        if (attr.truenet) { //如果有truenet值，就判断联网
                            var trueRe = ctrl.trueNet();
                            if (trueRe) {
                                ctrl.goUrl(url);
                            }
                        } else {
                            ctrl.goUrl(url);
                        }
                    }
                });
            }
        };
    });


});


/**
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 * 15/11/11 */

