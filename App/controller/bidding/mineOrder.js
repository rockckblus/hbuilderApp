define(function(require) {
	var g = require('../public/g.js');
	var tools = require('../public/tools.js');

	//topNav
	var topNav = require('../../directive/js/default/topNav.js');

	require('../../../Public/js/moment.js');
	require('../../server/mServerData.js');
	require('../../server/default/publicServer.js');

	var showData = []; //显示的数组
	var totalPage = 1;
	var page = 1;
	var mUp;
	var complaintArr = [{
		id: 0,
		content: '车主在运输途中将GPS终端关闭',
		classType: 'r_icon_checkmark_gray l'
	}, {
		id: 1,
		content: '未经货主同意，运输过程中换车',
		classType: 'r_icon_checkmark_gray l'
	}, {
		id: 2,
		content: '货主要求回单,车主未执行',
		classType: 'r_icon_checkmark_gray l'
	}, {
		id: 3,
		content: '货物没有按时到达',
		classType: 'r_icon_checkmark_gray l'
	}, {
		id: 4,
		content: '货物到达地或收货人弄错',
		classType: 'r_icon_checkmark_gray l'
	}, {
		id: 5,
		content: '货物存在破损情况',
		classType: 'r_icon_checkmark_gray l'
	}, {
		id: 6,
		content: '其他',
		classType: 'r_icon_checkmark_gray l'
	}];

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

	g.app.controller('mine_order', function($scope, mServer, publicServer) {

		var blackTrans = document.getElementById('blackTrans');
		var complaintsDialog = document.getElementById('complaintsDialog');
		var contactDialog = document.getElementById('contactDialog');
		var confirmDialog = document.getElementById('confirmDialog');
		blackTrans.setAttribute('hidden', 'hidden');
		complaintsDialog.setAttribute('hidden', 'hidden');
		contactDialog.setAttribute('hidden', 'hidden');
		confirmDialog.setAttribute('hidden', 'hidden');

		//获取协议列表信息
		getOrderLst(mServer, $scope, 'refresh', publicServer);

		//上拉加载
		window.addEventListener('pullupLoading', function(e) {
			//获取更多协议列表信息
			getOrderLst(mServer, $scope, 'loading', publicServer);
		});

	});

	/**
	 * 获取协议列表信息
	 * @param {Object} mServer
	 * @param {Object} type --判断是刷新还是加载  refresh--刷新
	 */
	function getOrderLst(mServer, $scope, type, publicServer) {
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
		params['state'] = '2'; //2---执行中    3---历史
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
					tmp.is_transport = re.list[i].is_transport; //承运车辆运输状态
					tmp.car_type = re.list[i].car_type; //承运车辆车型
					tmp.car_lat = re.list[i].car_lat; //纬度
					tmp.car_lng = re.list[i].car_lng; //经度
					tmp.load_time = moment(parseInt(re.list[i].load_time) * 1000).format('YYYY/MM/DD');
					tmp.growth_level = re.list[i].growth_level;
					tmp.evalu_num = re.list[i].evalu_num;
					tmp.evalu_level = re.list[i].evalu_level;

					showData.push(tmp);
				}

				show($scope, type, mServer, publicServer);
			} else if ('20609' == re.sign) {
				totalPage = re.count;
				plus.ui.toast("您还没有任何订单");
				show($scope, type, mServer, publicServer);
			} else if ('99' == re.sign) {
				mui.toast('登录超时，请重新登录');
				setTimeout(function() {
					publicServer.goUrl('../member/quit.html');
				}, 1000);
			} else {
				console.error('我的订单获取数据出错');
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
	function show($scope, type, mServer, publicServer) {
		var pullUpEle = document.getElementsByClassName('mui-pull-bottom-wrapper');
		$scope.showData = showData;
		//		console.log(totalPage);
		if (totalPage == 1 || page == totalPage || totalPage == 0) {
			pullUpEle[0].setAttribute('hidden', 'hidden');
		} else {
			pullUpEle[0].removeAttribute('hidden');
			if (type == 'loading') {
				mUp.endPullUpToRefresh();
			}
		}

		addEvent($scope, mServer, publicServer);

		if (type == 'refresh') {
			setTimeout(function() {
				tools.tools.hackGoUrl();
			}, 400);

		}
	}

	var pos;
	/**
	 * 添加监听事件
	 * @param {Object} $scope
	 */
	function addEvent($scope, mServer, publicServer) {

		setTimeout(function() {

			//已完成订单
			var hasEndBtn = document.getElementById('btn_commit');
			if (hasEndBtn.getAttribute('hasClick') == null) {
				hasEndBtn.setAttribute('hasClick', 'true');
				hasEndBtn.addEventListener('tap', function() {
					//跳转到已完成订单页面
//					console.log("点击了到已完成");
					publicServer.goUrl('completeOrder.html');
				}, false);
			}


			//确认收获按钮
			var confirms = $('.confirm');
			confirms.each(function(i, confirm) {
				if (confirm.getAttribute('hasClick') == null) {
					confirm.setAttribute('hasClick', 'true');
					confirm.addEventListener('tap', function() {
						pos = this.getAttribute('position');
						blackTrans.removeAttribute('hidden');
						confirmDialog.removeAttribute('hidden');

					}, false);
				}

			});
			var confirArriveEle = document.getElementById('confirArrive');
			if (confirArriveEle.getAttribute('hasClick') == null) {
				confirArriveEle.setAttribute('hasClick', 'true');
				confirArriveEle.addEventListener('tap', function(e) {
					var deal = showData[pos];
					completeDeal(deal.id, mServer, g.read2DB(g.storage_key.user_id), g.read2DB(g.storage_key.user_token), publicServer);
					return false;
				}, false);
			}

			var confirmCancelEle = document.getElementById('confirmCancel');
			if (confirmCancelEle.getAttribute('hasClick') == null) {
				confirmCancelEle.setAttribute('hasClick', 'true');
				confirmCancelEle.addEventListener('tap', function() {
					blackTrans.setAttribute('hidden', 'hidden');
					confirmDialog.setAttribute('hidden', 'hidden');
					return false;
				}, false);
			}

			//联系司机
			var contacts = $('.contact');
			contacts.each(function(i, contact) {
				if (contact.getAttribute('hasClick') == null) {
					contact.setAttribute('hasClick', 'true');
					contact.addEventListener('tap', function() {
						pos = this.getAttribute('position');
						document.getElementById('driverName').childNodes[0].textContent = showData[pos].driver_name;
						document.getElementById('car_num').childNodes[0].textContent = showData[pos].car_num;
						document.getElementById('car_type').childNodes[0].textContent = showData[pos].car_type;
						//					document.getElementById('is_transport').childNodes[0].textContent = showData[pos].is_transport;
						var evalu = document.getElementById('evalu');
						var growth = document.getElementById('growth');
						showImg(evalu, growth);
						blackTrans.removeAttribute('hidden');
						contactDialog.removeAttribute('hidden');

					}, false);
				}

			});

			var callPhoneEle = document.getElementById('callPhone');
			if (callPhoneEle.getAttribute('hasClick') == null) {
				callPhoneEle.setAttribute('hasClick', 'true');
				callPhoneEle.addEventListener('tap', function(e) {
					var deal = showData[pos];
					plus.device.dial(deal.driver_tel, false);
					blackTrans.setAttribute('hidden', 'hidden');
					contactDialog.setAttribute('hidden', 'hidden');
					return false;
				}, false);
			}

			var contactCancelEle = document.getElementById('contactCancel');
			if (contactCancelEle.getAttribute('hasClick') == null) {
				contactCancelEle.setAttribute('hasClick', 'true');
				contactCancelEle.addEventListener('tap', function() {
					blackTrans.setAttribute('hidden', 'hidden');
					contactDialog.setAttribute('hidden', 'hidden');
					return false;
				}, false);
			}

			//投诉建议
			var complaints = $('.complaint');
			complaints.each(function(i, complaint) {
				if (complaint.getAttribute('hasClick') == null) {
					complaint.setAttribute('hasClick', 'true');
					complaint.addEventListener('tap', function() {
						pos = this.getAttribute('position');
						$scope.$apply(function() {
							$scope.complaints = complaintArr;
						});

						setTimeout(function() {
							blackTrans.removeAttribute('hidden');
							complaintsDialog.removeAttribute('hidden');
						}, 200);
						//点击改变选中背景
						$scope.selectComplaint = function(index) {
							if (complaintArr[index].classType == 'r_icon_checkmark_gray l') {
								complaintArr[index].classType = 'r_icon_checkmark_red l';
							} else {
								complaintArr[index].classType = 'r_icon_checkmark_gray l';
							}
						}
					}, false);
				}

			});

			var complaintConfirmEle = document.getElementById('complaintConfirm');
			if (complaintConfirmEle.getAttribute('hasClick') == null) {
				complaintConfirmEle.setAttribute('hasClick', 'true');
				complaintConfirmEle.addEventListener('tap', function(e) {
					console.log('点击了确认投诉按钮');
					confirmComplaint(showData[pos].id, mServer);
					return false;
				}, false);
			}


			var complaintCancelEle = document.getElementById('complaintCancel');
			if (complaintCancelEle.getAttribute('hasClick') == null) {
				complaintCancelEle.setAttribute('hasClick', 'true');
				complaintCancelEle.addEventListener('tap', function() {
					blackTrans.setAttribute('hidden', 'hidden');
					complaintsDialog.setAttribute('hidden', 'hidden');
					return false;
				}, false);
			}

			//协议详情
			var itemContents = $('.itemContent');
			itemContents.each(function(i, itemContent) {
				if (itemContent.getAttribute('hasClick') == null) {
					itemContent.setAttribute('hasClick', 'true');
					itemContent.addEventListener('tap', function() {
						pos = this.getAttribute('position');
						g.save2DB(g.storage_key.cur_deal_id, showData[pos].id); //保存需要查看详情的协议的id
						publicServer.goUrl('deal_detail.html');
					}, false);
				}

			});


		}, 200);

	}

	/**
	 * 显示服务  和  运力水平
	 * @param {Object} evalu
	 * @param {Object} growth
	 */
	function showImg(evalu, growth) {
		if (showData[pos].growth_level == '1') {
			growth.className = 'r_icon_yunli_chu';
		} else if (showData[pos].growth_level == '2') {
			growth.className = 'r_icon_yunli_zhong';
		} else if (showData[pos].growth_level == '3') {
			growth.className = 'r_icon_yunli_gao';
		} else if (showData[pos].growth_level == '4') {
			growth.className = 'r_icon_yunli_max';
		}

		if (showData[pos].evalu_level == '1') {
			if (showData[pos].evalu_num == '1') {
				evalu.className = 'r_icon_xinxing_1';
			} else if (showData[pos].evalu_num == '2') {
				evalu.className = 'r_icon_xinxing_2';
			} else if (showData[pos].evalu_num == '3') {
				evalu.className = 'r_icon_xinxing_3';
			} else if (showData[pos].evalu_num == '4') {
				evalu.className = 'r_icon_xinxing_4';
			} else if (showData[pos].evalu_num == '5') {
				evalu.className = 'r_icon_xinxing_5';
			}
		} else if (showData[pos].evalu_level == '2') {
			if (showData[pos].evalu_num == '1') {
				evalu.className = 'r_icon_gold_start_1';
			} else if (showData[pos].evalu_num == '2') {
				evalu.className = 'r_icon_gold_start_2';
			} else if (showData[pos].evalu_num == '3') {
				evalu.className = 'r_icon_gold_start_3';
			} else if (showData[pos].evalu_num == '4') {
				evalu.className = 'r_icon_gold_start_4';
			} else if (showData[pos].evalu_num == '5') {
				evalu.className = 'r_icon_gold_start_5';
			}
		} else if (showData[pos].evalu_level == '3') {
			if (showData[pos].evalu_num == '1') {
				evalu.className = 'r_icon_yinguan_1';
			} else if (showData[pos].evalu_num == '2') {
				evalu.className = 'r_icon_yinguan_2';
			} else if (showData[pos].evalu_num == '3') {
				evalu.className = 'r_icon_yinguan_3';
			} else if (showData[pos].evalu_num == '4') {
				evalu.className = 'r_icon_yinguan_4';
			} else if (showData[pos].evalu_num == '5') {
				evalu.className = 'r_icon_yinguan_5';
			}
		} else if (showData[pos].evalu_level == '4') {
			if (showData[pos].evalu_num == '1') {
				evalu.className = 'r_icon_gold_1';
			} else if (showData[pos].evalu_num == '2') {
				evalu.className = 'r_icon_gold_2';
			} else if (showData[pos].evalu_num == '3') {
				evalu.className = 'r_icon_gold_3';
			} else if (showData[pos].evalu_num == '4') {
				evalu.className = 'r_icon_gold_4';
			} else if (showData[pos].evalu_num == '5') {
				evalu.className = 'r_icon_gold_5';
			}
		} else if (showData[pos].evalu_level == '5') {
			if (showData[pos].evalu_num == '1') {
				evalu.className = 'r_icon_crown_1';
			} else if (showData[pos].evalu_num == '2') {
				evalu.className = 'r_icon_crown_2';
			} else if (showData[pos].evalu_num == '3') {
				evalu.className = 'r_icon_crown_3';
			} else if (showData[pos].evalu_num == '4') {
				evalu.className = 'r_icon_crown_4';
			} else if (showData[pos].evalu_num == '5') {
				evalu.className = 'r_icon_crown_5';
			}
		}

	}


	/**
	 * 确认申诉
	 * @param {Object} dealID
	 */
	function confirmComplaint(dealID, mServer) {
		var complaintId = '';
		for (var i = 0; i < complaintArr.length; i++) {
			if (complaintArr[i].classType == 'r_icon_checkmark_red l') {
				if (i == 0) {
					complaintId = complaintId + complaintArr[i].content;
				} else {
					complaintId = complaintId + ',' + complaintArr[i].content;
				}
			}
		}
		var params = [];

		params['uid'] = g.read2DB(g.storage_key.user_id);
		params['psd_time'] = g.read2DB(g.storage_key.user_token);
		params['deal_id'] = dealID;
		params['memo'] = complaintId;

		mServer.confirmComplaint(params, function(re) {
			console.log('申诉---' + JSON.stringify(re));
			if (re.sign == '20610') {
				//申诉成功
				plus.ui.toast('申诉成功');
				blackTrans.setAttribute('hidden', 'hidden');
				complaintsDialog.setAttribute('hidden', 'hidden');
			} else if (re.sign == '20612') {
				//不存在此协议
				mui.alert('您申诉的协议不存在!');
			} else if (re.sign == '20613') {
				//已经申诉过此协议
				mui.alert('您已经申诉过此协议!');
			} else if (re.sign == '99') {
				mui.toast('登录超时，请重新登录');
				setTimeout(function() {
					publicServer.goUrl('../member/quit.html');
				}, 1000);
			} else {
				mui.alert('申诉失败!');
			}
		}, function() {
			//联网失败
			console.log('====联网失败===我的协议申诉===');
		});

	}

	/**
	 * 确认协议完成
	 * @param {Object} dealId
	 * @param {Object} mServer
	 * @param {Object} uid
	 * @param {Object} psd_time
	 */
	function completeDeal(dealId, mServer, uid, psd_time, publicServer) {
		var params = [];

		params['uid'] = uid;
		params['psd_time'] = psd_time;
		params['deal_id'] = dealId;

		mServer.completeDeal(params, function(re) {
			console.error("deal---" + JSON.stringify(re));
			if (re.sign == '20630') {
				blackTrans.setAttribute('hidden', 'hidden');
				confirmDialog.setAttribute('hidden', 'hidden');
				//跳到已完成页面
				publicServer.goUrl('completeOrder.html');
				plus.ui.toast('确认收货完成');
			} else if (re.sign == '99') {
				mui.toast('登录超时，请重新登录');
				setTimeout(function() {
					publicServer.goUrl('../member/quit.html');
				}, 1000);
			} else {
				mui.alert('确认完成失败!');
			}
		}, function() {
			//错误返回
			console.log('====联网失败===我的协议确认收获===');
		});
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