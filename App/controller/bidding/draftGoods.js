define(function(require) {
	var g = require('../public/g.js');
	var tools = require('../public/tools.js');

	require('../../directive/js/default/topNav.js');
	require('../../../Public/js/moment.js');

	var goodsType = require('../../server/mysql/goods_type.js');
	var carType = require('../../server/mysql/car_type.js');
	var topNav = require('../../directive/js/default/topNav.js');

	var result;
	var dragLst = [];

	g.app.controller('draftCtrl', function($scope) {
		showDraft($scope);
		tools.tools.hackGoUrl();
	})

	function showDraft($scope) {
		var dragNameList = g.read2DB(g.storage_key.all_fahuo);
		if (dragNameList == '') {
			mui.toast('您还没有将发货保存到待发布货源中过.');
			return;
		}

		//				console.error('dragNameList=' + dragNameList);

		result = dragNameList.split(",");
		for (var i = 0; i < result.length; i++) {
			if (result[i] != '' && g.read2DB(result[i]) != '') {
				//								console.error("good["+i+"]=" + result[i]);
				var dragObj = {};
				var goodJson = jQuery.parseJSON(g.read2DB(result[i]));
				dragObj.name = result[i];

				//				console.error(JSON.stringify(goodJson));

				if (goodJson.goods_price.goods_fare == "" || goodJson.goods_price.goods_fare == "0") {
					dragObj.price = "等待司机报价";
				} else {
					dragObj.price = goodJson.goods_price.goods_fare + "元"; //价格
				}
				dragObj.goods_class = goodJson.goods_info.goods_class;
				//				console.error("goods_class="+dragObj.goods_class);

				var fahuoDate = moment(goodJson.address_list[0].time[0].stime * 1000).format('YYYY/MM/DD HH:mm');
				dragObj.date = fahuoDate;

				var goods_type = tools.tools.getValueBykey(goodsType, goodJson.goods_info.goods_type);
				dragObj.goodsInfo = goods_type + "  " + goodJson.goods_info.weight + "吨  " + goodJson.goods_info.volume + "方";

				var select_car_type = tools.tools.getValAChilByKey(carType, goodJson.car_type.car_type, goodJson.car_type.car_shape);
				if (!select_car_type) {
					dragObj.car_type = "无要求";
				} else {
					dragObj.car_type = select_car_type.child + select_car_type.parent;
				}

				dragObj.startAdr = goodJson.address_list[0].adrs_detail;
				//				dragObj.endAdr = goodJson.address_list[goodJson.address_list.length - 1].adrs_detail;

				var endaddLst = [];
				for (var i = 0; i < goodJson.address_list.length; i++) {
					var addr = goodJson.address_list[i].adrs_detail;
					if (i < goodJson.address_list.length - 1) {
						endaddLst.push("第" + parseInt(i + 1) + "站：" + addr);
					} else
						endaddLst.push("最终站：" + addr);
				}
				dragObj.endaddLst=endaddLst;
				console.error(JSON.stringify(dragObj.endaddLst));

				dragLst.push(dragObj);
			}
		}
		$scope.dragLst = dragLst;

		setTimeout(function() {
			var delGoods = $('.btn_del');
			delGoods.each(function(i, delItem) {
				delItem.addEventListener('tap', function() {
					var index = parseInt(this.getAttribute('position'));

					var btnArray = ['是', '否'];
					mui.confirm('您确定要删除货源：' + result[index + 1], '删除确认', btnArray, function(e) {
						if (e.index == 0) {
							g.save2DB(result[index + 1], ""); //之所以+1,是因为最前面有逗号
							result.splice(index + 1, 1);
							dragLst.splice(index, 1); //这里不能+1

							$scope.$apply(function() {
								$scope.dragLst = dragLst;
							})
						}
					})
				}, false);
			});

			var pushGoods = $('.btn_push');
			pushGoods.each(function(i, pushItem) {
				pushItem.addEventListener('tap', function() {
					var index = parseInt(this.getAttribute('position'));

					var no = 0;
					for (var i = 0; i < result.length; i++) {
						if (result[i] != '' && g.read2DB(result[i]) != '') {
							if (no == index) {
								goBack(result[i]);
								return;
							} else {
								no++;
							}
						}
					}
				}, false);
			});
		}, 0);
	}

	function goBack(dragName) {
		var before = plus.webview.currentWebview().opener();

		mui.fire(before, 'drag_back', {
			data: dragName
		});

		mui.back();
	}
});