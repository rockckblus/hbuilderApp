/**
 * 公共组件 地址输入父级页面调用地址输入控件
 *-地址输入控件 获取预加载 addArea.html ,封装到directive addarea 里面，一个页面只能加载一次这个控件，所以使用时候 addarea 注入时候，注意作用域的位置,此处是发货地址，和收货地址 div  声明的时候 把 绑定的class 传过去 click的 value值 取 属性 attrClcikVal 可把参数 写入 startaddlst 里面, 重新绑定的自定义事件 名称 为 resBind-->
 * by rockblus
 */
define(function (require) {

    //全局对象，包括angular bodyAll 控制器
    var g = require('../../../controller/public/g.js');


    g.app.directive('addareapre', function () {
        return {
            restrict: 'A',//E:包裹标签  A:属性 C:class
            replace: false,
            controller: function ($scope) {

                var isGiveGps = false; //判断是否第一次给过gps了，如果给过了，再次加载的时候就不fire 到父发货页面 事件了


                /**
                 * 地址点击跳转到输入webView 相关
                 * by mayanqiao
                 * 15/12/17 */
                var goFun = {

                    addAreaObj: {},//addArea webView Obj
                    isOver: false,//addArea 加载状态

                    /**
                     * 默认addArea url 此处路径有可能有问题，用file路径 ios 会报错,暂用 相对路径
                     * 15/12/17 */
                    url: function () {
                        return  '../default/addArea.html';
                    },

                    /**
                     * 预加载 addInputWebView
                     * 15/12/17 */
                    pre: function () {
                        var _this = this;
                        setTimeout(function () {
                            _this.addAreaObj = mui.preload({
                                url: _this.url(),
                                id: _this.url()
                            });
                        }, 1800);
                    },

                    /**
                     * 监听area页面加载完成 的 addAreaIsOver 事件
                     * 15/12/17 */
                    addAreaIsOver: function () {
                        window.addEventListener('addAreaIsOver', function () {
                            goFun.isOver = true;//修改 addArea加载状态

//                                    var obj = goFun.getFirstGps(); 不从数据读了，直接写监听 传过来
                        });
                    },

                    /**
                     * 获取第一次定位信息
                     * 16/1/19 */
                    getFirstGps: function () {
                        var re = {
                            address: g.read2DB(g.storage_key.cur_address),
                            lat: g.read2DB(g.storage_key.cur_lat),
                            lng: g.read2DB(g.storage_key.cur_lng)
                        };
                        return re;
                    },

                    /**
                     * 响应addArea fire 动作来跳转，并传值
                     * 15/12/18 */
                    waitAreaFire: function (val) {
                        window.addEventListener('preWaitAddAreaIsOver', function () {
                            plus.nativeUI.closeWaiting();
                            goFun.isOver = true;//修改 addArea加载状态
                            goFun.goAddArea(val);//传值并跳转

                        });
                    },


                    /**
                     * fire 到 addArea goAddArea事件，传值过去 ,
                     * 15/12/17 */
                    /**
                     * hack连续提交
                     * 16/1/18 */
                    timeHackCount: false,
                    goAddArea: function (val) {
                        if (this.timeHackCount) {
                            return false;
                        } else {
                            if (this.addAreaObj) {


                                mui.fire(this.addAreaObj, 'goAddArea', {'val': val});
                                this.timeHackCount = true;
                                setTimeout(function () {
                                    goFun.timeHackCount = false;
                                }, 300);
                            }
                        }
                    },


                    bindElement: function (id) {
                        var element = document.getElementsByClassName(id);

                        var goInputAdd = function (v, val) {
//                      	var aa = JSON.stringify(val);
//							console.log("--传递数据--"+aa);
                            element[v].addEventListener('tap', function () {
                            	var bb = JSON.stringify(val);
//								console.log("--点击执行的数据--"+bb);
//                          	console.log('mmmmmmmm-----'+v)
                                $scope.goFun.goInputAdd(val);
                            });
                        };

                        for (var vo in element) {
                            if (typeof element[vo] == "object") {

                                var angualrElement = angular.element(element[vo]);
                                var val = {};
                                try {
                                    val.content = JSON.parse(angualrElement.attr('addclcikval'));
//									console.log("--resBind--"+angualrElement.attr('addclcikval'));
                                    val.type = angualrElement.attr('addclickvaltype');
                                    val.startEnd = angualrElement.attr('startend');
                                    val.LineBidding = angualrElement.attr('LineBidding');
                                } catch (e) {
                                    console.error('未获取到数据');
                                }

                                /**
                                 * 循环绑定监听
                                 * 16/1/25 */
                                if (val.type) {
                                    goInputAdd(vo, val);
                                } else {
                                    console.error('未获取到编辑类型');
                                }
                            }

                        }
                    },

//                    重新绑定元素click跳转 地图事件
                    resBind: function () {
                        window.addEventListener('resBind', function (data) {
                            $scope.goFun.bindElement($scope.addArea);
                        });
                    },

                    /**
                     * 监听地图加载完成 给 父页面传 gps
                     * 16/2/5 */

                    isHaveGps: function () {
                        window.addEventListener('isHaveGps', function (obj) {
                            /**
                             * 给发货页面sent 初始地址 提取本地 数据库信息，传对象过去
                             * 16/1/19 */
                            var before = plus.webview.currentWebview();
                            if (!isGiveGps) {
                                mui.fire(before, 'goGps', obj.detail);
                                isGiveGps = true;
                            } else {
                                console.log('isHaveGpsNoRe');
                            }
                        });
                    },
                    init: function () {
                        this.pre();//预加载
                        this.addAreaIsOver();//监听area加载完成事件
                        this.resBind();//重新绑定元素click跳转 地图事件
                        this.isHaveGps();//监听有gps 或 没 gps 都给父页面传 gps fire
                    }
                };

                /**
                 * 执行goFun
                 * 15/12/17 */
                goFun.init();

                /**
                 * 对应controller响应事件对象,controller 的调用方法
                 * 15/12/17 */
                $scope.goFun = {
                    /**
                     * bind Element
                     * 15/12/24 */
                    bindElement: function (id) {
                        setTimeout(function () {
                            goFun.bindElement(id);
                        }, 300);
                    },


                    /**
                     * 跳转到添加地址webView click事件.模板传入参数
                     * 15/12/17 */
                    goInputAdd: function (val) {
//                      console.log('valBind=='+val);
                        if (!val) {
                            return false;
                        }
                        if (goFun.isOver) {//如果addArea加载完成
                            goFun.goAddArea(val);//自定义事件 给 addArea 传参,addArea 执行跳转
                        } else {//启动监听事件，等待 addArea 加载完成fire 动作
                            plus.nativeUI.showWaiting();
                            goFun.waitAreaFire(val);
                        }
                    }
                };
            },
            link: function (scope, element, attrs) {
                setTimeout(function () {
                    scope.addArea = attrs.addareapre;
                    scope.goFun.bindElement(attrs.addareapre);
                }, 0);
            }
        };
    })
    ;
})
;
