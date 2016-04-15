define(function(require) {
	var g = require('../public/g.js');
	var tools = require('../public/tools.js');

	require('../../directive/js/default/topNav.js');
	require('../../server/mServerData.js');
	require('../../../Public/js/moment.js');
	require('../../server/default/publicServer.js');
	require('../../server/goods/goodsInfo.js');

	var goodsType = require('../../server/mysql/goods_type.js');
	var topNav = require('../../directive/js/default/topNav.js');

	var flag = 1; //1---进行中   2---已失效
	var totalPage = 1; //总页数
	var page = 0; //请求的页数  yujian:如果初值＝1，48行有问题：if (page < totalPage) {，在第一次运行时，永远＝false
	var showData = [];
	var mUp;
	var ifShowNoData = 1; //0-不显示

	mui.ready(function() {
		//初始化下拉加载
		var ele = document.getElementById('bidding_content');
		mui(ele).pullToRefresh({
			up: {
				contentrefresh: '正在加载...',
				callback: pullupLoading
			}
		});

	});

	g.app.controller('biddingCtrl', function($scope, mServer, goodsDb, publicServer) {
		//联网获取货源列表
		getBiddingLst(publicServer, mServer, goodsDb, $scope, 'first');

		addEvent($scope, mServer, goodsDb, publicServer);

	})


	/**
	 * 联网获取货源列表
	 * @param {Object} mServer
	 */
	function getBiddingLst(publicServer, mServer, goodsDb, $scope, type) {
		var uid = g.read2DB(g.storage_key.user_id);
		var psd_time = g.read2DB(g.storage_key.user_token);
		if (type == '') {
			page = 1;
		} else {
			if (page < totalPage) {
				page++;
			} else {
				show($scope, type);
				//				if (ifShowNoData==1){
				//					ifShowNoData=0;
				plus.ui.toast("没有更多数据了");
				//				}
				return;
			}
		}

		var paramter = [];
		paramter['uid'] = uid;
		paramter['psd_time'] = psd_time;
		paramter['p'] = page;
		if (flag == 1) {
			paramter['goods_state'] = '1';
		} else if (flag == 2) {
			paramter['goods_state'] = '2';
		}

		//		console.error('uid=' + paramter['uid']);
		//		console.error('psd_time=' + paramter['psd_time']);
		//		console.error('p=' + paramter['p']);
		//		console.error('goods_state=' + paramter['goods_state']);

		mServer.getBiddingLst(paramter, function(re) {
			//			console.error("oning=====" + JSON.stringify(re));
			if (re.code == 'S') {
				if (type == '') {
					showData = [];
				}
				totalPage = re.data.totalPages;
				var bidLst = re.data.info;
				if (bidLst.length != 0) {
					for (var i = 0; i < bidLst.length; i++) {
						var tmp = {};
						tmp.flag = flag;
						tmp.gid = bidLst[i].id;
						tmp.line_name = bidLst[i].line_name;
						tmp.goods_class = bidLst[i].goods_class;
						tmp.goods_state = bidLst[i].goods_state;
						tmp.goods_type = bidLst[i].goods_name;

						if (bidLst[i].pur_money == "0") { //我的出价
							tmp.pur_money = "等待车主竞价";
						} else {
							tmp.pur_money = bidLst[i].pur_money + "元";
						}


						var role = g.read2DB(g.storage_key.role_type);
						if (role == "1" || paramter['goods_state'] == '2') {
							var mouth = moment(parseInt(bidLst[i].load_time) * 1000).format('MM');
							var day = moment(parseInt(bidLst[i].load_time) * 1000).format('DD');
							var time = moment(parseInt(bidLst[i].load_time) * 1000).format('HH:mm');
							tmp.load_time = mouth + '月' + day + '日   ' + time; //装货时间
						} else {
							var load_time = "";
							//							console.error("oning=====" + JSON.stringify(bidLst[i]));
							for (var k = 0; k < bidLst[i].db_info.length; k++) {
								var mouth = moment(parseInt(bidLst[i].db_info[k].stime) * 1000).format('MM');
								var day = moment(parseInt(bidLst[i].db_info[k].stime) * 1000).format('DD');

								if (k > 0) load_time = load_time + ",　";
								load_time = load_time + mouth + '/' + day; //装货时间
							}
							tmp.load_time = load_time;
						}

						tmp.release = '';
						tmp.fail_cause = bidLst[i].fail_cause;
						tmp.pay_type = bidLst[i].pay_type;

						var order = [];
						if (bidLst[i].order_list != null) {
							for (var k = 0; k < bidLst[i].order_list.length; k++) {
								orderObj = {};
								orderObj.pindex = i;
								orderObj.order_id = bidLst[i].order_list[k].id;
								orderObj.cz_id = bidLst[i].order_list[k].cz_id;
								orderObj.deal_state = bidLst[i].order_list[k].deal_state;
								orderObj.driver_name = bidLst[i].order_list[k].driver_name;
								orderObj.driver_tel = bidLst[i].order_list[k].driver_tel;
								orderObj.car_num = bidLst[i].order_list[k].car_num;
								orderObj.evalu_level = bidLst[i].order_list[k].evalu_level;
								orderObj.evalu_num = bidLst[i].order_list[k].evalu_num;
								orderObj.bid_money = bidLst[i].order_list[k].bid_money;

								order.push(orderObj);
							}
						}
						tmp.orderLst = order;

						showData.push(tmp);
					}

					//					console.error(JSON.stringify(showData));
					show($scope, type);

					addListener($scope, mServer, goodsDb, publicServer);
				} else {
					//数据为空的情况
					if (type == '') {
						plus.ui.toast("没找到任何数据");
						show($scope, type);
					} else {
						show($scope, type);
					}
				}
			} else if (re.code == 'T') {
				mui.toast('登录超时，请重新登录');
				setTimeout(function() {
					publicServer.goUrl('../member/quit.html');
				}, 1000);
			} else {
				mui.toast('很抱歉，没有找到您的货源信息');
				show($scope, type);
			}
			//			tools.tools.hackGoUrl();
		}, function() {
			mui.toast('很抱歉，没有找到您的货源信息');
			show($scope, type);
		});
	}

	function addListener($scope, mServer, goodsDb, publicServer) {
		setTimeout(function() {
			var cancelGoods = $('.r_simple_button_gray');
			cancelGoods.each(function(i, cancelItem) {
				if (cancelItem.getAttribute('hasClick') == null) {
					cancelItem.setAttribute('hasClick', 'true');
					cancelItem.addEventListener('tap', function() {
						var index = parseInt(this.getAttribute('position'));
						quxiaoGoods($scope, mServer, index);
					}, false);
				}
			});

			var cancelGoods2 = $('.btn_cancel');
			cancelGoods2.each(function(i, cancelItem) {
				if (cancelItem.getAttribute('hasClick') == null) {
					cancelItem.setAttribute('hasClick', 'true');
					cancelItem.addEventListener('tap', function() {
						var index = parseInt(this.getAttribute('position'));
						quxiaoGoods($scope, mServer, index);
					}, false);
				}
			});

			var editPrice = $('.btn_edit');
			editPrice.each(function(i, editItem) {
				if (editItem.getAttribute('hasClick') == null) {
					editItem.setAttribute('hasClick', 'true');
					editItem.addEventListener('tap', function() {
						var index = parseInt(this.getAttribute('position'));
						editGoodsPrice($scope, mServer, index);
					}, false);
				}
			});

			var delGoodsCls = $('.btn_del');
			delGoodsCls.each(function(i, delItem) {
				if (delItem.getAttribute('hasClick') == null) {
					delItem.setAttribute('hasClick', 'true');
					delItem.addEventListener('tap', function() {
						var index = parseInt(this.getAttribute('position'));
						delGoods($scope, mServer, index);
					}, false);
				}
			});

			var againPush = $('.btn_again');
			againPush.each(function(i, pushItem) {
				if (pushItem.getAttribute('hasClick') == null) {
					pushItem.setAttribute('hasClick', 'true');
					pushItem.addEventListener('tap', function() {
						var index = parseInt(this.getAttribute('position'));
						pushAgain(goodsDb, showData[index].gid);
					}, false);
				}
			});

			var faqiCls = $('.jingjia');
			faqiCls.each(function(i, faqiItem) {
				if (faqiItem.getAttribute('hasClick') == null) {
					faqiItem.setAttribute('hasClick', 'true');
					faqiItem.addEventListener('tap', function() {
						var pIndex = parseInt(this.getAttribute('pIndex'));
						var index = parseInt(this.getAttribute('position'));
						doFaqi(publicServer, pIndex, index);
					}, false);
				}
			});

			var gaiyaoInfo = $('.gaiyao');
			gaiyaoInfo.each(function(i, gaiyaoItem) {
				if (gaiyaoItem.getAttribute('hasClick') == null) {
					gaiyaoItem.setAttribute('hasClick', 'true');
					gaiyaoItem.addEventListener('tap', function() {
						var index = parseInt(this.getAttribute('position'));

						viewDetail(publicServer, goodsDb, index);
					}, false);
				}
			});
		}, 0);
	}

	/**
	 * 取消发货
	 * @param {Object} $scope
	 * @param {Object} mServer
	 * @param {Object} index
	 */
	function quxiaoGoods($scope, mServer, index) {
		//检查该货源是否过期
		var curDate = Date.parse(new Date());
		if (curDate > showData[index].load_time) {
			mui.toast("该货源过期已经下架，请在失效中查找");
			showData.splice(index, 1);
			show($scope, '');
			return;
		}

		var goodType = showData[index].goods_type;
		var btnArray = ['是', '否'];
		mui.confirm('您确定要取消发货：' + goodType, '取消确认', btnArray, function(e) {
			if (e.index == 0) {
				var paramter = [];
				paramter['uid'] = g.read2DB(g.storage_key.user_id);
				paramter['psd_time'] = g.read2DB(g.storage_key.user_token);
				paramter['id'] = showData[index].gid;

				mServer.cancelOrder(paramter, function(re) {
					//					console.error("cancel=" + JSON.stringify(re));
					if (re.sign == '20410') {
						showData.splice(index, 1);
						mui.toast('发货取消成功');

						show($scope, '');
					} else if (re.sign == '99') {
						mui.toast('登录超时，请重新登录');
						setTimeout(function() {
							publicServer.goUrl('../member/quit.html');
						}, 1000);
					} else {
						mui.toast('很抱歉，取消发货失败，请联系客服');
					}
				}, function() {
					mui.toast('很抱歉，取消发货失败，请联系客服');
				});
			}
		})
	}

	/**
	 * 删除过期货源
	 * @param {Object} $scope
	 * @param {Object} mServer
	 * @param {Object} index
	 */
	function delGoods($scope, mServer, index) {
		var goodType = showData[index].goods_type;
		var btnArray = ['是', '否'];
		mui.confirm('您确定要删除货源：' + goodType, '删除确认', btnArray, function(e) {
			if (e.index == 0) {
				var paramter = [];
				paramter['uid'] = g.read2DB(g.storage_key.user_id);
				paramter['psd_time'] = g.read2DB(g.storage_key.user_token);
				paramter['id'] = showData[index].gid;

				mServer.cancelOrder(paramter, function(re) {
					console.error("cancel=" + JSON.stringify(re));
					if (re.sign == '20410') {
						showData.splice(index, 1);
						mui.toast('删除成功');

						show($scope, '');
					} else if (re.sign == '99') {
						mui.toast('登录超时，请重新登录');
						setTimeout(function() {
							publicServer.goUrl('../member/quit.html');
						}, 1000);
					} else {
						mui.toast('很抱歉，删除货源失败，请检查网络');
					}
				}, function() {
					mui.toast('很抱歉，删除货源失败，请检查网络');
				});
			}
		})
	}

	/**
	 * 修改出价
	 * @param {Object} $scope
	 * @param {Object} mServer
	 * @param {Object} index
	 */
	function editGoodsPrice($scope, mServer, index) {
		//检查该货源是否过期
		var curDate = Date.parse(new Date());
		if (curDate > showData[index].load_time) {
			mui.toast("该货源过期已经下架，请在失效中查找");
			showData.splice(index, 1);
			show($scope, '');
			return;
		}

		var goodType = showData[index].goods_type;
		var btnArray = ['确定', '取消'];
		mui.prompt('当前运费；' + showData[index].pur_money + '(仅有一次机会)', '', '', btnArray, function(e) {
			if (e.index == 0) {
				if (e.value == null && e.value == '') return;

				console.error(e.value + "    " + showData[index].pur_money);

				if (parseInt(e.value) <= parseInt(showData[index].pur_money)) {
					mui.toast('出价必须大于原来价格，修改失败。');
					return;
				}

				var paramter = [];
				paramter['uid'] = g.read2DB(g.storage_key.user_id);
				paramter['psd_time'] = g.read2DB(g.storage_key.user_token);
				paramter['pur_money'] = e.value;
				paramter['id'] = showData[index].gid;

				mServer.changePrice(paramter, function(re) {
					//					console.error("change=" + JSON.stringify(re));
					if (re.sign == '20420') {
						showData[index].pur_money = e.value;
						mui.toast('修改运费成功');

						show($scope, '');
					} else if (re.sign == '20423') {
						mui.toast('很抱歉，您的运费已经修改过一次，不能再修改');
					} else if (re.sign == '99') {
						mui.toast('登录超时，请重新登录');
						setTimeout(function() {
							publicServer.goUrl('../member/quit.html');
						}, 1000);
					} else {
						mui.toast('很抱歉，修改运费失败，请联系客服');
					}
				}, function() {
					mui.toast('很抱歉，修改运费失败，请联系客服');
				});
			}
		})
	}

	/**
	 * 显示数据
	 */
	function show($scope, type) {
		$scope.role = g.read2DB(g.storage_key.role_type);

		var pullUpEle = document.getElementsByClassName('mui-pull-bottom-wrapper');
		$scope.showData = showData;

		if (type == 'first') {
			var before = plus.webview.currentWebview().opener();
			if (before.id.indexOf('confirmation_order') > 0) {
				plus.webview.close(before);
			}

			tools.tools.hackGoUrl();
		}

		if (totalPage == 1 || totalPage == null) {
			pullUpEle[0].setAttribute('hidden', 'hidden');
			try {
				mUp.endPullUpToRefresh();
			} catch (e) {}

		} else {
			pullUpEle[0].removeAttribute('hidden');
			if (type == 'loading') {
				mUp.endPullUpToRefresh();
			}
		}
	}

	/**
	 * 将货源再出发布
	 * @param {Object} $scope
	 * @param {Object} mServer
	 * @param {Object} index
	 */
	function pushAgain(goodsDb, goods_id) {
		var paramter = [];
		paramter['uid'] = g.read2DB(g.storage_key.user_id);
		paramter['psd_time'] = g.read2DB(g.storage_key.user_token);
		paramter['goods_id'] = goods_id;

		console.error('uid=' + paramter['uid']);
		console.error('psd_time=' + paramter['psd_time']);
		console.error('goods_id=' + paramter['goods_id']);

		goodsDb.getGoodsDetail2(paramter, function(re) {
			//			console.error("shixiao=" + JSON.stringify(re));
			g.save2DB(g.storage_key.yi_chang, "");
			g.save2DB(g.storage_key.yi_kuan, "");
			g.save2DB(g.storage_key.yi_gao, "");
			if (re.code == 'S' && re.data != undefined) {
				//临时的，把1，2，3级地址放到详细地址里
				for (var i = 0; i < re.data.address_list.length; i++) {
					re.data.address_list[i].adrs_detail = tools.verify.getAddr(re.data.address_list[i].adrs_level1, re.data.address_list[i].adrs_level2, re.data.address_list[i].adrs_level3, re.data.address_list[i].adrs_detail);
				}
				//				console.error("history=" + JSON.stringify(re));

				g.save2DB(g.storage_key.goods_info, JSON.stringify(re.data));

				goBack();
			} else if (re.code == 'T') {
				mui.toast('登录超时，请重新登录');
				setTimeout(function() {
					publicServer.goUrl('../member/quit.html');
				}, 1000);
			} else {
				mui.toast('重新发货失败，请检查网络');
			}
		}, function() {
			mui.toast('重新发货失败，请检查网络');
		});
	}

	/**
	 * 查看协议详情
	 * @param {Object} publicServer
	 * @param {Object} goodsDb
	 * @param {Object} index
	 */
	function viewDetail(publicServer, goodsDb, index) {
		var goods_id = showData[index].gid;

		var paramter = [];
		paramter['uid'] = g.read2DB(g.storage_key.user_id);
		paramter['psd_time'] = g.read2DB(g.storage_key.user_token);
		paramter['goods_id'] = goods_id;

		//				console.error('uid=' + paramter['uid']);
		//				console.error('psd_time=' + paramter['psd_time']);
		//				console.error('goods_id=' + paramter['goods_id']);

		goodsDb.getGoodsDetail2(paramter, function(re) {
			console.error("detail=" + JSON.stringify(re));
			g.save2DB(g.storage_key.yi_chang, "");
			g.save2DB(g.storage_key.yi_kuan, "");
			g.save2DB(g.storage_key.yi_gao, "");
			if (re.code == 'S' && re.data != undefined) {
				//临时的，把1，2，3级地址放到详细地址里
				for (var i = 0; i < re.data.address_list.length; i++) {
					re.data.address_list[i].adrs_detail = tools.verify.getAddr(re.data.address_list[i].adrs_level1, re.data.address_list[i].adrs_level2, re.data.address_list[i].adrs_level3, re.data.address_list[i].adrs_detail);
				}

				g.save2DB(g.storage_key.goods_info, JSON.stringify(re.data));

				var role_type = g.read2DB(g.storage_key.role_type);
				if ("1" == role_type) { //普通货主
					publicServer.goUrl('../goods/confirmation_order.html');
				} else {
					publicServer.goUrl('../goods/confirmation_order_line_bidding.html');
				}
			} else if (re.code == 'T') {
				mui.toast('登录超时，请重新登录');
				setTimeout(function() {
					publicServer.goUrl('../member/quit.html');
				}, 1000);
			} else {
				mui.toast('获取发货详情失败，请检查网络');
			}
		}, function() {
			mui.toast('获取发货详情失败，请检查网络');
		});
	}

	function getCount(str1, str2) {
		var r = new RegExp(str2, "gi");
		return str1.match(r).length + 1;
	}

	/**
	 * 发起协议
	 * @param {Object} $scope
	 * @param {Object} mServer
	 * @param {Object} index
	 */
	function doFaqi(publicServer, pindex, index) {
		var dealInfo = {};
		console.error("showdata=" + JSON.stringify(showData));
		dealInfo.gid = showData[pindex].gid;
		dealInfo.goods_class = showData[pindex].goods_class;
		dealInfo.cz_id = showData[pindex].orderLst[index].cz_id;
		dealInfo.goods_type = showData[pindex].goods_type;
		dealInfo.pur_money = showData[pindex].orderLst[index].bid_money;
		dealInfo.pay_type = showData[pindex].pay_type;
		dealInfo.order_id = showData[pindex].orderLst[index].order_id;
		dealInfo.driver_name = showData[pindex].orderLst[index].driver_name;
		dealInfo.driver_tel = showData[pindex].orderLst[index].driver_tel;
		dealInfo.car_num = showData[pindex].orderLst[index].car_num;
		dealInfo.pindex = pindex;
		dealInfo.index = index;

		if (dealInfo.goods_class == '21')
			dealInfo.rep_days = getCount(showData[pindex].load_time, ",");
		else
			dealInfo.rep_days = '';
		g.save2DB(g.storage_key.deal_push, JSON.stringify(dealInfo));

		//如果已经是发起过协议的，不再相应点击事件
		if (showData[pindex].goods_state == '2') {
			//			publicServer.goUrl('deal_detail.html');   现有接口，已经发起协议后，不能再查看详情
			return;
		}

		publicServer.goUrl('signUpDeal.html');
	}

	function goBack() {
		var before = plus.webview.currentWebview().opener();

		mui.fire(before, 'feiqiback', {
			data: ''
		});

		mui.back();
	}

	/**
	 * 添加点击事件
	 * @param {Object} $scope
	 * @param {Object} mServer
	 */
	function addEvent($scope, mServer, goodsDb, publicServer) {
		//进行中按钮
		document.getElementById('ongoing').addEventListener('tap', function() {
			if (flag == 2) {
				//				plus.webview.currentWebview().evalJS('mui.scrollTo(0, 100)');
				mui('.mui-scroll-wrapper').scroll().scrollTo(0, 0, 100);
				document.getElementById('failure').className = '';
				this.className = 'selected';
				flag = 1;
				getBiddingLst(publicServer, mServer, goodsDb, $scope, '');
			}
		});

		//已失效按钮
		document.getElementById('failure').addEventListener('tap', function() {
			if (flag == 1) {
				//				plus.webview.currentWebview().evalJS('mui.scrollTo(0, 100)');
				mui('.mui-scroll-wrapper').scroll().scrollTo(0, 0, 100);
				document.getElementById('ongoing').className = '';
				this.className = 'selected';
				flag = 2;
				getBiddingLst(publicServer, mServer, goodsDb, $scope, '');
			}
		});

		//上拉加载事件
		window.addEventListener('loading', function(e) {
			getBiddingLst(publicServer, mServer, goodsDb, $scope, 'loading');
		});

		//查看临时货源
		setTimeout(function() {
			document.getElementById('btn_commit').addEventListener('tap', function() {
				publicServer.goUrl('draftGoods.html');
			})
		}, 400);

		//从临时货源返回
		window.addEventListener('drag_back', function(event) {
			var before = plus.webview.currentWebview().opener();

			mui.fire(before, 'drag_back', {
				data: event.detail.data
			});

			mui.back();
		});

		//发起协议成功
		window.addEventListener('faqi_back', function(event) {
			$scope.$apply(function() {
				console.error('sign='+g.read2DB(g.storage_key.autoSign));
				//如果是扣除车主邦票成功，则跳转到订单画面
				if (g.read2DB(g.storage_key.autoSign) == '1') {
//					var before = '../goods/index.html';
					var before = plus.webview.getWebviewById('../aTpl/goods/index.html');
					console.error('before='+before);

					mui.fire(before, 'order_back', {
						data: event.detail.data
					});

					mui.back();
				} else {
					var clickObj = jQuery.parseJSON(event.detail.data);
					var pIndex = clickObj.pindex;
					var index = clickObj.index;

					showData[pIndex].goods_state = '2';
					showData[pIndex].orderLst[index].deal_state = '1';
				}
			})
		});
	}

	/**
	 * 上拉加载的方法
	 */
	function pullupLoading() {
		mUp = this;
		var curr = plus.webview.currentWebview();
		mui.fire(curr, 'loading');
	}
});