define(function (require) {


    var g = require('../public/g.js');
    var tools = require('../public/tools.js');

    require('../../directive/js/default/topNav.js');
    require('../../../Public/js/moment.js');
    require('../../server/mServerData.js');
    require('../../server/default/publicServer.js');

    var pay = require('../../controller/default/pay.js'); //支付宝支付

    var topNav = require('../../directive/js/default/topNav.js');

    var dealInfo;


    g.app.controller('signUpCtrl', function ($scope, mServer, publicServer) {
        dealInfo = jQuery.parseJSON(g.read2DB(g.storage_key.deal_push));
          		console.error('push='+JSON.stringify(dealInfo));

        $scope.goods_type = dealInfo.goods_type;
        $scope.pay_type = dealInfo.pay_type;
        $scope.driver_name = dealInfo.driver_name;
        $scope.car_num = dealInfo.car_num;

        if (dealInfo.pay_type == '1') {
            $scope.pay_type = "担保支付";
        } else if (dealInfo.pay_type == '2') {
            $scope.pay_type = "每周结算";
        } else if (dealInfo.pay_type == '3') {
            $scope.pay_type = "现场结算";
        }
        
        	$scope.goods_class = dealInfo.goods_class;
        if (dealInfo.goods_class=="1"){
        		$scope.pur_money = dealInfo.pur_money;
        }else{
        		$scope.pur_money = parseInt(dealInfo.pur_money*dealInfo.rep_days);
        		$scope.disp_money = dealInfo.rep_days+"日*"+dealInfo.pur_money+"元＝￥"+$scope.pur_money+"元";
        }
        
        

        document.getElementById('dosign').addEventListener('tap', function () {
            //如果是担保支付，跳到支付宝支付画面
            if (dealInfo.pay_type == 1) {
                var uid = g.read2DB(g.storage_key.user_id);
                var psd_time = g.read2DB(g.storage_key.user_token);
                pay('alipay', $scope.pur_money, dealInfo.order_id,uid,psd_time);
            }else{
            		doSuccess(mServer, publicServer);
            }
        });

        document.getElementById('detail').addEventListener('tap', function () {
            publicServer.goUrl('deal_detail.html');
        });

        tools.tools.hackGoUrl();

        /**
         * 监听doSuccess事件
         * 16/2/24 */
        window.addEventListener('doSuccess', function () {
            doSuccess(mServer, publicServer);
//			danbao_success(publicServer,"S");
        });
    });

	/**
	 * 担保支付发布协议
	 * @param {Object} publicServer
	 * @param {Object} code
	 */
//	function danbao_success(publicServer,code) {
//		g.save2DB(g.storage_key.yi_chang, "");
//		g.save2DB(g.storage_key.yi_kuan, "");
//		g.save2DB(g.storage_key.yi_gao, "");
//		
//		if (code == "S") {
//			var btnArray = ['确认'];
//			mui.confirm('签署成功，已短信通知车主。车主签署完协议后，会短信通知您', '签署成功', btnArray, function(e) {
//				publicServer.goUrl('signComplete.html');
//			});
//		}else{
//			mui.toast("支付失败，请联系客服");
//		}
//	}
	
	/**
	 * 周结和现场结算发布协议
	 * @param {Object} mServer
	 * @param {Object} publicServer
	 */
    function doSuccess(mServer, publicServer) {
        var paramter = [];
        paramter['uid'] = g.read2DB(g.storage_key.user_id);
        paramter['psd_time'] = g.read2DB(g.storage_key.user_token);
        paramter['order_id'] = dealInfo.order_id;

//      console.error('uid=' + paramter['uid']);
//      console.error('psd_time=' + paramter['psd_time']);
//      console.error('order_id=' + paramter['order_id']);

        mServer.launchDeal(paramter, function (re) {
            console.error("history=" + JSON.stringify(re));
            g.save2DB(g.storage_key.yi_chang, "");
            g.save2DB(g.storage_key.yi_kuan, "");
            g.save2DB(g.storage_key.yi_gao, "");
            if (re.code == 'S' && re.data != undefined) {
                g.save2DB(g.storage_key.cur_deal_id, re.data.deal_id);
                g.save2DB(g.storage_key.cur_deal_code, re.data.deal_code);
                
                if (re.data.result == '签署成功，已短信通知车主。'){
                		g.save2DB(g.storage_key.autoSign, '1');
                }else{
                		g.save2DB(g.storage_key.autoSign, '0');
                }

                var btnArray = ['确认'];
                mui.confirm(re.data.result, '签署成功', btnArray, function (e) {
                    publicServer.goUrl('signComplete.html');
                });
            } else if (re.code == 'T') {
                mui.toast('登录超时，请重新登录');
                setTimeout(function () {
                    publicServer.goUrl('../member/quit.html');
                }, 1000);
            } else {
//              mui.toast('签署协议失败，请检查网络');
				mui.toast(re.err_msg);
                setTimeout(function () {
                    g.save2DB(g.storage_key.cur_deal_code, 'WXTEST001');
                }, 1000);
            }
        }, function () {
            mui.toast('签署协议失败，请检查网络');
        });
    }
});