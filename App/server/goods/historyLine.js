/**
 * 货源相关
 * 15/11/20 */
define(function (require) {
    var g = require('../../controller/public/g.js');
    var tools = require('../../controller/public/tools.js');

    g.app.factory('historyLine', function ($http, $rootScope) {
        /**
         * 声明接口地址
         */
        var srvUrl = {
            history_line: g.apiHost + '/Api/AppHuo/hz_history_adrs' //取得历史线路
        };

        /**
         * 公共方法
         * 15/11/11 */
        var fun = {
            get: function (frontUrl, jsonObj, func) {
                tools.angular.getJson($http, frontUrl, jsonObj, function (re) {
                    if (re) {
                        func(re);
                    }
                })
            },
            post: function (url, dataObj, func) {
                $http({
                    url: url,
                    method: "POST",
                    data: dataObj,
                    timeout: 5000 //超时设置
                }).success(function (response) {
                    func(response);
                }).error(function (data, status, headers, config, error) {
                    console.log('postDataErr====' + status, headers, config, error);
                    return false;
                })
            }
        };

        var re = {
            /**
             * 取得历史线路
             * @param {Object} $http
             * @param {Object} dataObj
             * @param {Object} func
             */
            getGoodsLine: function (dataObj, func) {
                dataObj = {};
                dataObj.psd_time = g.read2DB(g.storage_key.user_token);
                dataObj.uid = g.read2DB(g.storage_key.user_id);

                fun.post(srvUrl.history_line, dataObj, function (re) {
                    func(re);
                })
            }

        }
        return re;
    })
})