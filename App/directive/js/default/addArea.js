/**
 * 公共组件 百度地址下拉
 * by rockblus
 */
define(function (require) {

    //全局对象，包括angular bodyAll 控制器
    var g = require('../../../controller/public/g.js');
    var tools = require('../../../controller/public/tools.js');


    //百度api服务
    require('../../../server/default/baiduApi.js');

    //历史线路
    require('../../../server/goods/historyLine.js');

    //发货三级数据 server touchThreeGhData
    require("../../../server/goods/touchThreeFh.js");

    g.app.directive('areainput', function (baiduapi, historyLine, touchThreeGhData) {
        return {
            restrict: 'E',//E:包裹标签  A:属性 C:class
            //require:其他directive,
            replace: true,
            //此处可以引用外部html文件,添加对象名 templateUrl
            templateUrl: plus.io.convertLocalFileSystemURL("_www/App/directive/html/default/addArea/addArea.html"),
            controller: function ($scope, $timeout) {

                var _this = this;
                var map, thisGps, preVal, inType = 1;//地图对象,gps对象,父页面传来的参数对象, inType为传入的 编辑地址类型，是起始地，还是目的地，起始 1 ，目的 2
                var firstHistory = false;//判断下拉里面的数据是不是历史记录，判断是否第一次历史记录
                var returnYear = false;//edit 地址的时候，返回的年份 是 edit 传来时候的年份
                $scope.timePlaneState = false;//时间控制面板状态
                $scope.subDataShow = true;//时间显示

                /**
                 * 声明是否点击了地址输入框
                 * 15/12/18 */
                $scope.aleryClickInput = false;

                /**
                 * //临时下拉模型
                 * 15/12/18 */
                $scope.tempXiaLa = '';

                /**
                 * //记录地址的 gps点
                 * 15/12/18 */
                $scope.addGps = false;

                /**
                 * //判断联网变量
                 * 15/12/18 */
                $scope.trueNet = false;

                /**
                 * //控制显示输入姓名电话
                 * 15/12/18 */
                $scope.nametTelDivShow = true;


                /**
                 * //footBar显示控制
                 * 15/12/18 */
                $scope.footBarShow = false;

                /**
                 * //map icon 显示控制
                 * 15/12/18 */
                $scope.mapCenterIconShow = false;

                /**
                 * //判断下拉是否 被收起 未收起 是true  收起是 false
                 * 15/12/18 */
                $scope.trueSilde = false;

                /**
                 * inputUI Icon
                 * 15/12/18 */
                $scope.inputUiIcon = {
                    sm: plus.io.convertLocalFileSystemURL("_www/Public/images/icon/icon_phonebook_gray.png"),
                    del: plus.io.convertLocalFileSystemURL("_www/Public/images/addArea/btn_delete_0.png"),//删除图标
                    gps: plus.io.convertLocalFileSystemURL("_www/Public/images/addArea/icon_gps.png"),//重新定位图标
                    silde: plus.io.convertLocalFileSystemURL("_www/Public/images/addArea/icon_silde.png"),//重新定位图标
                    img: '',
                    startEnd: plus.io.convertLocalFileSystemURL("_www/Public/images/addArea/icon_star.png"),//起终 默认 起
                    changeImg: function (status) {//default
                        switch (status) {
                            case 'del':
                                this.img = this.del;
                                break;
                            case 'gps':
                                this.img = this.gps;
                                break;
                            case 'silde':
                                this.img = this.silde;
                                break;
                            default :
                                this.img = this.gps;
                                break;
                        }
                    },
                    hackImg: {

                        /**
                         * hack back
                         * 15/12/16 */
                        hackBack: function () {
                            var backDivWidth = $('#leftBackImg').width();
                            var backDivHeight = $('#leftBackImg').height();
                            if (backDivWidth < 50) {// div的 高是 50px,判断宽 大于50px 就不变给图标 48px,如果小于50，那就取宽，给图标小于宽的值

                                $('#leftBackImg').css({
                                    width: '60%',
                                    height: 'auto'
                                });
                                setTimeout(function () {
                                    var newHeight = $('#leftBackImg').height();
                                    $('#leftBackImg').css('marginTop', (50 - newHeight) / 2);
                                }, 400);
                            }
                        },

                        /**
                         * hack startEnd Icon
                         * 16/1/12 */
                        hackStartEndIcon: function () {
                            setTimeout(function () {
                                var iconHeight = $('#startEndIcon').height();
                                var mar = (50 - iconHeight) / 2;
                                $('#startEndIcon').css({marginTop: mar + 'px'});
                            }, 400);
                        },

                        /**
                         * hack startEnd Icon
                         * 16/1/12 */
                        hackTime: function () {
                            setTimeout(function () {
                                var iconHeight = $('#leftIconTime').height();
                                var mar = (50 - iconHeight) / 2;
                                $('#leftIconTime').css({marginTop: mar + 'px'});
                            }, 400);
                        },


                        /**
                         * hack header
                         * 16/1/12 */
                        hackHeader: function () {
                            setTimeout(function () {
                                var iconHeight = $('#leftIconHeader').height();
                                var mar = (50 - iconHeight) / 2;
                                $('#leftIconHeader').css({marginTop: mar + 'px'});
                            }, 400);
                        },

                        /**
                         * hack telIconImg
                         * 16/1/12 */
                        hackTelIconImg: function () {
                            setTimeout(function () {
                                var iconHeight = $('#telIconImg').height();
                                var mar = (50 - iconHeight) / 2;
                                $('#telIconImg').css({marginTop: mar + 'px'});
                            }, 400);
                        },

                        /**
                         * hack tel Icon
                         * 15/12/16 */
                        hackTelIcon: function () {
                            var height = $('.inputTel').height();
                            $('.sm').css('height', height).find('img').css({
                                height: '90%',
                                marginTop: '5%'
                            });
                        },

                        /**
                         * map Hack
                         * 15/12/16 */
                        hackMap: function () {
                            var topThisHeigh = $('.inputCenter').height() + $('.nameTelDiv').height();//实际的div 高
//                            $('.addInputDiv').height(topThisHeigh + 20 + 50);//上部输入表单 div 和实际高度相同 + tel上部的 panding 10 + 50 时间 todo 此处有hack时间输入的情况
                            $('.addInputDiv').height(220);//上部输入表单 div 和实际高度相同 + tel上部的 panding 10 + 50 时间 todo 此处有hack时间输入的情况
                            var rightDivInputHeight = $('.rightDivInput').height();//整个 conetn高
//                            $('.mapDiv').height(rightDivInputHeight - (topThisHeigh + 20));//给mapdiv高
                            $('.mapDiv').height(rightDivInputHeight - 220);//给mapdiv高
                        },


                        init: function () {
                            this.hackBack();
                            this.hackStartEndIcon();
                            this.hackTime();
                            this.hackHeader();
//                            this.hackTelIcon();
                            this.hackMap();
                            this.hackTelIconImg();
                        }
                    }
                };

                /**
                 * 图标模型对象
                 * 15/12/18 */
                $scope.icon = {

                    /**
                     * 返回图标
                     * 15/12/18 */
                    back: plus.io.convertLocalFileSystemURL("_www/Public/images/addArea/icon_arrow_left_red.png"),

                    /**
                     * time图标
                     * 16/1/12 */
                    time: plus.io.convertLocalFileSystemURL("_www/Public/images/addArea/icon_time.png"),

                    /**
                     * 时间描述图标
                     * 16/1/12 */
                    timeDescriberIcon: {
                        select: '',
//                        worry: plus.io.convertLocalFileSystemURL("_www/Public/images/icon/icon_urgency.png"),
                        worry: ''

                    },

                    /**
                     * 电话头像图标
                     * 16/1/12 */
                    header: plus.io.convertLocalFileSystemURL("_www/Public/images/addArea/icon_name.png"),

                    /**
                     * 电话听筒图标
                     * 16/1/12 */
                    telIconImg: plus.io.convertLocalFileSystemURL("_www/Public/images/addArea/icon_telephone.png")
                };

                /**
                 *地址模型
                 * 15/12/18 */
                $scope.area = {
                    input: {
                        default: '',
                        defaultPlace: '地址',
                        city: '',//城市
                        district: '',//区
                        street: '',//街
                        street_number: '',//号
                        poiRegions: ''//简介标志
                    }//输入框模型
                };

                /**
                 *表单模型
                 * 15/12/18 */
                $scope.from = {
                    name: '',
                    namePlace: '姓名',
                    tel: '',
                    telPlace: '电话',

                    //时间模型
                    timeObj: {
                        date: '',
                        time: '',
                        describe: ''
                    },
                    /**
                     * 验证表单相关方法
                     * 15/12/16 */
                    verFun: {

                        /**
                         * 验证输入模型
                         * 15/12/16 */
                        inputAddNull: function () {
                            if (!tools.verify.isEmpty($scope.area.input.default)) {//如果空
                                plus.nativeUI.toast('地址不能为空');
                                return true;
                            }
                        },

                        /**
                         * 验证姓名空
                         * 15/12/16 */
                        nameNull: function () {
                            if (!tools.verify.isEmpty($scope.from.name)) {
                                plus.nativeUI.toast('姓名不能为空');
                                return true;
                            }
                        },

                        /**
                         * 验证tel空 并去掉 '-' 再验证为数字
                         * 15/12/16 */
                        telNull: function () {
                            if (!tools.verify.isEmpty($scope.from.tel)) {
                                plus.nativeUI.toast('电话不能为空');
                                return true;
                            }
                            else {
                                var tel = $scope.from.tel;

                                if (isNaN(tel)) {
                                    plus.nativeUI.toast('电话不正确');
                                    return true;
                                }
                            }
                        },

                        /**
                         * 验证输入的地址是否有 城市 todo 接口
                         * 16/1/27 */
                        trueCityName: function (fun) {
                            baiduapi.trueCityName($scope.area.input.default, function (re) {

                                if (re.code && (re.code == 'S')) {
                                    fun(re);
                                } else {
                                    plus.nativeUI.toast('地址输入不正确,没有城市');
                                    return true;
                                }
                            });

                            return false;
                        },

                        init: function (func) {

                            this.trueCityName(function () {

                                if ($scope.from.verFun.inputAddNull()) {
                                    return false;
                                }
                                if ($scope.from.verFun.nameNull()) {
                                    return false;
                                }
                                if ($scope.from.verFun.telNull()) {
                                    return false;
                                }

                                func();

                            });


                        }

                    }

                    /**
                     * 记录地址信息记录到
                     * 15/12/17 */
                };

                /**
                 *other模型
                 * 15/12/18 */
                $scope.other = {
                    noNet: '加载地图中',
                    resMapShow: false,//刷新地图button显示控制
                    resMap: function () {//刷新地图控制
                        plus.nativeUI.toast('重新定位中');
                        $scope.other.noNet = '';
                        $scope.other.resMapShow = false;
                        start(true);
                    }
                };

                /**
                 *通讯录对象
                 * 15/12/18 */
                $scope.smObj = {
                    show: false,
                    list: ''
                };

                /**
                 *监听输入模型变化事件
                 * 15/12/18 */
                $scope.$watch('area.input.default', function (e) {
                    var city = $scope.area.input.city;//判断城市 如果定位了当前地址,或者判断传入 是 需要定位的情况，就传city
                    setTimeout(function () {
                        _this.fun.changeTwoLine.changeTrue();//判断2行还是 1行 给 行高
                    }, 0);

                    if (!e) {

                        if (firstHistory) {
                            //为空给历史,并且不是第一次载入
                            _this.fun.getHistory(function (re) {

                                var list;
                                if (inType == 1) {//起始
                                    try {
                                        list = re.data.receive_adr_list;
                                    } catch (e) {

                                    }
                                }
                                if (inType == 2) {//目的
                                    try {
                                        list = re.data.send_adr_list;
                                    } catch (e) {

                                    }
                                }
                                if (list) {
                                    $scope.area.slide = list;
                                    $scope.tempXiaLa = list;
//                                $scope.inputUiIcon.changeImg('silde');//给下拉开启状态

                                    //ui 操作 隐藏nametelDiv ，根据下拉给高，变换地图高
                                    _this.fun.ui.changeSlide();
                                }
                            });
                        }

                        /**
                         * 记录不是第一次的 空 ，来判断给历史
                         * 16/1/25 */
                        firstHistory = true;
                    }


                    if ($scope.aleryClickInput) {//判断是否input框被点击了
                        setTimeout(function () {

                            if (e) {//如果不为空
                                _this.fun.getLiangxiang($scope.area.input.default, function (re) {
                                    if ((re.status === 0) && re.result[0] && re.result[0].name) {
                                        $scope.area.slide = re.result;
                                        $scope.tempXiaLa = re.result;
                                        $scope.inputUiIcon.changeImg('silde');//给下拉开启状态

                                        //ui 操作 隐藏nametelDiv ，根据下拉给高，变换地图高
                                        _this.fun.ui.changeSlide();
                                    }
                                }, city);
                            }

                        }, 300);
                    }
                });

                /**
                 *下拉item点击事件
                 * 15/12/18 */
                $scope.getThisAdd = function (index) {
                    var indexObj = $scope.tempXiaLa[index];
                    $scope.area.input.default = indexObj.city + " " + indexObj.district + " " + indexObj.name;//给默认输入字符串

                    /**
                     * todo  此处记录 三级联动的字符串 获取 gps点
                     * 15/12/7 */
                    if (indexObj.city) {
                        $scope.area.input.city = indexObj.city;
                        $scope.area.input.district = indexObj.district;
                        if (map) {
                            baiduapi.wapApi.moveMap(map, indexObj.location);//移动地图
                            baiduapi.wapApi.delMark(map);//删除标记
                            baiduapi.wapApi.setMark(map, indexObj.location);//设置标记
                        } else {
//                            var reGps = {
//                                lat: indexObj.location.lng,
//                                lng: indexObj.location.lat
//                            }
                            _this.mapFun.setNewMap(indexObj.location, true);//如果没有地图对象，就新建立一个地图,true 为是百度坐标类型
                        }
                    }
                };

                /**
                 *历史下拉item点击事件
                 * 15/12/18 */
                $scope.getThisAddHistory = function (index) {
                    $scope.mapClick();
                    var indexObj = $scope.tempXiaLa[index];

                    /**
                     * 给姓名电话
                     * 16/1/25 */
                    try {
                        _this.smFun.giveNameTelFromHistory(indexObj.psn_name, indexObj.psn_tel);
                    } catch (e) {
                        console.error(e);
                    }

                    $scope.area.input.default = indexObj.adrs_detail;//给默认输入字符串
                    indexObj.location = {
                        lat: indexObj.lng,
                        lng: indexObj.lat
                    };

                    /**
                     * todo  此处记录 三级联动的字符串 获取 gps点
                     * 15/12/7 */
                    if (map) {
                        baiduapi.wapApi.moveMap(map, indexObj.location);//移动地图
                        baiduapi.wapApi.delMark(map);//删除标记
                        baiduapi.wapApi.setMark(map, indexObj.location);//设置标记
                    } else {
                        _this.mapFun.setNewMap(indexObj.location, true);//如果没有地图对象，就新建立一个地图,true 为是百度坐标类型
                    }
                };

                /**
                 *app input focus 事件
                 * 15/12/18 */
                $scope.addInputFocus = function () {
                    setTimeout(function () {
                        $scope.$apply(function () {
                            _this.fun.clearData();
                            _this.fun.ui.repOldMap();//恢复地图高
                            $scope.nametTelDivShow = true;//显示姓名电话输入框
                            $scope.hideFooter();//关闭foot
                        });
                    }, 0);
                };

                /**
                 *地图点击事件
                 * 15/12/18 */
                $scope.mapClick = function () {
                    setTimeout(function () {
                        $scope.$apply(function () {

                            //判断default 是否空 来给 del 还是 silde
                            if ($scope.area.input.default) {
                                $scope.inputUiIcon.changeImg('del');
                            } else {
                                $scope.inputUiIcon.changeImg('gps');
                            }

                            _this.fun.clearData();
                            _this.fun.ui.repOldMap();//恢复地图高
                            $scope.nametTelDivShow = true;//显示姓名电话输入框
                            $('textarea').blur();//关闭键盘
                            $('input').blur();//关闭键盘
                        });
                    }, 0);
                };

                /**
                 * 监听地址框点击事件
                 * 15/12/7 */
                document.getElementById('inputAdd').addEventListener('tap', function () {
                    $scope.aleryClickInput = true;
                });

                /**
                 *清除input 点击事件
                 * 15/12/18 */
                $scope.clearInput = function () {
                    thisGps = false;//给thisGpsfalse
                    setTimeout(function () {
                        $scope.$apply(function () {
                            _this.fun.clearData();
                            $scope.area.input.default = '';
                            _this.fun.ui.repOldMap();//恢复地图高
                            $scope.nametTelDivShow = true;//显示姓名电话输入框
                            $scope.inputUiIcon.changeImg('gps');//icon 变为gps
                        });
                    }, 0);
                };

                /**
                 *input右侧图标点击时间,判断三种状态
                 * 15/12/18 */
                $scope.changeInputIcon = function () {
                    $scope.hideFooter();//关闭foot
                    $scope.other.noNet = '';
                    $scope.other.resMapShow = false;
                    switch ($scope.inputUiIcon.img) {
                        case $scope.inputUiIcon.del://删除Icon点击
                            thisGps = false;//获取到gps标示设置为false
                            $scope.clearInput();
                            $('#inputAdd').focus();//给inputAdd 焦点
                            $scope.aleryClickInput = true;//hack alerty
                            break;
                        case $scope.inputUiIcon.silde://收起下拉icon点击
                            $scope.mapClick();
                            break;
                        case $scope.inputUiIcon.gps://重新获取gpsIcon 点击
                            $scope.mapClick();
                            thisGps = false;//获取到gps标示设置为false
                            plus.nativeUI.toast('重新定位中');
                            start(true);
                            break;
                    }
                };

                /**
                 * 精确定位 按钮 点击事件
                 * 15/12/9 */
                $scope.gpsCenterChange = function () {

                    var point = map.getCenter();
                    baiduapi.wapApi.delMark(map);//删除标记
                    baiduapi.wapApi.setMark(map, point);//设置标记
                    $scope.hideFooter();//关闭footer

                    /**
                     * 此功能取消
                     * 16/1/27 */

                    baiduapi.sosoApi.gpsToAdd(point, function (re) {
                        console.log('re', re);
                        try {
                            var city = re.result.ad_info.city;
                            var format = re.result.formatted_addresses.recommend;
                            setTimeout(function () {
                                $scope.$apply(function () {
                                    $scope.area.input.default = city + format;
                                });
                            }, 0);
                        } catch (e) {
                            console.log(e);
                        }
                    });


                    //                    thisGps = point;//给全局gps坐标对象
                };

                /**
                 *关闭footBar
                 * 15/12/18 */
                $scope.hideFooter = function () {
                    $scope.footBarShow = false;
                    $scope.mapCenterIconShow = false;
                };

                /**
                 * 提交点击事件
                 * 15/12/10 */
                $scope.sub = function () {
                    $scope.from.verFun.init(function () {

                        /**
                         * 最后确定得到地址，都去soso拿gps
                         * 16/1/27 */
//
//                     if (!thisGps) {//判断如果gps地址为空,就去把地址查sosoApi 返回的坐标 转成 百度 坐标,再在 地图上标记
//                        baiduapi.sosoApi.addToGps($scope.area.input.default, function (re) {
//                                if (re && (re.status === 0) && re.result.location && re.result.location.lat) {
//                                    baiduapi.sosoApi.changeBaiDu(re.result.location.lat, re.result.location.lng, function (reTwo) {//转换坐标
//                                        $scope.area.input.city = re.result.address_components.city;
//                                        $scope.area.input.district = re.result.address_components.district;
//
//                                        //直接给转换后的百度坐标
//                                        thisGps = reTwo;
//
//                                        if (map) {
//                                            baiduapi.wapApi.moveMap(map, reTwo);//移动地图
//                                            baiduapi.wapApi.delMark(map);//删除标记
//                                            baiduapi.wapApi.setMark(map, reTwo);//设置标记
//                                        }
//                                    });
//                                } else {//坐标未转换成功
//                                    thisGps = false;//给全局gps false
//                                    plus.nativeUI.actionSheet({title: "!未获取到位置信息,会影响精确车源推送,您确定提交吗？", cancel: "取消", buttons: [
//                                        {title: "确定"}
//                                    ]}, function (e) {
//                                        if (e.index == 1) {//确定提交，无gps信息的货源 todo
//                                            plus.nativeUI.toast('确定提交');
//                                        } else if (e.index === 0) {//取消对话框
//                                            console.log('eInedex===0');
//                                        }
//                                    });
//                                }
//                            }
//                        );
//                    } else {
//
//                        console.log('else');
//
//                    }
//


                        /**
                         * 去搜搜拿gps 转换 百度坐标
                         * 16/1/27 */
                        baiduapi.sosoApi.addToGps($scope.area.input.default, function (re) {
                            if (re && (re.status === 0) && re.result.location && re.result.location.lat) {
                                baiduapi.sosoApi.changeBaiDu(re.result.location.lat, re.result.location.lng, function (reTwo) {//转换坐标

                                    //直接给转换后的百度坐标
                                    thisGps = reTwo;
                                    if (map) {
                                        baiduapi.wapApi.moveMap(map, reTwo);//移动地图
                                        baiduapi.wapApi.delMark(map);//删除标记
                                        baiduapi.wapApi.setMark(map, reTwo);//设置标记
                                    }

                                    _this.fun.subData();

                                });
                            } else {//坐标未转换成功
                                plus.nativeUI.toast("!未获取到位置信息,请检测地址和网络状态");
                            }
                        });

                    });
                    //验证表单输入框

                };

                /**
                 * back 返回上一页点击
                 * 15/12/17 */
                $scope.back = function () {
                    $('textarea').blur();//关闭键盘
                    $('input').blur();//关闭键盘
//                    plus.nativeUI.actionSheet({title: "返回将清空目前输入数据,您确定返回吗？", cancel: "取消", buttons: [
//                        {title: "确定"}
//                    ]}, function (e) {
//                        if (e.index == 1) {//确定提交，无gps信息的货源 todo
//                            setTimeout(function () {
//                                $scope.$apply(function () {
//                                    $scope.area.input.default = '';//地址框 null
//
////                                    if (map) {
////                                        map = {};//map null
////                                        $('#newMap').html('').attr('style', '');
////                                        $scope.other.noNet = '位置被清空，可重新定位';
////                                        $scope.other.resMapShow = true;
////                                        //变换addArea图标
////                                        $scope.inputUiIcon.changeImg('gps');
////                                        return;
////                                    } else {
////                                        $scope.other.noNet = '位置被清空，可重新定位';
////                                        $scope.other.resMapShow = true;
////                                    }
//                                    $scope.from.name = '';//name null
//                                    $scope.from.tel = '';//tell null
//                                });
//
//                                /**
//                                 * 销毁临时数据
//                                 * 16/1/28 */
//                                g.save2DB('tempPreVal', '');
//
//                                mui.back();
//                            }, 0);
//                        } else if (e.index === 0) {//取消对话框
//                            return false;
//                        }
//                    });


                    setTimeout(function () {
                        $scope.$apply(function () {
                            $scope.area.input.default = '';//地址框 null
                            $scope.from.name = '';//name null
                            $scope.from.tel = '';//tell null
                        });

                        /**
                         * 销毁临时数据
                         * 16/1/28 */
                        g.save2DB('tempPreVal', '');
                        mui.back();
                    }, 0);
                };

                /**
                 * 当前contro 的 方法相关
                 * 15/12/7 */
                this.fun = {
                    /**
                     * 清空下拉数据以及临时下拉数组
                     * 15/12/7 */
                    clearData: function () {
                        $scope.tempXiaLa = '';
                        $scope.area.slide = '';
                        $scope.trueSilde = false;//给下拉收起状态
                    },

                    /**
                     * 获取设备gps信息位置信息将通过手机GPS设备或其它信息如IP地址、移动网络信号获取，由于获取位置信息可能需要较长的时间，当成功获取位置信息后将通过successCB回调函数返回。
                     * 15/12/4 */
                    getGps: function (func, errFun, first) {
                        var timeOut = g.overTime;//默认给长超时
                        if (first) {
                            timeOut = g.sortOverTime;//如果 第一次请求 ，给短超时
                        }
                        plus.geolocation.getCurrentPosition(function (p) {
                            func(p);
                        }, function (e) {
                            if (e.code == 2) {
                                /**
                                 * hack android 2.2+ 老版本无法获取到gps 而使用 百度地图定位模块获取
                                 * 15/12/15 */
                                plus.geolocation.getCurrentPosition(function (e) {
                                    e.from = 'baidu';
                                    var lat = e.coords.latitude;
                                    var lng = e.coords.longitude;
                                    e.coords.latitude = lng;
                                    e.coords.longitude = lat;
                                    func(e);
                                }, function (ee) {
                                    errFun(ee);
                                }, {provider: 'baidu'});
                            } else {
                                errFun(e);
                            }

                        }, {timeout: timeOut});
                    },

                    /**
                     * obj 转 字符串
                     * 15/12/7 */
                    objtoStr: function (obj) {
                        var re = '';
                        for (var i in obj) {
                            if (obj[i]) {
                                re += obj[i];
                            }
                        }
                        return re;
                    },

                    /**
                     * 获取百度下拉
                     * 15/12/7 */
                    getLiangxiang: function (data, func, area) {
                        baiduapi.getXiaLa(data, function (re) {
                            func(re);
                        }, area);
                    },

                    /**
                     * 获取历史地址
                     * 16/1/21 */
                    getHistory: function (func) {
                        historyLine.getGoodsLine({}, function (re) {
                            func(re);
                        });
                    },

                    /**
                     * changeTwoLine
                     * 判断输入框超过2行之后 修改 行高
                     * 16/1/11 */
                    changeTwoLine: {

                        /**
                         * inputAdd 对象
                         * 16/1/11 */
                        inputAddObj: function () {
                            var obj = document.getElementById('inputAdd');
                            obj = angular.element(obj);
                            return obj;
                        },

                        /**
                         * inputAdd 对象
                         * 16/1/11 */
                        inputAddObjClone: function () {
                            var obj = document.getElementById('trueInputLine');
                            obj = angular.element(obj);
                            return obj;
                        },

                        /**
                         * 变1行
                         * 16/1/11 */
                        toOne: function () {
                            this.inputAddObj()[0].style.lineHeight = '45px';
                        },

                        /**
                         * 变2行
                         * 16/1/11 */
                        toTwo: function () {
                            this.inputAddObj()[0].style.lineHeight = '22px';
                        },

                        /**
                         * 给clone width
                         * 16/1/11 */
                        giveCloneWidth: function () {
                            var oldWidth = this.inputAddObj()[0].offsetWidth;
                            this.inputAddObjClone().width(oldWidth + 'px');
                        },

                        /**
                         * 判断几行 变换 1行 还是 2行
                         * 16/1/11 */
                        changeTrue: function () {
                            var height = this.inputAddObjClone().height();
                            if (height > 22) {//就是2行显示
                                this.toTwo();
                            } else if ((height == 22) || (height === 0)) {
                                this.toOne();
                            }

                        },


                        init: function () {
                            this.giveCloneWidth();
                        }



                    },

                    /**
                     * ui 操作相关
                     * 15/12/8 */
                    ui: {
                        oldMapHeight: '',//原始map最宽高
                        oldMapOffset: {},//原始map定位,宽高offset对象
                        oldInputHeight: '',//原始Input高
                        nameTelDivHeight: '',//原始姓名电话Div高
                        setOldMapOffset: function () {//原始map定位,宽高offset对象
                            this.oldMapOffset.x = $('.mapDiv').offset().left;
                            this.oldMapOffset.y = $('.mapDiv').offset().top;
                            this.oldMapOffset.height = $('.mapDiv').height();
                            this.oldMapOffset.width = $('.mapDiv').width();
                        },
                        setOldMapHeight: function () {//获取原始最宽高,最先执行
                            this.oldMapHeight = $('.mapDiv').height();

                        },
                        setOldInputHeight: function () {//获取原始addInput高,最先执行
                            this.oldInputHeight = $('.addInputDiv').height();
                        },
                        setOldNameTelDivHeight: function () {//获取原始 nameTel高
                            this.nameTelDivHeight = $('.nameTelDiv').height();
                        },

                        getSlideHeight: function () {//get 下拉的整个div height
                            var slideHeight = $('.reqItemDiv').height();
                            return slideHeight;
                        },
                        getAddInputHeight: function () {//获取addInput 的高
                            var slideHeight = $('.addInputDiv').height();
                            return slideHeight;
                        },
                        getMapDivHeight: function () {//获取地图Div高
                            var slideHeight = $('.mapDiv').height();
                            return slideHeight;
                        },
                        getNameTelDivHeight: function () {//获取原始nameTeldiv高
                            var slideHeight = $('.nameTelDiv').height();
                            return slideHeight;
                        },
                        setAddInputHeight: function () {//set AddInput 高
                            var slideHeight = this.getSlideHeight();//获取下拉Div的高
                            var addInputHeight = this.oldInputHeight - this.nameTelDivHeight; //获取地址输入的高 减去隐藏name的高
                            var addHeight = slideHeight + addInputHeight;
                            addHeight = 160;

                            $('.addInputDiv').height(addHeight);
                            this.setMapDivHeight(slideHeight); //设置地图的高,传入下拉的高
                        },
                        setMapDivHeight: function (slideHeight) {//set 地图Div高
                            var addHeight = this.oldMapHeight + this.nameTelDivHeight - slideHeight;
                            $('.mapDiv').height(addHeight);//设置地图的高 为 old 高 减去 下拉高
                        },
                        repOldMap: function () {//恢复地图高度
                            $('.addInputDiv').height(this.oldInputHeight);
                            $('.mapDiv').height(this.oldMapHeight);//设置地图的高 为 old 高 减去 下拉高
                        },
                        changeSlide: function () {//获取下拉高，隐藏nameTel，给addInputDiv高（包含reqItemDiv下拉）,变地图高
                            setTimeout(function () {
                                $scope.$apply(function () {
                                    $scope.nametTelDivShow = false;
                                    _this.fun.ui.setAddInputHeight();
                                });
                            }, 200);
                        },
                        setMapIcon: function () {
                            $('#mapCenterIcon').css({
                                top: this.oldMapOffset.y,
                                left: this.oldMapOffset.x
                            }).css({
                                marginLeft: (this.oldMapOffset.width / 2) - 20 + 'px',
                                marginTop: (this.oldMapOffset.height / 2) - 20 + 'px'
                            });

                            $scope.mapCenterIconShow = true;
                        },

                        start: function () {
                            this.setOldInputHeight();
                            this.setOldMapHeight();
                            this.setOldNameTelDivHeight();
                            this.setOldMapOffset();
                        }

                    },

                    /**
                     * 接收父页面传参
                     * 15/12/17 */
                    getPreVal: {

                        /**
                         * 接收val，给全局preVal 对象值
                         * 15/12/17 */
                        getVal: function () {
//                            var self = plus.webview.currentWebview();
//                            preVal.val = self.val;
                        },

                        /**
                         * 自定义监听事件,来接收父页面的传值
                         * 15/12/17 */
                        addValLister: function () {
                            window.addEventListener('goAddArea', function (val) {
                                try {

                                    /**
                                     * 清空下拉 恢复 姓名输入框
                                     * 16/1/27 */
                                    $scope.mapClick();

                                    var data = val.detail.val;

                                    /**
                                     * 记录到历史数据库，提交完成的时候销毁
                                     * 16/1/27 */
                                    g.save2DB('tempPreVal', JSON.stringify(val.detail));

                                    /**
                                     * hack 是否显示事件控件 LineBidding
                                     * LineBidding
                                     * 16/2/16 */
                                    if (val.detail.val.LineBidding) {
                                        setTimeout(function(){
                                            $scope.$apply(function(){
                                                $scope.subDataShow = false;
                                            })
                                        },0);
                                    }

                                    /**
                                     * 给时间默认数据，和 显示的 数据
                                     * 16/1/26 */
                                    _this.fun.getPreVal.setTime(data);

                                    /**
                                     * 给类型 出发还是 目的
                                     * 16/1/26 */
                                    _this.fun.getPreVal.setInType(data);


                                    /**
                                     * 如果是编辑
                                     * 16/1/26 */
                                    if (data.type == 'edit') {//如果是编辑


                                        /**
                                         * 给姓名电话
                                         * 16/1/25 */
                                        try {
                                            _this.smFun.giveNameTelFromHistory(data.content.psn_name, data.content.psn_tel);
                                        } catch (e) {
                                            console.error(e);
                                        }


                                        /**
                                         * 给地址
                                         * 16/1/26 */
                                        setTimeout(function () {
                                            $scope.$apply(function () {
                                                $scope.area.input.default = data.content.addr;
                                            });
                                        }, 0);

                                        /**
                                         * 变地图
                                         * 16/1/26 */
                                        $timeout(function () {
                                            if(map){
                                                console.log('map', map);
                                                baiduapi.wapApi.delMark(map);
                                                baiduapi.wapApi.moveMap(map, {lng: data.content.lng, lat: data.content.lat});
                                                baiduapi.wapApi.setMark(map, {lng: data.content.lng, lat: data.content.lat});
                                            }else{
                                               console.log('noMap');
                                            }
                                        }, 0, false);
                                    }

                                    /**
                                     * 如果是新加
                                     * 16/1/27 */
                                    if (data.type == 'add') {
                                        console.log('add');
                                    }
                                } catch (e) {
                                    console.error(e);
                                }
                                var meView = plus.webview.currentWebview();
                                meView.show('slide-in-right');
                            });
                        },

                        /**
                         * 给时间默认数据，和 显示的 数据
                         * 16/1/26 */
                        setTime: function (data) {
                            setTimeout(function () {
                                $scope.$apply(function () {
                                    console.log('contentTime', data.content.time);
                                    $scope.from.timeObj.date = data.content.time;
                                    $scope.from.timeObj.time = '';
                                    $scope.icon.timeDescriberIcon.worry = _this.fun.getPreVal.getTimeIcon(data.content.state);

                                    /**
                                     * 修改时间字符串
                                     * 16/1/27 */
                                    var obj = _this.fun.getPreVal.editDate(data.content.time);
                                    mui.fire(plus.webview.currentWebview(), 'changeDate', obj.data, obj.time, data.content.state);

                                    /**
                                     * 记录到数据库，one.date,one.time,one.quick(去 getTime)
                                     * 16/1/27 */
                                    var writeObj = {
                                        one: {
                                            date: obj.data,
                                            time: obj.time,
                                            quick: $scope.icon.timeDescriberIcon.worry
                                        }
                                    };

                                    writeObj = JSON.stringify(writeObj);
                                    g.save2DB(g.storage_key.goods_time_touch, writeObj);
                                });
                            }, 0);
                        },

                        /**
                         * 修改时间字符串 2016-01-27 12:00
                         * 返回{data:'01月27日',time:'12:00'}
                         * 16/1/26 */
                        editDate: function (str) {

                            var endStr = {};
                            if(str){
                            	endStr.arr = str.split(' ');
                            	endStr.data = endStr.arr[0].split('-');
                            	returnYear = endStr.data[0];//记录edit来的年份
                            	endStr.data = endStr.data[1] + '月' + endStr.data[2] + '日';
                            	endStr.time = endStr.arr[1];
                            }
                            return endStr;
                        },

                        /**
                         * 遍历 timeDescriberIcon 01 02 03
                         * 16/1/26 */
                        getTimeIcon: function (num) {
                            switch (num) {
                                case '01':
                                    return plus.io.convertLocalFileSystemURL("_www/Public/images/icon/icon_cn_ruyue_green.png");
                                case '02':
                                    return  plus.io.convertLocalFileSystemURL("_www/Public/images/icon/icon_cn_jingkuai.png");
                                case '03':
                                    return plus.io.convertLocalFileSystemURL("_www/Public/images/icon/icon_urgency.png");
                                default :
                                    return plus.io.convertLocalFileSystemURL("_www/Public/images/icon/icon_cn_ruyue_green.png");
                            }
                        },


                        /**
                         *设置传入类型
                         * 16/1/26 */
                        setInType: function (str) {
                            if (str.startEnd == 'start') {
                                inType = 1;
                                setTimeout(function () {
                                    $scope.$apply(function () {
                                        $scope.inputUiIcon.startEnd = plus.io.convertLocalFileSystemURL("_www/Public/images/addArea/icon_star.png");//起终 默认 起
                                    });
                                }, 0);
                            }

                            if ((str.startEnd == 'end') || (str.type == 'add')) {
                                inType = 2;
                                setTimeout(function () {
                                    $scope.$apply(function () {
                                        $scope.inputUiIcon.startEnd = plus.io.convertLocalFileSystemURL("_www/Public/images/icon/icon_cn_zhong_red.png");//起终
                                    });
                                }, 0);
                            }
                        },


                        /**
                         * 声明加载完成动作，给父页面发送加载完成状态 来判断是否 等待，还是跳转
                         * 15/12/17 */
                        sendToPreOver: function () {
                            var preWebView = plus.webview.currentWebview().opener();
                            mui.fire(preWebView, 'addAreaIsOver'); // 给父页面，传初始地址。,此时已经把位置信息存入db，发货页面去取
                        },

                        /**
                         * 加载完成事件 fire事件，执行此事件时候，父页面的 preWaitAddAreaIsOver 监听已经打开 ,所以可以激活跳转
                         * 15/12/18 */
                        preWaitAddAreaIsOver: function () {
                            var preWebView = plus.webview.currentWebview().opener();
                            mui.fire(preWebView, 'preWaitAddAreaIsOver');
                            mui.fire(preWebView, 'isHaveGps');
                        },

                        init: function () {
                            this.addValLister();//设置监听 父页面 事件 goAddArea

                            var _this = this;
                            /**
                             * fire 父页面 的 preWaitAddAreaIsOver 事件，
                             * 父页面的preWaitAddAreaIsOver事件，是当子页面还没加载完成的时候 就需要跳转才被激活
                             * 15/12/18 */
                            var time = 0;//hack eidt 进来的 如果 地图对象还没赋值成功的时间
                            if (!map) {
                                time = 1000;
                            }
                            setTimeout(function () {
                                _this.sendToPreOver();//fire 到父页面
                                _this.preWaitAddAreaIsOver();
                            }, time);
                        }
                    },

                    /**
                     * hack 时间控件 与地图map 冲突，监听点击调用time控件 隐藏mapDiv
                     * 16/1/13 */
                    hackTimeDirecitve: {
                        firstDate: false,//判断是否第一次给的默认， 第2次的话，就直接读 数据库
                        eventTime: function () {
                            document.getElementById('subDate').addEventListener('tap', function () {
                                $('.mapDiv').hide();
                                $scope.timePlaneState = true;
                            });
                            setTimeout(function () {
                                document.getElementById('touchCancel').addEventListener('tap', function () {
                                    $('.mapDiv').show();
                                    $scope.timePlaneState = false;
                                });
                                document.getElementById('touchOk').addEventListener('tap', function () {
                                    _this.fun.hackTimeDirecitve.giveData();
                                    $('.mapDiv').show();
                                    $scope.timePlaneState = false;
                                });
                            }, 200);
                        },

                        /**
                         * give Data 给时间模型 //todo worry 图片 以后有可能需要hack
                         * 16/1/13 */
                        giveData: function () {
                            if (!this.firstDate) {
                                var touchData = {};
                                touchData.date = touchThreeGhData.date[1];
                                touchData.time = touchThreeGhData.time[1];
                                touchData.quick = touchThreeGhData.quick[1];
                                setTimeout(function () {
                                    $scope.$apply(function () {
                                        $scope.from.timeObj.date = touchData.date;
                                        $scope.from.timeObj.time = touchData.time;
                                        $scope.icon.timeDescriberIcon.worry = touchData.quick;
                                    });
                                }, 0);
                                this.firstDate = true;
                            } else {
                                var touchData2 = g.read2DB(g.storage_key.goods_time_touch);
                                touchData2 = JSON.parse(touchData2);
                                setTimeout(function () {
                                    $scope.$apply(function () {
                                        $scope.from.timeObj.date = touchData2.one.date;
                                        $scope.from.timeObj.time = touchData2.one.time;
                                        $scope.icon.timeDescriberIcon.worry = touchData2.one.quick;
                                    });
                                }, 0);
                            }

                        },

                        init: function () {
                            this.eventTime();
                            this.giveData();
                        }
                    },


                    /**
                     * 提交总数据,fire 到 父页面 mapFirePre 事件
                     * 16/1/27 */
                    subData: function () {
                        var obj = {};
                        obj.addr = $scope.area.input.default;//详细地址串
                        obj.gps = thisGps;//gps 对象
                        obj.timeObj = this.getEndTime();//时间对象
                        obj.preVal = this.getPreValEnd();//提取 传来的 其他值
                        obj.tel = this.getTel();//提取姓名电话

                        var preWebView = plus.webview.currentWebview().opener();

                        mui.fire(preWebView, 'mapFirePre', obj);
                        console.log('endObj', obj);

                        /**
                         * 销毁临时数据
                         * 16/1/28 */
                        g.save2DB('tempPreVal', '');

                        setTimeout(function () {
                            mui.back();
                        }, 0);
                    },

                    /**
                     * 提取 最终的 事件对象
                     * 16/1/27 */
                    getEndTime: function () {
                        var touchData2 = g.read2DB(g.storage_key.goods_time_touch);
                        touchData2 = JSON.parse(touchData2);
                        return {
                            date: touchData2.one.date,
                            time: touchData2.one.time,
                            year: returnYear
//                        todo 返回图标状态
                        };
                    },

                    /**
                     * 提取 传来的 值 no startEnd('start','end')  addClickValType('add','edit')
                     * 16/1/27 */
                    getPreValEnd: function () {
                        var preVal = JSON.parse(g.read2DB('tempPreVal'));
                        try {
                            return {
                                no: preVal.val.content.no,
                                startEnd: preVal.val.startEnd,
                                addClickValType: preVal.val.type
                            };
                        } catch (e) {
                            return false;
                        }
                    },

                    /**
                     * 提取姓名电话
                     * 16/2/14 */
                    getTel: function () {
                        var endRe = {
                            psn_name: $scope.from.name,
                            psn_tel: $scope.from.tel
                        };
                        return endRe;
                    }




                };

                /**
                 * 地图Fun相关
                 * 15/12/7 */
                this.mapFun = {
                    //初始化地图
                    setNewMap: function (gps, baidu, fun) {
                        var trueMt = true;//判断是否 手机坐标，
                        if (baidu) {//hack 手机坐标，还是 百度坐标
                            trueMt = false;
                        }
                        if (gps) {
                            //判断联网给 scope.trueNet 变量
                            if (tools.driver.noNet()) {
                                $scope.trueNet = false;
                                $scope.other.noNet = '网络无法访问';
                            } else {
                                $scope.trueNet = true;
                                $scope.other.noNet = '网络正常';
                                baiduapi.wapApi.newMap('newMap', gps, function (re) {
                                    if (map) {
                                        map = {};
                                    }
                                    setTimeout(function () {
                                        map = re;
                                    }, 0);
//                                    tools.tools.hackGoUrl();
                                }, trueMt, fun);


                                /**
                                 * map 单击事件 判断ios android
                                 * 15/12/8 */
                                document.getElementById('newMap').addEventListener('tap', function (ev) {
                                    $scope.mapClick();
                                    return false;
                                });

                                /**
                                 * 地图移动事件
                                 * 15/12/8 */
                                document.getElementById('newMap').addEventListener('touchmove', function () {
                                    $scope.mapClick();
                                    $scope.footBarShow = false;//隐藏footBar
                                    _this.mapFun.showIcon();//显示mapCenterIcon
                                    return false;
                                });

                                /**
                                 * 地图移动end事件
                                 * 15/12/8 */
                                document.getElementById('newMap').addEventListener('touchend', function () {
                                    $scope.mapClick();
                                    $scope.footBarShow = true;//显示footBar
//                                    alert("当前地图中心点：" + map.getCenter().lng + "," + map.getCenter().lat);
                                    return false;
                                });

                            }
                        }
                    },

                    /**
                     * 显示mapCenterIcon，给位置
                     * 15/12/9 */
                    showIcon: function () {
                        _this.fun.ui.setMapIcon();
                    },

                    /**
                     * map 相关Ui操作 变换 输入图标Ui
                     * 15/12/10 */
                    UI: {
                        showDel: function () {//显示删除图标

                        },
                        hideDel: function () {//隐藏删除图标

                        },
                        showGps: function () {//显示gps图标

                        },
                        hideGps: function () {//隐藏gps图标

                        },
                        showUp: function () {//显示关闭下拉图标

                        },
                        hideUp: function () {//隐藏关闭下拉图标

                        }


                    }

                };

                /**
                 * 通讯录Icon点击事件
                 * 15/12/18 */
                $scope.smClick = function () {
                    _this.smFun.getSm();
                };

                /**
                 *通讯录Item点击事件
                 * 15/12/18 */
                $scope.smItemClick = function (index) {
                    setTimeout(function () {
                        $scope.$apply(function () {
                            try {
                                $scope.from.name = $scope.smObj.list[index].displayName;

                                var tel = $scope.smObj.list[index].phoneNumbers[0].value;
                                tel = tel.replace(/-/g, '');
                                tel = tel.replace(/\ +/g, "");
                                tel = tel.replace(/[ ]/g, "");
                                $scope.from.tel = parseInt(tel);
                                $scope.smObj.show = false;//关闭通讯录
                            }
                            catch (e) {
                                plus.nativeUI.toast('获取电话号码失败');
                                $scope.smObj.show = false;//关闭通讯录
                            }
                        });
                    }, 0);
                };

                /**
                 * 获取通讯录方法相关
                 * 15/12/11 */
                this.smFun = {

                    /**
                     * 获取通讯录对象,传入 手机通讯录 或 sm卡
                     * 15/12/11 */
                    getSm: function (type) {
                        var typeStr = plus.contacts.ADDRESSBOOK_PHONE;//默认手机
                        if (type) {
                            typeStr = plus.contacts.ADDRESSBOOK_SIM;//sm卡
                        }
                        plus.contacts.getAddressBook(typeStr, function (addressbook) {
                            addressbook.find(["displayName", "phoneNumbers"], function (contacts) {
                                if (contacts[0]) {
                                    setTimeout(function () {
                                        $scope.$apply(function () {
                                            $scope.smObj.show = true;
                                            $scope.smObj.list = contacts;
                                        });
                                    }, 0);
                                } else {
                                    plus.nativeUI.toast('获取联系人失败');
                                    setTimeout(function () {
                                        $scope.$apply(function () {
                                            $scope.smObj.show = false;
                                            $scope.smObj.list = '';
                                        });
                                    }, 0);
                                }
                            }, function () {
                                console.log('error');
                            }, {multiple: true});
                        }, function (e) {
                            console.log('e', e);
                        }, false);
                    },

                    /**
                     * 如果是历史线路点击，给姓名电话
                     * 16/1/25 */
                    giveNameTelFromHistory: function (name, tel) {
                        console.log('nameTel', name, tel);
                        if (name && tel) {
                            setTimeout(function () {
                                $scope.$apply(function () {
                                    $scope.from.name = name;
                                    $scope.from.tel = parseInt(tel);
                                });
                            }, 0);
                        }
                    }
                };

                /**
                 * 起始动作
                 * 15/12/18 */
                var start = function (gpsClick) {//gpsClick 是有map对象情况，frist是没有map的情况
                    var first = true;//hack 是否第一次载入
                    var baidu = false;//hack 老版安卓无法网络定位，调用百度模块定位,默认false
                    if (gpsClick) {
                        first = undefined;
                    }

                    if (gpsClick) {
                        plus.nativeUI.showWaiting();
                    }
                    //给默认地理位置信息 ,起始动作
                    _this.fun.getGps(function (p) {
                        if (p.from == 'baidu') {
                            baidu = true;
                        }
                        if (p && p.coords && p.coords.latitude) {
                            baiduapi.getAdd(p.coords.latitude, p.coords.longitude, function (re) {
                                setTimeout(function () {
                                    $scope.$apply(function () {
                                        if (re.status === 0) {
                                            $scope.area.input.default = '';
                                            $scope.area.input.city = re.result.addressComponent.city;
                                            $scope.area.input.district = re.result.addressComponent.district;
                                            $scope.area.input.street = re.result.addressComponent.street;
                                            $scope.area.input.street_number = re.result.addressComponent.street_number;
                                            if (re.result.poiRegions && re.result.poiRegions[0] && re.result.poiRegions[0].name) {
                                                $scope.area.input.poiRegions = re.result.poiRegions[0].name;
                                            }

                                            //拼接字符串
//                                            hackBug by rockblus
                                            var arr = $scope.area.input;
                                            delete (arr.defaultPlace);
                                            $scope.area.input.default = _this.fun.objtoStr($scope.area.input);


                                            //变换addArea图标
                                            $scope.inputUiIcon.changeImg('del');

                                            plus.nativeUI.closeWaiting();

                                            if (!gpsClick) {
                                                _this.fun.getPreVal.init();//fire 父页面 此页面加载完成,监听父页面传值
                                            }

                                            _this.mapFun.setNewMap(//建立newMap
                                                {
                                                    lng: p.coords.latitude,
                                                    lat: p.coords.longitude
                                                },
                                                baidu, function (reGps) {
                                                    g.save2DB(g.storage_key.cur_address, $scope.area.input.default);
                                                    g.save2DB(g.storage_key.cur_lat, reGps.lat);
                                                    g.save2DB(g.storage_key.cur_lng, reGps.lng);
                                                    var obj = {
                                                        address: $scope.area.input.default,
                                                        lat: reGps.lat,
                                                        lng: reGps.lng
                                                    };

                                                    mui.fire(plus.webview.currentWebview().opener(), 'isHaveGps', obj);

                                                });

                                        } else {
                                            setTimeout(function () {
                                                plus.nativeUI.closeWaiting();
                                                $scope.$apply(function () {
                                                    $scope.other.noNet = '获取位置失败,原生接口错误返回第一次';
                                                    $scope.other.resMapShow = true;
                                                    $scope.inputUiIcon.changeImg();
                                                    _this.fun.getPreVal.init();//fire 父页面 此页面加载完成,监听父页面传值
                                                });
                                                mui.fire(plus.webview.currentWebview().opener(), 'isHaveGps');
                                            }, g.srotOverTime + 100);
                                        }
                                    });
                                }, 0);
                            }, function () {
                                $scope.other.noNet = '获取地图失败';
                                $scope.other.resMapShow = true;
                                $scope.inputUiIcon.changeImg('del');
                                plus.nativeUI.closeWaiting();

                                _this.fun.getPreVal.init();//fire 父页面 此页面加载完成,监听父页面传值

                            }, first, baidu);

                        } else {//获取设备 gps 失败 初始默认地图
                            if (tools.driver.noNet) {
                                $scope.other.noNet = '网络无连接,';
                                $scope.other.resMapShow = true;
                            } else {
                                $scope.other.noNet = '获取位置失败';
                                $scope.other.resMapShow = true;
                            }

                            _this.fun.getPreVal.init();//fire 父页面 此页面加载完成,监听父页面传值
                        }
                    }, function (error) {
                        console.error('error', error);
                        if (gpsClick) {
                            plus.nativeUI.closeWaiting();
                            setTimeout(function () {
                                $scope.$apply(function () {
                                    $scope.other.noNet = '获取位置失败,原生接口错误返回gpsClick';
                                    $scope.other.resMapShow = true;
                                });
                            }, 0);
                            return;
                        }
                        setTimeout(function () {
                            $scope.$apply(function () {
                                $scope.other.noNet = '获取位置失败,原生接口错误返回';
                                $scope.other.resMapShow = true;
                                $scope.inputUiIcon.changeImg();

                                _this.fun.getPreVal.init();//fire 父页面 此页面加载完成,监听父页面传值
                            });
                        }, 0);
                    }, first, baidu);

                    //hack 地址输入右侧图标
                    if (!gpsClick) {
                        $scope.inputUiIcon.hackImg.init();
                        setTimeout(function () {
                            _this.fun.ui.start();//初始uiDiv 属性
                        }, 0);
                    }

                    /**
                     * 给判断inputAdd克隆div 行宽
                     * 16/1/11 */
                    _this.fun.changeTwoLine.init();

                    /**
                     * hack 时间控件 与地图map 冲突，监听点击调用time控件 隐藏mapDiv
                     * 16/1/13 */
                    _this.fun.hackTimeDirecitve.init();


                };

                start();


            },
            link: function (scope, element, attrs, rCtrl) {

                /**
                 * 禁用回退按钮
                 * 16/1/21 */
                mui.init({
                    keyEventBind: {
                        backbutton: false,
                        menubutton: false
                    }
                });

                setTimeout(function () {


                    plus.key.addEventListener("backbutton", function () {
                        if (scope.smObj.show) {
                            setTimeout(function () {
                                scope.$apply(function () {
                                    scope.smObj.show = false;
                                });
                            }, 0);
                        }
                        else if (scope.timePlaneState) {
                            $('.mapDiv').show();
                            mui.fire(plus.webview.currentWebview(), 'hidePlane');
                            scope.timePlaneState = false;
                        }
                        else {
                            scope.back();
                        }
                    });
                }, 400);


            }
        };
    });
});
