define(function(require) {
	var g = require('../public/g.js');
	var tools = require('../public/tools.js');

	require('../../directive/js/default/topNav.js');
	require('../../../Public/js/moment.js');
	require('../../server/mServerData.js');
	require('../../server/default/publicServer.js');

	var topNav = require('../../directive/js/default/topNav.js');

	g.app.controller('detailCtrl', function($scope, mServer, publicServer) {
		var before = plus.webview.currentWebview().opener();
//		console.error("before="+JSON.stringify(before));
		if (before.id.indexOf('mineOrder_main.html')>=0  || before.id.indexOf('completeOrder.html')>=0) {
			showDetail($scope, mServer, publicServer);
		} else {
			//发起协议时查看协议详情
			showFaqiDetail($scope, mServer, publicServer);
		}
	})

	function showFaqiDetail($scope, mServer, publicServer) {
		var dealInfo = jQuery.parseJSON(g.read2DB(g.storage_key.deal_push));

		var paramter = [];
		paramter['uid'] = g.read2DB(g.storage_key.user_id);
		paramter['psd_time'] = g.read2DB(g.storage_key.user_token);
		paramter['goods_id'] = dealInfo.gid;
		paramter['cz_id'] = dealInfo.cz_id;

//		console.error('uid=' + paramter['uid']);
//		console.error('psd_time=' + paramter['psd_time']);
//		console.error('goods_id=' + paramter['goods_id']);
//		console.error('cz_id=' + paramter['cz_id']);

		mServer.showDeal(paramter, function(re) {
			console.error("faqi="+JSON.stringify(re));
			tools.tools.hackGoUrl();
			if (re.code == 'S' && re.data != undefined) {
				dispScreenPro($scope, re.data);
			} else if (re.code == 'T') {
				mui.toast('登录超时，请重新登录');
				setTimeout(function() {
					publicServer.goUrl('../member/quit.html');
				}, 1000);
			} else {
				mui.toast('获取协议详情失败，请检查网络');
			}
		}, function() {
			tools.tools.hackGoUrl();
			mui.toast('获取协议详情失败，请检查网络');
		});
	}
	
	function getCount(str1, str2) {
		var r=new RegExp(str2,"gi");
  		return str1.match(r).length+1;
	}

	function dispScreenPro($scope, goodsInfo) {
//		console.error("json="+JSON.stringify(goodsInfo));
		$scope.hz_name = goodsInfo.hzInfo.hz_name;
		$scope.hz_sfz = goodsInfo.hzInfo.hz_sfz;
		$scope.hz_tel = goodsInfo.hzInfo.hz_tel;
		
		$scope.begin_name=goodsInfo.hzInfo.hz_name;
		$scope.begin_tel=goodsInfo.hzInfo.hz_tel;

		$scope.cz_name = goodsInfo.czInfo.cz_name;
		$scope.cz_sfz = goodsInfo.czInfo.cz_sfz;
		$scope.cz_tel = 'XXX XXX XXXXX';
		$scope.car_num = goodsInfo.czInfo.car_num;
		$scope.driver_name = goodsInfo.czInfo.driver_name;
		$scope.driver_tel = 'XXX XXX XXXXX';
		$scope.goods_name = goodsInfo.goodsInfo.goods_name;
		
		$scope.goods_class = goodsInfo.goodsInfo.goods_class;
		if (goodsInfo.goodsInfo.goods_class=="1"){
			$scope.money = goodsInfo.goodsInfo.money + "元(" + goodsInfo.goodsInfo.pay_type + ")";
		}else{
			$scope.day_nums = getCount(goodsInfo.goodsInfo.transport_time,",");
			$scope.money = goodsInfo.goodsInfo.total_money + "元(" + goodsInfo.goodsInfo.pay_type + ")";;
		}
		
		$scope.goods_weight = convertNum(goodsInfo.goodsInfo.goods_weight, 0);
		$scope.goods_square = convertNum(goodsInfo.goodsInfo.goods_square, 1);
		$scope.is_receipt = goodsInfo.goodsInfo.is_receipt;
		$scope.unload_need = goodsInfo.goodsInfo.unload_need;
		$scope.badrs = tools.verify.getAddr(goodsInfo.goodsInfo.begin_city, goodsInfo.goodsInfo.begin_area, goodsInfo.goodsInfo.begin_towns, goodsInfo.goodsInfo.begin_sadrs); //装货地址
		
		if (goodsInfo.goodsInfo.goods_class=="1"){
			$scope.load_time = moment(goodsInfo.goodsInfo.load_time * 1000).format('YYYY/MM/DD HH:mm');
			$scope.endtime = moment(goodsInfo.goodsInfo.endtime * 1000).format('YYYY/MM/DD HH:mm');
			$scope.transport_time ="";
		}else{
			$scope.transport_time = goodsInfo.goodsInfo.transport_time;
			$scope.load_time = goodsInfo.goodsInfo.stime;
			$scope.endtime = goodsInfo.goodsInfo.etime;
		}

		if (goodsInfo.goodsInfo.remark == "") $scope.remark = "无";
		else $scope.remark = goodsInfo.goodsInfo.remark;
//		console.error("endaddLst=" + JSON.stringify(goodsInfo.goodsInfo.eadrs));
		var endaddLst = [];
		for (var i = 0; i < goodsInfo.goodsInfo.eadrs.length; i++) {
//			var addr = tools.verify.getAddr(goodsInfo.goodsInfo.eadrs[i].end_city, goodsInfo.goodsInfo.eadrs[i].end_area, goodsInfo.goodsInfo.eadrs[i].end_towns, goodsInfo.goodsInfo.eadrs[i].end_sadrs);
//			if (i < goodsInfo.goodsInfo.eadrs.length - 1)
//				endaddLst.push("第" + parseInt(i + 1) + "站：" + addr);
//			else
//				endaddLst.push("最终站：" + addr);
				
			var endAdrObj={};
			var addr = tools.verify.getAddr(goodsInfo.goodsInfo.eadrs[i].end_city, goodsInfo.goodsInfo.eadrs[i].end_area, goodsInfo.goodsInfo.eadrs[i].end_towns, goodsInfo.goodsInfo.eadrs[i].end_sadrs);
			if (i < goodsInfo.goodsInfo.eadrs.length - 1) {
				endAdrObj.adr="第" + parseInt(i + 1) + "站：" + addr;
			} else{
				endAdrObj.adr="最终站：" + addr;
			}
			endAdrObj.shr_name=goodsInfo.goodsInfo.eadrs[i].shr_name;
			endAdrObj.shr_phone=goodsInfo.goodsInfo.eadrs[i].shr_phone;
			endaddLst.push(endAdrObj);
		}
		$scope.endaddLst = endaddLst;
		console.error("endaddLst=" + JSON.stringify(endaddLst));

		/* 协议种类编号
		 * 1 普通协议：担保支付无回单 ；打包：打包拆分后子协议，担保支付无回单
		 * 2 普通协议:担保支付有回单；打包：拆分后子协议，担保支付有回单
		 * 3 普通协议：月结无回单；打包：拆分后子协议，月结无回单
		 * 4 普通协议：月结有回单；打包：拆分后子协议，月结有回单
		 * 5 普通协议：现场结算无回单;打包：拆分后子协议，现场结算无回单
		 * 6 普通协议：现场结算有回单；打包：拆分后子协议，现场结算有回单
		 * 7 打包总协议
		 * 8 组配总协议和子协议*/
		var deal_type = 3;
		if (goodsInfo.goodsInfo.goods_class == '1') {
			if (goodsInfo.goodsInfo.pay_type == "担保支付") {
				if ($scope.is_receipt == "需要回单") deal_type = 2;
				else deal_type = 1;
			} else if (goodsInfo.goodsInfo.pay_type == "现场结算") {
				if ($scope.is_receipt == "需要回单") deal_type = 6;
				else deal_type = 5;
			} else {
				if ($scope.is_receipt == "需要回单") deal_type = 4;
				else deal_type = 3;
			}
		} else {
			deal_type = 7;
		}
//		console.error('goods_class='+goodsInfo.goodsInfo.goods_class);
//		console.error('deal_type='+deal_type);
		$scope.deal_type = deal_type;
	}

	function convertNum(value, type) {
		var showValue;
		if (!isNaN(value)) {
			var tmpValue = parseFloat(value);
			if (tmpValue == 0) showValue = ""; //"未填写";
			else showValue = parseFloat(value);
		} else if (value.length > 1) {
			var tail = value.substring(value.length - 1, value.length - 1);
			if ("吨" == tail || "方" == tail) {
				var tmpValue = parseFloat(value.substring(0, value.length() - 1));
				if (tmpValue == 0) showValue = ""; //"未填写";
				else {
					showValue = tmpValue + tail;
				}
			} else {
				showValue = ""; //"未填写";
			}
		} else {
			showValue = ""; //"未填写";
		}

		if (type == 0) {
			if (showValue != "") return showValue + "吨";
		} else {
			if (showValue != "") return showValue + "方";
		}
	}

	function showDetail($scope, mServer, publicServer) {
		var paramter = [];
		paramter['uid'] = g.read2DB(g.storage_key.user_id);
		paramter['psd_time'] = g.read2DB(g.storage_key.user_token);
		paramter['dealid'] = g.read2DB(g.storage_key.cur_deal_id);

		console.error('uid=' + paramter['uid']);
		console.error('psd_time=' + paramter['psd_time']);
		console.error('cur_deal_id=' + paramter['dealid']);

		mServer.viewDealDetail(paramter, function(re) {
			console.error("协议详情---" + JSON.stringify(re));
			if (re.sign == '3060') {
				dispScreen($scope, re);
				tools.tools.hackGoUrl();
			} else if (re.sign == '99') {
				tools.tools.hackGoUrl();
				mui.toast('登录超时，请重新登录');
				setTimeout(function() {
					publicServer.goUrl('../member/quit.html');
				}, 1000);
			} else {
				tools.tools.hackGoUrl();
				mui.toast('获取协议详情失败1，请检查网络');
			}
		}, function() {
			tools.tools.hackGoUrl();
			mui.toast('获取协议详情失败2，请检查网络');
		});
	}

	function dispScreen($scope, goodsInfo) {
//				console.error("goodsInfo"+JSON.stringify(goodsInfo));
		$scope.hz_name = goodsInfo.deal_info.hz_name;
		$scope.hz_sfz = goodsInfo.deal_info.hz_code;
		$scope.hz_tel = goodsInfo.deal_info.hz_tel;

		$scope.cz_name = goodsInfo.deal_info.cz_name;
		$scope.cz_sfz = goodsInfo.deal_info.cz_card;
		$scope.cz_tel = goodsInfo.deal_info.cz_tel;
		$scope.car_num = goodsInfo.deal_info.car_num;
		$scope.driver_name = goodsInfo.deal_info.driver_name;
		$scope.driver_tel = goodsInfo.deal_info.driver_tel;
		
		$scope.begin_name=goodsInfo.deal_info.begin_name;
		$scope.begin_tel=goodsInfo.deal_info.begin_tel;

		$scope.goods_name = goodsInfo.deal_info.goods_name;
		$scope.money = goodsInfo.deal_info.order_mny + "元(" + goodsInfo.deal_info.pay_type + ")";
		$scope.goods_class = "1";  //这显示的是订单，打包的也已经拆分了
		
		$scope.goods_weight = convertNum(goodsInfo.deal_info.goods_weight, 0);
		$scope.goods_square = convertNum(goodsInfo.deal_info.goods_square, 1);
		$scope.is_receipt = goodsInfo.deal_info.is_receipt;
		$scope.unload_need = goodsInfo.deal_info.unload_need;
		$scope.badrs = tools.verify.getAddr(goodsInfo.deal_info.begin_city, goodsInfo.deal_info.begin_area, goodsInfo.deal_info.begin_towns, goodsInfo.deal_info.begin_sadrs); //装货地址
//		$scope.load_time = moment(goodsInfo.deal_info.load_time * 1000).format('YYYY/MM/DD HH:mm');
//		$scope.endtime = moment(goodsInfo.deal_info.endtime * 1000).format('YYYY/MM/DD HH:mm');

		if (goodsInfo.deal_info.goods_class=="1"){
			$scope.load_time = moment(goodsInfo.deal_info.load_time * 1000).format('YYYY/MM/DD HH:mm');
			$scope.endtime = moment(goodsInfo.deal_info.endtime * 1000).format('YYYY/MM/DD HH:mm');
			$scope.transport_time ="";
		}else{
			$scope.transport_time = goodsInfo.deal_info.transport_time;
			$scope.load_time = goodsInfo.deal_info.stime;
			$scope.endtime = goodsInfo.deal_info.etime;
		}

		if (goodsInfo.deal_info.remark == "") $scope.remark = "无";
		else $scope.remark = goodsInfo.deal_info.remark;
		var endaddLst = [];
		for (var i = 0; i < goodsInfo.deal_info.eadrs.length; i++) {
			var endAdrObj={};
			var addr = tools.verify.getAddr(goodsInfo.deal_info.eadrs[i].end_city, goodsInfo.deal_info.eadrs[i].end_area, goodsInfo.deal_info.eadrs[i].end_towns, goodsInfo.deal_info.eadrs[i].end_sadrs);
			if (i < goodsInfo.deal_info.eadrs.length - 1) {
				endAdrObj.adr="第" + parseInt(i + 1) + "站：" + addr;
			} else{
				endAdrObj.adr="最终站：" + addr;
			}
			endAdrObj.shr_name=goodsInfo.deal_info.eadrs[i].shr_name;
			endAdrObj.shr_phone=goodsInfo.deal_info.eadrs[i].shr_phone;
			endaddLst.push(endAdrObj);
		}
		$scope.endaddLst = endaddLst;

		/* 协议种类编号
		 * 1 普通协议：担保支付无回单 ；打包：打包拆分后子协议，担保支付无回单
		 * 2 普通协议:担保支付有回单；打包：拆分后子协议，担保支付有回单
		 * 3 普通协议：月结无回单；打包：拆分后子协议，月结无回单
		 * 4 普通协议：月结有回单；打包：拆分后子协议，月结有回单
		 * 5 普通协议：现场结算无回单;打包：拆分后子协议，现场结算无回单
		 * 6 普通协议：现场结算有回单；打包：拆分后子协议，现场结算有回单
		 * 7 打包总协议
		 * 8 组配总协议和子协议*/
		var deal_type = 3;
		if (goodsInfo.deal_info.pay_type == "担保支付") {
			if ($scope.is_receipt == "需要回单") deal_type = 2;
			else deal_type = 1;
		} else if (goodsInfo.deal_info.pay_type == "现场结算") {
			if ($scope.is_receipt == "需要回单") deal_type = 6;
			else deal_type = 5;
		} else {
			if ($scope.is_receipt == "需要回单") deal_type = 4;
			else deal_type = 3;
		}

		$scope.deal_type = deal_type;
		
		tools.tools.hackGoUrl();
	}
});