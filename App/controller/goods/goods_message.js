/**
 * 附加服务页
 * 15/10/25 */
define(function(require) {
	//全局对象，包括angular bodyAll 控制器
	var g = require('../public/g.js');
	var tools = require('../public/tools.js');
	//topNav
	var topNav = require('../../directive/js/default/topNav.js');
	//照片控件
	var Photo = require('../../server/default/photo.js');

	require('../../server/default/publicServer.js');
	require('../../server/goods/goodsInfo.js');
	var maData = require("../../server/member/memberData.Ma.js");

	var goods_info, in_pic_url; //进入该画面时的货物照片的url
	var in_pic = localStorage.getItem(g.storage_key.user_imgTemp); //进入该画面时的货物照片

	plus.key.addEventListener('backbutton', backListener, false);

	function backListener() { //按回退返回
		if (goods_info.goods_info.goods_pic == "") { //如果进入时没有图片
			localStorage.removeItem(g.storage_key.user_imgTemp);
		} else {
			localStorage.setItem(g.storage_key.user_imgTemp, in_pic);
		}
	}

	g.app.controller('addSrvCtrl', function($scope, photo, goodsDb, memberDbMa,publicServer) {
		var car_Type;

		//ui
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
				 * mask 点击事件
				 * 15/12/23 */
				maskClick: function() {
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
						top: '50px',
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
						width: '100px',
						height: '100px',
						top: '',
						left: '',
						'z-index': 0
					})
				}
			}
		};

		var fun = {
			/**
			 * bind事件 提升点击性能
			 * 15/12/23 */
			bindElement: {
				init: function() {
					this.ui();
					this.goods();

					goods_info = jQuery.parseJSON(g.read2DB(g.storage_key.goods_info));
					car_Type = goods_info.car_type.car_type;

					in_pic_url = goods_info.goods_info.goods_pic;
					var goods_type = goods_info.goods_info.goods_type;
					if (goods_type=='0') goods_type='6';
					var goods_name = goods_info.goods_info.goods_name;
					var goods_volume = goods_info.goods_info.volume;
					var goods_weight = goods_info.goods_info.weight;

					if (goods_volume == "") {} else {
						document.getElementById('et_fang').value = goods_volume.toString();
					}
					if (goods_weight == "") {} else {
						document.getElementById('et_dun').value = goods_weight.toString();
					}

					fun.selectIndexType(parseInt(goods_type));

					//异形件
					var chang = g.read2DB(g.storage_key.yi_chang);
					var kuan = g.read2DB(g.storage_key.yi_kuan);
					var gao = g.read2DB(g.storage_key.yi_gao);
					if (chang != "" || kuan != "" || gao != "") {
						document.getElementById('chk_yixing').src = '../../../Public/images/btn_check_c.png';
						document.getElementById('ed_chang').value = chang;
						document.getElementById('ed_kuan').value = kuan;
						document.getElementById('ed_gao').value = gao;
					}

					//照片
					$scope.hasImg = '';
					$scope.goodsImg = '';

					if (in_pic_url) {
						tools.tools.convertImgToBase64(in_pic_url, function(baseImg) {
							localStorage.setItem(g.storage_key.user_imgTemp, baseImg);
							setTimeout(function() {
								var tempImg = localStorage.getItem(g.storage_key.user_imgTemp);
								if (tempImg) {
									$scope.hasImg = 'yes';
									$scope.ui.goods.showImg = true;
									$scope.$apply(function() {
										$scope.goodsImg = tempImg;
									})
								}
							}, 0);
						})
					}
				},
				ui: function() {
					setTimeout(function() {
						document.getElementById('btn_back').addEventListener('tap', function() {
							backListener();
						})
					}, 400);

					setTimeout(function() {
						document.getElementById('btn_commit').addEventListener('tap', function() {
							var errMsg = fun.chkInput();
							if ("" != errMsg) {
								mui.toast(errMsg);
								return;
							}

							var listId = ['food', 'equipment', 'material', 'clothes', 'abnormity', 'other'];
							for (var i = 0; i < listId.length; i++) {
								if (document.getElementById(listId[i]).className == 'r_tag selected') {
//									goods_info.goods_info.goods_type = (i + 1).toString();
									if(i==5){
										goods_info.goods_info.goods_type = '0';
									}else{
										goods_info.goods_info.goods_type = (i + 1).toString();
									}
									break;
								}
							}

							goods_info.goods_info.goods_name = document.getElementById('et_yaoqiu').value;
							goods_info.goods_info.volume = document.getElementById('et_fang').value;
							goods_info.goods_info.weight = document.getElementById('et_dun').value;

							if (document.getElementById('ed_chang').value != "") {
								g.save2DB(g.storage_key.yi_chang, document.getElementById('ed_chang').value);
							} else {
								g.save2DB(g.storage_key.yi_chang, "");
							}

							if (document.getElementById('ed_kuan').value != "") {
								g.save2DB(g.storage_key.yi_kuan, document.getElementById('ed_kuan').value);
							} else {
								g.save2DB(g.storage_key.yi_kuan, "");
							}

							if (document.getElementById('ed_gao').value != "") {
								g.save2DB(g.storage_key.yi_gao, document.getElementById('ed_gao').value);
							} else {
								g.save2DB(g.storage_key.yi_gao, "");
							}

							//处理图片
							var pic = localStorage.getItem(g.storage_key.user_imgTemp);
							if (pic) {
								fun.uploadPic(goods_info, pic);
								return;
							} else {
								goods_info.goods_info.goods_pic = "";
								g.save2DB(g.storage_key.goods_info, JSON.stringify(goods_info));
								fun.goBack();
							}
						})
					}, 400);

					document.getElementById('chk_yixing').addEventListener('tap', function() {
						fun.checkYixing();
					})

					document.getElementById('lbl_yixing').addEventListener('tap', function() {
						fun.checkYixing();
					})

					document.getElementById('food').addEventListener('tap', function() {
						fun.selectIndexType(1);
					})

					document.getElementById('equipment').addEventListener('tap', function() {
						fun.selectIndexType(2);
					})

					document.getElementById('material').addEventListener('tap', function() {
						fun.selectIndexType(3);
					})

					document.getElementById('clothes').addEventListener('tap', function() {
						fun.selectIndexType(4);
					})

					document.getElementById('abnormity').addEventListener('tap', function() {
						fun.selectIndexType(5);
					})

					document.getElementById('other').addEventListener('tap', function() {
						fun.selectIndexType(6);
					})

				},
				goods: function() {
					/**
					 * 照相机图标点击
					 * 15/12/23 */
					document.getElementById('funGoodsPhotoCameraClick').addEventListener('tap', function() {
						$scope.fun.goods.photo.cameraClick();
					});

					/**
					 * 照相生成的图片点击
					 * 15/12/23 */
					document.getElementById('uiGoodsImgClick').addEventListener('tap', function() {
						$scope.ui.goods.imgClick();
					});

					/**
					 * mask点击事件uiGoodsMaskClick
					 * 15/12/23 */
					document.getElementById('uiGoodsMaskClick').addEventListener('tap', function() {
						$scope.ui.goods.maskClick();
					});

					//清除图片
					document.getElementById('clsImg').addEventListener('tap', function() {
						localStorage.removeItem(g.storage_key.user_imgTemp);
						$scope.goodsImg = '';
						$scope.hasImg = '';
						$scope.ui.goods.showImg = false;
						setTimeout(function() {
							$scope.$apply(function() {
								$scope.goodsImg = '';
							})
						}, 0);
					});
				},
			},

			//上传图片
			uploadPic: function(goods_info, pic) {
				var paramter = [];
				paramter['uid'] = g.read2DB(g.storage_key.user_id);
				paramter['psd_time'] = g.read2DB(g.storage_key.user_token);
				paramter['goods_photo'] = pic;
				if (g.read2DB(g.storage_key.up_pic_url) != '') {
					paramter['unlink_pic'] = g.read2DB(g.storage_key.up_pic_url);
				}


				goodsDb.uploadGoodsPic(paramter, function(re) {
//					console.error(JSON.stringify(re));
					if (re.code == 'S' && re.data != undefined) {
						g.save2DB(g.storage_key.up_pic_url, re.data.imgurl_name);
						goods_info.goods_info.goods_pic = re.data.imgurl_name;
						g.save2DB(g.storage_key.goods_info, JSON.stringify(goods_info));
						fun.goBack();
					} else if (re.code == 'T') {
						mui.toast('登录超时，请重新登录');
						setTimeout(function() {
							publicServer.goUrl('../member/quit.html');
						}, 1000);
					} else {
						mui.toast('很抱歉，上传货物照片失败');
					}
				}, function() {
					mui.toast('未知错误，上传货物照片失败！');
				});
			},

			selectIndexType: function(index) {
				var listId = ['food', 'equipment', 'material', 'clothes', 'abnormity', 'other'];
				for (var i = 0; i < listId.length; i++) {
					if (i == index - 1) {
						document.getElementById(listId[i]).className = 'r_tag selected';
						document.getElementById("icon_" + listId[i]).className = "r_icon_" + listId[i] + "_red";
					} else {
						document.getElementById(listId[i]).className = 'r_tag';
						document.getElementById("icon_" + listId[i]).className = "r_icon_" + listId[i] + "_gray";
					}
				}
			},

			checkYixing: function() {
				if (document.getElementById('chk_yixing').src.indexOf('btn_check_c.png') > 0) {
					document.getElementById('chk_yixing').src = '../../../Public/images/btn_check.png';
					document.getElementById("ed_chang").value = "";
					document.getElementById("ed_kuan").value = "";
					document.getElementById("ed_gao").value = "";
				} else {
					document.getElementById('chk_yixing').src = '../../../Public/images/btn_check_c.png';
				}
			},

			chkInput: function() {
				var errMsg = "";
				if (document.getElementById('et_dun').value == "" && document.getElementById('et_fang').value == "" && car_Type >= 4) {
					errMsg = "4.2米以上车型，重量和体积至少需要输入1个";
					return errMsg;
				}

				if (document.getElementById('chk_yixing').src.indexOf('btn_check_c.png') > 0) {
					if (document.getElementById('ed_chang').value == "" && document.getElementById('ed_kuan').value == "" && document.getElementById('ed_gao').value == "") {
						errMsg = "对异形件，长,宽,高至少需要输入1个";
						return errMsg;
					}
				}

				return "";
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

		/**
		 * 作用域下的事件对象
		 * 15/12/22 */
		$scope.fun = {
			/**
			 * goods
			 * 15/12/23 */
			goods: {

				/**
				 * 拍照
				 * 15/12/23 */
				photo: {

					//拍照图标点击事件
					cameraClick: function() {
						this.photoAlert();
					},

					//拍照逻辑 并加入回调监听事件
					photoAlert: function() {
						photo(this.setPhoto);
					},

					//照片回调事件
					setPhoto: function() {
						var tempImg = localStorage.getItem(g.storage_key.user_imgTemp);

						if (tempImg) {
							$scope.goodsImg = '';
							$scope.hasImg = 'yes';
							$scope.ui.goods.showImg = true;
							setTimeout(function() {
								$scope.$apply(function() {
									$scope.goodsImg = tempImg;
								})
							}, 0);
						}
					}
				},
			},
		}
	
	});


})