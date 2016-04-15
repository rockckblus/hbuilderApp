/**
 * Created by rockblus on 15/12/30.
 * 发货touchThree，本地数据
 */
define(function(require) {
	var g = require('../../controller/public/g.js');

	require('../../../Public/js/moment.js');

	g.app.factory('touchThreeGhData', function() {


		var re = {

			/**
			 * 测试数据
			 * 16/1/4 */
			date: get21Days(),
			time: [ //此处应 判断 当前时间，与业务逻辑,动态 给时间
				'00:00',
				'00:30',
				'01:00',
				'01:30',
				'02:00',
				'02:30',
				'03:00',
				'03:30',
				'04:00',
				'04:30',
				'05:00',
				'05:30',
				'06:00',
				'06:30',
				'07:00',
				'07:30',
				'08:00',
				'08:30',
				'09:00',
				'09:30',
				'10:00',
				'10:30',
				'11:00',
				'11:30',
				'12:00',
				'12:30',
				'13:00',
				'13:30',
				'14:00',
				'14:30',
				'15:00',
				'15:30',
				'16:00',
				'16:30',
				'17:00',
				'17:30',
				'18:00',
				'18:30',
				'19:00',
				'19:30',
				'20:00',
				'20:30',
				'21:00',
				'21:30',
				'22:00',
				'22:30',
				'23:00',
				'23:30'
			],
			quick: [
				plus.io.convertLocalFileSystemURL("_www/Public/images/icon/icon_urgency.png"),
				plus.io.convertLocalFileSystemURL("_www/Public/images/icon/icon_cn_jingkuai.png"),
				plus.io.convertLocalFileSystemURL("_www/Public/images/icon/icon_cn_ruyue_green.png")
			],
			two: {
				/**
				 * 测试数据 tpl2
				 * 16/1/4 */
				date: [
					'00:00',
					'00:30',
					'01:00',
					'01:30',
					'02:00',
					'02:30',
					'03:00',
					'03:30',
					'04:00',
					'04:30',
					'05:00',
					'05:30',
					'06:00',
					'06:30',
					'07:00',
					'07:30',
					'08:00',
					'08:30',
					'09:00',
					'09:30',
					'10:00',
					'10:30',
					'11:00',
					'11:30',
					'12:00',
					'12:30',
					'13:00',
					'13:30',
					'14:00',
					'14:30',
					'15:00',
					'15:30',
					'16:00',
					'16:30',
					'17:00',
					'17:30',
					'18:00',
					'18:30',
					'19:00',
					'19:30',
					'20:00',
					'20:30',
					'21:00',
					'21:30',
					'22:00',
					'22:30',
					'23:00',
					'23:30'
				],
				time: [ //此处应 判断 当前时间，与业务逻辑,动态 给时间
					'00:00',
					'00:30',
					'01:00',
					'01:30',
					'02:00',
					'02:30',
					'03:00',
					'03:30',
					'04:00',
					'04:30',
					'05:00',
					'05:30',
					'06:00',
					'06:30',
					'07:00',
					'07:30',
					'08:00',
					'08:30',
					'09:00',
					'09:30',
					'10:00',
					'10:30',
					'11:00',
					'11:30',
					'12:00',
					'12:30',
					'13:00',
					'13:30',
					'14:00',
					'14:30',
					'15:00',
					'15:30',
					'16:00',
					'16:30',
					'17:00',
					'17:30',
					'18:00',
					'18:30',
					'19:00',
					'19:30',
					'20:00',
					'20:30',
					'21:00',
					'21:30',
					'22:00',
					'22:30',
					'23:00',
					'23:30'
				],
				quick: [
					plus.io.convertLocalFileSystemURL("_www/Public/images/icon/icon_urgency.png"),
					plus.io.convertLocalFileSystemURL("_www/Public/images/icon/icon_cn_jingkuai.png"),
					plus.io.convertLocalFileSystemURL("_www/Public/images/icon/icon_cn_ruyue_green.png")
				]
			}


		};
		return re;

	});


	/**
	 * 获取当天及其后21天的日期
	 */
	function get21Days() {
		var days = [];
		var currTimeStr = Date.parse(new Date()); //当前时间
		var currTimeInt = parseInt(currTimeStr);
		for (var i = 0; i < 21; i++) {
			var mouth = moment(currTimeInt).format('MM');
			var day = moment(currTimeInt).format('DD');
			var dayItem = mouth + '月' + day + '日';
			days.push(dayItem);
			currTimeInt = currTimeInt + 86400000;
		}
		return days;
	}
});