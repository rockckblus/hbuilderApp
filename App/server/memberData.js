/**
 * 会员server
 * 15/11/11 */
define(function (require) {

    var g = require('../controller/public/g.js');
    var tools = require('../controller/public/tools.js');

    g.app.factory('memberDb', function ($http, $rootScope) {

        /**
         * 声明接口地址
         * 15/11/11 */
        var memberUrl = {
            getMember: g.apiHost + '/member/getMemberContent/',
//          getMemberTest: 'http://city.5656111.com/index.php/Api/Search/getZx/fromWeb/1/',
//          postTest: 'http://city.5656111.com/Api/User/user_login',
//          getFeng:'http://city56.5656111.com/Home/TestGoods/goodsInfo'
        }

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
                tools.angular.postJsp($http, url, dataObj, function (re) {
                    if (re) {
                        func(re);
                    }
                })
            }
        };

        var re = {
            /**
             * 传入json对象
             * 15/11/11 */
            getMember: function (jsonObj, func) {
                fun.get(memberUrl.getMemberTest, jsonObj, function (re) {
                    func(re);
                })
            },

            /**
             * post 对象 格式
             * 15/11/12 */
            postMember: function (dataObj, func) {
                fun.post(memberUrl.postTest, dataObj, function (re) {
                    func(re);
                })
            }
        }
        return re;
    })
})
