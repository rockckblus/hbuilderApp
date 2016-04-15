/**
 * public goUrl 服务
 * 15/11/18 */
define(function (require) {
    var g = require('../../controller/public/g.js');
    var tools = require('../../controller/public/tools.js');
    g.app.factory('baiduapi', function ($http) {

        //相关参数
        var data = {
            ak: 'Tn3pNaqSUtTr49oujSGfowDZ',//百度ak
            sosoAk: 'KFSBZ-RR7H4-5IMUE-X7I67-R6EZS-PWBCK',//sosoak
            coordtype: 'wgs84ll',//gps 设备坐标类型
            coordtypeBaidu: 'bd09ll',//百度坐标类型
            posi: 1,//周边posi信息数组
            callback: 'renderReverse',
            output: 'json',//返回的数据格式
            locationLat: '',//temp
            locationLng: '',//temp
            set location(gpsData) {
                this.locationLat = gpsData.lat;
                this.locationLng = gpsData.lng;
            },
            get location() {//组合字符串
                var re = this.locationLat + ',' + this.locationLng;
                return re;
            },
        }

        //百度地址逆解析，传入 gps 坐标
        var getAdd = {

            //给gps坐标组合成串
            getGps: function (lat, lng) {
                var gpsObj = {
                    lat: lat,
                    lng: lng
                }
                data.location = gpsObj;
            },


            //转换gps坐标成百度坐标
            changeBaiDu: function (lat, lng, func, form) {
                if (!form) {
                    form = 1;
                }
                var baidApiUrl = 'http://api.map.baidu.com/geoconv/v1/?coords=' + lat + ',' + lng + '&ak=' + data.ak + '&from=' + form;
                $http.get(baidApiUrl).success(function (re) {
                    if (re && (re.status == 0)) {
                        re = {
                            lat: re.result[0].x,
                            lng: re.result[0].y
                        }
                        func(re);
                    }
                })
            },


            //组合post数据
            joinPost: function (baidu) {
                /**
                 * hackbaidu
                 * 15/12/15 */
                var coordtype = data.coordtype;
                if (baidu) {
                    coordtype = data.coordtypeBaidu;
                }
                var dataRe = {
                    ak: data.ak,
                    coordtype: coordtype,
                    location: data.location,
                    output: data.output,
                    posi: data.posi
                }
                dataRe = tools.tools.parseParamOld(dataRe);
                return dataRe;
            },

            //getApi
            getApi: function (data, fun, errorFun, first) {
                var timeOut = g.overTime;//默认长超时
                if (first) {
                    timeOut = g.sortOverTime;//短超时
                }
                var baidApiUrl = 'http://api.map.baidu.com/geocoder/v2/?' + data;
                $http({
                    method: "GET",
                    timeout: timeOut, //超时设置
                    url: baidApiUrl
                }).success(function (re) {
                    fun(re);
                }).error(function (e) {
                    plus.nativeUI.toast('请求地图api超时');
                    if (errorFun) {
                        errorFun();
                    }
                })
            },

            //start 传 lat，lng，func成功回调方法，e失败回调方法，first是否第一次载入，baidu是否百度坐标类型
            start: function (lat, lng, func, e, first, baidu) {
                if (baidu) {
                    getAdd.getGps(lng, lat);
                } else {
                    getAdd.getGps(lat, lng);
                }
                var data = getAdd.joinPost(baidu);
                getAdd.getApi(data, func, e, first);
            },


            //复写原生地址解析
//            start: function (lat, lng, func) {
//                var point = new plus.maps.Point(lng,lat);
//                plus.maps.Map.reverseGeocode(point, {coordType:'bd09ll'}, function (event) {
//                    func(event);
//                }, function (e) {
//                    console.log('error', e);
//                })
//            }


        }

        //百度联想下拉
        var lianXiang = {

            //传入字符串
            start: function (str, func, region) {
                if (!region) {
                    region = '全国';
                }
                var obj = {
                    query: str,//联想的字符串
                    region: region,//默认城市，如果有定位值就是定位，没有传全国
                    output: data.output,//json格式
                    ak: data.ak,//开发者密钥
                }

                var dataRe = tools.tools.parseParamOld(obj);
                lianXiang.getApi(dataRe, func);
            },

            //getApi
            getApi: function (data, fun) {
                var baidApiUrl = 'http://api.map.baidu.com/place/v2/suggestion?' + data;
                $http({
                    method: "GET",
                    timeout: g.overTime, //超时设置
                    url: baidApiUrl
                }).success(function (re) {
                    fun(re);
                })
            },
        }

        //百度wapApi
        var wapApi = {
            //初始新地图,传入className    最后一个 fun 是 回调，此处为了 hack 手机坐标，还是百度坐标,返回 最后的 百度坐标
            newMap: function (className, gps, func, e, fun) {
                var newMap = new BMap.Map(className, {enableMapClick: false});//关闭默认地图响应点击事件
                if (e) {//判断坐标是 手机定位来的，需要转换成百度坐标
                    getAdd.changeBaiDu(gps.lat, gps.lng, function (re) {
                        wapApi.reNewMap(re, func, newMap);
                        fun({lat: re.lng, lng: re.lat});//返回转好的坐标
                    })
                } else {// todo 判断第一次下拉 网络穿来的百度坐标，还是百度模块传来的第一次下拉,(主要先判断是否第一次)
                    var endGps;
//                    plus.geolocation.getCurrentPosition(function () {
//                        endGps = {lat: gps.lat, lng: gps.lng};
//                        wapApi.reNewMap(endGps, func, newMap);
//                    },function(e){
//                    if (e.code == 2) {
                    endGps = {lat: gps.lng, lng: gps.lat};
                    wapApi.reNewMap(endGps, func, newMap);
//                    }
//                    })
                    if(fun){
                        fun(endGps);//返回未转换的坐标
                    }
                }
            },

            reNewMap: function (gps, func, map) {
                var point = new BMap.Point(gps.lat, gps.lng);  // 创建点坐标
                map.centerAndZoom(point, 14);                 // 初始化地图，设置中心点坐标和地图级别
                wapApi.setMark(map, {lat: gps.lng, lng: gps.lat});
                func(map);
            },

            //根据地址逆解析gps
            moveMap: function (map, gps) {
                if (map) {
                    var point = new BMap.Point(gps.lng, gps.lat);  // 创建点坐标
                    map.panTo(point, 14);                 // 初始化地图，设置中心点坐标和地图级别
                } else {
                    plus.nativeUI.toast('无法获取map对象');
                }
            },

            //设置标记
            setMark: function (map, gps) {
                if (map) {
                    var point = new BMap.Point(gps.lng, gps.lat);  // 创建点坐标
                    var marker = new BMap.Marker(point);
                    map.addOverlay(marker);
                }
            },

            //删除标记
            delMark: function (map) {
                if (map) {
                    map.clearOverlays();
                } else {
                    plus.nativeUI.toast('无法获取map对象');
                }
            }
        }

        /**
         * sosoApi
         * 15/12/10 */

        var sosoApi = {
            /**
             * 地址转坐标
             * 15/12/10 */
            addToGps: function (str, func) {
                var url = "http://apis.map.qq.com/ws/geocoder/v1/?address=" + str + "&key=" + data.sosoAk;
//                var url = "http://apis.map.qq.com/ws/geocoder/v1/?address=天津市和平区二号桥朝阳小区&key=KFSBZ-RR7H4-5IMUE-X7I67-R6EZS-PWBCK";

                $http(
                    {
                        method: "GET",
                        timeout: g.overTime, //超时设置
                        url: url
                    }).success(function (re) {
                        func(re);
                    })
            },

            /**
             * 百度坐标转地址
             * 16/2/15 */
            gpsToAdd: function (gpsObj, func) {
                var url = "http://apis.map.qq.com/ws/geocoder/v1/?location=" + gpsObj.lat + "," + gpsObj.lng + "&coord_type=3&key=" + data.sosoAk;
                $http(
                    {
                        method: "GET",
                        timeout: g.overTime, //超时设置
                        url: url
                    }).success(function (re) {
                        func(re);
                    })
            },

            /**
             * soso变换成百度坐标
             * 15/12/10 */
            changeBaiDu: function (lat, lng, func) {
                getAdd.changeBaiDu(lat, lng, func, 3);
            }
        };

        /**
         * 验证输入详细地址里面有没有 城市名称
         * 传入 str
         * 16/1/27 */
        var trueCityName = function (str, fun) {
            var url = g.apiHost + '/Api/ApiPublic/checkHasCity';
            var obj = {address: str};

            tools.angular.postJsp($http, url, obj, function (re) {
                fun(re);
            })

        };


        var re = {
            getAdd: getAdd.start,
            getXiaLa: lianXiang.start,
            wapApi: wapApi,
            sosoApi: sosoApi,
            trueCityName: trueCityName
        }

        return re;

    })
})