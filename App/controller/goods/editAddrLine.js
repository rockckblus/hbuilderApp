define(function(require) {

	var g = require('../public/g.js');
	var tools = require('../public/tools.js');

	//topNav
	var topNav = require('../../directive/js/default/topNav.js');
	var fahuo_common = require('./fahuo_common.js');

	//预加载地址输入控件,父页面directive 方法
	var addAreaPre = require('../../directive/js/default/addAreaPre.js');

	require('../../../Public/js/moment.js');
	require('../../server/default/publicServer.js');
	//发货touch三级
	require("../../directive/js/goods/touchThreeFh.js");

	var saveInfo = [];

	g.app.controller('addeline', function($scope, publicServer) {

		$scope.addArea = 'eddArea';
		//读取历史数据
		getHistoryData();
		//初始化日历组件
		initCalendarF($scope, publicServer);
		//初始化装卸货地址
		showAddrF($scope, publicServer, 'first');



		//		setTimeout(function() {
		//			
		//		}, 100);

	});

	//为循环添加自定义的属性,目的为了赋值后的初始化操作
	g.app.directive('onFinishRenderFilters', function($timeout) {
		return {
			restrict: 'A',
			link: function(scope, element, attr) {
				if (scope.$last === true) {
					$timeout(function() {
						scope.$emit('ngRepeatFinished');
					});
				}
			}
		};
	});

	var initCalendar = [];
	var JsonData = {};
	/**
	 * 读取历史数据
	 */
	function getHistoryData() {
		var localdataStr = g.read2DB(g.storage_key.goods_info);
		console.log('历史数据---' + localdataStr);
		JsonData = jQuery.parseJSON(localdataStr);

		//获取历史数据中所有的时间
		var days = getTime(JsonData.address_list);
		//重构数据,使数据变成符合angular的module的格式,保存在saveInfo中

		//		var aa = JSON.stringify(days);
		//		console.log("--历史数据中的所有时间--"+aa);

		refactData(days, JsonData.address_list);
	}

	/**
	 * 初始化日历组件
	 * @param {Object} $scope
	 */
	function initCalendarF($scope, publicServer) {
		$scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
			var mySwiper = new Swiper('.swiper-container', {
				nextButton: '.button_next',
				prevButton: '.button_prev',
				slidesPerView: 7, //'auto'
				slidesPerGroup: 3,
				freeMode: true,
			});
		});

		//将历史数据显示在日历上
		initCalendar = buildDates();
		showHistoryTime($scope);
		$scope.dates = initCalendar;

		var aa = JSON.stringify(initCalendar);
		console.log("----" + aa);

		//日历每天的点击事件  i为数组的position,从0开始
		$scope.selectTime = function(i) {
			console.log('点击了日历');
			//保存当前页面的数据
			saveCurrData($scope);
			//改变日历当天的背景
			changeCaBg(initCalendar, $scope, i);
			//改变地址时间子页面内容
			showAddrF($scope, publicServer);

			//									var aa = JSON.stringify(saveInfo);
			//									console.log("----"+aa);
		}
	}

	/**
	 * 保存当前显示的数据  保存到saveInfo中
	 * @param {Object} $scope
	 */
	function saveCurrData($scope) {
		//判断当前显示的时间在saveInfo中是否存在,若存在,修改saveInfo中对应的值   若不存在,重建对象,添加到saveInfo中
		var time = isSelectDay(); //日历中当前选中的时间的对象
		if (time) {
			var obj = getDayFromSave(time.year, time.mouth, time.day);
			if (obj.isContain) {
				//找到了saveInfo中对应选中时间的装卸货地址,修改
				saveInfo[obj.index].startAddrLst = $scope.addrdata.startAddrLst;
				saveInfo[obj.index].endAddrLst = $scope.addrdata.endAddrLst;
			} else {
				//没找到saveInfo中对应选中时间的装卸货地址,新建
				var tmp = {};
				tmp.day = time.timeStr;
				tmp.startAddrLst = $scope.addrdata.startAddrLst;
				tmp.endAddrLst = $scope.addrdata.endAddrLst;
				saveInfo.push(tmp);
			}
		}

	}

	/**
	 * 根据日历组合中被选中的那一天找到saveInfo中与之相同的那一天,并将装卸货时间地址显示出来
	 * @param {Object} $scope
	 */
	function showAddrF($scope, publicServer, type, reEvent) {
		//找出日历数组中显示选中的那一天
		var time = isSelectDay(); //Calendar数组中被选中的那天的对象
		if (time) {
			var obj = getDayFromSave(time.year, time.mouth, time.day);
			//			var obj = getDayFromSave('2016', '02', '19');
			if (obj.isContain) {
				var showAddr = saveInfo[obj.index];
				$scope.addrdata = showAddr;
			} else {
				//在保存的数据中没找到对应的日期 ,将saveInfo中保存的最后一个对象复制一份重新保存到saveInfo中
				var tmp = {};
				tmp = clone(saveInfo[saveInfo.length - 1]);
				//				tmp = saveInfo[saveInfo.length - 1];
				tmp.day = time.timeStr;
				saveInfo.push(tmp);
				showAddrF($scope, publicServer);
			}
		}

		//重新绑定地址添加和编辑的点击事件
		if (type == 'first') {
			setTimeout(function() {
				tools.tools.hackGoUrl();
			}, 100);
		}
		var webViewId = plus.webview.currentWebview();
		mui.fire(webViewId, 'resBind');
		//添加点击事件
		if (type == 'first') {
			setOnClickEvent($scope, publicServer);
		}
		setTimeout(function() {
			if (reEvent != undefined) {
				reEvent();
			}
		}, 200);

	}



	/**
	 * 添加点击事件
	 */
	function setOnClickEvent($scope, publicServer) {
		//当天不发货点击事件
		document.getElementById('cancelToday').addEventListener('tap', function() {
			cancelToday($scope, publicServer);

		});
		//保存全部点击事件
		document.getElementById('saveAll').addEventListener('tap', function() {
			//保存当前显示页面的内容
			saveCurrData($scope);

			saveAll();
		});

		setTimeout(function() {

			//历史线路按钮
			document.getElementById('btn_commit').addEventListener('tap', function() {
				//跳转到历史线路页面
				publicServer.goUrl('historical_line.html');
			});

			//删除按钮点击事件//TODO
			var deleteAddrs = $('.r_icon_reduce_gray');
			deleteAddrs.each(function(i, deleteAddr) {
				deleteAddr.addEventListener('tap', function() {
					var position = this.getAttribute('position');
					var type = this.getAttribute('type');
					var btnArray = ['是', '否'];
					mui.confirm('您确定要取消该收货地址吗?', '取消确认', btnArray, function(e) {
						if (e.index == 0) {
							deleteAddrByPos($scope, position, type, publicServer);
						}
					});

					return false;
				}, false);
			});

		}, 300);

		//历史线路返回的监听事件
		window.addEventListener('history_back', function(event) {
			var addrLst = event.detail.data;
			if (event.detail.data) {
				showHisOnCurr($scope, addrLst);
			}
		});

		//地址编辑返回数据
		window.addEventListener('mapFirePre', function(event) {
			//			var str = JSON.stringify(event.detail);
			//			console.log("--地址编辑成功了--" + str);
			editAddr($scope, event.detail.addr, event.detail.preVal.startEnd, event.detail.preVal.no, event.detail.gps, event.detail.preVal.addClickValType, event.detail.tel, publicServer);

		});

		//选择时间返回信息
		window.addEventListener('timeInfo', function(event) {
			var result = event.detail.data;
			if (result) {
				var thisDate = g.read2DB(g.storage_key.goods_time_touch);
				var data = jQuery.parseJSON(thisDate);
				showSelectedTime(result.type, data, $scope, publicServer);
			}
		});
	}

	/**
	 * 编辑装卸货地址
	 * @param {Object} addr---地址信息
	 * @param {Object} type---装卸货类型
	 * @param {Object} pos---位置
	 * @param {Object} gps---gps
	 * @param {Object} editType---添加还是修改
	 */
	function editAddr($scope, addr, type, pos, gps, editType, tel, publicServer) {
		//为照顾老数据库,所以将saveInfo中所有的装卸货地址都修改
		if (type == 'start') {
			//装货地址
			//						$scope.$apply(function() {
			//							//				for (var i = 0; i < $scope.addrdata.startAddrLst.length; i++) {
			//							$scope.addrdata.startAddrLst[0].addr = addr;
			//							$scope.addrdata.startAddrLst[0].lat = gps.lat;
			//							$scope.addrdata.startAddrLst[0].lng = gps.lng;
			//							$scope.addrdata.startAddrLst[0].no = pos;
			//							$scope.addrdata.startAddrLst[0].psn_name = tel.psn_name;
			//							$scope.addrdata.startAddrLst[0].psn_tel = tel.psn_tel;
			//							//				}
			//						});
			//						console.log('vvvvvmmmmllll');
			//						var webViewId = plus.webview.currentWebview();
			//						mui.fire(webViewId, 'resBind');


			for (var s = 0; s < saveInfo.length; s++) {
				saveInfo[s].startAddrLst[0].addr = addr;
				saveInfo[s].startAddrLst[0].lat = gps.lat;
				saveInfo[s].startAddrLst[0].lng = gps.lng;
				saveInfo[s].startAddrLst[0].no = pos;
				saveInfo[s].startAddrLst[0].psn_name = tel.psn_name;
				saveInfo[s].startAddrLst[0].psn_tel = tel.psn_tel;
			}
		} else if (type == 'end') {
			//卸货地址
			for (var e = 0; e < saveInfo.length; e++) {
				if (editType == 'edit') {
					saveInfo[e].endAddrLst[pos - 1].addr = addr;
					saveInfo[e].endAddrLst[pos - 1].lat = gps.lat;
					saveInfo[e].endAddrLst[pos - 1].lng = gps.lng;
					saveInfo[e].endAddrLst[pos - 1].no = pos;
					saveInfo[e].endAddrLst[pos - 1].psn_name = tel.psn_name;
					saveInfo[e].endAddrLst[pos - 1].psn_tel = tel.psn_tel;
				} else if (editType == 'add') {
					//添加一个新的
					//					console.log('添加新的--' + pos);
					var tmp = {};
					tmp.addr = addr;
					tmp.lat = gps.lat;
					tmp.lng = gps.lng;
					tmp.no = saveInfo[e].endAddrLst.length;
					tmp.psn_name = tel.psn_name;
					tmp.psn_tel = tel.psn_tel;
					tmp.adrs_type = 2;
					tmp.clickType = 'edit';
					tmp.etime = saveInfo[e].endAddrLst[0].etime;
					tmp.img = 'r_icon_reduce_gray';
					tmp.stime = saveInfo[e].endAddrLst[0].stime;
					saveInfo[e].endAddrLst.splice(saveInfo[e].endAddrLst.length - 1, 0, tmp);
				}

			}
		}
		//重新显示
		if (editType == 'edit') {
			$scope.$apply(function() {
				showAddrF($scope, publicServer, '');
			});
		} else if (editType == 'add'){
			$scope.$apply(function() {
				showAddrF($scope, publicServer, '', function() {
					//给新添加的地址绑定点击事件
					var deles = document.getElementsByClassName('r_icon_reduce_gray');
					//				console.log(deles.length);
					deles[deles.length - 1].addEventListener('tap', function() {
						var position = this.getAttribute('position');
						var type = this.getAttribute('type');
						var btnArray = ['是', '否'];
						mui.confirm('您确定要取消该收货地址吗?', '取消确认', btnArray, function(e) {
							if (e.index == 0) {
								deleteAddrByPos($scope, position, type);
							}
						});
						return false;
					}, false);

				});
			});
		}


	}

	/**
	 * 删除某个地址
	 * @param {Object} position--删除第几个
	 * @param {Object} type--删除的是装货还是卸货
	 */
	function deleteAddrByPos($scope, position, type, publicServer) {
		if (type == 'start') {
			//装货
			//			$scope.$apply(function() {
			//				$scope.addrdata.startAddrLst.splice(position, 1);
			//			});
		} else if (type == 'end') {
			//卸货
			for (var i = 0; i < saveInfo.length; i++) {
				saveInfo[i].endAddrLst.splice(position, 1);
			}

			$scope.$apply(function() {
				//				$scope.addrdata.endAddrLst.splice(position, 1);
				showAddrF($scope, publicServer);
			});
		}
	}

	/**
	 * 显示选择的时间
	 * @param {Object} type
	 * @param {Object} data
	 */
	function showSelectedTime(type, data, $scope, publicServer) {
		//为适应老数据库,修改的时候改变所有的时间
		if (type == 'start') {
			for (var si = 0; si < saveInfo.length; si++) {
				for (var sj = 0; sj < saveInfo[si].startAddrLst.length; sj++) {
					saveInfo[si].startAddrLst[sj].stime = data.one.date;
					saveInfo[si].startAddrLst[sj].etime = data.one.time;
				}
			}
		} else if (type == 'end') {
			for (var ei = 0; ei < saveInfo.length; ei++) {
				for (var ej = 0; ej < saveInfo[ei].endAddrLst.length; ej++) {
					saveInfo[ei].endAddrLst[ej].stime = data.one.date;
					saveInfo[ei].endAddrLst[ej].etime = data.one.time;
				}
			}
		}
		//重新显示
		showAddrF($scope, publicServer);

		//		if (type == 'start') {
		//			$scope.$apply(function() {
		//				for (var i = 0; i < $scope.addrdata.startAddrLst.length; i++) {
		//					$scope.addrdata.startAddrLst[i].stime = data.one.date;
		//					$scope.addrdata.startAddrLst[i].etime = data.one.time;
		//				}
		//			});
		//		} else if (type == 'end') {
		//			$scope.$apply(function() {
		//				for (var i = 0; i < $scope.addrdata.endAddrLst.length; i++) {
		//					$scope.addrdata.endAddrLst[i].stime = data.one.date;
		//					$scope.addrdata.endAddrLst[i].etime = data.one.time;
		//				}
		//			});
		//		}
	}


	/**
	 * 将获取到的历史线路显示到当前页面
	 * @param {Object} addrLst
	 */
	function showHisOnCurr($scope, addrLst) {
		var startList = [];
		var endList = [];
		for (var i in addrLst) {
			if (addrLst[i].adrs_type == 1) {
				//装货地址
				var tmpStart = {};
				tmpStart.addr_id = '';
				tmpStart.goods_id = '';
				tmpStart.adrs_type = addrLst[i].adrs_type;
				tmpStart.adrs_level1 = '';
				tmpStart.adrs_level2 = '';
				tmpStart.adrs_level3 = '';
				tmpStart.addr = addrLst[i].adrs_detail;
				tmpStart.lat = addrLst[i].lat;
				tmpStart.lng = addrLst[i].lng;
				tmpStart.psn_name = addrLst[i].psn_name;
				tmpStart.psn_tel = addrLst[i].psn_tel;
				tmpStart.stime = '09:00';
				tmpStart.etime = '10:00';
				tmpStart.state = '01';
				tmpStart.no = addrLst[i].adrs_order;

				startList.push(tmpStart);
			} else if (addrLst[i].adrs_type == 2) {
				//卸货地址
				var tmpEnd = {};
				tmpEnd.addr_id = '';
				tmpEnd.goods_id = '';
				tmpEnd.adrs_type = addrLst[i].adrs_type;
				tmpEnd.adrs_level1 = '';
				tmpEnd.adrs_level2 = '';
				tmpEnd.adrs_level3 = '';
				tmpEnd.addr = addrLst[i].adrs_detail;
				tmpEnd.lat = addrLst[i].lat;
				tmpEnd.lng = addrLst[i].lng;
				tmpEnd.psn_name = addrLst[i].psn_name;
				tmpEnd.psn_tel = addrLst[i].psn_tel;
				tmpEnd.stime = '16:00';
				tmpEnd.etime = '17:00';
				tmpEnd.state = '01';
				tmpEnd.img = 'r_icon_reduce_gray';
				tmpEnd.clickType = 'edit';
				tmpEnd.no = addrLst[i].adrs_order;
				endList.push(tmpEnd);
			}
		}

		var addEnd = {
			addr: '添加卸货地址和联系人',
			psn_name: '',
			psn_tel: '',
			img: 'r_icon_add_gray',
			clickType: 'add',
			etime: '15:00',
			stime: '16:00',
			state: '01',
		};
		endList.push(addEnd);
		$scope.$apply(function() {
			delete $scope.addrdata.startAddrLst;
			delete $scope.addrdata.endAddrLst;
			$scope.addrdata.startAddrLst = startList;
			$scope.addrdata.endAddrLst = endList;
		});

	}

	/**
	 * 当天不发货
	 */
	function cancelToday($scope, publicServer) {
		//先保存当前页面显示的内容
		saveCurrData($scope);
		//先判断saveInfo中是否大于1,若大于1,取消当前选中的那天的所有内容,显示为上一次编辑的那一天(即线上saveInfo中保存的前一个数据),若等于1,提示
		if (saveInfo.length > 1) {
			//找出当前日历选中的日期
			var time = isSelectDay();
			if (time) {
				//从initCalendar中找出当天日期
				var obj = containYMD(time.timeStr);
				if (obj.is) {
					initCalendar[obj.index].cssSty = 'swiper-slide'; //将前天状态改为没有被选中
				}
				//找到save中对应日期的对象
				var obj = getDayFromSave(time.year, time.mouth, time.day);
				if (obj.isContain) {
//					console.log('找到了该天数据,并且删除');
					//saveInfo中保存了这一天的数据,删除该天的数据,显示前一天的数据
					saveInfo.splice(obj.index, 1);
					var data = saveInfo[saveInfo.length - 1];
					var timeStr = data.day;
					var o = containYMD(timeStr);
					if (o.is) {
						initCalendar[o.index].cssSty = 'swiper-slide selected';
					}
					$scope.$apply(function() {
						$scope.dates = initCalendar;
						showAddrF($scope, publicServer);
					});
				}
			}
		} else if (saveInfo.length == 1) {
			plus.ui.toast('至少要有一天发货');
		} else {

		}
	}

	/**
	 * 保存全部内容   将saveInfo中保存的数据转换为规定的数据结构,替换原来的数据保存到storage中
	 */
	function saveAll() {
		//TODO  
		var obj = info2DB();
		if (obj.result == -1) {
			//装卸货时间早于当前时刻TODO
			alert('装卸货时间不能早于当前时刻');
		} else if (obj.result == -2) {
			//卸货时间早于装货时间TODO
			alert('卸货时间不能早于装货时间');
		} else {
			delete JsonData.address_list;
			JsonData.address_list = obj.arr;
			if (saveInfo.length == 1) {
				JsonData.goods_info.goods_class = '1';
			} else if (saveInfo.length > 1) {
				JsonData.goods_info.goods_class = '21';
			}
			var JsonStr = JSON.stringify(JsonData);
			g.save2DB(g.storage_key.goods_info, JsonStr);

			//			console.log('保存的数据--' + JsonStr);

			var before = plus.webview.currentWebview().opener();
			mui.fire(before, 'back');

			mui.back();
		}
	}

	/**
	 * 将saveInfo中的数据改成storage中需要的格式
	 */
	function info2DB() {
		var obj = {};
		obj.arr = [];
		obj.result = 1;
		//对数据按照时间排序
		saveInfo = sortSaveInfo();
		//		var aa = JSON.stringify(saveInfo);
		//		console.log("--排序后--"+aa);
		for (var i = 0; i < saveInfo.length; i++) {
			var timeStr = saveInfo[i].day;
			var startAddrLst = saveInfo[i].startAddrLst;
			var endAddrLst = saveInfo[i].endAddrLst;
			for (var s = 0; s < startAddrLst.length; s++) {
				obj.result = dealAddr(obj.arr, startAddrLst[s], timeStr);
				if (obj.result == -1) {
					return obj;
				} else if (obj.result == -2) {
					return obj;
				}
			}
			for (var e = 0; e < endAddrLst.length - 1; e++) {
				obj.result = dealAddr(obj.arr, endAddrLst[e], timeStr);
				if (obj.result == -1) {
					return obj;
				} else if (obj.result == -2) {
					return obj;
				}
			}
		}
		return obj;
	}

	/**
	 * 将saveInfo中的数据按天排序
	 */
	function sortSaveInfo() {

		saveInfo.sort(function(a, b) {
			var i = parseInt(a.day);
			var j = parseInt(b.day);

			if (i < j) {
				return -1;
			} else if (i == j) {
				return 0;
			} else {
				return 1;
			}
		});

		//		for (var i = 0; i < saveInfo.length - 2; i++) {
		//			for (var j = i + 1; j < saveInfo.length - 1; j++) {
		//				if (saveInfo[i].day > saveInfo[j].day) {
		//					var tmp = saveInfo[i];
		//					saveInfo[i] = saveInfo[j];
		//					saveInfo[j] = tmp;
		//				}
		//			}
		//		}
		return saveInfo;
	}


	/**
	 * 将单个地址信息处理并填到新建的数组中
	 * @param {Object} arr
	 * @param {Object} addrInfo
	 * @param {Object} timeStr
	 */
	function dealAddr(arr, addrInfo, timeStr) {
		var year = moment(parseInt(timeStr) * 1000).format('YYYY');
		var mouth = moment(parseInt(timeStr) * 1000).format('MM');
		var day = moment(parseInt(timeStr) * 1000).format('DD');
		//根据详细地址,地址类型,联系人,联系人电话判断
		var obj = getDataFromDb(arr, addrInfo.addr, addrInfo.adrs_type, addrInfo.psn_name, addrInfo.psn_tel);
		if (obj.isContain) {
			//已经存在,添加
			var tmpTime = {};
			tmpTime.adrs_order = addrInfo.no;
			var stime = year + '-' + mouth + '-' + day + ' ' + addrInfo.stime + ':00.0';
			var etime = year + '-' + mouth + '-' + day + ' ' + addrInfo.etime + ':00.0';
			//判断如果日期小于当前日期,则提示日期早于当前日期  不能发货
			var stimeInt = parseInt(transdate(stime));
			var etimeInt = parseInt(transdate(etime));
			if (stimeInt < parseInt(Date.parse(new Date())) && etimeInt < parseInt(Date.parse(new Date()))) {
				//装卸货日期小于当前日期
				return -1;
			}
			//			else if (stimeInt > etimeInt) {
			//				//卸货日期小于装货日期
			//				return -2;
			//			} 
			else {
				tmpTime.stime = '' + stimeInt / 1000;
				tmpTime.etime = '' + etimeInt / 1000;
				tmpTime.time_rule = addrInfo.state;
				arr[obj.index].time.push(tmpTime);
			}
		} else {
			//不存在,新建
			var tmp = {};
			tmp.id = '';
			tmp.goods_id = '';
			tmp.adrs_type = addrInfo.adrs_type;
			tmp.adrs_level1 = addrInfo.adrs_level1;
			tmp.adrs_level2 = addrInfo.adrs_level2;
			tmp.adrs_level3 = addrInfo.adrs_level3;
			tmp.adrs_detail = addrInfo.addr;
			tmp.lat = addrInfo.lat;
			tmp.lng = addrInfo.lng;
			tmp.psn_name = addrInfo.psn_name;
			tmp.psn_tel = addrInfo.psn_tel;
			tmp.time = [];
			var objTime = {};
			objTime.adrs_order = addrInfo.no;
			var stime = year + '-' + mouth + '-' + day + ' ' + addrInfo.stime + ':00.0';
			var etime = year + '-' + mouth + '-' + day + ' ' + addrInfo.etime + ':00.0';
			//判断如果日期小于当前日期,则提示日期早于当前日期  不能发货
			var stimeInt = parseInt(transdate(stime));
			var etimeInt = parseInt(transdate(etime));
			if (stimeInt < parseInt(Date.parse(new Date())) && etimeInt < parseInt(Date.parse(new Date()))) {
				//装卸货日期小于当前日期 
				return -1;
			}
			//			else if (stimeInt < etimeInt) {
			//				//卸货日期小于装货日期
			//				return -2;
			//			} 
			else {
				objTime.stime = '' + stimeInt / 1000;
				objTime.etime = '' + etimeInt / 1000;
				objTime.time_rule = addrInfo.state;
				tmp.time.push(objTime);
			}
			arr.push(tmp);
		}
		return 1;
	}

	/**
	 * 判断转换的DB结构中是否包含该地址
	 * @param {Object} arr---DB数组
	 * @param {Object} addr---详细地址
	 * @param {Object} addr_type---地址类型
	 * @param {Object} psn_name---联系人
	 * @param {Object} psn_tel---联系人电话
	 * return {Object} obj {isContain: 是否包含,index: 包含的索引/不包含返回-1}
	 */
	function getDataFromDb(arr, addr, addr_type, psn_name, psn_tel) {
		var obj = {};
		obj.isContain = false;
		obj.index = -1;
		for (var i = 0; i < arr.length; i++) {
			if (arr[i].adrs_detail == addr && arr[i].adrs_type == addr_type && arr[i].psn_name == psn_name && arr[i].psn_tel == psn_tel) {
				obj.isContain = true;
				obj.index = i;
				return obj;
			}
		}
		return obj;
	}

	/**
	 * 根据年月日找出saveInfo中相同的那天
	 * @param {Object} year
	 * @param {Object} mouth
	 * @param {Object} day
	 * return {Object} obj {isContain: 是否包含,index: 包含的索引/不包含返回-1}
	 */
	function getDayFromSave(year, mouth, day) {
		var obj = {};
		obj.isContain = false;
		obj.index = -1;
		for (var i = 0; i < saveInfo.length; i++) {
			var saveY = moment(parseInt(saveInfo[i].day) * 1000).format('YYYY');
			var saveM = moment(parseInt(saveInfo[i].day) * 1000).format('MM');
			var saveD = moment(parseInt(saveInfo[i].day) * 1000).format('DD');
			if (saveD.substr(0, 1) == 0) { //01的话  要去掉前面的0
				saveD = saveD.substr(1, 1);
			} else {
				saveD = saveD;
			}
			if (year == saveY && saveM == mouth && day == saveD) {
				//找到了saveInfo中对应选中时间的装卸货地址
				obj.isContain = true;
				obj.index = i;
			}
		}
		return obj;

	}

	/**
	 * 日历中被选中的是哪一天
	 */
	function isSelectDay() {
		for (var i = 0; i < initCalendar.length; i++) {
			//			initCalendar[i].timeStr
			if (-1 != initCalendar[i].cssSty.indexOf('selected')) {
				return initCalendar[i];
			}
		}
		return null;
	}

	/**
	 * 将历史曾选中的日期显示在日历上
	 */
	function showHistoryTime($scope) {
		for (var i = 0; i < saveInfo.length; i++) {
			//循环保存的数据,改变日历与其重合的日期的背景
			var timeStr = saveInfo[i].day;
			//判断日历数组中是否有和其重合的,若有,返回在日历组合中的索引,返回false
			var isContain = containYMD(timeStr);
			if (isContain.is) {
				//包含,判断是否是最后一个,将最后一个设置为选中,其他的设置为发货
				if (i == (saveInfo.length - 1)) {
					initCalendar[isContain.index].cssSty = 'swiper-slide selected';
					var mouth = moment(parseInt(timeStr) * 1000).format('MM');
					var day = moment(parseInt(timeStr) * 1000).format('DD');
					$scope.mouth = mouth + "月" + day + "日";
				} else {
					initCalendar[isContain.index].cssSty = 'swiper-slide delivery';
				}
			} else {
				console.log('业务逻辑是走不到这里的,走到这里说明storage保存的数据的时间有在日历之前或者之后的');
				//不包含,说明数据在日历天数之前或者之后
				if (timeStr < initCalendar[0].timeStr) {
					//数据在日历的天数之前,将此数据删除再次显示页面
					saveInfo.splice(i, 1);
					showHistoryTime($scope)
				} else if (timeStr > initCalendar[initCalendar.length-1].timeStr) {
					//数据在日历天数之后,将此数据删除
					saveInfo.splice(i, 1);
					showHistoryTime($scope)
				}
			}
		}
	}

	/**
	 * 算法: 创建起始日期后的21天的日期数组
	 * @param {Object} $scope
	 */
	function buildDates() {
		var timeStr = Date.parse(new Date());
		var dates = [];
		for (var i = 0; i < 21; i++) {
			var tmpDate = {};
			tmpDate.year = moment(parseInt(timeStr)).format('YYYY'); //年
			tmpDate.mouth = moment(parseInt(timeStr)).format('MM'); //月
			var tmpDay = moment(parseInt(timeStr)).format('DD'); //日
			if (tmpDay.substr(0, 1) == 0) { //01的话  要去掉前面的0
				tmpDate.day = tmpDay.substr(1, 1);
			} else {
				tmpDate.day = tmpDay;
			}
			tmpDate.cssSty = 'swiper-slide';
			tmpDate.week = updateWeek(moment(parseInt(timeStr)).format('dddd')); //周

			tmpDate.timeStr = parseInt(timeStr) / 1000;
			dates.push(tmpDate);
			timeStr = timeStr + 86400000;
		}

		return dates;
	}

	/**
	 * 处理星期文本
	 * @param {Object} week  星期几
	 */
	function updateWeek(week) {
		switch (week) {
			case 'Sunday':
				return '星期日';
			case 'Monday':
				return '星期一';
			case 'Tuesday':
				return '星期二';
			case 'Wednesday':
				return '星期三';
			case 'Thursday':
				return '星期四';
			case 'Friday':
				return '星期五';
			case 'Saturday':
				return '星期六';
		}
	}

	/**
	 * 根据日历点击事件改变相对应的按钮的背景
	 * @param {Object} array--需要改变的数组
	 * @param {Object} $scope
	 * @param {Object} i--点击的日历的position
	 */
	function changeCaBg(array, $scope, i) {
		//循环遍历数组,将i对应的对象的cssSty属性改变为选中,并将当前选中的改为发货标识delivery
		for (var j = 0; j < array.length; j++) {
			//先将当前选中变为发货标识
			if (-1 != array[j].cssSty.indexOf('selected')) {
				array[j].cssSty = array[j].cssSty.concat(' delivery');
			}
			//再将除了被选中的其他天的选中状态取消
			if (j == i) {
				array[j].cssSty = array[j].cssSty.concat(' selected');
			} else {
				array[j].cssSty = array[j].cssSty.replace('selected', '');
			}
		}
		$scope.mouth = array[i].mouth + "月" + array[i].day + "日";
		$scope.dates = array;
	}

	/**
	 * 将存储的json结构转换为自己需要的结构,并保存到saveInfo中  
	 * @param {Object} days 需要显示的天,精确到秒的时间戳
	 * @param {Object} arr  从这里面取出地址数据
	 */
	function refactData(days, arr) {
		for (var i = 0; i < days.length; i++) {
			//判断该天是否是在当天之前
			if (!((parseInt(days[i]) * 1000) < (parseInt(Date.parse(new Date()))))) {

				var tmp = {};
				//不在当前时间之前
				//循环时间,找出所有该时间下的地址
				var day = moment(parseInt(days[i]) * 1000).format('MM/DD');
				//该天下的所有的装卸货地址
				var data = fahuo_common.init.getGoodsInfoByDate(arr, day);

				tmp.day = days[i];
				//装货
				tmp.startAddrLst = clone(data.startaddLst);
				//				tmp.startAddrLst = data.startaddLst;
				for (var s = 0; s < tmp.startAddrLst.length; s++) {
					tmp.startAddrLst[s].img = 'r_icon_reduce_gray';
				}
				//				var addStart = {
				//					addr: '添加装货地址和联系人',
				//					psn_name: '',
				//					psn_tel: '',
				//					img: 'r_icon_add_gray',
				//					etime: '09:00',
				//					stime: '10:00',
				//					state: '01',
				//				};
				//				tmp.startAddrLst.push(addStart);
				//卸货
				//				tmp.endAddrLst = data.endaddLst;
				tmp.endAddrLst = clone(data.endaddLst);
				for (var e = 0; e < tmp.endAddrLst.length; e++) {
					tmp.endAddrLst[e].img = 'r_icon_reduce_gray';
					tmp.endAddrLst[e].clickType = 'edit';
				}
				var addEnd = {
					addr: '添加卸货地址和联系人',
					psn_name: '',
					psn_tel: '',
					clickType: 'add',
					img: 'r_icon_add_gray',
					etime: '15:00',
					stime: '16:00',
					state: '01',
				};
				tmp.endAddrLst.push(addEnd);
				saveInfo.push(tmp);

			}
		}
		//				var aa = JSON.stringify(saveInfo);
		//				console.log("---saveInfo中数据----" + aa);
	}

	/**
	 * clone一个对象
	 * @param {Object} obj
	 */
	function clone(obj) {
		var o;
		if (typeof obj == "object") {
			if (obj === null) {
				o = null;
			} else {
				if (obj instanceof Array) {
					o = [];
					for (var i = 0, len = obj.length; i < len; i++) {
						o.push(clone(obj[i]));
					}
				} else {
					o = {};
					for (var k in obj) {
						o[k] = clone(obj[k]);
					}
				}
			}
		} else {
			o = obj;
		}
		return o;
	}

	/**
	 * 获取历史数据中的所有的时间段
	 * @param {Object} arr--历史地址信息
	 * return days--历史数据里的所有时间戳
	 */
	function getTime(arr) {
		var days = [];
		for (var i = 0; i < arr.length; i++) {
			var tmpTimeArr = arr[i].time;
			if (arr[i].adrs_type == 1) {
				//只判断装货地址
				for (var j = 0; j < tmpTimeArr.length; j++) {
					var tempTime = tmpTimeArr[j];
					var stime = tempTime.stime;
					var etime = tempTime.etime;
					if (!containTime(days, stime)) {
						days.push(stime);
					}
					if (!containTime(days, etime)) {
						days.push(etime);
					}
				}
			}
		}

		return days;
	}

	/**
	 * 判断arr数组中是否有和该时间戳同年月日
	 * @param {Object} arr
	 * @param {Object} time
	 */
	function containTime(arr, time) {
		var year = moment(parseInt(time) * 1000).format('YYYY');
		var mouth = moment(parseInt(time) * 1000).format('MM');
		var day = moment(parseInt(time) * 1000).format('DD');
		for (var i = 0; i < arr.length; i++) {
			var yearArr = moment(parseInt(arr[i]) * 1000).format('YYYY');
			var mouthArr = moment(parseInt(arr[i]) * 1000).format('MM');
			var dayArr = moment(parseInt(arr[i]) * 1000).format('DD');
			if (yearArr == year && mouthArr == mouth && dayArr == day) {
				return true;
			}
		}
		return false;
	}

	/**
	 * 判断日历数组中是否由此日期
	 * @param {Object} timeStr
	 */
	function containYMD(timeStr) {
		var year = moment(parseInt(timeStr) * 1000).format('YYYY');
		var mouth = moment(parseInt(timeStr) * 1000).format('MM');
		var day = moment(parseInt(timeStr) * 1000).format('DD');
		if (day.substr(0, 1) == 0) {
			day = day.substr(1, 1);
		}
		var isContain = {};
		isContain.is = false;
		isContain.index = -1;
		for (var i = 0; i < initCalendar.length; i++) {
			if (initCalendar[i].year == year && initCalendar[i].mouth == mouth && initCalendar[i].day == day) {
				isContain.is = true;
				isContain.index = i;
				return isContain;
			} else {
				continue;
			}
		}
		return isContain;
	}

	/**
	 * 将时间串转换为时间戳
	 * @param {Object} date  时间串格式为'2015-03-05 07:30:00.0'
	 */
	function transdate(date) {
		date = date.substring(0, 19);
		date = date.replace(/-/g, '/');
		var timestamp = new Date(date).getTime();
		return timestamp;
	}
});