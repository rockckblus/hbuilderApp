/**
 * 公共组件 触摸移动控件
 * by rockblus
 */
define(function (require) {

    //全局对象，包括angular bodyAll 控制器
    var g = require('../../../../controller/public/g.js');


    g.app.directive('moveobj', function () {
            return {
                restrict: 'A',//E:包裹标签  A:属性 C:class
                replace: false,
                controller: function ($scope) {
                },
                link: function (scope, element, attrs) {

                    var objFour, bodyWH;//移动obj的 4边，body 的 width height
                    setTimeout(function () {
                        objFour = getObjFour();
                        bodyWH = getBody();
                    }, 0);


                    /**
                     * ji禁止滚动
                     * 15/12/22 */
                    function preventDefault(e) {
                        e.preventDefault();
                    };


                    /**
                     *页面逻辑具体调用方法
                     * 15/12/22 */
                    var scroll = {
                        start: function (e) {
                            document.addEventListener('touchmove', preventDefault, false);//禁止浏览器滚动
                        },
                        stop: function (e) {
                            document.removeEventListener('touchmove', preventDefault, false);//恢复浏览器滚动
                        }
                    };

                    var mouseX, mouseY;
                    var objX, objY;
                    var isDowm = false; //是否按下鼠标


                    var fun = {

                        /**
                         * 默认关闭浏览器滚动
                         * 15/12/22 */
                        init: function () {
                        },

                        /**
                         * 开始拖动
                         * 15/12/18 */
                        start: function (e) {
                            scroll.start(true);
                            objX = e.target.offsetLeft;
                            objY = e.target.offsetTop;
                            mouseX = e.clientX;
                            mouseY = e.clientY;

                            isDowm = true;
                        },

                        /**
                         * 拖动中
                         * 15/12/18 */
                        ing: function (e) {
                            var div = e;
                            var x = e.detail.touches[0].clientX;
                            var y = e.detail.touches[0].clientY;

                            var trueMore = trueXy(e);//判断 是否 允许移动

                            if (isDowm && trueMore) {
                                div.target.style.left = parseInt(objX) + parseInt(x) - parseInt(mouseX) + "px";
                                div.target.style.top = parseInt(objY) + parseInt(y) - parseInt(mouseY) + "px";
                            }


                        },

                        /**
                         * 拖动借宿
                         * 15/12/18 */
                        end: function (e) {
                            scroll.stop(true);
                            var trueMore = trueXy(e);//判断 是否 允许移动
                            if (isDowm && trueMore) {
                                var x = e.detail.touches[0].clientX;
                                var y = e.detail.touches[0].clientY;
                                var div = e;
                                div.target.style.left = (parseInt(x) - parseInt(mouseX) + parseInt(objX)) + "px";
                                div.target.style.top = (parseInt(y) - parseInt(mouseY) + parseInt(objY)) + "px";
                                mouseX = x;
                                mouseY = y;
                                isDowm = false;
                            }
                        }
                    };

                    function trueXy(e) {
                        var left = e.target.offsetLeft;
                        var top = e.target.offsetTop;

                        if (left < 0) {
                            e.target.style.left = 0 + 'px';
                            setTimeout(function () {
                                e.target.style.left = 0 + 'px';
                            }, 100);
                            return false;
                        }

                        if (left > bodyWH.width) {
                            setTimeout(function () {
                                e.target.style.left = bodyWH.width + 'px';
                            }, 100);
                            return false;
                        }

                        if (top < 0) {
                            e.target.style.top = 0 + 'px';
                            setTimeout(function () {
                                e.target.style.top = 0 + 'px';
                            }, 100);
                            return false;
                        }

                        if (top > bodyWH.height) {
                            setTimeout(function () {
                                e.target.style.top = bodyWH.height + 'px';
                            }, 100);
                            return false;
                        }

                        return true;

                    }

                    /**
                     * 监听事件
                     * 15/12/18 */

                    var element = document.getElementById(attrs.id);
                    var e = angular.element(element);//转 angualr 元素
                    /**
                     * 获取moveObj的宽高 4边的 offset
                     * 16/3/2 */
                    function getObjFour() {
                        var re = {
                            height: e[0].offsetHeight,
                            width: e[0].offsetWidth,
                            left: e[0].offsetLeft,
                            top: e[0].offsetTop
                        };
                        return re;
                    }


                    /**
                     * 获取 屏幕 下 右的 offset
                     * 16/3/2 */
                    function getBody() {
                        var body = angular.element('body');
                        return {
                            height: body[0].offsetHeight - parseInt(objFour.height),
                            width: body[0].offsetWidth - parseInt(objFour.width)
                        }
                    }


                    element.addEventListener('touchstart', function (e) {//拖动开始
                        fun.start(e.touches[0]);
                    });

                    element.addEventListener('drag', function (e) {//拖动中
                        fun.ing(e);
                    });
                    element.addEventListener('dragend', function (e) {//拖动借宿
                        fun.end(e);
                    });

                    fun.init();

                    /**
                     * 接收来自父控制器广播来的开始事件
                     * 15/12/22 */
                    scope.$on('scrollSend', function (target, type) {
                        if (type == 'start') {
                            scroll.start();
                        } else if (type == 'stop') {
                            scroll.stop();
                        }
                    })
                }
            }
        }
    )
});
