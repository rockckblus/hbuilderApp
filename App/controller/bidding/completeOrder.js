define(function(require) {
	var g = require('../public/g.js');
	var tools = require('../public/tools.js');

	//topNav
	var topNav = require('../../directive/js/default/topNav.js');

	require('../../../Public/js/moment.js');
	require('../../server/mServerData.js');
	require('../../server/default/publicServer.js');
	require('../../server/goods/goodsInfo.js');

	var showData = []; //显示的数组
	var totalPage = 1;
	var page = 1;
	var mUp;

	//初始化  上拉加载
	mui.ready(function() {
		//初始化下拉加载
		var ele = document.getElementById('order_pullrefresh');
		mui(ele).pullToRefresh({
			up: {
				contentrefresh: '正在加载...',
				callback: pullupLoading
			}
		});

	});

	g.app.controller('complete_order', function($scope, mServer, publicServer, goodsDb) {
		//获取协议列表信息
		getOrderLst(mServer, $scope, 'refresh', goodsDb, publicServer);

		//上拉加载
		window.addEventListener('pullupLoading', function(e) {
			//获取更多协议列表信息
			getOrderLst(mServer, $scope, 'loading', goodsDb, publicServer);
		});

	});

	/**
	 * 获取协议列表信息
	 * @param {Object} mServer
	 * @param {Object} type --判断是刷新还是加载  refresh--刷新
	 */
	function getOrderLst(mServer, $scope, type, goodsDb, publicServer) {
		//设置参数请求网络
		var uid = g.read2DB(g.storage_key.user_id);
		var psd_time = g.read2DB(g.storage_key.user_token);
		if (type == 'refresh') {
			page = 1;
		} else {
			if (page < totalPage) {
				page++;
			} else {
				show($scope, type);
				plus.ui.toast("没有更多数据了");
				return;
			}
		}

		var params = [];

		params['uid'] = uid;
		params['psd_time'] = psd_time;
		params['state'] = '3'; //2---执行中    3---历史
		params['p'] = page; //页数

		mServer.getOrderLst(params, function(re) {
			console.error("deal---" + JSON.stringify(re));
			//成功返回
			//pur_money ----车主报价
			//goods_name----货物名称
			//deal_code----协议编号
			//is_receipt---是否需要回单
			//暂时只有这些   还缺少 是否需要协助装卸  货物重量或方数   承运车辆    货物状态(运输中..装货...卸货...)
			if ('20600' == re.sign) {
				if (type == 'refresh') {
					showData = [];
				}
				totalPage = re.count;
				for (var i = 0; i < re.list.length; i++) {
					var tmp = {};
					tmp.id = re.list[i].id;
					tmp.goods_id = re.list[i].goods_id; //货物id
					tmp.pur_money = re.list[i].pur_money + '元'; //车主报价
					tmp.goods_name = re.list[i].goods_name; //货物名称
					tmp.goods_weight = re.list[i].goods_weight; //货物重量
					tmp.goods_square = re.list[i].goods_square; //货物体积
					if (re.list[i].is_receipt == '1') { //判断是否需要回单
						tmp.is_receipt = '回单';
					} else {
						tmp.is_receipt = '不需要回单';
					}
					tmp.unload_need = re.list[i].unload_need; //装卸需求
					tmp.deal_code = re.list[i].deal_code; //协议code
					tmp.car_num = re.list[i].car_num; //承运车辆车牌号
					tmp.driver_name = re.list[i].driver_name; //司机姓名
					tmp.driver_tel = re.list[i].driver_tel; //司机电话
					//					tmp.is_transport = re.list[i].is_transport; //承运车辆运输状态
					tmp.time = moment(parseInt(re.list[i].maketime) * 1000).format('YYYY/MM/DD');
					tmp.car_type = re.list[i].car_type; //承运车辆车型
					//					tmp.car_lat = re.list[i].car_lat; //纬度
					//					tmp.car_lng = re.list[i].car_lng; //经度


					if (g.read2DB(g.storage_key.role_type) == '1') {
						//普货
						tmp.goods_class = '1';
					} else if(g.read2DB(g.storage_key.role_type) == '2') {
						//线路竞标
						tmp.goods_class = '2';
					}

					showData.push(tmp);
				}

				show($scope, type, mServer, goodsDb, publicServer);
			} else if ('20609' == re.sign) {
				totalPage = re.count;
				plus.ui.toast("您还没有任何订单");
				show($scope, type, mServer, goodsDb, publicServer);
			} else {
				console.error('我的已完成订单获取数据出错');
			}

			//			var str = JSON.stringify(re);
			//			console.log('====re======'+str);

		}, function() {
			//错误返回
			console.log('====错误======');
		})


	}


	/**
	 * 显示数据
	 */
	function show($scope, type, mServer, goodsDb, publicServer) {
		var pullUpEle = document.getElementsByClassName('mui-pull-bottom-wrapper');
		$scope.showData = showData;

		if (type == 'refresh') {
			tools.tools.hackGoUrl();
		}
		//		console.log(totalPage);
		if (totalPage == 1 || page == totalPage || totalPage == 0) {
			pullUpEle[0].setAttribute('hidden', 'hidden');
		} else {
			pullUpEle[0].removeAttribute('hidden');
			if (type == 'loading') {
				mUp.endPullUpToRefresh();
			}
		}

		addEvent($scope, mServer, goodsDb, publicServer);
	}

	/**
	 * 添加监听事件
	 * @param {Object} $scope
	 */
	function addEvent($scope, mServer, goodsDb, publicServer) {

		setTimeout(function() {
			//再次发货按钮
			var confirms = $('.again');
			confirms.each(function(i, confirm) {
				if (confirm.getAttribute('hasClick') == null) {
					confirm.setAttribute('hasClick', 'true');
					confirm.addEventListener('tap', function() {
						var pos = this.getAttribute('position');
						pushAgain(goodsDb, showData[pos].goods_id);
					}, false);
				}

			});


			//协议详情
			var itemContents = $('.itemContent');
			itemContents.each(function(i, itemContent) {
				if (itemContent.getAttribute('hasClick') == null) {
					itemContent.setAttribute('hasClick', 'true');
					itemContent.addEventListener('tap', function() {
						var pos = this.getAttribute('position');
						g.save2DB(g.storage_key.cur_deal_id, showData[pos].id); //保存需要查看详情的协议的id
						publicServer.goUrl('deal_detail.html');
					}, false);
				}

			});

		}, 200);

	}

	/**
	 * 再次发货
	 * @param {Object} goodsDb
	 * @param {Object} goods_id
	 */
	function pushAgain(goodsDb, goods_id) {
		var paramter = [];
		paramter['uid'] = g.read2DB(g.storage_key.user_id);
		paramter['psd_time'] = g.read2DB(g.storage_key.user_token);
		paramter['goods_id'] = goods_id;

		goodsDb.getGoodsDetail2(paramter, function(re) {
			g.save2DB(g.storage_key.yi_chang, "");
			g.save2DB(g.storage_key.yi_kuan, "");
			g.save2DB(g.storage_key.yi_gao, "");

			if (re.code == 'S' && re.data != undefined) {
				//临时的，把1，2，3级地址放到详细地址里
				for (var i = 0; i < re.data.address_list.length; i++) {
					re.data.address_list[i].adrs_detail = tools.verify.getAddr(re.data.address_list[i].adrs_level1, re.data.address_list[i].adrs_level2, re.data.address_list[i].adrs_level3, re.data.address_list[i].adrs_detail);
				}

				g.save2DB(g.storage_key.goods_info, JSON.stringify(re.data));

				goBack();
			} else if (re.code == 'T') {
				mui.toast('登录超时，请重新登录');
				setTimeout(function() {
					publicServer.goUrl('../member/quit.html');
				}, 1000);
			} else if (re.code == 'F') {
				mui.toast(re.err_msg);
			}
		}, function() {
			mui.toast('重新发货失败，请检查网络');
		});
	}


	function goBack() {
		var before = plus.webview.currentWebview().opener();
		plus.webview.close(before);

		var indexWeb = plus.webview.getWebviewById('../aTpl/goods/line_index.html');
		mui.fire(indexWeb, 'feiqiback', {
			data: ''
		});

		mui.back();


	}
	/**
	 * 上拉加载
	 */
	function pullupLoading() {
		mUp = this;
		var curr = plus.webview.currentWebview();
		mui.fire(curr, 'pullupLoading');
	}

})