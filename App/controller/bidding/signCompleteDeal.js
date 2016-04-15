define(function(require) {
	var g = require('../public/g.js');
	var tools = require('../public/tools.js');

	require('../../directive/js/default/topNav.js');
	require('../../../Public/js/moment.js');
	require('../../server/mServerData.js');
	require('../../server/default/publicServer.js');

	var topNav = require('../../directive/js/default/topNav.js');

	var dealInfo;

	g.app.controller('signOverCtrl', function($scope, mServer, publicServer) {
		dealInfo = jQuery.parseJSON(g.read2DB(g.storage_key.deal_push));
		console.error("dealInfo="+JSON.stringify(dealInfo));
		
		if (g.read2DB(g.storage_key.role_type)=='1'){
			$scope.pur_money = dealInfo.pur_money;
		}else{
			$scope.pur_money = parseInt(dealInfo.pur_money*dealInfo.rep_days);
			console.error("pur_money="+dealInfo.pur_money);
		}
		
		$scope.auto=g.read2DB(g.storage_key.autoSign);
		
		$scope.driver_name = dealInfo.driver_name;
		$scope.car_num = dealInfo.car_num;
		$scope.driver_tel = dealInfo.driver_tel;
		$scope.goods_type = dealInfo.goods_type;
		
		if (dealInfo.pay_type=='1'){
			$scope.pay_type = "担保支付";
		}else if (dealInfo.pay_type=='2'){
			$scope.pay_type = "每周结算";
		}else if (dealInfo.pay_type=='3'){
			$scope.pay_type = "现场结算";
		}
		
		document.getElementById('btnOver').addEventListener('tap', function() {
			goBack();
		});

		tools.tools.hackGoUrl();
	})
	
	function goBack(){
		var before2 = plus.webview.currentWebview().opener().opener();
		
		var before = plus.webview.currentWebview().opener();
		plus.webview.close(before);
		
		var clickObj = '{"pindex":"' + dealInfo.pindex + '","index":"' + dealInfo.index + '"}';
		mui.fire(before2, 'faqi_back', {
			data: clickObj
		});

		var curView = plus.webview.currentWebview();
		plus.webview.close(curView);
	}

	mui.back = function() {
		goBack();
	};
});