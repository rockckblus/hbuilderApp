/**
 * 会员server
 * 15/11/11 */
define(function (require) {

    var g = require('../../controller/public/g.js');
    var tools = require('../../controller/public/tools.js');

    g.app.factory('memberDbMa', function ($http) {

        /**
         * 声明接口地址
         * 15/11/11 */
        var memberUrl = {
//        		subMemberHeader: 'http://192.168.0.5/thinkphp/index.php/Home/Index/postUserHeader/',//头像提交地址
        		subMemberHeader: g.apiHost + '/Api/ApiPublic/update_headimage',//头像提交地址
        		scoreDetail: g.apiHost + '/Api/AppHuo/getHuoScoreDetail', //取得积分详情
        		scoreRule: g.apiHost + '/Api/ApiPublic/jifen_rulet', //取得积分规则
        };

        /**
         * 公共方法
         * 15/11/11 */
        var fun = {
            get: function (frontUrl, jsonObj, func, errFun) {
                tools.angular.getJson($http, frontUrl, jsonObj, function (re) {
                    if (re) {
                        func(re);
                    }
                }, errFun)
            },
            post: function (url, dataObj, func, errFun) {
                tools.angular.postJsp($http, url, dataObj, function (re) {
                    if (re) {
                        func(re);
                    }
                }, errFun)
            }
        };

        var re = {
            /**
             * 提交post用户头像
             * 15/12/3 */
            subMemberHeader: function (dataObj, func) {
                fun.post(memberUrl.subMemberHeader, dataObj, function (re) {
                    func(re);
                })
            },

			//取得积分详情
			getUserScore: function (dataObj, func,errFun) {
                fun.post(memberUrl.scoreDetail, dataObj, function (re) {
                    func(re);
                }, function() {
					errFun();
				})
            },
            
            //取得积分规则
			getScoreRule: function (dataObj, func,errFun) {
                fun.post(memberUrl.scoreRule, dataObj, function (re) {
                    func(re);
                }, function() {
					errFun();
				})
            },
        }
        return re;
    })


})
