//发货用到的共通方法
define(function(require) {
	//全局对象，包括angular bodyAll 控制器
	var g = require('../public/g.js');
	var tools = require('../public/tools.js');

	var diffDay = 0; //前次发货日到当日的天数差
	var ifSrvData = true; //初期显示时，显示的是从服务器取得的数据时＝true，如果是从地址输入画面跳转回来时＝false
	var repDate = "";

	var init = {
		//去重复(输入是YYYY/MM/DD,输出是MM/DD)
		rmDouble: function(rep_date) {
			var n = {},
				r = []; //n为hash表，r为临时数组
			for (var i = 0; i < rep_date.length; i++) //遍历当前数组
			{
				if (!n[rep_date[i]]) //如果hash表中没有当前项
				{
					n[rep_date[i]] = true; //存入hash表
					r.push(rep_date[i]); //把当前数组的当前项push到临时数组里面
				}
			}

			//去掉重复之后，再按日期排序
			r.sort();

			var result = [];
			for (var i = 0; i < r.length; i++) {
				result.push(r[i].substr(5, 5));
			}

			return result;
		},
		/*显示发货日期 */
		assignFahuoDate: function(goods_info, ifSrvData) {
			var i = 0;
			var startaddLst = [],
				endaddLst = [],
				rep_date = [];

			//找出历史发货的第一日
			var firstDay = parseInt(goods_info.address_list[0].time[0].stime);
			for (i = 0; i < goods_info.address_list.length; i++) {
				for (j = 0; j < goods_info.address_list[i].time.length; j++) {
					if (parseInt(goods_info.address_list[i].time[j].stime) < firstDay) {
						firstDay = parseInt(goods_info.address_list[i].time[j].stime);
					}
				}
			}
			
			

			//如果当前时间<发货时间－2小时，则第一次发货日期为当日；否则为次日
			var curDate = Date.parse(new Date())/1000;
			if (ifSrvData) {
//				console.error("curDate="+curDate);
//				console.error("firstDay="+firstDay);
				
				diffDay = parseInt((curDate - firstDay ) / 86400+1);
//				console.error("diffDay="+diffDay);

//				console.error("hh="+moment(goods_info.address_list[0].time[0].stime * 1000).format('HH'));
//				console.error("mm="+moment(goods_info.address_list[0].time[0].stime * 1000).format('mm'));
//				console.error("hh2="+moment(curDate*1000).format('HH'));
//				console.error("hh2="+moment(curDate*1000).format('mm'));

				var first_time = moment(goods_info.address_list[0].time[0].stime * 1000).format('HH') * 60 + moment(goods_info.address_list[0].time[0].stime * 1000).format('mm');
				var cur_time = parseInt(moment(curDate*1000).format('HH') * 60 + moment(curDate*1000).format('mm'));
				
//				console.error("first_time="+first_time);
//				console.error("cur_time="+cur_time);
//				console.error("cur_time="+parseInt(cur_time + 2 * 60));
				
				if (parseInt(cur_time+2 * 60*60) > first_time) {
					diffDay = diffDay + 1;
				}
			} else {
				diffDay = 0;
			}
//			console.error("diffDay="+diffDay);

			for (i = 0; i < goods_info.address_list.length; i++) {
				for (j = 0; j < goods_info.address_list[i].time.length; j++) {
//					console.error("newTime0="+goods_info.address_list[i].time[j].stime);
					var newTime = parseInt(parseInt(goods_info.address_list[i].time[j].stime)+parseInt(diffDay * 24 * 60 * 60));
//					console.error("newTime="+newTime);
					var curDay = moment(newTime * 1000).format('YYYY/MM/DD');
					
					if (i==0)
						rep_date.push(curDay);
//					console.error("curDay="+curDay);

					//将新日期写回db
					if (ifSrvData) {
						goods_info.address_list[i].time[j].stime = newTime.toString();
						var newEndTime = parseInt(parseInt(goods_info.address_list[i].time[j].etime)+parseInt(diffDay * 24 * 60 * 60));
//						console.error("newEndTime="+newEndTime);
						goods_info.address_list[i].time[j].etime = newEndTime.toString();
					}
				}
			}

			g.save2DB(g.storage_key.goods_info, JSON.stringify(goods_info));
//console.error(rep_date);
			return rep_date;
		},

		//根据日期，取出那天的发货信息
		getGoodsInfoByDate: function(addLst, mmdd) {
			var dayInfo = {};
			var startaddLst = [],
				endaddLst = [];
			for (var i = 0; i < addLst.length; i++) {
				for (var j = 0; j < addLst[i].time.length; j++) {
					var curDay = moment(parseInt(addLst[i].time[j].stime) * 1000).format('MM/DD');

					if (curDay == mmdd || addLst[i].time.length == 1) { //=1表示普通货源，不验证日期
						try {
							var detail = {};

							detail.addr_id = addLst[i].id; //地址 id
							detail.goods_id = addLst[i].goods_id; //货物ID
							detail.adrs_type = addLst[i].adrs_type; //地址类型
							detail.adrs_level1 = addLst[i].adrs_level1; //一级地址
							detail.adrs_level2 = addLst[i].adrs_level2; //二级地址
							detail.adrs_level3 = addLst[i].adrs_level3; //三级地址

							detail.addr = addLst[i].adrs_detail; //全部的地址
							detail.lat = addLst[i].lat; //经纬度
							detail.lng = addLst[i].lng; //经纬度
							detail.psn_name = addLst[i].psn_name; //联系人姓名
							detail.psn_tel = addLst[i].psn_tel; //联系人电话
							//time里的
							detail.stime = moment(parseInt(addLst[i].time[j].stime) * 1000).format('HH:mm'); //装货时间
							detail.etime = moment(parseInt(addLst[i].time[j].etime) * 1000).format('HH:mm'); //卸货时间
							detail.state = addLst[i].time[j].time_rule; //如约,急,尽快

							//						detail.time_adrs_id = addLst[i].time[j].adrs_id; //时间里的adrs_id
							//						detail.time_id = addLst[i].time[j].id; //时间里的adrs_id
							//						detail.time_goods_id = addLst[i].time[j].goods_id; //时间里的goods_id

							//普通发货用
							detail.time = moment(parseInt(addLst[i].time[j].stime) * 1000).format('YYYY-MM-DD HH:mm');

							if (addLst[i].adrs_type == '1') {
								detail.no = i;//addLst[i].time[j].adrs_order; //地址order
								startaddLst.push(detail);
							} else {
								detail.no = i;//addLst[i].time[j].adrs_order;
								endaddLst.push(detail);
							}
						} catch (e) {}

					}
				}
			}

			//根据detail.no排序
			dayInfo.startaddLst = g.JsonSort(startaddLst, 'no');
			dayInfo.endaddLst = g.JsonSort(endaddLst, 'no');

			return dayInfo;
		}
	}

	var re = {
		init: init,
	}

	return re;
})