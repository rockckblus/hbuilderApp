/**
 * 发货确认
 * 15/10/25 */
define(function(require) {
	//全局对象，包括angular bodyAll 控制器
	var g = require('../public/g.js');
	var tools = require('../public/tools.js');
	//topNav
	var topNav = require('../../directive/js/default/topNav.js');

	require('../../server/goods/goodsInfo.js');
	var fahuo_common = require('./fahuo_common.js');
	var goodsType = require('../../server/mysql/goods_type.js');
	var carType = require('../../server/mysql/car_type.js');
	var servicesType = require('../../server/mysql/goods_service_class.js');

	require('../../../Public/js/moment.js');
	require('../../server/default/publicServer.js');

	g.app.controller('fahuoCtrl', function($http, $scope, goodsDb, publicServer) {
		var goods_info;

		$scope.ui = {
			/**
			 * 货物
			 * 15/12/23 */
			goods: {
				showImg: false, //图片div显示控制
				imgBig: false, //判断图片是否大的
				maskShow: false, //自定义蒙版
				imgClick: function() { //图片点击事件
					var _this = this;
					setTimeout(function() {
						$scope.$apply(function() {
							_this.clickFun();
						})
					}, 0);
				},


				/**
				 * 点击事件具体方法
				 * 15/12/23 */
				clickFun: function() {
					if (this.imgBig) {
						this.resImg();
						this.imgBig = false;
						this.maskShow = false;
					} else {
						this.maskShow = true;
						this.allImg();
						this.imgBig = true;
					}

				},


				/**
				 * 放大图片
				 * 15/12/23 */
				allImg: function() {
					this.bigImg = true;
					$('#goodsImg').css({
						position: 'fixed',
						width: '100%',
						height: 'auto',
						top: '10rem',
						left: 0,
						'z-index': 6000
					})
				},

				/**
				 * 还原
				 * 15/12/23 */
				resImg: function() {
					$('#goodsImg').css({
						position: 'static',
						width: '0',
						height: '0',
						top: '',
						left: '',
						'z-index': 0
					})
				}
			}
		};

		var fun = {
			bindElement: {
				init: function() {
					this.ui();

					var before = plus.webview.currentWebview().opener();
//										console.error("id=" + before.id);
					if (before.id.indexOf('mineBidding_main.html') > 0) {
						$scope.flag = 0; //不显示发货按钮
					} else {
						$scope.flag = 1;
					}
					//					console.error("flag=" + $scope.flag);

					fun.dispScreen();
				},
				ui: function() {
					setTimeout(function() {
						document.getElementById('btn_commit').addEventListener('tap', function() {
							var btnArray = ['确定', '取消'];
							mui.prompt(' ', '亲，给起个名字呗', '保存到待发布货源', btnArray, function(e) {
								if (e.index == 0) {
									//									console.error('11111='+e.value);
									if (e.value != null && e.value != "" && e.value != undefined) {
										//								var fahuoInfo = jQuery.parseJSON(g.read2DB(t));
										var fahuoInfo = g.read2DB(e.value);
										if (fahuoInfo == "") {
											var goodJson = g.read2DB(g.storage_key.goods_info);
											g.save2DB(e.value, goodJson);

											//将这个名字保存到db中
											var fahuoLst = g.read2DB(g.storage_key.all_fahuo);
											if (fahuoLst == "") {
												g.save2DB(g.storage_key.all_fahuo, "," + e.value + ",");
											} else {
												g.save2DB(g.storage_key.all_fahuo, fahuoLst + e.value + ",");
											}
											mui.toast("已经保存到了待发布货源中");
										} else {
											var se = confirm("已经有这个名字存在了，覆盖它吗？");
											if (se == true) {
												var goodJson = g.read2DB(g.storage_key.goods_info);
												g.save2DB(e.value, goodJson);
											}
											fun.goBack();
										}
									} else {
										mui.toast("没有起名，保存失败！");
									}
								}
							})
						})
					}, 400);

					setTimeout(function() {
						if (document.getElementById('img_good_pic') != null) {
							var tempImg = localStorage.getItem(g.storage_key.user_imgTemp);
							if (tempImg) {
								$scope.hasImg = 'yes';
								$scope.ui.goods.showImg = true;
								setTimeout(function() {
									$scope.$apply(function() {
										$scope.goodsImg = tempImg;
									})
								}, 0);
							}
							document.getElementById('img_good_pic').addEventListener('tap', function() {
								$scope.ui.goods.imgClick();
							});
							document.getElementById('goodsImg').addEventListener('tap', function() {
								$scope.ui.goods.imgClick();
							})
						}
					}, 400);

					setTimeout(function() {
						if (document.getElementById('btn_fahuo') != null) {
							document.getElementById('btn_fahuo').addEventListener('tap', function() {
								//															console.error("class="+document.getElementById('btn_fahuo').className);
								if (document.getElementById('btn_fahuo').className == 'r_border_button ng-scope') {
									document.getElementById('btn_fahuo').className = 'r_border_button_gray ng-scope';
									fun.doPush(publicServer);
								}
							})
						}
					}, 400);
				},
			},

			dispScreen: function() {
				var goodJson = jQuery.parseJSON(g.read2DB(g.storage_key.goods_info));
				//				console.error('parmeter' + g.read2DB(g.storage_key.goods_info));
				fun.dispGoods(goodJson);
			},

			dispGoods: function(goodJson) {
				this.assignFahuoDate(goodJson);
				this.assignCarType(goodJson);
				this.assignGoodInfo(goodJson);
				this.assingService(goodJson);

				setTimeout(function() {
					tools.tools.hackGoUrl();
				}, 400);
			},

			/*显示发货日期 */
			assignFahuoDate: function(goods_info) {
				//				console.error(JSON.stringify(goods_info));
				var rep_date = fahuo_common.init.assignFahuoDate(goods_info);
//				console.error(rep_date);

				//如果是线路竞标的货主，还需要将重复日期删除
				$scope.rep_date = fahuo_common.init.rmDouble(rep_date);
				$scope.curIndex = 0;
				//				repDate = JSON.stringify($scope.rep_date);

				//某天的地址时间联系人
				fun.dispAddrInfo(goods_info.address_list, $scope.curIndex);
			},

			dispAddrInfo: function(addLst, index) {
				//某天的地址时间联系人
				var dayAddress = fahuo_common.init.getGoodsInfoByDate(addLst, $scope.rep_date[index]);
//															console.error("day="+JSON.stringify(dayAddress));

				$scope.startaddLst = dayAddress.startaddLst;
				$scope.endaddLst = dayAddress.endaddLst;

				//第一站装货开始时间
				$scope.loadStartTime = dayAddress.startaddLst[0].stime;
				//最后一站卸货开始时间
				$scope.downStartTime = dayAddress.endaddLst[dayAddress.startaddLst.length - 1].stime;

				//最后一站装货开始时间(新db这里需要改，这里暂时认为只有一个发货地址)
				$scope.loadEndTime = dayAddress.startaddLst[0].etime;
				//最后一站卸货开始时间
				$scope.downEndTime = dayAddress.endaddLst[dayAddress.endaddLst.length - 1].etime;
			},

			assignCarType: function(re) {
				var select_car_type = tools.tools.getValAChilByKey(carType, re.car_type.car_type, re.car_type.car_shape);

				if (!select_car_type) {
					$scope.car = "";
				} else {
					$scope.car = select_car_type.child + select_car_type.parent;
				}
			},

			assignGoodInfo: function(re) {
				try {
					$scope.goods_info = tools.tools.getValueBykey(goodsType, re.goods_info.goods_type); //货物类型

					$scope.weight = re.goods_info.weight; //重
					if ($scope.weight == "0." || $scope.weight == "") {
						$scope.weight = "";
					} else $scope.goods_info = $scope.goods_info + "(" + re.goods_info.weight + "吨";

					$scope.volume = re.goods_info.volume; //方
					if ($scope.volume == "0." || $scope.volume == "") {
						$scope.volume = "";
					} else {
						if ($scope.weight == "") {
							$scope.goods_info = $scope.goods_info + "(" + re.goods_info.volume + "方";
						} else {
							$scope.volume = $scope.goods_info + "," + re.goods_info.volume + "方";
						}
					}

					if ($scope.weight != "" || $scope.volume != "") {
						$scope.goods_info = $scope.goods_info + ")";
					}
					$scope.goods_info = $scope.goods_info + "　";

					if (re.goods_price.goods_fare == "" || re.goods_price.goods_fare == "0") {
						$scope.goods_fare = "等待司机报价";
					} else {
						$scope.goods_fare = parseInt(re.goods_price.goods_fare) + "元"; //价格
					}


					if (re.goods_price.pay_type == 1) $scope.pay_type = "担保支付";
					else if (re.goods_price.pay_type == 2) $scope.pay_type = "每周结算";
					else if (re.goods_price.pay_type == 3) $scope.pay_type = "现场结算";

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

					//图片
					$scope.goods_pic = re.goods_info.goods_pic;

					//					console.error('class=' + re.goods_info.goods_class);
					//线路名称
					//					if (re.goods_info.goods_class == '21') {
					$scope.line_name = re.goods_info.line_name;
					//					}
				} catch (e) {
					console.error('error', e);
				}
			},

			assingService: function(re) {
				$scope.newService = "";
				$scope.service_name = "";
				if (re.add_service.length == 0) {} else {
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
							var serviceItem = tools.tools.getValueBykey(servicesType, re.add_service[i].service_code);
							if ($scope.service_name == "") {
								$scope.service_name = serviceItem;
							} else {
								$scope.service_name = $scope.service_name + "; " + serviceItem;
							}
						}
					}
				}

				if (re.add_service.length > 0 && $scope.newService != "") {
					$scope.newService = "其它：" + $scope.newService;
				}
			},

			//发货
			doPush: function(publicServer) {
				var goods_info = jQuery.parseJSON(g.read2DB(g.storage_key.goods_info));
				var push_data = {};

				//地址信息
				push_data.address_list = [];
				for (k = 0; k < goods_info.address_list.length; k++) {
					push_data.address_list[k] = {};
					push_data.address_list[k].adrs_type = goods_info.address_list[k].adrs_type;
					push_data.address_list[k].adrs_order = goods_info.address_list[k].adrs_order;
					push_data.address_list[k].adrs_level1 = goods_info.address_list[k].adrs_level1;
					push_data.address_list[k].adrs_level2 = goods_info.address_list[k].adrs_level2;
					push_data.address_list[k].adrs_level3 = goods_info.address_list[k].adrs_level3;
					push_data.address_list[k].adrs_detail = goods_info.address_list[k].adrs_detail;
					push_data.address_list[k].lat = goods_info.address_list[k].lat;
					push_data.address_list[k].lng = goods_info.address_list[k].lng;
					push_data.address_list[k].psn_name = goods_info.address_list[k].psn_name;
					push_data.address_list[k].psn_tel = goods_info.address_list[k].psn_tel;
					push_data.address_list[k].adrs = goods_info.address_list[k].adrs;

					push_data.address_list[k].time = [];
					for (i = 0; i < goods_info.address_list[k].time.length; i++) {
						push_data.address_list[k].time[i] = {};
						push_data.address_list[k].time[i].stime = goods_info.address_list[k].time[i].stime;
						push_data.address_list[k].time[i].etime = goods_info.address_list[k].time[i].etime;
						push_data.address_list[k].time[i].time_rule = goods_info.address_list[k].time[i].time_rule;
					}
				}

				//附加服务
				push_data.add_service = [];
				var yixing = fun.getRemark();
				for (i = 0; i < goods_info.add_service.length; i++) {
					push_data.add_service[i] = {};
					push_data.add_service[i].adrs_type = '1';
					push_data.add_service[i].adrs_order = '1';
					push_data.add_service[i].service_code = goods_info.add_service[i].service_code;

					if (push_data.add_service[i].service_code == '1000' && yixing != '') {
						push_data.add_service[i].value = goods_info.add_service[i].value + "\n" + yixing;
						yixing = "";
					} else {
						push_data.add_service[i].value = goods_info.add_service[i].value;
					}
				}

				if (yixing != '') {
					push_data.add_service[i] = {};
					push_data.add_service[i].adrs_type = '1';
					push_data.add_service[i].adrs_order = '1';
					push_data.add_service[i].service_code = '1000';
					push_data.add_service[i].value = yixing;
				}

				//车型
				push_data.car_type = {};
				push_data.car_type.car_type = goods_info.car_type.car_type;
				if (push_data.car_type.car_type == '') push_data.car_type.car_type = '0';
				push_data.car_type.car_shape = goods_info.car_type.car_shape;
				push_data.car_type.car_qty = "1";

				//价格信息
				push_data.goods_price = {};
				push_data.goods_price.goods_fare = goods_info.goods_price.goods_fare;
				push_data.goods_price.pay_type = goods_info.goods_price.pay_type;

				//货物信息
				push_data.goods_info = {};
				push_data.goods_info.goods_class = goods_info.goods_info.goods_class;
				push_data.goods_info.line_name = goods_info.goods_info.line_name;
				push_data.goods_info.goods_name = tools.tools.getValueBykey(goodsType, goods_info.goods_info.goods_type);;
				push_data.goods_info.goods_type = goods_info.goods_info.goods_type;
				push_data.goods_info.goods_pic = goods_info.goods_info.goods_pic;
				if (goods_info.goods_info.weight == "" && goods_info.goods_info.volume == "") {
					if (push_data.car_type.car_type == "1") {
						push_data.goods_info.volume = "2";
					} else if (push_data.car_type.car_type == "2") {
						push_data.goods_info.volume = "4";
					} else {
						push_data.goods_info.volume = "6";
					}
				} else {
					push_data.goods_info.weight = goods_info.goods_info.weight;
					push_data.goods_info.volume = goods_info.goods_info.volume;
				}

				//为了往老db里的goods_time里插入记录
				var goods_time = [];
				for (i = 0; i < goods_info.address_list[0].time.length; i++) { //装货地址
					var timeObj = {};
					timeObj.adrs_id = '0';
					timeObj.time_rule = '01';
					timeObj.stime = goods_info.address_list[0].time[i].stime;
					timeObj.etime = goods_info.address_list[1].time[i].etime; //当天的卸货时间
					goods_time.push(timeObj);
				}
				push_data.goods_time = goods_time;

				var paramter = [];
				paramter['uid'] = g.read2DB(g.storage_key.user_id);
				paramter['psd_time'] = g.read2DB(g.storage_key.user_token);
				paramter['good_info_json'] = JSON.stringify(push_data);

				var timestamp = parseInt(new Date().getTime() / 1000);
				paramter['timestamp'] = timestamp;

				var sign = paramter['good_info_json'] + timestamp + 'a6wpE5fZIkAqPfrUTdln';
				sign = tools.tools.md5(sign);
				paramter['sign'] = sign;

								console.error("uid=" + paramter['uid']);
								console.error("psd_time=" + paramter['psd_time']);
								console.error("good_info_json=" + paramter['good_info_json']);
								console.error("timestamp=" + paramter['timestamp']);
								console.error("sign=" + paramter['sign']);

				goodsDb.goodsPush(paramter, function(re) {
															console.error(JSON.stringify(re));
					if (re.code == 'S') {
						g.save2DB(g.storage_key.up_pic_url, '');
						var btnArray = ['确定'];
						mui.confirm('发货成功，已通知附近车主。有车主报价时，会短信通知您', '发货成功', btnArray, function(e) {
							publicServer.goUrl('../bidding/mineBidding_main.html');
						});
					} else if (re.code == 'T') {
						mui.toast('登录超时，请重新登录');
						setTimeout(function() {
							publicServer.goUrl('../member/quit.html');
						}, 1000);
					} else {
						mui.toast(re.err_msg);
						document.getElementById('btn_fahuo').className = 'r_border_button ng-scope';
					}
				}, function() {
					mui.toast('未知错误，发货失败！');
					document.getElementById('btn_fahuo').className = 'r_border_button ng-scope';
				});
			},

			//将异形件描述加到老db的remark
			getRemark: function() {
				var chang = g.read2DB(g.storage_key.yi_chang);
				var kuan = g.read2DB(g.storage_key.yi_kuan);
				var gao = g.read2DB(g.storage_key.yi_gao);
				if (chang != "" || kuan != "" || gao != "") {
					var remark = "异形件：";

					if (chang != "") {
						remark = remark + "长约" + chang + "米;";
					}
					if (kuan != "") {
						remark = remark + "宽约" + kuan + "米;";
					}
					if (gao != "") {
						remark = remark + "高约" + gao + "米;";
					}
					return remark;
				} else {
					return "";
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
				this.bindElement.init();
			}
		};

		/**
		 * 起始动作
		 * 15/12/22 */
		fun.init();
	});
})