define(function (require) {
    var g = require('./g.js');
//    var md5Tools = require('../../../Public/js/md5.js');
    var md5Tools = require('./md5.js');

    /**
     * 记录loginIn storage
     * 15-7-29 */
    var db = {
        setCarLogin: function () {
            //车主
            plus.storage.setItem('isLogin', '1');
        },
        setHuoLogin: function () {
            //货主
            plus.storage.setItem('isLogin', '2');
        },
        setLogOut: function () {
            //销毁登录
            plus.storage.removeItem('isLogin');
        },
        clear: function () {
            //清空数据库
            plus.storage.clear();
        }

    };

    /**
     * 验证相关
     * 15-7-31 */
    var verify = {

        /** 验证空 15-3-22 */
        isEmpty: function (t) {
            return $.trim(t) ? true : false;
        },

        /** 验证手机号 15-3-22 */
        checkMobile: function (sMobile) {
            if (!(/^1[3|4|5|7|8][0-9]\d{4,8}$/.test(sMobile))) {
                return false;
            } else {
                if (sMobile.length == 11)
                    return true;
                else
                    return false;
            }
        },

        //如果详细地址已经含有1，2，3级地址，则直接返回详细地址
        getAddr: function (level1, level2, level3, detail) {
            if (detail.length <= 3) return detail;
            var oldDetail = detail;
            detail = detail.substring(0, 3);

            if (detail.indexOf("北京") < 0 && detail.indexOf("天津") < 0 && detail.indexOf("石家庄") < 0 && detail.indexOf("唐山") < 0 && detail.indexOf("秦皇岛") < 0 && detail.indexOf("邯郸") < 0 && detail.indexOf("邢台") < 0 && detail.indexOf("保定") < 0 && detail.indexOf("张家口") < 0 && detail.indexOf("承德") < 0 && detail.indexOf("沧州") < 0 && detail.indexOf("廊坊") < 0 && detail.indexOf("衡水") < 0) {
                return  level1 + level2 + level3 + oldDetail
            } else {
                return oldDetail;
            }
        },


        /** getError 遍历错误代码返回错误提示信息 15-3-24
         * */

        getError: function (codeNum) {
            switch (codeNum) {
            /**
             * 修改密码错误代码
             * 15-8-27 */
                //* 10005 修改成功之后把发送时间变为0（更改成功）
                // * 590 修改之前的密码和修改之后的密码一样，直接抛出修改成功
                case '3_110001':
                    return '短信发送成功插入数据失败';
                case '3_593':
                    return '短信发送失败';
                case '3_594':
                    return '验证码不正确 && 验证码超时';
                case '3_599':
                    return '密码修改失败';
                case '3_599':
                    return '密码修改失败';

            /**
             * 根据协议id，手机号返回对应协议gps位置
             * 15-8-7 */
                case '2_5002':
                    return '协议编号或手机号不存在';
                case '2_5009':
                    return '车辆信息不存在';
                case '2_5001':
                    return '参数为空';
            /**
             * 登录
             * 15-8-7 */
                case '1_501':
                    return '用户名不存在';
                case '1_502':
                    return '密码不正确';
                case '1_509':
                    return '更新或插入错误';
                default:
                    return '错误';
            }
        }
    };


    /**
     * angular get post
     * 15-7-31 */
    var angular = {

        /**
         * angular post
         * 15-3-27 */
        postJsp: function ($http, getMoreUrl, data, re, errRe) {
            if (driver.noNet()) {
                plus.ui.toast('无网络连接，请检查');
                return false;
            } else {
                /**
                 * 显示等待
                 * 15-8-7 */
                plus.nativeUI.showWaiting();

                //              console.log('data', data);
                var endData = {};
                for (var vo in data) {
                    //                    endData[data[vo].name] = data[vo].value;
                    endData[vo] = data[vo];
                }


                 console.log('postData'+ JSON.stringify(endData));
                //                              console.log('meorUrl==='+ getMoreUrl);
                $http({
                    url: getMoreUrl,
                    method: "POST",
                    data: endData,
                    timeout: g.overTime + 1000 //超时设置
                }).success(function (response) {

                    /**
                     * 关闭等待
                     * 15-8-7 */
                    plus.nativeUI.closeWaiting();
                    re(response);
                }).error(function (data, status, headers, config, error) {
                    console.error("error=" + error);
                    console.log('postDataErr====' + status, headers, config, error);
                    mui.toast("连接失败，请检查网络");
                    plus.nativeUI.closeWaiting();
                    if (errRe) {
                        errRe();
                    } else {
                        plus.nativeUI.alert('请求超时', '', '物流邦');
                    }
                    return false;
                });
            }
        },

        /**
         * angualr get 传 前 组合网址 ，参数json对象，
         * 15-7-31 */
        getJson: function ($http, frontUrl, jsonObj, re, errRe) {

            if (driver.noNet()) {
                plus.ui.toast('无网络连接，请检查');
                return false;
            } else {

                /**
                 * 显示等待
                 * 15-8-7 */
                plus.nativeUI.showWaiting();

                var jsonUrl = tools.parseParam(jsonObj);
                var getMoreUrl = frontUrl + jsonUrl;

                console.log('getMoreUrl', frontUrl);


                $http({
                    //                    method: 'JSONP',
                    //                    url: getMoreUrl + "?callback=JSON_CALLBACK",
                    method: 'GET',
                    url: getMoreUrl,
                    timeout: g.overTime + 1000,
                    headers: {
                        'Content-Type': 'Content-Type:application/json; charset=utf-8'
                    }
                }).success(function (data) {
                    /**
                     * 关闭等待
                     * 15-8-7 */
                    plus.nativeUI.closeWaiting();
                    re(data);
                }).error(function (data, status, headers, config) {
                    /**
                     * 关闭等待
                     * 15-8-7 */
                    plus.nativeUI.closeWaiting();
                    if (errRe) {
                        errRe();
                    } else {
                        plus.nativeUI.alert('请求超时', '', '物流邦');
                    }
                    return false;
                });
            }
        }
    };

    /**
     * 硬件相关
     * 15-7-31 */
    var driver = {

        /**
         * 判断是否联网
         * 15-7-31 */
        noNet: function () {

            //var types = {};
            //types[plus.networkinfo.CONNECTION_UNKNOW] = "未知";
            //types[plus.networkinfo.CONNECTION_NONE] = "未连接网络";
            //types[plus.networkinfo.CONNECTION_ETHERNET] = "有线网络";
            //types[plus.networkinfo.CONNECTION_WIFI] = "WiFi网络";
            //types[plus.networkinfo.CONNECTION_CELL2G] = "2G蜂窝网络";
            //types[plus.networkinfo.CONNECTION_CELL3G] = "3G蜂窝网络";
            //types[plus.networkinfo.CONNECTION_CELL4G] = "4G蜂窝网络";

            var netType = plus.networkinfo.getCurrentType();
            //如果未联网 返回 true
            if (netType == 1) {
                return true;
            }
        },

        //判断android 和 ios 平台 执行不同回调方法
        trueAI: function (android, ios) {
            switch (plus.os.name) {
                case "Android":
                    // Android平台: plus.android.*
                    android();
                    break;
                case "iOS":
                    // iOS平台: plus.ios.*
                    ios();
                    break;
                default:
                    // 其它平台
                    break;
            }
        }


    };

    //tools 相关
    var tools = { //打印console
        c: function (re) {
            for (var i in re) {
                console.log('re--' + i + ':' + re[i]);
                var type = typeof re[i];
                if (type == 'object') {
                    for (var ii in re[i]) {
                        console.log('__re---' + ii + ':' + re[i][ii]);
                    }
                }
            }
        },

        /**
         * md5
         * 15-8-1 */
        md5: function (str) {
            return md5Tools.md5(str);
        },

        /**
         * 获取www路径后面的网址 getAfterWww()
         * 15/10/30 */
        getUrl: function () {
            var thisUrl = window.location.pathname;
            if (thisUrl) {
                thisUrl = thisUrl.split('www');
                thisUrl = thisUrl[1];
                return thisUrl;
            }
        },

        /**
         * 解析 json对象 为 url {name:'tom','age':'23'}pathInfo
         * 15/10/30 */
        parseParam: function (param, key) {
            var paramStr = "";
            if (param instanceof String || param instanceof Number || param instanceof Boolean) {
                //                    修改普通模式为pathInfo模式
                //                    paramStr += "&" + key + "=" + encodeURIComponent(param);
                paramStr += "/" + key + "/" + encodeURIComponent(param);
            } else {
                $.each(param, function (i) {
                    var k = key == null ? i : key + (param instanceof Array ? "[" + i + "]" : "." + i);

                    //                    修改普通模式为pathInfo模式
                    //                        paramStr += '&' + tools.parseParam(this, k);
                    paramStr += '/' + tools.parseParam(this, k);
                });
            }
            return paramStr.substr(1);
        },

        /**
         * 解析 json对象 为 url {name:'tom','age':'23'}普通模式
         * 15/10/30 */
        parseParamOld: function (param, key) {
            var paramStr = "";
            if (param instanceof String || param instanceof Number || param instanceof Boolean) {
                paramStr += "&" + key + "=" + encodeURIComponent(param);
            } else {
                $.each(param, function (i) {
                    var k = key == null ? i : key + (param instanceof Array ? "[" + i + "]" : "." + i);
                    paramStr += '&' + tools.parseParamOld(this, k);
                });
            }
            return paramStr.substr(1);
        },

        /**
         * getFileObj 获取文件对象
         * 15/10/30 */
        getFileObj: function (url, fun) {
            console.log('thisUrl', window.location.href);
            console.log('url', url);
            var _fun = fun;
            if (url) {
                //获取成功之后的回调函数
                var succesCB = function (re) {
                    _fun(re);
                };

                //获取失败之后的回调函数
                var errorCB = function (re) {
                    _fun(re);
                };
                void plus.io.resolveLocalFileSystemURL(url, succesCB, errorCB);
            }
        },

        /**
         *关闭除了传入当前页面的 所有 窗口 ,这里 public.js 已经判断不会传入 侧栏webView
         * 15/11/12 */
        closeOtherView: function (thisss) {


            /**
             * 声明预加载页面，出错不被关闭的数组 页面id
             * 15/12/22 */
            var proLoadView = ['leftNav', '../default/addArea.html'];

            if (!thisss && !thisss.id) {
                thisss = mui.currentWebview;
            }
            var allViewArr = plus.webview.all(); //获取所有窗口对象数组
            for (var vo in allViewArr) { //关闭所有窗口
                if ((allViewArr[vo].id != thisss.id) && (proLoadView.indexOf(allViewArr[vo].id) == -1)) {
                    plus.webview.close(allViewArr[vo]);
                }
            }
        },

        /**
         * 优化页面跳转，监听angualr加载完成事件
         * 15/11/10 */
        hackGoUrl: function (re) {

            var thisView = mui.currentWebview;
            var thisV = plus.webview.currentWebview().opener(); //获取创建者

            if (thisView.id == 'HBuilder') { //判断首页
                thisV = thisView;
            }
            if (thisV.id == 'leftNav') {
                thisV = plus.webview.currentWebview().opener().opener(); //获取创建者
            }
            mui.fire(thisV, 'new'); //关闭侧板栏
            //关闭等待框

            mui.fire(thisV, 'freeStopClick');
            plus.nativeUI.closeWaiting();

            /**
             * 如果需要传值，就给回调方法传值，回调执行完成后 再次来调用 tools.tools.hackGoUrl (不回调)
             * 16/2/2 */
            if (re) {
                re(thisView);
            } else {
                //显示当前页面
                thisView.show('slide-in-right');
            }


        },
        /**
         * 根据特定的name值从指定的数组中查询其对应的value
         * @param {Object} arr--特定的数组
         * @param {Object} value--需要查询的value
         */
        getValueBykey: function (arr, value) {
            if (arr) {
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i].value == value) {
                        return arr[i].text;
                    }
                }
            } else {
                console.log('文件引入出错');
            }
        },
        /**
         * 根据特定的name值从指定的数组中查询其对应的value和相对应的子数组的对应的value
         * @param {Object} arr
         * @param {Object} value
         * @param {Object} childValue
         * return {parent:value,child:value}
         */
        getValAChilByKey: function (arr, value, childValue) {
            var values = {};
            if (arr) {
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i].value == value) {
                        values.parent = arr[i].text;
                        var children = arr[i].children;
                        for (var j = 0; j < children.length; j++) {
                            if (children[j].value == childValue) {
                                values.child = children[j].text;
                                return values;
                            }
                        }
                    }
                }
            } else {
                console.log('文件引入出错');
            }
        },

        /**
         * 解析url图片地址为base64格式
         * 15/12/3 */
        convertImgToBase64: function (url, callback, outputFormat) {
            var canvas = document.createElement('CANVAS'),
                ctx = canvas.getContext('2d'),
                img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = function () {
                canvas.height = img.height;
                canvas.width = img.width;
                ctx.drawImage(img, 0, 0);
                var dataURL = canvas.toDataURL(outputFormat || 'image/png');
                callback.call(this, dataURL);
                canvas = null;
            };
            img.src = url;
        }

    };

    var re = {

        //用户登录记录销毁方法 db
        db: db,
        verify: verify,
        angular: angular,
        driver: driver,
        tools: tools
    };

    return re;

});