/**
 * 附加服务页
 * 15/10/25 */
define(function(require) {
	//全局对象，包括angular bodyAll 控制器
	var g = require('../public/g.js');
	var tools = require('../public/tools.js');
	//topNav
	var topNav = require('../../directive/js/default/topNav.js');

	var servicesType = require('../../server/mysql/goods_service_class.js');

	g.app.controller('addSrvCtrl', function($scope) {
		var goods_info;

		var fun = {
			bindElement: {
				init: function() {
					this.ui();

					goods_info = jQuery.parseJSON(g.read2DB(g.storage_key.goods_info));

					for (var i = 0; i < goods_info.add_service.length; i++) {
						var serviceItem = goods_info.add_service[i];
						if (serviceItem.service_code == '1000') {
							document.getElementById('tip_edittext').style.visibility = 'hidden';
							document.getElementById('edittext').innerHTML = serviceItem.value;
						} else if (serviceItem.service_code == '1001') {
							document.getElementById('ck_huozhu').className = 'r_icon_checkbox selected';
						} else if (serviceItem.service_code == '1002') {
							document.getElementById('ck_huidan').className = 'r_icon_checkbox selected';
						} else if (serviceItem.service_code == '1003') {
							document.getElementById('ck_siji').className = 'r_icon_checkbox selected';
						}
					}


				},
				ui: function() {
					//添加newId自定义事件监听
					//					document.getElementById('btn_back').addEventListener('tap', function() {
					//						fun.goBack();
					//					})

					setTimeout(function() {
						document.getElementById('btn_commit').addEventListener('tap', function() {
							var goodsId = "";
							var adrId = "";

							delete goods_info.add_service;
							var add_service = [];

							var arrId = ['ck_huozhu', 'ck_huidan', 'ck_siji'];
							var strLog = "";

							for (var i = 0; i < arrId.length; i++) {
								var str = document.getElementById(arrId[i]).className;
								if (str == 'r_icon_checkbox selected') {
									var srvItem = {};
									srvItem.goods_id = goodsId;
									srvItem.address_id = adrId;
									srvItem.value = '1';

									if (i == 0) {
										srvItem.service_code = '1001';
									} else if (i == 1) {
										srvItem.service_code = '1002';
									} else if (i == 2) {
										srvItem.service_code = '1003';
									}

									add_service.push(srvItem);
								}
							}

							if (document.getElementById('edittext').value != "") {
								var srvItem = {};
								srvItem.goods_id = goodsId;
								srvItem.address_id = adrId;
								srvItem.service_code = '1000';
								srvItem.value = document.getElementById('edittext').value;
								add_service.push(srvItem);
							}

							goods_info.add_service = add_service;
							g.save2DB(g.storage_key.goods_info, JSON.stringify(goods_info));

							fun.goBack();
						})
					}, 400);
				},
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

				tools.tools.hackGoUrl();
			}
		};

		/**
		 * 起始动作
		 * 15/12/22 */
		fun.init();
	});
})