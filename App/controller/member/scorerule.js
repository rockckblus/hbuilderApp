/**

 * 附加服务页

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


	g.app.controller('ruleCtrl', function($http, $scope, memberDbMa, publicServer) {
		var fun = {
			getContent: function(page) {
				var paramter = [];
				paramter['usr_type'] = '1';

				memberDbMa.getScoreRule(paramter, function(re) {
					console.error(JSON.stringify(re));
					if (re.code == 'S') {
						$scope.banner = re.data.banner;
						$scope.context = re.data.context;
					} else if (re.code == 'T') {
						mui.toast('登录超时，请重新登录');
						setTimeout(function() {
							publicServer.goUrl('../member/quit.html');
						}, 1000);
					} else {
						mui.toast('连接服务器失败，稍后再试');
						$scope.addrsLst = [];
					}
					tools.tools.hackGoUrl();
				}, function() {
					mui.toast('连接服务器失败，稍后再试');
					tools.tools.hackGoUrl();
				});
			},



			init: function() {
				fun.getContent(1);
			}
		};

		/**
		 * 起始动作
		 * 15/12/22 */
		fun.init();
	});

})