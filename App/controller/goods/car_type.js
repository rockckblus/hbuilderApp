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

	g.app.controller('carTypeCtrl', function($scope) {
		var goods_info;
		var sel_shape = "3";
		var sel_nums = 1;
		var sel_car = 0;

		var fun = {
			/**
			 * bind事件 提升点击性能
			 * 15/12/23 */
			bindElement: {
				init: function() {
					this.ui();

					goods_info = jQuery.parseJSON(g.read2DB(g.storage_key.goods_info));

					if (goods_info.car_type.car_type == '')
						fun.selectCar('');
					else {
						sel_shape = goods_info.car_type.car_shape;
						fun.selectCar(goods_info.car_type.car_type);
					}
				},
				ui: function() {
					//添加newId自定义事件监听
					//					document.getElementById('btn_back').addEventListener('tap', function() {
					//						fun.goBack();
					//					})

					document.getElementById('xiaomian_row').addEventListener('tap', function() {
						sel_shape = "0";
						fun.selectCar(1);
					})

					document.getElementById('pingmian_row').addEventListener('tap', function() {
						sel_shape = "0";
						fun.selectCar(2);
					})

					document.getElementById('gaomian_row').addEventListener('tap', function() {
						sel_shape = "0";
						fun.selectCar(3);
					})

					document.getElementById('qingka_row').addEventListener('tap', function() {
						if (sel_shape=='0') sel_shape='3';
						fun.selectCar(4);
					})

					document.getElementById('zhongka_row').addEventListener('tap', function() {
						if (sel_shape=='0') sel_shape='3';
						fun.selectCar(5);
					})

					document.getElementById('daka_row').addEventListener('tap', function() {
						if (sel_shape=='0') sel_shape='3';
						fun.selectCar(6);
					})

					document.getElementById('qingcar_1').addEventListener('tap', function() {
						fun.selectShap('3', '3');
					})
					document.getElementById('qingcar_2').addEventListener('tap', function() {
						fun.selectShap('3', '4');
					})
					document.getElementById('qingcar_3').addEventListener('tap', function() {
						fun.selectShap('3', '5');
					})

					document.getElementById('zhongcar_1').addEventListener('tap', function() {
						fun.selectShap('4', '3');
					})
					document.getElementById('zhongcar_2').addEventListener('tap', function() {
						fun.selectShap('4', '4');
					})
					document.getElementById('zhongcar_3').addEventListener('tap', function() {
						fun.selectShap('4', '5');
					})

					document.getElementById('dacar_1').addEventListener('tap', function() {
						fun.selectShap('5', '3');
					})
					document.getElementById('dacar_2').addEventListener('tap', function() {
						fun.selectShap('5', '4');
					})
					document.getElementById('dacar_3').addEventListener('tap', function() {
						fun.selectShap('5', '5');
					})

					document.getElementById('funCarNumReduce1').addEventListener('tap', function() {
						$scope.$apply(function() {
							sel_nums--;
							if (sel_nums < 1) {
								//数量必须大于或等于1
								plus.nativeUI.alert("至少1辆车");
								sel_nums = 1;
							} else {
								document.getElementById('carnums1').value = sel_nums;
							}
						});
					});
					document.getElementById('funCarNumAdd1').addEventListener('tap', function() {
						$scope.$apply(function() {
							sel_nums++;
							document.getElementById('carnums1').value = sel_nums;
						})
					});

					document.getElementById('funCarNumReduce2').addEventListener('tap', function() {
						$scope.$apply(function() {
							sel_nums--;
							if (sel_nums < 1) {
								//数量必须大于或等于1
								plus.nativeUI.alert("至少1辆车");
								sel_nums = 1;
							} else {
								document.getElementById('carnums2').value = sel_nums;
							}
						});
					});
					document.getElementById('funCarNumAdd2').addEventListener('tap', function() {
						$scope.$apply(function() {
							sel_nums++;
							document.getElementById('carnums2').value = sel_nums;
						})
					});

					document.getElementById('funCarNumReduce3').addEventListener('tap', function() {
						$scope.$apply(function() {
							sel_nums--;
							if (sel_nums < 1) {
								//数量必须大于或等于1
								plus.nativeUI.alert("至少1辆车");
								sel_nums = 1;
							} else {
								document.getElementById('carnums3').value = sel_nums;
							}
						});
					});
					document.getElementById('funCarNumAdd3').addEventListener('tap', function() {
						$scope.$apply(function() {
							sel_nums++;
							document.getElementById('carnums3').value = sel_nums;
						})
					});

					document.getElementById('funCarNumReduce4').addEventListener('tap', function() {
						$scope.$apply(function() {
							sel_nums--;
							if (sel_nums < 1) {
								//数量必须大于或等于1
								plus.nativeUI.alert("至少1辆车");
								sel_nums = 1;
							} else {
								document.getElementById('carnums4').value = sel_nums;
							}
						});
					});
					document.getElementById('funCarNumAdd4').addEventListener('tap', function() {
						$scope.$apply(function() {
							sel_nums++;
							document.getElementById('carnums4').value = sel_nums;
						})
					});

					document.getElementById('funCarNumReduce5').addEventListener('tap', function() {
						$scope.$apply(function() {
							sel_nums--;
							if (sel_nums < 1) {
								//数量必须大于或等于1
								plus.nativeUI.alert("至少1辆车");
								sel_nums = 1;
							} else {
								document.getElementById('carnums5').value = sel_nums;
							}
						});
					});
					document.getElementById('funCarNumAdd5').addEventListener('tap', function() {
						$scope.$apply(function() {
							sel_nums++;
							document.getElementById('carnums5').value = sel_nums;
						})
					});

					document.getElementById('funCarNumReduce6').addEventListener('tap', function() {
						$scope.$apply(function() {
							sel_nums--;
							if (sel_nums < 1) {
								//数量必须大于或等于1
								plus.nativeUI.alert("至少1辆车");
								sel_nums = 1;
							} else {
								document.getElementById('carnums6').value = sel_nums;
							}
						});
					});
					document.getElementById('funCarNumAdd6').addEventListener('tap', function() {
						$scope.$apply(function() {
							sel_nums++;
							document.getElementById('carnums6').value = sel_nums;
						})
					});

					setTimeout(function() {
						document.getElementById('btn_commit').addEventListener('tap', function() {
							
							goods_info.car_type.goods_id = "";
							goods_info.car_type.car_shape = sel_shape;
							goods_info.car_type.car_qty = sel_nums;
							goods_info.car_type.car_type = sel_car;

							g.save2DB(g.storage_key.goods_info, JSON.stringify(goods_info));

							fun.goBack();
						})
					}, 400);

				},
			},

			selectCar: function(car_type) {
				if (sel_car == car_type) {
					car_type = '';
				}
				sel_car = car_type;

				document.getElementById('xiaomian').className = 'r_icon_xiaomian_gray';
				document.getElementById('pingmian').className = 'r_icon_pingmian_gray';
				document.getElementById('gaomian').className = 'r_icon_gaomian_gray';
				document.getElementById('qingka').className = 'r_icon_qingka_gray';
				document.getElementById('zhongka').className = 'r_icon_zhongka_gray';
				document.getElementById('daka').className = 'r_icon_daka_gray';

				document.getElementById('stepper1').style.display = 'none';
				document.getElementById('stepper2').style.display = 'none';
				document.getElementById('stepper3').style.display = 'none';
				document.getElementById('stepper4').style.display = 'none';
				document.getElementById('stepper5').style.display = 'none';
				document.getElementById('stepper6').style.display = 'none';

				document.getElementById('line4').style.borderBottom = '#bbb 1px solid';
				document.getElementById('line5').style.borderBottom = '#bbb 1px solid';
				document.getElementById('line6').style.borderBottom = '#bbb 1px solid';

				document.getElementById('shape4').style.display = 'none';
				document.getElementById('shape5').style.display = 'none';
				document.getElementById('shape6').style.display = 'none';

				if (car_type == '1') {
					document.getElementById('xiaomian').className = 'r_icon_xiaomian_red';
					//					document.getElementById('stepper1').style.display = 'block';
					document.getElementById('carnums1').value = sel_nums;
				} else if (car_type == '2') {
					document.getElementById('pingmian').className = 'r_icon_pingmian_red';
					//					document.getElementById('stepper2').style.display = 'block';
					document.getElementById('carnums2').value = sel_nums;
				} else if (car_type == '3') {
					document.getElementById('gaomian').className = 'r_icon_gaomian_red';
					//					document.getElementById('stepper3').style.display = 'block';
					document.getElementById('carnums3').value = sel_nums;
				} else if (car_type == '4') {
					document.getElementById('qingka').className = 'r_icon_qingka_red';
					//					document.getElementById('stepper4').style.display = 'block';
					document.getElementById('line4').style.borderBottom = '#e9e7e7 1px solid';
					document.getElementById('shape4').style.display = 'block';
					document.getElementById('carnums4').value = sel_nums;
					fun.selectShap('3', sel_shape);
				} else if (car_type == '5') {
					document.getElementById('zhongka').className = 'r_icon_zhongka_red';
					//					document.getElementById('stepper5').style.display = 'block';
					document.getElementById('line5').style.borderBottom = '#e9e7e7 1px solid';
					document.getElementById('shape5').style.display = 'block';
					document.getElementById('carnums5').value = sel_nums;
					fun.selectShap('4', sel_shape);
				} else if (car_type == '6') {
					document.getElementById('daka').className = 'r_icon_daka_red';
					//					document.getElementById('stepper6').style.display = 'block';
					document.getElementById('line6').style.borderBottom = '#e9e7e7 1px solid';
					document.getElementById('shape6').style.display = 'block';
					document.getElementById('carnums6').value = sel_nums;
					fun.selectShap('5', sel_shape);
				}
			},

			selectShap: function(car_type, shap_type) {
				sel_shape = shap_type;
				if (car_type == '3') {
					if (shap_type == '3') {
						document.getElementById('qingcar_f1').style.color = '#e6454a';
						document.getElementById('qingcar_f2').style.color = '#999';
						document.getElementById('qingcar_f3').style.color = '#999';
					} else if (shap_type == '4') {
						document.getElementById('qingcar_f2').style.color = '#e6454a';
						document.getElementById('qingcar_f1').style.color = '#999';
						document.getElementById('qingcar_f3').style.color = '#999';
					} else if (shap_type == '5') {
						document.getElementById('qingcar_f3').style.color = '#e6454a';
						document.getElementById('qingcar_f2').style.color = '#999';
						document.getElementById('qingcar_f1').style.color = '#999';
					}
				} else if (car_type == '4') {
					if (shap_type == '3') {
						document.getElementById('zhongcar_f1').style.color = '#e6454a';
						document.getElementById('zhongcar_f2').style.color = '#999';
						document.getElementById('zhongcar_f3').style.color = '#999';
					} else if (shap_type == '4') {
						document.getElementById('zhongcar_f2').style.color = '#e6454a';
						document.getElementById('zhongcar_f1').style.color = '#999';
						document.getElementById('zhongcar_f3').style.color = '#999';
					} else if (shap_type == '5') {
						document.getElementById('zhongcar_f3').style.color = '#e6454a';
						document.getElementById('zhongcar_f1').style.color = '#999';
						document.getElementById('zhongcar_f2').style.color = '#999';
					}
				} else if (car_type == '5') {
					if (shap_type == '3') {
						document.getElementById('dacar_f1').style.color = '#e6454a';
						document.getElementById('dacar_f2').style.color = '#999';
						document.getElementById('dacar_f3').style.color = '#999';
					} else if (shap_type == '4') {
						document.getElementById('dacar_f2').style.color = '#e6454a';
						document.getElementById('dacar_f1').style.color = '#999';
						document.getElementById('dacar_f3').style.color = '#999';
					} else if (shap_type == '5') {
						document.getElementById('dacar_f3').style.color = '#e6454a';
						document.getElementById('dacar_f1').style.color = '#999';
						document.getElementById('dacar_f2').style.color = '#999';
					}
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

				tools.tools.hackGoUrl();
			}
		};

		/**
		 * 起始动作
		 * 15/12/22 */
		fun.init();
	});
})