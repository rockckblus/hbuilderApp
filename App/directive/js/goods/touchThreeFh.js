/**
 * 发货 页面 touch三级directive
 * 15/12/30 */

define(function (require) {

    //全局对象，包括angular bodyAll 控制器
    var g = require('../../../controller/public/g.js');

    //发货三级数据 server touchThreeGhData
    require("../../../server/goods/touchThreeFh.js");

    require('../../../../Public/js/moment.js');

    var type = 'start';
    var selectDay = parseInt(Date.parse(new Date())) / 1000;
    g.app.directive('touchThreeFh', function () {
        return {
            restrict: 'E', //E:包裹标签  A:属性 C:class
            controller: function ($scope, touchThreeGhData) {

                $scope.touchData = {
                    date: '', //日期
                    time: '', //时间
                    quick: '' //时间描述
                };
                $scope.touchUi = {
                    back: false,
                    control: false,
                    showControl: '' //给面板动画 class
                };


                var _this = this;
                var tplType; //模板类型


                this.uiFun = {

                    /**
                     * 面板 显示 控制
                     * 16/1/7 */
                    controlShow: {
                        show: function () {
                            setTimeout(function () {
                                $scope.$apply(function () {
                                    $scope.touchUi.back = true;
                                    $scope.touchUi.control = true;
                                    $scope.touchUi.showControl = 'showControl';
                                    _this.uiFun.controlShow.hackLeftNavTouch(); //hack hack left导航 touch事件冲突
                                });
                            }, 0);
                        },
                        hide: function () {

                            setTimeout(function () {
                                $scope.$apply(function () {
                                    $scope.touchUi.back = false;
                                    $scope.touchUi.showControl = '';
                                    $scope.touchUi.control = false;
//									if (tplType == 2) {
//										$scope.touchData.date = [];
//										$scope.touchData.time = [];
//									}
                                    _this.uiFun.controlShow.hackLeftNavTouch(); //hack hack left导航 touch事件冲突
                                });
                            }, 301);
                        },
                        /**
                         * 监听 关闭事件 todo , 点确定的时候有应由 后续 逻辑
                         * 16/1/7 */
                        eventButton: function () {

                            /**
                             * 取消
                             * 16/1/7 */
                            document.getElementById('touchCancel').addEventListener('tap', function () {
                                _this.uiFun.controlShow.hide();
                            });


                            /**
                             * 确定
                             * 16/1/7 */
                            document.getElementById('touchOk').addEventListener('tap', function () {
                                _this.uiFun.controlShow.hide();
                                //                                todo , 点确定的时候有应由 后续 逻辑
                                if (tplType == 2) {
                                	_this.uiFun.saveData();
                                    //线路竞标页面
                                    var curr = plus.webview.currentWebview();
                                    var result = {};
                                    result.type = type; //装货还是卸货时间
                                    result.sign = 'S';
                                    mui.fire(curr, 'timeInfo', {
                                        data: result
                                    });
                                }
                            });
                        },

                        /**
                         * hack left导航 touch事件冲突
                         * 16/1/18 */
                        hackLeftNavTouch: function () {
                            try {
                                var leftAllDiv = document.getElementById('touchLeftNav'); //左侧响应touch的 div
                                leftAllDiv = angular.element(leftAllDiv);

                                var triangle = document.getElementById('touchLeftNavTriangle'); //3脚型
                                triangle = angular.element(triangle);

                                if ($scope.touchUi.control) { //判断面板打开
                                    leftAllDiv.hide();
                                    triangle.hide();
                                } else {
                                    leftAllDiv.show();
                                    triangle.show();
                                }

                            } catch (e) {
                                console.log('e', e);
                            }
                        }
                    },

                    /**
                     * edit给 日期
                     * 16/1/4 */
                    giveFiveDate: function () {
                        var date = touchThreeGhData.date; //日期

                        /**
                         * hack Tpl
                         * 16/1/7 */
                        if (tplType == 2) {
                            date = touchThreeGhData.two.date;
                            //将小于当前时间的都去掉
                            date = filterTime_1(date);
                        }
                        var endDate = [];
                        for (var i in date) {
                            var tmp = {};
                            tmp.name = date[i];
                            tmp.id = i;
                            endDate.push(tmp);
                        }
                        $scope.touchData.date = endDate;

                        _this.fun.showDefaultTime(this.editObj.one.date, date, 1);
                    },

                    /**
                     * giveTime edit给时间
                     * 16/1/6 */
                    giveTime: function () {
                        var date = touchThreeGhData.time; //时间
                        if (this.trueThisTime()) {

                            //此处应 判断 当前时间，与业务逻辑,动态 给时间
                            var level_1 = this.editObj.one.date;
                            if (tplType == 2) {
                                //第二类型的数据,根据保存的内容筛选date数组中合适的数据
                                if (level_1 !== '') {
                                    date = filterTime_2(level_1, date);
                                }
                            } else {
                                //第一类型的数据,根据保存的内容筛选date数组中合适的数据 TODO  还未测试
                                if (level_1 !== '') {
                                    date = filterTime_0(level_1, date);
                                }
                            }
                            var endDate = [];
                            for (var i in date) {
                                var tmp = {};
                                tmp.name = date[i];
                                tmp.id = i;
                                endDate.push(tmp);
                            }
                            var str = JSON.stringify(endDate);
                            //							console.log('str---' + str);
                            $scope.touchData.time = endDate;
                            _this.fun.showDefaultTime(this.editObj.one.time, date, 2);
                        } else {
                            /**
                             * hack Tpl
                             * 16/1/7 */
                            if (tplType == 2) {
                                date = touchThreeGhData.two.time;
                            }

                            var endDate2 = [];
                            for (var ii in date) {
                                var tmp2 = {};
                                tmp2.name = date[ii];
                                tmp2.id = ii;
                                endDate2.push(tmp2);
                            }
                            $scope.touchData.time = endDate2;
                            //							_this.fun.showDefaultTime(this.editObj.one.time, date, 2);
                        }
                    },

                    /**
                     * edit给 时间描述
                     * 16/1/4 */
                    giveQuice: function () {
                        var date = touchThreeGhData.quick; //


                        /**
                         * hack Tpl
                         * 16/1/7 */
                        if (tplType == 2) {
                            date = touchThreeGhData.two.quick;
                        }


                        var endDate = [];
                        for (var i in date) {
                            var tmp = {};
                            tmp.name = date[i];
                            tmp.id = i;
                            endDate.push(tmp);
                        }
                        $scope.touchData.quick = endDate;
                        _this.fun.showDefaultTime(this.editObj.one.quick, date, 3);
                    },
                    /**
                     * trueThisTime   此处应 判断 当前时间 todo
                     * 16/1/6 */
                    trueThisTime: function () {
                        if (this.editObj.one.date === "") {
                            //如果存储的信息为空,则将数据库第一个信息赋予
                            var date = touchThreeGhData.date; //日期
                            this.editObj.one.date = date[0];
                        }
                        //						var thisDate = g.read2DB(g.storage_key.goods_time_touch);
                        //						var data = jQuery.parseJSON(thisDate);
                        //						console.log(thisDate);
                        //						if (data.one.date == '') {
                        //
                        //						}
                        return true;
                    },

                    /**
                     * 计算统计出来的 底部
                     * 16/1/4 */
                    countBottom: function (touchNumStr) {
                        var re, length;
                        switch (touchNumStr) {
                            case 'touch1':
                                length = $scope.touchData.date.length;
                                break;
                            case 'touch2':
                                length = $scope.touchData.time.length;
                                break;
                            case 'touch3':
                                length = $scope.touchData.quick.length;
                                break;
                        }


                        if (tplType == 2) { //hack tpl
                            length++;
                        }

                        re = -(45 * length - 88);
                        return re;
                    },

                    /**
                     * 判断第一次给默认高亮
                     * 16/1/5 */
                    trueDefault: false,

                    /**
                     * 高亮日期选择
                     * 16/1/4 */
                    heightDate: function (arrNum, touchObjStr) {

                        if (!arrNum && arrNum !== 0) {

                            if (!this.trueDefault) { //default

                                var num_1 = 0; //日期
                                var num_2 = 0; //时间
                                var num_3 = 0; //如约,急...

                                var re = this.setInitPos();

                                num_1 = re.datePos;
                                num_2 = re.timePos;

                                //                                hack tpl
                                //								if (tplType == 2) {
                                //									num = 0;
                                //								}
                                //								console.log('num_1==='+num_1+'-----num_2===='+num_2);
                                setTimeout(function () {
                                    $scope.$apply(function () {
                                        $scope.touchData.date[num_1].class = 'heightSelect'; //日期
                                        $scope.touchData.time[num_2].class = 'heightSelect'; //时间
                                        $scope.touchData.quick[num_3].class = 'heightSelect'; //时间
                                        _this.uiFun.trueDefault = true;
                                    });
                                }, 0);
                            }
                            //
                            //                            var redLineDivArea = fun.getRedTopPx(); //红框的 上边线 位置
                            //                            var redLineDivAreaB = redLineDivArea + 45;//红框底边线位置
                            //                            console.log('top', redLineDivArea, redLineDivAreaB, areaPx + fun.touch1StartOffSetOne);
                            //                            if (areaPx == 45) {//第一个
                            //                                setTimeout(function () {
                            //                                    $scope.$apply(function () {
                            //                                        $scope.touchData.date[0].class = 'heightSelect';
                            //                                    })
                            //                                }, 0);
                            //                            }

                        } else {
                            switch (touchObjStr) {
                                case 'touch1':
                                    setTimeout(function () {
                                        $scope.$apply(function () {
                                            $scope.touchData.date[arrNum].class = 'heightSelect';
                                        });
                                    }, 0);
                                    _this.uiFun.editObj.one.date = $scope.touchData.date[arrNum].name; //给 one date
                                    _this.uiFun.saveData();
                                    //根据选择的第一级的时间分配第二时间
                                    //									console.log('aaaabbbbccc');
                                    _this.uiFun.changeEditTime();
                                    this.giveTime();
                                    break;
                                case 'touch2':
                                    setTimeout(function () {
                                        $scope.$apply(function () {
                                            $scope.touchData.time[arrNum].class = 'heightSelect';
                                        });
                                    }, 0);
                                    _this.uiFun.editObj.one.time = $scope.touchData.time[arrNum].name; //给 one date
                                    _this.uiFun.saveData();
                                    break;
                                case 'touch3':
                                    setTimeout(function () {
                                        $scope.$apply(function () {
                                            $scope.touchData.quick[arrNum].class = 'heightSelect';
                                        });
                                    }, 0);
                                    _this.uiFun.editObj.one.quick = $scope.touchData.quick[arrNum].name; //给 one date
                                    _this.uiFun.saveData();
                                    break;
                            }
                        }
                    },

                    /**
                     * 组合记录格式
                     * 16/1/5 */
                    editObj: { //根据设计 分 one two ,2 个模板调用 都从这里来取值，所以 这是 临时 存储数据用,这里 可以配置默认选项
                        one: {
                            date: '', //此处应该动态判断给默认 日期
                            time: '',
                            quick: '' //急 尽快 如约
                        }
                    },

                    /**
                     * 记录临时选中的数据进本地数据库,
                     * 16/1/5 */
                    saveData: function () {
                        var str = JSON.stringify(this.editObj);
                        g.save2DB(g.storage_key.goods_time_touch, str);
                    },

                    /**
                     * 判断 分配 取消高亮
                     * 16/1/6 */
                    cutHeight: function (touchStr) {
                        switch (touchStr) {
                            case 'touch1':
                                this.cutHeightToch1();
                                break;
                            case 'touch2':
                                this.cutHeightToch2();
                                break;
                            case 'touch3':
                                this.cutHeightToch3();
                                break;
                        }

                    },

                    /**
                     * 取消高亮touch1
                     * 16/1/4 */
                    cutHeightToch1: function () {
                        for (var i in $scope.touchData.date) {
                            $scope.touchData.date[i].class = '';
                        }
                        setTimeout(function () {
                            $scope.$apply($scope.touchData.date);
                        }, 0);
                    },

                    /**
                     * 取消高亮touch2
                     * 16/1/4 */
                    cutHeightToch2: function () {
                        for (var i in $scope.touchData.time) {
                            $scope.touchData.time[i].class = '';
                        }
                        setTimeout(function () {
                            $scope.$apply($scope.touchData.time);
                        }, 0);
                    },

                    /**
                     * 取消高亮touch2
                     * 16/1/4 */
                    cutHeightToch3: function () {
                        for (var i in $scope.touchData.quick) {
                            $scope.touchData.quick[i].class = '';
                        }
                        setTimeout(function () {
                            $scope.$apply($scope.touchData.quick);
                        }, 0);
                    },

                    init: function () {
                        this.setInitTop();
                        this.saveData(); //记录临时选中的数据进本地数据库,
                        this.giveFiveDate(); //给日期
                        this.giveTime(); //给时时间
                        this.giveQuice(); //给时间描述
                        //                        this.heightDate();//给默认 高亮
                        this.controlShow.eventButton(); //监听确定 取消 事件
                    },
                    /**
                     * 给editObj添加默认数据
                     * @param {Object} date
                     * @param {Object} time
                     * @param {Object} quick
                     */
                    defaultData: function (date, time, quick) {
                        this.editObj.one.date = date;
                        this.editObj.one.time = time;
                        this.editObj.one.quick = quick;
                    },

                    /**
                     * 第一级时间滑动结束后改变edit中time的数据
                     */
                    changeEditTime: function () {
                        var data = touchThreeGhData.time;
                        var t2 = document.getElementById('touch2');
                        if (tplType == 2) {
                            data = filterTime_2(this.editObj.one.date, data);
                            t2.style.top = '0px';
                        } else {
                            data = filterTime_0(this.editObj.one.date, data);
                            t2.style.top = '45px';
                        }
                        if (data.length > 0) {
                            this.editObj.one.time = data[0];
                        }
                    },
                    /**
                     * 设置控件初始高度
                     */
                    setInitTop: function () {
                        var t1 = document.getElementById('touch1');
                        var t2 = document.getElementById('touch2');
                        var t3 = document.getElementById('touch3');
                        if (tplType == 2) {
                            t1.style.top = '0px';
                            t2.style.top = '0px';
                            t3.style.top = '0px';
                        } else {
                            t1.style.top = '45px';
                            t2.style.top = '45px';
                            t3.style.top = '45px';
                        }
                    },

                    /**
                     * 找到默认数据在数组中的位置
                     */
                    setInitPos: function () {
                        var re = {};
                        re.datePos = 0;
                        re.timePos = 0;
                        var date1 = touchThreeGhData.date; //日期
                        if (tplType == 2) {
                            date1 = touchThreeGhData.two.date;
                            //将小于当前时间的都去掉
                            date1 = filterTime_1(date1);
                        }
                        for (var m = 0; m < date1.length; m++) {
                            if (date1[m] == this.editObj.one.date) {
                                re.datePos = m;
                                break;
                            }
                        }

                        var date2 = touchThreeGhData.time; //时间

                        //此处应 判断 当前时间，与业务逻辑,动态 给时间
                        var level_1 = this.editObj.one.date;
                        if (tplType == 2) {
                            //第二类型的数据,根据保存的内容筛选date数组中合适的数据
                            if (level_1 !== '') {
                                date2 = filterTime_2(level_1, date2);
                            }
                        } else {
                            //第一类型的数据,根据保存的内容筛选date数组中合适的数据 TODO  还未测试
                            if (level_1 !== '') {
                                date2 = filterTime_0(level_1, date2);
                            }
                        }

                        for (var n = 0; n < date2.length; n++) {
                            if (date2[n] == this.editObj.one.time) {
                                re.timePos = n;
                                break;
                            }
                        }
                        //						console.log('num_1==='+num1+'--&&&---num_2===='+num2);
                        return re;
                    }
                };

                this.fun = {

                    /**
                     * ji禁止滚动
                     * 15/12/22 */
                    preventDefault: function (e) {
                        e.preventDefault();
                    },

                    /**
                     *页面逻辑具体调用方法
                     * 15/12/22 */
                    scroll: {
                        start: function (e) {
                            document.addEventListener('touchmove', _this.fun.preventDefault, false); //禁止浏览器滚动
                        },
                        stop: function (e) {
                            document.removeEventListener('touchmove', _this.fun.preventDefault, false); //恢复浏览器滚动
                        }
                    },

                    /**
                     * 获取红色div 的 top 的 位置
                     * 15/12/30 */
                    getRedTopPx: function () {
                        var redDiv = document.getElementById('thisSelect');
                        redDiv = angular.element(redDiv);
                        return this.getTop(redDiv[0]);
                    },

                    /**
                     * 获取 元素 相对 浏览器 top
                     * 15/12/30 */
                    getTop: function (e) {
                        var offset = e.offsetTop;
                        if (e.offsetParent != null) {
                            offset += this.getTop(e.offsetParent);
                        }
                        return offset;
                    },

                    /**
                     * touch1StartTrue , 判断第一次的原始位置
                     * 16/1/4 */
                    touch1StartTrue: false,

                    /**
                     * 原始位置常量
                     * 16/1/4 */
                    touch1StartOffSetOne: '',

                    /**
                     * touch1Div 的 开始 位置
                     * 16/1/4 */
                    touch1StartOffSet: function () {
                        if (!this.touch1StartTrue) {
                            var touch1 = document.getElementById('touch1');
                            this.touch1StartTrue = true;
                            this.touch1StartOffSetOne = this.getTop(touch1);
                            return this.touch1StartOffSetOne;
                        } else {
                            return this.touch1StartOffSetOne;
                        }
                    },

                    /**
                     * 清空所有input。收起键盘
                     * 16/1/25 */
                    removeKey: function () {
                        document.activeElement.blur();
                    },

                    /**
                     * touch1 的 touch 事件 touchstart 的触摸 初始位置
                     * 16/1/4 */
                    touch1TouchStart: '',

                    /**
                     * touch2 的 touch 事件 touchstart 的触摸 初始位置
                     * 16/1/4 */
                    touch2TouchStart: '',

                    /**
                     * touch3 的 touch 事件 touchstart 的触摸 初始位置
                     * 16/1/4 */
                    touch3TouchStart: '',

                    /**
                     * touch监听事件
                     * 15/12/30 */
                    touchEvent: function () {
                        var touch1 = document.getElementById('touch1');
                        var touch2 = document.getElementById('touch2');
                        var touch3 = document.getElementById('touch3');


                        /**
                         * touch1 监听
                         * 16/1/6 */
                        touch1.addEventListener('touchstart', function (e) { //拖动开始
                            touchStart(touch1, e, 'touch1');
                        });

                        touch1.addEventListener('drag', function (e) { //拖动ing
                            touchDrag(touch1, e, 'touch1');
                        });

                        touch1.addEventListener('dragend', function (e) { //拖动end
                            touchDragend(touch1, 'touch1');
                        });

                        /**
                         * touch2 监听
                         * 16/1/6 */
                        touch2.addEventListener('touchstart', function (e) { //拖动开始
                            touchStart(touch2, e, 'touch2');
                        });

                        touch2.addEventListener('drag', function (e) { //拖动ing
                            touchDrag(touch2, e, 'touch2');
                        });

                        touch2.addEventListener('dragend', function (e) { //拖动end
                            touchDragend(touch2, 'touch2');
                        });

                        /**
                         * touch3 监听
                         * 16/1/6 */
                        touch3.addEventListener('touchstart', function (e) { //拖动开始
                            touchStart(touch3, e, 'touch3');
                        });

                        touch3.addEventListener('drag', function (e) { //拖动ing
                            touchDrag(touch3, e, 'touch3');
                        });

                        touch3.addEventListener('dragend', function (e) { //拖动end
                            touchDragend(touch3, 'touch3');
                        });

                        /**
                         * touchstart 监听方法
                         * 16/1/6 */
                        function touchStart(touchNumObj, e, touchNumStr) {
                            var touchArea = e.touches[0];
                            var divObj = _this.fun.getTop(touchNumObj);
                            var divCha = divObj - _this.fun.touch1StartOffSetOne;
                            switch (touchNumStr) {
                                case 'touch1':
                                    _this.fun.touch1TouchStart = touchArea.clientY - divCha;
                                    break;
                                case 'touch2':
                                    _this.fun.touch2TouchStart = touchArea.clientY - divCha;
                                    break;
                                case 'touch3':
                                    _this.fun.touch3TouchStart = touchArea.clientY - divCha;
                                    break;
                            }
                            _this.fun.scroll.start(); //禁止浏览器滚动
                        }

                        /**
                         * touchDrag 监听方法
                         * 16/1/6 */
                        function touchDrag(touchNumObj, e, touchNumStr) {
                            _this.uiFun.cutHeight(touchNumStr); //取消高亮,传过 touch1，或者 touch2 的 字符串
                            var touchMouse = e.detail.touches[0].clientY;
                            var margin;
                            switch (touchNumStr) {
                                case 'touch1':
                                    margin = touchMouse - _this.fun.touch1TouchStart; //计算第一次 和拖动的 距离
                                    break;
                                case 'touch2':
                                    margin = touchMouse - _this.fun.touch2TouchStart; //计算第一次 和拖动的 距离
                                    break;
                                case 'touch3':
                                    margin = touchMouse - _this.fun.touch3TouchStart; //计算第一次 和拖动的 距离
                                    break;
                            }

                            var countBotton = _this.uiFun.countBottom(touchNumStr);
                            var fourFive = 45;
                            if (tplType == 2) {
                                fourFive = 0;
                            }
                            if ((margin > fourFive)) { //阻止下拉事件
                                touchNumObj.style.top = fourFive + 'px';
                            } else {
                                if (margin > countBotton) {
                                    touchNumObj.style.top = margin + 'px';
                                }
                            }
                        }

                        /**
                         * touchDragend
                         * 16/1/6 */
                        function touchDragend(touchNumObj, touchObjStr) {
                            //							console.log('-------------------');
                            count(touchNumObj, touchObjStr); //计算位置 给 动画，给高亮
                            _this.fun.scroll.stop(); //恢复浏览器滚动
                        }


                        /**
                         * 如果 摸 为 0 就 (redLine - toucThisArea  )/45  获取 第几个数组 给高亮,最好加一个高亮动画
                         * 计算touch1 的高 ，根据与 45 像素取模  ，如果 模大于 22 ，就用touch1 div 想上移动 (45-模);
                         * 如果小于 23，就 向下移动 模 。然后 再执行一次 本方法，这里应该用动画回调
                         * 16/1/5 */
                        function count(touchNumObj, touchObjStr) {
                            var touchThisArea = _this.fun.getTop(touchNumObj); //当前停止时候的 touch1 的位置
                            var redLine = _this.fun.getRedTopPx();

                            var mo;
                            if (redLine - touchThisArea >= 45) {
                                mo = (redLine - touchThisArea) % 45; //45 取模
                            } else {
                                mo = (redLine - touchThisArea + 45) % 45;
                            }
                            //							console.log('mo', mo);
                            var moState;
                            if (mo === 0) {
                                moState = 1;
                            } else if (mo > 22) {
                                moState = 2;
                            } else if ((mo < 23) && (mo > 0)) {
                                moState = 3;
                            } else if (mo < 0) { //存在 负数的 mo 的时候
                                moState = 4;
                            }
                            var distance = 45 - mo;
                            switch (moState) {
                                case 1: //正好位置
                                    var num = (redLine - touchThisArea) / 45;
                                    _this.uiFun.heightDate(num, touchObjStr);
                                    break;
                                case 2: //touch 向上移动 45 - mo
                                    moveTouch(touchNumObj, touchNumObj.offsetTop, distance, function () {
                                        count(touchNumObj, touchObjStr);
                                    });
                                    break;
                                case 3: //touch  向下移动
                                    distance = -mo;
                                    moveTouch(touchNumObj, touchNumObj.offsetTop, distance, function () {
                                        count(touchNumObj, touchObjStr);
                                    });
                                    break;
                                case 4: //touch  向下移动 ,负数的 mo 情况
                                    touchNumObj.style.top = 45 + 'px';
                                    count(touchNumObj, touchObjStr);
                                    break;
                            }
                        }

                        /**
                         * 移动touch,
                         * 传 touch 对象，当前位置，移动距离
                         * 16/1/5 */
                        function moveTouch(touchNumObj, offsetTop, distance, fun) {
                            var endMargin; //最后移动距离
                            endMargin = offsetTop - distance;
                            //							console.log('endMargin', endMargin);
                            touchNumObj.style.top = endMargin + 'px';
                            fun();
                        }
                    },

                    /**
                     * 给模板类型 1 ,2
                     * 16/1/7 */
                    giveTplType: function (tplTypeNum) {
                        tplType = tplTypeNum;
                    },

                    /**
                     * 找到三个默认显示的数据,并将touch移动到该位置
                     * @param {Object} data--需要找的数据
                     * @param {Object} arr--从此数组中寻找
                     * @param {Object} touchIndex--需要移动第几个touchu
                     * 如果没有找到此数据,默认显示数组第一个
                     */
                    showDefaultTime: function (data, arr, touchIndex) {
                        for (var i = 0; i < arr.length; i++) {
                            if (data == arr[i]) {
                                //找到了
                                var distance;
                                if (tplType == 2) {
                                    distance = 45 * i;
                                    _this.fun.moveTo(touchIndex, distance);
                                } else {
                                    distance = 45 * i;
                                    _this.fun.moveTo(touchIndex, distance);
                                }
                                break;
                            } else {
                                //除非出错才会走到这一步,业务逻辑不允许走到这里
                                var tou = document.getElementById('touch2');
                                if (tplType == 2) {
                                    tou.style.top = '0px';
                                    if(touchIndex == 2){
                                    	_this.uiFun.editObj.one.time = arr[0];
                                    	
                                    }
                                } else {
                                    tou.style.top = '45px';
                                }
                            }
                        }
                    },

                    /**
                     * 将指定控件移动一定的距离
                     * @param {Object} touchIndex--需要移动的第几个touch控件
                     * @param {Object} distance--需要移动的距离
                     */
                    moveTo: function (touchIndex, distance) {
                        var touch;
                        var margin;
                        var countBotton;
                        switch (touchIndex) {
                            case 1:
                                touch = document.getElementById('touch1');
                                countBotton = _this.uiFun.countBottom('touch1');
                                break;
                            case 2:
                                touch = document.getElementById('touch2');
                                countBotton = _this.uiFun.countBottom('touch2');
                                break;
                            case 3:
                                touch = document.getElementById('touch3');
                                countBotton = _this.uiFun.countBottom('touch3');
                                break;
                            default:
                                break;
                        }

                        if (touch) {
                            var mOffsetTop = touch.offsetTop;
                            var endMargin = mOffsetTop - distance;
                            if (endMargin > countBotton) {
                                setTimeout(function () {
                                    touch.style.top = endMargin + 'px';
                                }, 0);

                            }
                        }
                    },

                    /**
                     * 监听当前view fire 来的changeDate事件
                     * 16/1/25 */
                    listenChangeDate: function () {
                        window.addEventListener('changeDate', function (obj) {
                            _this.uiFun.defaultData(obj.data, obj.time, obj.state);
                        });

                        /**
                         * 监听关闭面板取消事件
                         * 16/2/14 */
                        window.addEventListener('hidePlane', function () {
                            _this.uiFun.controlShow.hide();
                        });
                    },

                    init: function (tplTypeNum) {
                        this.giveTplType(tplTypeNum); //给模板类型
                        this.touchEvent(); //监听touch1
                        this.touch1StartOffSet(); //获取原始相对 浏览器 位置
                        this.listenChangeDate();//监听当前view fire 来的changeDate事件
                    }
                };

                this.touchThreeGhData = touchThreeGhData;

            }
        };
    });

    g.app.directive('tplOne', function () {
        return {
            restrict: 'A', //E:包裹标签  A:属性 C:class
            require: 'touchThreeFh',
            templateUrl: "../../directive/html/goods/touchThreeFh.html",
            link: function (scope, element, attrs, rCtrl) {

                /**
                 * bind 监听 弹出 选择面板
                 * 16/1/7 */
                var id = attrs.tplOne;
//                var first = false;//判断 是否 初始化，第2次 是响应 监听事件的 传值
                var listentFun = function (id) {
                    document.getElementById(id).addEventListener('tap', function () {
                        rCtrl.fun.removeKey();


                        setTimeout(function () {
                            /**
                             * 初始化Controller
                             * 16/1/7 */

                            var thisDate = g.read2DB(g.storage_key.goods_time_touch);
                            thisDate = JSON.parse(thisDate);

                            try {
                                if (!thisDate.one.date[0]) {//如果 没有缓存的 地址，就给默认
                                    rCtrl.uiFun.defaultData(rCtrl.touchThreeGhData.date[1], rCtrl.touchThreeGhData.time[1], rCtrl.touchThreeGhData.quick[1]);
                                } else {
                                    rCtrl.uiFun.defaultData(thisDate.one.date, thisDate.one.time, thisDate.quick);
                                }
                            } catch (e) {
                                console.log(e);
                            }
                            rCtrl.fun.init(1);
                            rCtrl.uiFun.init();

                        }, 200);

                        rCtrl.uiFun.controlShow.show();
                        setTimeout(function () {
                            rCtrl.uiFun.heightDate(); //给默认 高亮
                        }, 600);
                    });
                };

                if (document.getElementById(id)) {
                    setTimeout(function () {
                        listentFun(id);
                    }, 0);
                } else {
                    setTimeout(function () {
                        listentFun(id);
                    }, 800);
                }

            }
        };
    });

    g.app.directive('tplTwo', function () {
        return {
            restrict: 'A', //E:包裹标签  A:属性 C:class
            require: 'touchThreeFh',
            templateUrl: "../../directive/html/goods/touchThreeFhTwo.html",
            link: function (scope, element, attrs, rCtrl) {

                /**
                 * bind 监听 弹出 选择面板
                 * 16/1/7 */
                var className = attrs.tplTwo;

                var times = document.getElementsByClassName(className);
                
                var listenFun = function (i, obj) {
                    times[i].addEventListener('tap', function () {
                        type = this.getAttribute('type');
                        selectDay = this.getAttribute('day');
                        var stime = this.getAttribute('stime');
                        var etime = this.getAttribute('etime');
                        var state = this.getAttribute('state');
                        switch (state) {
                            case '01':
                                state = plus.io.convertLocalFileSystemURL("_www/Public/images/icon/icon_cn_ruyue_green.png");
                                break;
                            case '02':
                                state = plus.io.convertLocalFileSystemURL("_www/Public/images/icon/icon_cn_jingkuai.png");
                                break;
                            case '03':
                                state = plus.io.convertLocalFileSystemURL("_www/Public/images/icon/icon_urgency.png");
                                break;
                            default:
                                break;
                        }
                        setTimeout(function () {
                            /**
                             * 初始化Controller
                             * 16/1/7 */
                            rCtrl.uiFun.defaultData(stime, etime, state);
                            rCtrl.fun.init(2);
                            rCtrl.uiFun.init();
                        }, 200);
                        rCtrl.uiFun.controlShow.show();
                        setTimeout(function () {

                            rCtrl.uiFun.heightDate(); //给默认 高亮
                        }, 600);
                    });

                };
                for (var i = 0; i < times.length; i++) {
                    listenFun(i, this);
                }
            }
        };
    });

    /**
     * 根据一级时间筛选二级时间符合数据--第一个结构
     * @param {Object} str---第一级的时间   01月02日
     * @param {Object} arr--第二级时间的数组
     */
    function filterTime_0(str, arr) {
        var newArr = [];
        if (str !== '') {
            var indexMouth = str.indexOf('月');
            var mouth = str.slice(0, indexMouth);
            var indexDay = str.indexOf('日');
            var day = str.slice(indexMouth + 1, indexDay);
            var currTimeStr = Date.parse(new Date()); //当前时间
            var yearCurr = moment(parseInt(currTimeStr)).format('YYYY');
            var mouthCurr = moment(parseInt(currTimeStr)).format('MM');
            var dayCurr = moment(parseInt(currTimeStr)).format('DD');
            if (mouthCurr == mouth && day == dayCurr) {
                //是当天
                for (var i = 0; i < arr.length; i++) {
                    var timeStr = yearCurr + '-' + mouth + '-' + day + ' ' + arr[i] + ':00.0';
                    var time = transdate(timeStr);
                    if (time > currTimeStr) {
                        newArr.push(arr[i]);
                    }
                }
                return newArr;
            } else {
                return arr;
            }
        }

    }

    /**
     * 将小于当前时间的去掉---第二个结构
     * @param {Object} timeArr  需要筛选的时间的数组
     * return 返回筛选完的数组
     */
    function filterTime_1(timeArr) {
        //判断选中的时间是不是当天
        var yearSelect = moment(parseInt(selectDay) * 1000).format('YYYY');
        var mouthSelect = moment(parseInt(selectDay) * 1000).format('MM');
        var daySelect = moment(parseInt(selectDay) * 1000).format('DD');
        var currTimeStr = Date.parse(new Date()); //当前时间
        var yearCurr = moment(parseInt(currTimeStr)).format('YYYY');
        var mouthCurr = moment(parseInt(currTimeStr)).format('MM');
        var dayCurr = moment(parseInt(currTimeStr)).format('DD');
        //		console.log('---选中的天----' + yearSelect + '-' + mouthSelect + '-' + daySelect);
        //		console.log('---当前的天----' + yearCurr + '-' + mouthCurr + '-' + dayCurr);
        if (yearSelect == yearCurr && mouthSelect == mouthCurr && daySelect == dayCurr) {
            //是当天
            var newTimeArr = [];
            for (var i = 0; i < timeArr.length; i++) {
                var timeSelectStr = yearSelect + '-' + mouthSelect + '-' + daySelect + ' ' + timeArr[i] + ':00.0';
                var timeSelect = transdate(timeSelectStr);
                if (timeSelect > currTimeStr) {
                    //大于当前时间,添入到新的数组中
                    newTimeArr.push(timeArr[i]);
                }
            }
            return newTimeArr;
        } else {
            //不是当天
            return timeArr;
        }
    }

    /**
     * 根据一级时间筛选二级时间符合数据--第二个结构
     * @param {Object} string---一级选中的时间
     * @param {Object} arr--保存二级时间的数组
     */
    function filterTime_2(string, arr) {
        var newArr = [];
        var currTimeStr = Date.parse(new Date()); //当前时间
        var yearCurr = moment(parseInt(currTimeStr)).format('YYYY');
        var mouthCurr = moment(parseInt(currTimeStr)).format('MM');
        var dayCurr = moment(parseInt(currTimeStr)).format('DD');
        var level_1_str = yearCurr + '-' + mouthCurr + '-' + dayCurr + ' ' + string + ':00.0';
        var level_1 = transdate(level_1_str);
        //		console.log(level_1);
        for (var i = 0; i < arr.length; i++) {
            var level_2_str = yearCurr + '-' + mouthCurr + '-' + dayCurr + ' ' + arr[i] + ':00.0';
            var level_2 = transdate(level_2_str);
            if (level_1 < level_2) {
                newArr.push(arr[i]);
            }
        }
        return newArr;
    }

    /**
     * 将时间串转换为时间戳
     * @param {Object} date  时间串格式为'2015-03-05 07:30:00.0'
     */
    function transdate(date) {
        date = date.substring(0, 19);
        date = date.replace(/-/g, '/');
        var timestamp = new Date(date).getTime();
        return timestamp;
    }


});