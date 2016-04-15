define(function (require) {

    var g = require('../public/g.js');//全局对象，包括angular bodyAll 控制器
    var tools = require('../public/tools.js');//tools
    require('../../directive/js/default/topNav.js');//topNav
    require('../../server/default/baiduApi.js');//baiduApi

    g.app.controller('baiduMap', baiduMap);//当前页面控制器
    g.app.$inject = ['$scope', 'baiduapi'];//手动注入

    function baiduMap($scope, baiduapi) {

        /**
         * 传来的Gps对象
         * 16/2/2 */
        var gpsObj;

        /**
         * fun对象
         *
         * init(),//init 接收父页面传参
         * getGps(),//接收传参后的回调方法,赋值gpsObj
         * reFun(),//赋值gpsObj成功后 去初始化地图
         * 16/2/2 */
        var fun = {

            /**
             * fun.init
             * 16/2/2 */
            init: function () {

                /**
                 * 接收参数
                 * 16/2/2 */
                tools.tools.hackGoUrl(this.getGps);

            },

            /**
             * 接收gps的回调方法,赋值gpsObj
             * 16/2/2 */
            getGps: function (reData) {
                gpsObj = {
                    lat: reData.lat,
                    lng: reData.lng
                };
                if (gpsObj.lat) {
                    fun.reFun();
                }
            },

            /**
             * 获取gps成功后方法
             * 16/2/2 */
            reFun: function () {
                mapFun.creatNewMap();//初始化地图
            }
        };

        /**
         * mapFun对象
         *
         * creatNewMap(),//建立新地图
         *
         * 16/2/2 */
        var mapFun = {
            /**
             * 建新地图
             * 16/2/2 */
            creatNewMap: function () {
                baiduapi.wapApi.newMap('content', gpsObj, reFun,'',function(){});

                function reFun(map) {
                    if (map) {
                        tools.tools.hackGoUrl();
                    }
                }
            }
        };


        /**
         * start
         * 16/2/2 */
        fun.init();

    }

})
;
