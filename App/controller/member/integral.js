/**

 * 用户积分页

 * 15/10/25 */

define(function(require) {
	//全局对象，包括angular bodyAll 控制器
	var g = require('../public/g.js');
	var tools = require('../public/tools.js');

	//topNav
	var topNav = require('../../directive/js/default/topNav.js');

	require('../../server/member/memberData.Ma.js');
	require('../../../Public/js/moment.js');
	require('../../server/default/publicServer.js');



	var leftNav = require('../../directive/js/default/webView/leftNav/leftNav2.js');

	var totalPage = 1; //总页数
	var page = 1; //请求的页数
	var mUp;

	mui.ready(function() {
		//初始化下拉加载
		var ele = document.getElementById('score_content');
		mui(ele).pullToRefresh({
			up: {
				contentrefresh: '正在加载...',
				callback: pullupLoading
			}
		});
	});

	g.app.controller('scoreCtrl', function($http, $scope, memberDbMa, publicServer) {
		$scope.score_type = 1; //1－信誉积分 2-兑换积分

		var fun = {
			getContent: function(type) {
				//				console.log('执行了联网方法');
				if (type == 'first') {
					page = 1;
				} else if (type == 'loading') {
					if (page < totalPage) {
						page++;
					} else {
						plus.ui.toast("没有更多数据了");
						try {
							mUp.endPullUpToRefresh();
						} catch (e) {}
						return;
					}

				}
				var paramter = [];
				paramter['uid'] = g.read2DB(g.storage_key.user_id);
				paramter['psd_time'] = g.read2DB(g.storage_key.user_token);
				paramter['p'] = page;

				memberDbMa.getUserScore(paramter, function(re) {
					//					console.error("score=======" + JSON.stringify(re));
					if (re.code == 'S' && re.data != undefined) {
						if (type == 'first') {
							$scope.log1 = [];
							$scope.log2 = [];
						}

						$scope.credit_score = re.data.score.credit_score;
						$scope.exchange_score = re.data.score.exchange_score;
						$scope.level = re.data.score.level;
						$scope.nextstep = re.data.score.nextstep;

						g.save2DB(g.storage_key.credit_score, re.data.credit_score); //信誉积分
						g.save2DB(g.storage_key.exchange_score, re.data.exchange_score); //兑换积分
						g.save2DB(g.storage_key.level, re.data.level); //级别
						g.save2DB(g.storage_key.nextstep, re.data.nextstep); //距下一等级积分

						totalPage = re.data.totalPages;
						for (i = 0; i < re.data.log.length; i++) {
							if (re.data.log[i].credit_score != '0') {
								re.data.log[i].time = moment(re.data.log[i].add_time * 1000).format('YYYY/MM/DD HH:mm');
								$scope.log1.push(re.data.log[i]);
							}
							if (re.data.log[i].exchange_score != '0') {
								re.data.log[i].time = moment(re.data.log[i].add_time * 1000).format('YYYY/MM/DD HH:mm');
								$scope.log2.push(re.data.log[i]);
							}
						}
						console.error(JSON.stringify($scope.log1));
					} else if (re.code == 'T') {
						mui.toast('登录超时，请重新登录');
						setTimeout(function() {
							publicServer.goUrl('../member/quit.html');
						}, 1000);
					} else {
						mui.toast('非常抱歉，没有查到您的积分记录');
						$scope.addrsLst = [];
					}
					fun.show();
				}, function() {
					//					console.log('联网失败了');
					mui.toast('很抱歉，没有找到您的积分记录');
					$scope.addrsLst = [];
					tools.tools.hackGoUrl();
					console.error("222");
				});
			},

			bindElement: {
				init: function() {
					this.ui();

					//					$scope.credit_score = g.read2DB(g.storage_key.credit_score);
					//					$scope.exchange_score = g.read2DB(g.storage_key.exchange_score);
					//					$scope.level = g.read2DB(g.storage_key.level);
					//					$scope.nextstep = g.read2DB(g.storage_key.nextstep);
				},

				ui: function() {
					setTimeout(function() {
						document.getElementById('xinyu').addEventListener('tap', function() {
							if ($scope.score_type == 1) return;
							plus.nativeUI.showWaiting();

							document.getElementById('xinyu_txt').style.color = '#e6454a';
							document.getElementById('duihuan_txt').style.color = '#999';
							mui('.mui-scroll-wrapper').scroll().scrollTo(0, 0, 100);
							$scope.$apply(function() {
								$scope.score_type = 1;
								plus.nativeUI.closeWaiting();
							})
						});
					}, 400);

					setTimeout(function() {
						document.getElementById('duihuan').addEventListener('tap', function() {
							if ($scope.score_type == 2) return;
							plus.nativeUI.showWaiting();

							document.getElementById('xinyu_txt').style.color = '#999';
							document.getElementById('duihuan_txt').style.color = '#e6454a';
							mui('.mui-scroll-wrapper').scroll().scrollTo(0, 0, 100);
							$scope.$apply(function() {
								$scope.score_type = 2;
								plus.nativeUI.closeWaiting();
							})
						});
					}, 400);

					setTimeout(function() {
						document.getElementById('btn_commit').addEventListener('tap', function() {
							publicServer.goUrl('score_rule.html');
						});
					}, 400);

					//上拉加载事件
					window.addEventListener('loading', function(e) {
						//						console.log('触发了上拉加载------page======'+page);
						fun.getContent('loading');
					});
				},
			},

			show: function() {

				var pullUpEle = document.getElementsByClassName('mui-pull-bottom-wrapper');
				if (page == 1) {
					//第一次进入此画面
					setTimeout(function(){
						tools.tools.hackGoUrl();
					},200);
					console.error("11111");
				}
				if ($scope.score_type == 1) {
					if ($scope.log1.length < 14) {
						//只有一页数据
						pullUpEle[0].setAttribute('hidden', 'hidden');
					} else {
						pullUpEle[0].removeAttribute('hidden');
						try {
							mUp.endPullUpToRefresh();
						} catch (e) {}
					}
				} else if ($scope.score_type == 2) {
					if ($scope.log2.length < 14) {
						//只有一页数据
						pullUpEle[0].setAttribute('hidden', 'hidden');
					} else {
						pullUpEle[0].removeAttribute('hidden');
						try {
							mUp.endPullUpToRefresh();
						} catch (e) {}
					}
				}
			},


			goBack: function() {
				var before = plus.webview.currentWebview().opener();

				mui.fire(before, 'back', {
					data: ''
				});

				mui.back();
			},

			init: function() {
				fun.getContent('first');
				this.bindElement.init();
			}
		};

		/**
		 * 起始动作
		 * 15/12/22 */
		fun.init();
	});

	function pullupLoading() {
		mUp = this;
		var curr = plus.webview.currentWebview();
		mui.fire(curr, 'loading');
	}
})