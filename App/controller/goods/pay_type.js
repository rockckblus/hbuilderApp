/**
 * 附加服务页
 * 15/10/25 */
define(function(require) {
	//全局对象，包括angular bodyAll 控制器
	var g = require('../public/g.js');
	var tools = require('../public/tools.js');
	//topNav
	var topNav = require('../../directive/js/default/topNav.js');

	g.app.controller('payTypeCtrl', function($scope) {
		var goods_info;
		var usr_pay_type = g.read2DB(g.storage_key.pay_type);
		var usr_pay_limit = g.read2DB(g.storage_key.locale_stlimits);

		var fun = {
			bindElement: {
				init: function() {
					this.ui();

					goods_info = jQuery.parseJSON(g.read2DB(g.storage_key.goods_info));
					$scope.sel_pay_type = goods_info.goods_price.pay_type;

					setTimeout(function() {
						if (goods_info.goods_price.pay_type == '1' && document.getElementById('ck_danbao') != null) {
							document.getElementById('ck_danbao').className = 'r_icon_checkbox selected';
						} else if (goods_info.goods_price.pay_type == '2') {
							document.getElementById('ck_zhoujie').className = 'r_icon_checkbox selected';
						} else if (goods_info.goods_price.pay_type == '3') {
							document.getElementById('ck_xianchang').className = 'r_icon_checkbox selected';
						}
					})
				},
				ui: function() {
					setTimeout(function() {
						document.getElementById('btn_commit').addEventListener('tap', function() {
							//							console.error('sel_pay_type'+$scope.sel_pay_type);
							goods_info.goods_price.pay_type = $scope.sel_pay_type;
							g.save2DB(g.storage_key.goods_info, JSON.stringify(goods_info));

							fun.goBack();
						})
					}, 400);

					if (document.getElementById('ck_danbao') != null) {
						document.getElementById('ck_danbao').addEventListener('tap', function() {
							$scope.sel_pay_type = "1";
							document.getElementById('ck_danbao').className = 'r_icon_checkbox selected';

							if (document.getElementById('ck_zhoujie') != null)
								document.getElementById('ck_zhoujie').className = 'r_icon_checkbox';

							if (document.getElementById('ck_xianchang') != null)
								document.getElementById('ck_xianchang').className = 'r_icon_checkbox';
						});
					}

					if (document.getElementById('ck_zhoujie') != null) {
						document.getElementById('ck_zhoujie').addEventListener('tap', function() {
							if (usr_pay_type == '1') {
								mui.toast("如果您需要每周结算，请联系客服");
							} else {
								$scope.sel_pay_type = "2";

								if (document.getElementById('ck_danbao') != null)
									document.getElementById('ck_danbao').className = 'r_icon_checkbox';

								document.getElementById('ck_zhoujie').className = 'r_icon_checkbox selected';

								if (document.getElementById('ck_xianchang') != null)
									document.getElementById('ck_xianchang').className = 'r_icon_checkbox';
							}
						});
					}

					if (document.getElementById('ck_xianchang') != null) {
						document.getElementById('ck_xianchang').addEventListener('tap', function() {
							if (usr_pay_limit == '0') {
								mui.toast("如果您需要现场结算，请联系客服");
							} else {
								$scope.sel_pay_type = "3";
								
								if (document.getElementById('ck_danbao') != null)
								document.getElementById('ck_danbao').className = 'r_icon_checkbox';
								
								if (document.getElementById('ck_zhoujie') != null)
								document.getElementById('ck_zhoujie').className = 'r_icon_checkbox';
								
								document.getElementById('ck_xianchang').className = 'r_icon_checkbox selected';
							}
						});
					}
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