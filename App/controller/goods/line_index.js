/**
 * 货主发货首页
 * 15/10/25 */
define(function(require) {
	//全局对象，包括angular bodyAll 控制器
	var g = require('../public/g.js');
	var tools = require('../public/tools.js');
	//topNav
	var topNav = require('../../directive/js/default/topNav.js');
	//侧栏
	var leftNav = require('../../directive/js/default/webView/leftNav/leftNav.js');
	//预加载地址输入控件,父页面directive 方法
	var addAreaPre;
	if (g.read2DB(g.storage_key.role_type) == '1') {
		addAreaPre = require('../../directive/js/default/addAreaPre.js');
	}

	//div移动控件
	var moveobj = require('../../directive/js/default/block/moveObj.js');

	//照片控件
	var Photo = require('../../server/default/photo.js');

	var fahuo_common = require('./fahuo_common.js');

	require('../../../Public/js/mui.poppicker.js');
	require('../../../Public/js/mui.picker.js');

	require('../../server/goods/goodsInfo.js');
	require('../../../Public/js/moment.js');
	//	require('./canvasResize.js');
	//	require('./binaryajax.js');
	//	require('./exif.js');

	var goodsType = require('../../server/mysql/goods_type.js');
	var carType = require('../../server/mysql/car_type.js');
	var servicesType = require('../../server/mysql/goods_service_class.js');
	var carData = require('../../server/mysql/car_type.js');
	require('../../server/default/publicServer.js');

	g.app.controller('fahuoCtrl', function($http, $scope, goodsDb, photo, publicServer) {

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

		//车型
		$scope.car_type = '';
		$scope.car_shape = '';
		$scope.car_qty = 1; //车辆数量默认1

		//货物信息
		$scope.goods_type = '';
		$scope.weight = '';
		$scope.volume = '';
		$scope.goodsImg = '';

		//附加服务
		$scope.serviceLst = '';
		$scope.newService = '';

		//出价
		$scope.price = 0;

		//结算类型
		$scope.pay_type = '';

		//ui
		$scope.ui = {
			more: {
				downPart: false //扩展下拉div
			},

			/**
			 * 声明判断浏览器是否隐藏变量,默认打开浏览器滚动
			 * 15/12/22 */
			trueScoller: true,
		};

		//piker
		var carPicker = new mui.PopPicker({
			layer: 2
		});

		//		var diffDay = 0; //前次发货日到当日的天数差
		var ifSrvData = true; //初期显示时，显示的是从服务器取得的数据时＝true，如果是从地址输入画面跳转回来时＝false
		//		var repDate = "";

		var fun = {
			getContent: function() {
				var paramter = [];
				paramter['uid'] = g.read2DB(g.storage_key.user_id);
				paramter['psd_time'] = g.read2DB(g.storage_key.user_token);
				console.error("uid=" + paramter['uid']);
				console.error("psd_time=" + paramter['psd_time']);

				goodsDb.getGoodsDetail(paramter, function(re) {
					console.error("history=" + JSON.stringify(re));
					g.save2DB(g.storage_key.yi_chang, "");
					g.save2DB(g.storage_key.yi_kuan, "");
					g.save2DB(g.storage_key.yi_gao, "");
					if (re.code == 'S' && re.data != undefined) {
						//临时的，把1，2，3级地址放到详细地址里
						for (var i = 0; i < re.data.address_list.length; i++) {
							re.data.address_list[i].adrs_detail = tools.verify.getAddr(re.data.address_list[i].adrs_level1, re.data.address_list[i].adrs_level2, re.data.address_list[i].adrs_level3, re.data.address_list[i].adrs_detail);
						}

						if (re.data.goods_price.goods_fare == "0") re.data.goods_price.goods_fare = "";

						//出现过一个现象，货物名称=undefine
						if (re.data.goods_info.goods_type == undefined) re.data.goods_info.goods_type = "0";
						if (re.data.goods_info.goods_name == undefined) {
							re.data.goods_info.goods_name = "其它货物";
							re.data.goods_info.goods_type = "0";
						}

						g.save2DB(g.storage_key.goods_info, JSON.stringify(re.data));

						fun.dispScreen();
						plus.navigator.closeSplashscreen(); //关闭启动
						tools.tools.hackGoUrl();
					} else if (re.code == 'T') {
						mui.toast('登录超时，请重新登录');
						setTimeout(function() {
							publicServer.goUrl('../member/quit.html');
						}, 1000);
					} else {
						//						console.error("net error....");
//						setTimeout(function() {
//							plus.nativeUI.showWaiting();
//						}, 1000);

						fun.getGpsFromArea();
					}
				}, function() {
//					setTimeout(function() {
//						plus.nativeUI.showWaiting();
//					}, 1000);
					/**
					 * api错误
					 * 监听地图控件页面传回的 gps地址
					 * 16/1/19 */
					fun.getGpsFromArea();
				});
			},

			dispAddrInfo: function(addLst, index) {
				//某天的地址时间联系人
				var dayAddress = fahuo_common.init.getGoodsInfoByDate(addLst, $scope.rep_date[index]);
				//				console.error(JSON.stringify(dayAddress));

				$scope.startaddLst = dayAddress.startaddLst;

				$scope.endaddLst = dayAddress.endaddLst;
				$scope.lastAddr = dayAddress.endaddLst[dayAddress.endaddLst.length - 1];

				//				console.error('end=' + JSON.stringify(dayAddress.endaddLst));
				$scope.endaddLstNums = dayAddress.endaddLst.length - 1;

				//第一站装货开始时间
				$scope.loadStartTime = dayAddress.startaddLst[0].stime;
				//最后一站卸货开始时间
				$scope.downStartTime = dayAddress.endaddLst[dayAddress.startaddLst.length - 1].stime;

				//最后一站装货开始时间(新db这里需要改，这里暂时认为只有一个发货地址)
				$scope.loadEndTime = dayAddress.startaddLst[0].etime;
				//最后一站卸货开始时间
				$scope.downEndTime = dayAddress.endaddLst[dayAddress.endaddLst.length - 1].etime;
			},

			/*显示发货日期 */
			assignFahuoDate: function(goods_info) {
				var rep_date = fahuo_common.init.assignFahuoDate(goods_info, ifSrvData);
				ifSrvData = false;

				//如果是线路竞标的货主，还需要将重复日期删除
				$scope.rep_date = fahuo_common.init.rmDouble(rep_date);
				$scope.curIndex = 0;

				//repDate = JSON.stringify($scope.rep_date);
				//某天的地址时间联系人
				//				console.error("add=" + JSON.stringify(goods_info.address_list));
				fun.dispAddrInfo(goods_info.address_list, $scope.curIndex);

				fun.addAdrsListener();
			},

			/**
			 *  分配车型
			 * 15/12/22 */
			assignCarType: function(re) {
				try {
					var select_car_type = tools.tools.getValAChilByKey(carType, re.car_type.car_type, re.car_type.car_shape);

					if (!select_car_type) {
						$scope.car_type = "请选择";
						$scope.car_shape = "";
						$scope.car_qty = "1";
					} else {
						$scope.car_type = select_car_type.parent;
						$scope.car_shape = select_car_type.child;
						$scope.car_qty = re.car_type.car_qty;
					}
				} catch (e) {
					console.error('error', e);
				}
			},

			/**
			 * 分配附加服务
			 * 15/12/22 */
			assingService: function(re) {
				try {
					$scope.newService = "";
					var serviceLst = [];
					if (re.add_service.length == 0) {
						var serviceItem = {};
						serviceItem.service_name = '请选择';
						serviceLst.push(serviceItem);
					} else {
						for (i = 0; i < re.add_service.length; i++) {
							var serviceItem = {};
							serviceItem.service_code = re.add_service[i].service_code;
							serviceItem.value = re.add_service[i].value;
							if (re.add_service[i].service_code == '1000') {
								var pos = serviceItem.value.indexOf("\n");
								if (pos > 0) {
									$scope.newService = serviceItem.value.substring(0, pos) + "...";
								} else {
									$scope.newService = serviceItem.value;
								}
							} else {
								serviceItem.service_name = tools.tools.getValueBykey(servicesType, re.add_service[i].service_code);
								serviceLst.push(serviceItem);
							}
						}
					}

					$scope.serviceLst = serviceLst;
					if (serviceLst.length == 0 && $scope.newService != "") {
						document.getElementById('add_srv1').style.display = 'none';
					} else if ($scope.newService == "") {
						document.getElementById('add_srv_br').style.display = 'none';
					} else {
						document.getElementById('add_srv1').style.display = 'none';
					}

				} catch (e) {
					console.error('error', e);
				}
			},

			/**
			 * 分配货物信息
			 * 15/12/22 */
			assignGoodInfo: function(re) {
				try {
					$scope.goods_type = tools.tools.getValueBykey(goodsType, re.goods_info.goods_type); //货物类型

					if (!$scope.goods_type) {
						$scope.goods_type = "请选择";
						$scope.weight = ""; //重
						$scope.volume = ""; //方
						$scope.price = 0; //价格
						$scope.yixing = "";
						$scope.pay_type = "请选择";
						$scope.goods_pic = '';
						$scope.line_name = '';
					} else {
						$scope.line_name = re.goods_info.line_name;

						$scope.weight = re.goods_info.weight; //重
						if ($scope.weight == "0.") $scope.weight = "";

						$scope.volume = re.goods_info.volume; //方
						if ($scope.volume == "0.") $scope.volume = "";

						$scope.goods_pic = re.goods_info.goods_pic;
						$scope.price = parseInt(re.goods_price.goods_fare); //价格

						//异形件
						var chang = g.read2DB(g.storage_key.yi_chang);
						var kuan = g.read2DB(g.storage_key.yi_kuan);
						var gao = g.read2DB(g.storage_key.yi_gao);

						if (chang != "" || kuan != "" || gao != "") {
							$scope.yixing = "异形件：";
							if (chang != "") {
								$scope.yixing = $scope.yixing + "长约" + chang + "米;";
							}
							if (kuan != "") {
								$scope.yixing = $scope.yixing + "宽约" + kuan + "米;";
							}
							if (gao != "") {
								$scope.yixing = $scope.yixing + "高约" + gao + "米;";
							}
						} else {
							$scope.yixing = "";
						}
//console.error("price="+JSON.stringify(re.goods_price));
						//结算方式
						if (re.goods_price.pay_type == '1') {
							$scope.pay_type = '担保支付';
						} else if (re.goods_price.pay_type == '2') {
							$scope.pay_type = '每周结算';
						} else if (re.goods_price.pay_type == '3') {
							$scope.pay_type = '现场结算';
						}
					}
				} catch (e) {
					console.error('error', e);
				}
			},

			/**
			 * 分配默认模型vale
			 * 15/12/22 */
			assingDefault: function(curPos) {
				var curDate = Date.parse(new Date());

				$scope.rep_dat = [];
				$scope.rep_dat.push(moment((curDate + 2 * 60 * 60 * 1000)).format('MM/DD'));

				var fahuoDate = moment((curDate + 2 * 60 * 60 * 1000)).format('YYYY/MM/DD HH:00');
				fahuoDate = (new Date(fahuoDate).getTime() / 1000).toString();

				var xiehuoDate = moment((curDate + 6 * 60 * 60 * 1000)).format('YYYY/MM/DD HH:00');
				xiehuoDate = (new Date(xiehuoDate).getTime() / 1000).toString();

				var owerID = g.read2DB(g.storage_key.owner_id);
				var userID = g.read2DB(g.storage_key.user_id);
				var payType = g.read2DB(g.storage_key.pay_type);
				var tel = g.read2DB(g.storage_key.telphone);
				var realName = g.read2DB(g.storage_key.real_name);
				if (realName == '') realName = '未知';

				var nullData = '{"goods_base":{"id":"","owner_uid":"' + owerID + '","sendgoods_uid":"' + userID +
					'","sign_id":"","opr_uid":"' + userID + '","goods_state":"01","addtime":"' +
					curDate + '","update_time":"' + curDate + '","opr_type":"0"},' +
					'"address_list":[{"id":"","goods_id":"","adrs_type":"1","adrs_level1":"",' +
					'"adrs_level2":"","adrs_level3":"","adrs_detail":"' + curPos.address + '",' +
					'"lat":"' + curPos.lat + '","lng":"' + curPos.lng + '","psn_name":"' + realName + '","psn_tel":"' + tel + '","adrs":"",' +
					'"time":[{"id":"","goods_id":"","adrs_id":"","adrs_order":"1","stime":"' + fahuoDate +
					'","etime":"' + fahuoDate + '","time_rule":"01"}]},' +
					'{"id":"","goods_id":"","adrs_type":"2","adrs_level1":"",' +
					'"adrs_level2":"","adrs_level3":"","adrs_detail":"' + curPos.address + '",' +
					'"lat":"' + curPos.lat + '","lng":"' + curPos.lng + '","psn_name":"' + realName + '","psn_tel":"' + tel + '","adrs":"",' +
					'"time":[{"id":"","goods_id":"","adrs_id":"","adrs_order":"1","stime":"' + xiehuoDate +
					'","etime":"' + xiehuoDate + '","time_rule":"01"}]}' +
					'],"goods_info":{"goods_id":"",' +
					'"goods_name":"","goods_type":"1","goods_pic":"","weight":"","volume":""},' +
					'"add_service":[],"car_type":{"goods_id":"","car_type":"0","car_shape":"0","car_qty":"1"},' +
					'"goods_price":{"id":"","goods_id":"","goods_fare":"","deal_price":"0","pay_type":"' + payType +
					'","status":"1"}}';

				g.save2DB(g.storage_key.goods_info, nullData);
			},

			/**
			 * 判断本地是否有货源数据，没有就给空默认,有就读本地数据库
			 * 15/12/22 */
			trueGoodsIsset: function() {
				this.getContent(); //给数据写本地数据库 测试时候使用 todo
			},

			dispScreen: function() {
				var goodJson = jQuery.parseJSON(g.read2DB(g.storage_key.goods_info));
				fun.dispGoods(goodJson);
				/**
				 * byRockblus
				 * 重新绑定 调用地图控件 事件
				 * 16/1/18 */
				var webViewId = plus.webview.currentWebview();
				mui.fire(webViewId, 'resBind');
			},

			dispGoods: function(goodJson) {
				/* assign 发货日期，地址模型 */
				this.assignFahuoDate(goodJson);

				/**
				 * assignCarType
				 * 15/12/22 */
				this.assignCarType(goodJson);

				/**
				 * assingGoodInfo 分配货物信息
				 * 15/12/22 */
				this.assignGoodInfo(goodJson);

				/**
				 * assgingServer 分配附加服务
				 * 15/12/22 */
				this.assingService(goodJson);

				$scope.role = g.read2DB(g.storage_key.role_type);
			},

			useHistoryLine: function(addrInfo) {
				var goodJson = jQuery.parseJSON(g.read2DB(g.storage_key.goods_info));
				//发货第1站发货时间
				var fahuo_stime = goodJson.address_list[0].time[0].stime;
				var fahuo_etime = goodJson.address_list[0].time[0].etime;
				//卸货第1站卸货时间
				var xiehuo_stime = "",
					xiehuo_etime = "";
				for (var i = 0; i < goodJson.address_list.length; i++) {
					if (goodJson.address_list[i].adrs_type = "2") {
						xiehuo_stime = goodJson.address_list[i].time[0].stime;
						xiehuo_etime = goodJson.address_list[i].time[0].etime;
						break;
					}
				}

				delete goodJson.address_list;

				for (var i = 0; i < addrInfo.length; i++) {
					addrInfo[i].id = "";
					addrInfo[i].goods_id = "";
					addrInfo[i].adrs_level1 = "";
					addrInfo[i].adrs_level2 = "";
					addrInfo[i].adrs_level3 = "";

					var timeInfo = [];
					var timeitem = {};
					timeitem.id = "";
					timeitem.goods_id = "";
					timeitem.adrs_id = "";
					timeitem.adrs_order = addrInfo.adrs_order;
					timeitem.time_rule = "01";

					if (addrInfo.adrs_type == "1") {
						timeitem.stime = fahuo_stime;
						timeitem.etime = fahuo_etime;
					} else {
						timeitem.stime = xiehuo_stime;
						timeitem.etime = xiehuo_etime;
					}

					timeInfo.push(timeitem);
					addrInfo[i].time = timeInfo;
				}

				goodJson.address_list = addrInfo;
				g.save2DB(g.storage_key.goods_info, JSON.stringify(goodJson));

				fun.dispScreen();
			},

			//将地图编辑页得到的数据反映出来
			addressEdit: function(addrInfo) {
				console.error("add=" + JSON.stringify(addrInfo));

				var goodJson = jQuery.parseJSON(g.read2DB(g.storage_key.goods_info));
				//				console.error("add="+JSON.stringify(goodJson));

				var index;
				//因为只有一个发货地址，所以想知道编辑的是哪个卸货地址，就只需要把返回的preVal.no＋1
				if (addrInfo.preVal.startEnd == "start") {
					index = 0;
				} else {
					index = addrInfo.preVal.no;
				}
//				console.error("index=" + index);

				goodJson.address_list[index].adrs_detail = addrInfo.addr;
				goodJson.address_list[index].lat = addrInfo.gps.lat;
				goodJson.address_list[index].lng = addrInfo.gps.lng;
				goodJson.address_list[index].psn_name = addrInfo.tel.psn_name;
				goodJson.address_list[index].psn_tel = addrInfo.tel.psn_tel;

				var stringTime = addrInfo.timeObj.year + "-" + addrInfo.timeObj.date + " " + addrInfo.timeObj.time;
				stringTime = stringTime.replace("月", "-");
				stringTime = stringTime.replace("日", "");
				//				var timestamp2 = Date.parse(new Date(stringTime));
				var timestamp2 = moment(stringTime).toDate();

				for (var i = 0; i < goodJson.address_list[index].time.length; i++) {
					goodJson.address_list[index].time[i].stime = timestamp2 / 1000;
					goodJson.address_list[index].time[i].etime = timestamp2 / 1000;
				}

				g.save2DB(g.storage_key.goods_info, JSON.stringify(goodJson));

				fun.dispScreen();
			},

			//将地图编辑页得到的数据反映出来(新建)
			newAddress: function(addrInfo) {
				var goodJson = jQuery.parseJSON(g.read2DB(g.storage_key.goods_info));
				var newAdd = {};

				newAdd.adrs_detail = addrInfo.addr;
				newAdd.lat = addrInfo.gps.lat;
				newAdd.lng = addrInfo.gps.lng;
				newAdd.psn_name = addrInfo.tel.psn_name;
				newAdd.psn_tel = addrInfo.tel.psn_tel;

				var stringTime = addrInfo.timeObj.year + "-" + addrInfo.timeObj.date + " " + addrInfo.timeObj.time;
				stringTime = stringTime.replace("月", "-");
				stringTime = stringTime.replace("日", "");
				//				var timestamp2 = Date.parse(new Date(stringTime));
				var timestamp2 = moment(stringTime).toDate();

				var timeLst = [],
					timeObj = {};
				timeObj.adrs_order = goodJson.address_list.length;
				timeObj.stime = timestamp2 / 1000;
				timeObj.etime = timestamp2 / 1000;
				timeLst.push(timeObj);
				newAdd.time = timeLst;


				//				console.error("add="+JSON.stringify(goodJson));
				goodJson.address_list.push(newAdd);

				g.save2DB(g.storage_key.goods_info, JSON.stringify(goodJson));

				fun.dispScreen();
			},

			addAdrsListener: function() {
				setTimeout(function() {
					var delAddrs = $('.r_icon_reduce_gray');

					delAddrs.each(function(i, delItem) {
						if (delItem.getAttribute('hasClick') == null) {
							delItem.setAttribute('hasClick', 'true');
							delItem.addEventListener('tap', function() {
								var index = parseInt(this.getAttribute('position'));
								console.error("i=" + i + "index=" + index);
								if (i != index) return;

								var goodJson = jQuery.parseJSON(g.read2DB(g.storage_key.goods_info));

								if (goodJson.address_list.length == 2) {
									mui.toast('至少必须有一个收货地址');
									return;
								}

								var delAdr = goodJson.address_list[index + 1].adrs_detail;

								var btnArray = ['是', '否'];
								mui.confirm('您确定要取消收货地址：' + delAdr, '取消确认', btnArray, function(e) {
									if (e.index == 0) {
										//														console.error("old=" + JSON.stringify(goodJson));
										goodJson.address_list.splice(index + 1, 1);
										//														console.error("new=" + JSON.stringify(goodJson));
										g.save2DB(g.storage_key.goods_info, JSON.stringify(goodJson));

										$scope.$apply(function() {
											fun.dispScreen();
										})
									}
								})
							}, false);
						}
					});
				}, 0);
			},

			/**
			 * bind事件 提升点击性能
			 * 15/12/23 */
			bindElement: {
				init: function() {
					this.ui();
					this.goods();
					this.car();
				},

				ui: function() {
					//展开扩展点击事件
					document.getElementById('funDownScrollsendFundownDownPartShow').addEventListener('tap', function() {
						$scope.fun.down.downPartShow();
					});


					//history 点击跳转的时候激活浏览器滚动
					document.getElementById('history').addEventListener('tap', function() {
						$scope.fun.down.scrollsend();
					});

					//跳转到地址编辑
					if (document.getElementById('addr_scope') !== null) {
						document.getElementById('addr_scope').addEventListener('tap', function() {
							publicServer.goUrl('../goods/editAddrLine.html');
						});
					}
					if (document.getElementById('div_rept') !== null) {
						document.getElementById('div_rept').addEventListener('tap', function() {
							publicServer.goUrl('../goods/editAddrLine.html');
						});
					}

					window.addEventListener('addr_back', function(event) {
						$scope.$apply(function() {
							fun.dispScreen();
						})
					});

					//跳转到我的货源
					setTimeout(function() {
						document.getElementById('btn_commit').addEventListener('tap', function() {
							publicServer.goUrl('../bidding/mineBidding_main.html');
						});
					}, 400);

					//跳转到附加服务
					document.getElementById('service_plus').addEventListener('tap', function() {
						publicServer.goUrl('add_service.html');
					});

					window.addEventListener('back', function(event) {
						var goodJson = jQuery.parseJSON(g.read2DB(g.storage_key.goods_info));
						console.error("line=" + g.read2DB(g.storage_key.goods_info));

						$scope.$apply(function() {
							fun.dispScreen();
						})
					});
					
					window.addEventListener('feiqiback', function(event) {
						ifSrvData=true;
						var goodJson = jQuery.parseJSON(g.read2DB(g.storage_key.goods_info));
//						console.error("line=" + g.read2DB(g.storage_key.goods_info));

						$scope.$apply(function() {
							fun.dispScreen();
						})
					});
					
					

					//跳转到货物信息界面
					document.getElementById('goodsTap').addEventListener('tap', function() {
						publicServer.goUrl('goods_message.html');
					});

					//跳转到历史线路
					document.getElementById('history').addEventListener('tap', function() {
						publicServer.goUrl('historical_line.html');
					});

					//从历史线路返回
					window.addEventListener('history_back', function(event) {
						$scope.$apply(function() {
							if (event.detail.data != null) {
								fun.useHistoryLine(event.detail.data);
							}
						})
					});

					var screenPositionFlg = true;
					var inputPrice = document.getElementById('tran_price');
					inputPrice.onfocus = function() {
						setTimeout(function() {
							document.getElementById("scrollAll").style.cssText = "top: 44px;position:static;";
							screenPositionFlg = false;
						}, 0);
					};
					inputPrice.onblur = function() {
						//						document.getElementById("scrollAll").className = "mui-scroll-wrapper";
						//						document.getElementById("scrollAll").style.cssText = "top: 44px;background: #F2EEEB;";
						//						screenPositionFlg = true;

						var goodJson = jQuery.parseJSON(g.read2DB(g.storage_key.goods_info));
						goodJson.goods_price.goods_fare = inputPrice.value;
						g.save2DB(g.storage_key.goods_info, JSON.stringify(goodJson));
					};

					var screenAll = document.getElementById('scrollAll');
					screenAll.ontouchstart = function() {
						if (!screenPositionFlg) {
							var ac = document.activeElement;
							ac.blur();

							document.getElementById("scrollAll").className = "mui-scroll-wrapper";
							document.getElementById("scrollAll").style.cssText = "top: 44px;background: #F2EEEB;";
							screenPositionFlg = true;
						}
					};

					//从地址编辑画面返回
					window.addEventListener('mapFirePre', function(event) {
						$scope.$apply(function() {
							if (event.detail != null) {
								//								console.error("map="+JSON.stringify(event.detail));
								var curDate = Date.parse(new Date());

								if (event.detail.preVal.addClickValType == "edit") {
									fun.addressEdit(event.detail);
								} else {
									fun.newAddress(event.detail);
								}
								fun.addAdrsListener();
							}
						})
					});

					//跳转到支付方式
					document.getElementById('pay_type').addEventListener('tap', function() {
						publicServer.goUrl('pay_type.html');
					});

					//显示货物图片
					if (document.getElementById('img_good_pic') !== null) {
						document.getElementById('img_good_pic').addEventListener('tap', function() {

						});
					}

					//从临时货源返回
					window.addEventListener('drag_back', function(event) {
						$scope.$apply(function() {
							console.error("old=" + event.detail.data);
							if (event.detail.data != null) {
								var goodJson = jQuery.parseJSON(g.read2DB(event.detail.data));
								g.save2DB(g.storage_key.goods_info, JSON.stringify(goodJson));

								fun.dispScreen();
							}
						})
					});
					
					//发起协议扣除车主邦票成功
					window.addEventListener('order_back', function(event) {
						$scope.$apply(function() {
							console.error('bbbbbb');
							publicServer.goUrl('../bidding/mineOrder_main.html');
						})
					});
				},


				goods: function() {
					/**
					 * 照相机图标点击
					 * 15/12/23 */
					//					document.getElementById('funGoodsPhotoCameraClick').addEventListener('tap', function() {
					//						$scope.fun.goods.photo.cameraClick();
					//					});
					//
					//					/**
					//					 * 照相生成的图片点击
					//					 * 15/12/23 */
					//					document.getElementById('uiGoodsImgClick').addEventListener('tap', function() {
					//						$scope.ui.goods.imgClick();
					//					});
					//
					//					/**
					//					 * mask点击事件uiGoodsMaskClick
					//					 * 15/12/23 */
					//					document.getElementById('uiGoodsMaskClick').addEventListener('tap', function() {
					//						$scope.ui.goods.maskClick();
					//					});

				},

				car: function() {
					/**
					 *  num 加减
					 * 15/12/23 */
					document.getElementById('funCarNumReduce').addEventListener('tap', function() {
						$scope.$apply(function() {
							$scope.car_qty--;
							if ($scope.car_qty < 1) {
								//数量必须大于或等于1
								plus.nativeUI.alert("至少1辆车");
								$scope.car_qty = 1;
							}
						});
					});
					document.getElementById('funCarNumAdd').addEventListener('tap', function() {
						$scope.$apply(function() {
							$scope.car_qty++;
						})
					});
					/**
					 * 车型点击
					 * 15/12/23 */
					document.getElementById('funCarPiker').addEventListener('tap', function() {
						publicServer.goUrl('car_type.html');
					})
				}
			},

			geoInf: function(curPos) {
				g.save2DB(g.storage_key.cur_address, curPos.address);
				g.save2DB(g.storage_key.cur_lat, curPos.lat);
				g.save2DB(g.storage_key.cur_lng, curPos.lng);

                setTimeout(function(){
                    $scope.$apply(function(){
                        fun.assingDefault(curPos);
                        goodJson = jQuery.parseJSON(g.read2DB(g.storage_key.goods_info));
                        fun.dispScreen();
                    })
                },0);

				plus.navigator.closeSplashscreen(); //关闭启动
				tools.tools.hackGoUrl();
				plus.nativeUI.closeWaiting();
			},
			// 通过百度定位模块获取位置信息
			getPosBaidu: function() {
				plus.geolocation.getCurrentPosition(this.geoInf, function(e) {
					console.error("获取百度定位位置信息失败：" + e.message);
				}, {
					provider: 'baidu'
				});
			},

			/**
			 * 监听地图控件页面传回的 gps地址 by rockblus
			 * 16/1/19 */
			getGpsFromArea: function() {
//				console.error("role=" + g.read2DB(g.storage_key.role_type));
				if (g.read2DB(g.storage_key.role_type) == '1') {
					plus.nativeUI.showWaiting();
					window.addEventListener('goGps', function(obj) {
//						console.error("gps=" + JSON.stringify(obj));
						if (obj == undefined || obj.detail == undefined || obj.detail.address == undefined) {
							obj = {};
							obj.detail = {};
							obj.detail.address = "天津市西青区华天道38号海泰信息广场F座南楼717";
							obj.detail.lat = "39.102137876802";
							obj.detail.lng = "117.12773263796";
						}
						try {
							fun.geoInf(obj.detail);
						} catch (e) {
							console.error(e);
						}
					})
				} else {
					plus.nativeUI.closeWaiting();
//					plus.navigator.closeSplashscreen(); //关闭启动
					//					tools.tools.hackGoUrl();
					var detail = {};
					detail.address = "天津市西青区华天道38号海泰信息广场F座南楼717";
					detail.lat = "39.102137876802";
					detail.lng = "117.12773263796";
					try {
						fun.geoInf(detail);
					} catch (e) {
						console.error(e);
					}
				}
			},

			init: function() {
				this.trueGoodsIsset();
				this.bindElement.init();
			},

			changeNumber: function(value) {
				if (!isNaN(value)) {
					var tmpValue = parseInt(value);
					if (tmpValue == 0) {
						return '';
					}
				} else {
					return '';
				}

				return value;
			},

			//检查发货
			checkFahuo: function(goods_info) {
				var ifCanDanbao = g.read2DB(g.storage_key.danbao_can); //是否支持担保支付
//				console.error('ifCanDanbao=' + ifCanDanbao);
				if (ifCanDanbao == '0' && goods_info.goods_price.pay_type == '1') {
					return "非常抱歉，当前版本不支持担保支付，请联系客服";
				}

				//先将数字项目=0的转换为''
				goods_info.goods_info.weight = fun.changeNumber(goods_info.goods_info.weight);
				goods_info.goods_info.volume = fun.changeNumber(goods_info.goods_info.volume);
				goods_info.goods_price.goods_fare = fun.changeNumber(goods_info.goods_price.goods_fare);

				var car_Type = goods_info.car_type.car_type;
				var weight = goods_info.goods_info.weight;
				var volume = goods_info.goods_info.volume;
				var car_Type_i = 0;

				//console.error('rep_date='+JSON.stringify($scope.rep_date));
				//检查输入框的值
				var role = g.read2DB(g.storage_key.role_type);
				if (role == '1') goods_info.goods_info.goods_class = '1';
				else { //if ($scope.rep_date.length > 1) {
					//					goods_info.goods_info.goods_class = '21'; 在线路竞标页，根据重复日期数量设定
					var line_name = document.getElementById('txt_line').value;
					if (line_name == "") {
						return "请输入线路名称";
					} else {
						goods_info.goods_info.line_name = line_name;
					}

					goods_info.goods_info.goods_class = "21";
					//				} else {
					//					goods_info.goods_info.goods_class = '1';
				}

				var price;
				if (goods_info.goods_price.goods_fare == "") {
					//					return "请输入运费";
				} else {
					price = parseInt(goods_info.goods_price.goods_fare);
				}

				if (weight == "" && volume == "" && car_Type == "") {
					return "请选择车型或者输入重量和体积";
				} else if (weight == "" && volume == "" && car_Type != "") {
					car_Type_i = parseInt(car_Type);
					if (car_Type_i >= 4) {
						return "4.2米以上车型，重量和体积至少需要输入1个";
					}
				}

				//根据重量体积折算车型
				if (car_Type == "") {
					var weight_i = 0,
						volume_i = 0;
					if (volume != "") {
						volume_i = parseInt(volume);
					} else if (weight != "") {
						weight_i = parseInt(weight);
					}

					if (volume_i > 0) {
						if (volume_i <= 2) car_Type_i = 1;
						else if (volume_i <= 4) car_Type_i = 2;
						else if (volume_i <= 6) car_Type_i = 3;
						else if (volume_i <= 14) car_Type_i = 4;
						else if (volume_i <= 18) car_Type_i = 5;
						else car_Type_i = 6;
					} else {
						if (weight_i <= 0.6) car_Type_i = 1;
						else if (weight_i <= 0.8) car_Type_i = 2;
						else if (weight_i <= 1.2) car_Type_i = 3;
						else if (weight_i <= 3) car_Type_i = 4;
						else if (weight_i <= 10) car_Type_i = 5;
						else car_Type_i = 6;
					}
				} else {
					car_Type_i = parseInt(car_Type);
				}

				if (goods_info.goods_price.goods_fare != "") {
					if (car_Type_i == 1 && price < 50) { //小面包车
						return "起步价50，请重新输入";
					} else if (car_Type_i == 2 && price < 60) { //大面包车
						return "起步价60，请重新输入";
					} else if (car_Type_i > 2 && price < 70) {
						return "起步价70，请重新输入";
					}
				}

				//每个地址必须有联系人和电话
				for (i = 0; i < goods_info.address_list.length; i++) {
					if (goods_info.address_list[i].psn_name == '' || goods_info.address_list[i].psn_tel == '') {
						return '所有装卸货地都需要指定联系人和电话';
					}
					
					if (goods_info.address_list[i].lat == '' || goods_info.address_list[i].lng == '') {
						return '地图定位失败，请重新在地址编辑画面定位';
					}
				}

//				console.error("stime=" + goods_info.address_list[0].time[0].stime);
//				console.error("etime=" + goods_info.address_list[1].time[0].stime);
				if (goods_info.address_list[0].time[0].stime >= goods_info.address_list[1].time[0].stime) {
					return '亲，卸货时间需要比装货时间晚哟';
				}

				g.save2DB(g.storage_key.goods_info, JSON.stringify(goods_info));
				return "";
			}
		};


		/**
		 * 起始动作
		 * 15/12/22 */
		fun.init();

		/**
		 * 作用域下的事件对象
		 * 15/12/22 */
		$scope.fun = {

			/**
			 * 控制器下拉图标点击事件，
			 * 15/12/22 */
			down: {
				/**
				 * by rockblus
				 * 激活directive moveobj touch移动元素,广播禁止浏览器滚动，或激活滚动事件 , 传 start 或 stop
				 * 15/12/22 */
				scrollsend: function() {
					$scope.$broadcast('scrollSend', 'stop');
				},

				/**
				 * 扩展点击事件
				 * 15/12/22 */
				downPartShow: function() {
					if ($scope.ui.more.downPart) {
						setTimeout(function() {
							$scope.$apply(function() {
								$scope.ui.more.downPart = false; //隐藏downPart
								document.getElementById("funDownScrollsendFundownDownPartShow").className = 'xialaDown';
								//								document.getElementById("scrollAll").style.cssText = "top: 44px;position:absolute;";
							})
						}, 0);
					} else {
						setTimeout(function() {
							$scope.$apply(function() {
								$scope.ui.more.downPart = true; //显示downPart
								document.getElementById("funDownScrollsendFundownDownPartShow").className = 'xialaUp';
								//								document.getElementById("scrollAll").style.cssText = "margin-top: 44px;position:static;";
							})
						}, 0);
					}
				}
			},
		};

		//货源发布
		$('.r_border_button').click(function() {
			var goods_info = jQuery.parseJSON(g.read2DB(g.storage_key.goods_info));
			goods_info.goods_price.goods_fare = document.getElementById('tran_price').value;

			var errMsg = fun.checkFahuo(goods_info);
			if (errMsg == "") {
				var role_type = g.read2DB(g.storage_key.role_type);
				if ("1" == role_type) { //普通货主
					publicServer.goUrl('./confirmation_order.html');
				} else {
					publicServer.goUrl('./confirmation_order_line_bidding.html');
				}
			} else {
				mui.toast(errMsg);
			}
		});

		$('#selectcar').click(function() {
			var carPicker = new mui.PopPicker({
				layer: 2
			});

			carPicker.setData(carData);

			carPicker.show(function(items) {
				$scope.$apply(function() {
					$scope.car_type = items[0].text;
					$scope.car_shape = items[1].text;
				});
			});
		});

		$scope.selectday = function(index) {
			var goods_info = jQuery.parseJSON(g.read2DB(g.storage_key.goods_info));
			$scope.curIndex = index;

			//			console.error(g.read2DB(g.storage_key.goods_info));

			fun.dispAddrInfo(goods_info.address_list, $scope.curIndex);
		};
	});


	//首页返回键处理
	//处理逻辑：1秒内，连续两次按返回键，则退出应用；
	var first = null;
	mui.back = function() {
		//首次按键，提示‘再按一次退出应用’
		if (!first) {
			first = new Date().getTime();
			mui.toast('再按一次退出应用');
			setTimeout(function() {
				first = null;
			}, 1000);
		} else {
			if (new Date().getTime() - first < 1000) {
				plus.runtime.quit();
			}
		}
	};
})