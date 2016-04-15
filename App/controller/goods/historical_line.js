/**
 * 货主发货首页
 * 15/10/25 */
define(function(require) {
	//全局对象，包括angular bodyAll 控制器
	var g = require('../public/g.js');
	var tools = require('../public/tools.js');
	//topNav
	var topNav = require('../../directive/js/default/topNav.js');

	require('../../server/goods/goodsInfo.js');
	require('../../server/default/publicServer.js');

	var mUp;
	var page = 1;
	var addrsLst = [];
	var totalPage;

	mui.ready(function() {
		//初始化下拉加载
		var ele = document.getElementById('history_refresh');
		mui(ele).pullToRefresh({
			up: {
				contentrefresh: '正在加载...',
				callback: pullupLoading
			}
		});
	});


	g.app.controller('historyCtrl', function($http, $scope, goodsDb,publicServer) {
		$scope.startaddLst = '';
		$scope.endaddLst = '';
		//第一站装货开始时间
		$scope.loadStartTime = '';
		//第一站卸货开始时间
		$scope.downStartTime = '';
		//最后一站装货开始时间
		$scope.loadEndTime = '';
		//最后一站卸货开始时间
		$scope.downEndTime = '';

		var fun = {
			getContent: function(type) {
				if (type == '') {
					//第一次加载
					page = 1;
				} else {
					//上拉加载
					if(page < totalPage){
						page++;
					}else{
						plus.ui.toast("没有更多数据了");
						try{
							mUp.endPullUpToRefresh();
						}catch(e){
						}
						return;
					}
					
				}

				var paramter = [];
				paramter['uid'] = g.read2DB(g.storage_key.user_id);
				paramter['psd_time'] = g.read2DB(g.storage_key.user_token);

				paramter['p'] = page;

				goodsDb.getGoodsLine(paramter, function(re) {
					console.error(re.count);
										console.error(JSON.stringify(re));
					if (re.code == 'S' && re.data != undefined) {
						console.log(re.data.totalPages);
						totalPage = re.data.totalPages;
						fun.dispScreen(re.data.list, type);

						setTimeout(function() {
							var useAddrs = $('.r_simple_button_red');
							useAddrs.each(function(i, useItem) {
								if (useItem.getAttribute('hasClick') == null) {
									useItem.setAttribute('hasClick', 'true');
									useItem.addEventListener('tap', function() {
										var index = parseInt(this.getAttribute('position'));
										fun.goBack(re.data.list[index].goodLst);
									}, false);
								}
							});
						}, 0);
					} else if (re.code == 'T') {
						mui.toast('登录超时，请重新登录');
						setTimeout(function() {
							publicServer.goUrl('../member/quit.html');
						}, 1000);
					} else if (re.code == 'F'){
						mui.toast(re.err_msg);
						$scope.addrsLst = [];
					}
					if (type == '') {
						tools.tools.hackGoUrl();
					}
				}, function() {
					mui.toast('很抱歉，没有找到您的历史发货记录');
					$scope.addrsLst = [];
					if (type == '') {
						tools.tools.hackGoUrl();
					}
				});
			},

			dispScreen: function(lineLst, type) {

				if (type == '') {
					addrsLst = [];
				}
				for (var i = 0; i < lineLst.length; i++) {
					var startaddLst = [],
						endaddLst = [];
					for (var j = 0; j < lineLst[i].goodLst.length; j++) {
						var detail = {};
						detail.adrs_type = lineLst[i].goodLst[j].adrs_type;
						detail.addr = lineLst[i].goodLst[j].adrs_detail;
						detail.index = lineLst[i].goodLst[j].adrs_order;
						detail.lat = lineLst[i].goodLst[j].lat;
						detail.lng = lineLst[i].goodLst[j].lng;
						detail.psn_name = lineLst[i].goodLst[j].psn_name;
						detail.psn_tel = lineLst[i].goodLst[j].psn_tel;

						if (detail.adrs_type == '1') {
							startaddLst.push(detail);
						} else {
							endaddLst.push(detail);
						}
					}

					var goodInfo = {};
					//根据detail.no排序
					goodInfo.startaddLst = g.JsonSort(startaddLst, 'index');
					goodInfo.endaddLst = g.JsonSort(endaddLst, 'index');

					addrsLst.push(goodInfo);
				}

				$scope.addrsLst = addrsLst;
				var pullUpEle = document.getElementsByClassName('mui-pull-bottom-wrapper');
				if (type == '') {
					pullUpEle[0].setAttribute('hidden', 'hidden');
				} else {
					pullUpEle[0].removeAttribute('hidden');
					if (type == 'loading') {
						mUp.endPullUpToRefresh();
					}
				}
			},

			/**
			 * bind事件 提升点击性能
			 * 15/12/23 */
			bindElement: {
				init: function() {
					this.ui();
				},

				ui: function() {
					//添加上拉加载的自定义事件
					window.addEventListener('loading', function(e) {
						fun.getContent('loading');
					});
					//添加newId自定义事件监听
					//					document.getElementById('btn_back').addEventListener('tap', function() {
					//						fun.goBack(null);
					//					})
				},
			},

			goBack: function(address) {
				var before = plus.webview.currentWebview().opener();

				mui.fire(before, 'history_back', {
					data: address
				});

				mui.back();
			},

			init: function() {
				fun.getContent('');
				this.bindElement.init();
			}
		};

		/**
		 * 起始动作
		 * 15/12/22 */
		fun.init();


	});

	/**
	 * 上拉加载
	 */
	function pullupLoading() {
		mUp = this;
		var curr = plus.webview.currentWebview();
		mui.fire(curr, 'loading');
	}
})