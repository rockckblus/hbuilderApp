define(function(require) {

	var g = require('../controller/public/g.js');

	var tools = require('../controller/public/tools.js');

	g.app.factory('mServer', function($http, $rootScope) {

		/**
		 * 接口地址
		 */
		var serverUrl = {
			/** 登录URL */
			loginUrl: g.apiHost + "/Api/ApiPublic/mobile_login",
			/** 自动登录取用户信息URL */
			usrInfoUrl: g.apiHost + "/Api/ApiPublic/auto_login",
			/** 获取验证码URL */
			getSecurityUrl: g.apiHost + "/Api/ApiPublic/send_smscode",
			/** Splash页面启动请求URL */
			getSplashUrl: g.apiHost + '/Api/ApiPublic/find_new_app_version',

			/** 获取我的货源列表 */
//			getMineBidding: g.apiHost + '/Api/Goods/my_goods',
			getMineBidding: g.apiHost + '/Api/AppHuo/my_order_list',
			/** 获取我的订单列表 */
			getMineOrder:g.apiHost+'/Api/Apibh/hzdeal',
			/** 撤消发货 */
			cancelOrderUrl:g.apiHost+'/Api/Goods/cancel_goods',
			/** 修改发布价格 */
			changePriceUrl:g.apiHost+'/Api/Goods/pur_money',
			/** 货主发起协议_查看详情路径 */
			showDealUrl:g.apiHost+'/Api/AppHuo/showDeal',
			/** 发起协议 */
			launchDealUrl:g.apiHost+'/Api/AppHuo/launchDeal',
			/** 查看协议详情路径 */
			dealDetailUrl:g.apiHost+'/Api/Apibh/dealmes',
			
			/** 协议确认完成 */
			completeDealUrl:g.apiHost+'/Api/Apibh/confirmdeal',
			/** 确认申诉 */
			confirmComplaintUrl:g.apiHost+'/Api/Apibh/hzAppeal',
		};

		/**
		 * 公用的方法
		 */
		var fun = {
			/**
			 * get请求方法--使用的angular的请求方法,外面包装了一层
			 * @param {Object} url--url地址
			 * @param {Object} params---传递的参数
			 * @param {Object} func--成功回调函数
			 * @param {Object} errfunc--联网失败回调函数
			 */
			get: function(url, params, func, errfunc) {
				tools.angular.getJson($http, url, params, function(re) {
					if (re) {
						func(re);
					}
				}, function() {
					errfunc();
				})
			},
			/**
			 * post请求方法--使用的angular的请求方法,外面包装了一层
			 * @param {Object} url--url地址
			 * @param {Object} params--传递的参数
			 * @param {Object} func--成功回调函数
			 * @param {Object} errfunc--联网失败回调函数
			 */
			post: function(url, params, func, errfunc) {
				tools.angular.postJsp($http, url, params, function(re) {
					if (re) {
						func(re);
					}
				}, function() {
					errfunc();
				})
			}
		};

		/**
		 * 每个自己需要的联网请求的操作
		 */
		var re = {

			/**
			 * splash页面的联网请求   1,检查版本更新  2,是否需要向服务器传递log信息  3,待定...
			 * @param {Object} params
			 * @param {Object} func
			 */
			getSplash: function(params, func, errFunc) {
				fun.post(serverUrl.getSplashUrl, params, function(re) {
					func(re);
				}, function() {
					errFunc();
				});
			},

			/**
			 * 请求登录的连接
			 * @param {Object} params
			 * @param {Object} func
			 */
			getLogin: function(params, func, errFunc) {
				fun.post(serverUrl.loginUrl, params, function(re) {
					func(re);
				}, function() {
					errFunc();
				});
			},
			
			getUsrInfo: function(params, func, errFunc) {
				fun.post(serverUrl.usrInfoUrl, params, function(re) {
					func(re);
				}, function() {
					errFunc();
				});
			},

			/**
			 * 向服务器请求验证码
			 * @param {Object} params
			 * @param {Object} func
			 */
			getSecurity: function(params, func, errFunc) {
				fun.post(serverUrl.getSecurityUrl, params, function(re) {
					func(re);
				}, function() {
					errFunc();
				});
			},
			/**
			 * 获取竞价列表
			 * @param {Object} params
			 * @param {Object} func
			 * @param {Object} errFunc
			 */
			getBiddingLst: function(params, func, errFunc) {
				fun.post(serverUrl.getMineBidding, params, function(re) {
//					if (re.sign = "99") {
//						g.save2DB(g.storage_key.user_token,"");
//						
//						mui.openWindow({
//							url: "../login.html",
//							id: "../login.html",
//							createNew: false,
//							show: {
//								autoShow: true,
//								aniShow: 'pop-in'
//							}
//						});
//					} else {
						func(re);
//					}
				}, function() {
					errFunc();
				});
			},
			/**
			 * 获取订单列表
			 * @param {Object} params
			 * @param {Object} func
			 * @param {Object} errFunc
			 */
			getOrderLst: function(params, func, errFunc) {
				fun.post(serverUrl.getMineOrder, params, function(re) {
					func(re);
				}, function() {
					errFunc();
				});
			},
			
			//取消发货
			cancelOrder: function(params, func, errFunc) {
				fun.post(serverUrl.cancelOrderUrl, params, function(re) {
					func(re);
				}, function() {
					errFunc();
				});
			},
			
			//修改发布价格
			changePrice: function(params, func, errFunc) {
				fun.post(serverUrl.changePriceUrl, params, function(re) {
					func(re);
				}, function() {
					errFunc();
				});
			},
			
			//发起协议时显示协议详情
			showDeal: function(params, func, errFunc) {
				fun.post(serverUrl.showDealUrl, params, function(re) {
					func(re);
				}, function() {
					errFunc();
				});
			},
			
			//发起协议
			launchDeal: function(params, func, errFunc) {
				fun.post(serverUrl.launchDealUrl, params, function(re) {
					func(re);
				}, function() {
					errFunc();
				});
			},
			
			//协议详情
			viewDealDetail: function(params, func, errFunc) {
				fun.post(serverUrl.dealDetailUrl, params, function(re) {
					func(re);
				}, function() {
					errFunc();
				});
			},
			
			//确认协议完成
			completeDeal: function(params, func, errFunc) {
				fun.post(serverUrl.completeDealUrl, params, function(re) {
					func(re);
				}, function() {
					errFunc();
				});
			},
			
			//确认申诉
			confirmComplaint:function(params,func,errFunc){
				fun.post(serverUrl.confirmComplaintUrl,params,function(re){
					func(re);
				},function(){
					errFunc();
				});
			},
		}
		return re;
	});
});
