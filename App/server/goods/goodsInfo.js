/**
 * 货源相关
 * 15/11/20 */
define(function(require) {
	var g = require('../../controller/public/g.js');
	var tools = require('../../controller/public/tools.js');

	g.app.factory('goodsDb', function($http, $rootScope) {
		/**
		 * 声明接口地址
		 */
		var srvUrl = {
			//			history_detail: g.apiHost + '/Home/TestGoods/goodsInfo', //取得历史货源详情
			history_detail: g.apiHost + '/Api/AppHuo/goods_history_info', //取得历史货源详情
			goods_push: g.apiHost + '/Api/AppHuo/do_add_goods', //货源发布
			//			history_line: g.apiHost + '/Home/TestGoods/testGoodsLine', //取得历史线路
			history_line: g.apiHost + '/Api/AppHuo/hz_adrs_list', //取得历史线路
			upload_goods_photo: g.apiHost + '/Api/AppHuo/up_pic_for_goods', //上传商品图片
		}

		/**
		 * 公共方法
		 * 15/11/11 */
		var fun = {
			get: function(frontUrl, jsonObj, func) {
				tools.angular.getJson($http, frontUrl, jsonObj, function(re) {
					if (re) {
						func(re);
					}
				})
			},
			post: function(url, dataObj, func, errFun) {
				tools.angular.postJsp($http, url, dataObj, function(re) {
					if (re) {
						func(re);
					}
				}, errFun);
			},
			post2: function (url, dataObj, func,errFun) {
                $http({
                    url: url,
                    method: "POST",
                    data: dataObj,
                    timeout: 5000 //超时设置
                }).success(function (response) {
                    func(response);
                }).error(function (data, status, headers, config, error) {
                    errFun();
                })
            }
		};

		var re = {
			/**
			 * 取得历史货源详情，如果是指定货源id的，在dataObj中设定key=goods_id
			 * @param {Object} $http
			 * @param {Object} dataObj
			 * @param {Object} func
			 */
			getGoodsDetail: function(dataObj, func,errFun) {
				fun.post2(srvUrl.history_detail, dataObj, function(re) {
					func(re);
				}, function() {
					errFun();
				})
			},
			
			getGoodsDetail2: function(dataObj, func,errFun) {
				fun.post(srvUrl.history_detail, dataObj, function(re) {
					func(re);
				}, function() {
					errFun();
				})
			},

			/**
			 * 货源发布
			 * @param {Object} $http
			 * @param {Object} dataObj
			 * @param {Object} func
			 */
			goodsPush: function(dataObj, func,errFun) {
				fun.post(srvUrl.goods_push, dataObj, function(re) {
					func(re);
				}, function() {
					errFun();
				})
			},

			/**
			 * 取得历史线路
			 * @param {Object} $http
			 * @param {Object} dataObj
			 * @param {Object} func
			 */
			getGoodsLine: function(dataObj, func,errFun) {
				fun.post(srvUrl.history_line, dataObj, function(re) {
					func(re);
				}, function() {
					errFun();
				})
			},
			
						/**
			 * 取得历史线路
			 * @param {Object} $http
			 * @param {Object} dataObj
			 * @param {Object} func
			 */
			uploadGoodsPic: function(dataObj, func,errFun) {
//				console.error(srvUrl.upload_goods_photo);
				fun.post(srvUrl.upload_goods_photo, dataObj, function(re) {
					console.error(srvUrl.upload_goods_photo);
					func(re);
				}, function() {
					errFun();
				})
			},

		}
		return re;
	})
})