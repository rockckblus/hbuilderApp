define(function (require) {

    var g = require('../public/g.js');
    var pays = {};

    function plusReady() {
        // 获取支付通道
        plus.payment.getChannels(function (channels) {
//            var content = document.getElementById('dcontent');
//            var info = document.getElementById("info");
            var content = 'content';
            var info = {};
            var txt = "支付通道信息：";
//          console.log('channels', channels);
            for (var i in channels) {
                var channel = channels[i];
                pays[channel.id] = channel;
                txt += "id:" + channel.id + ", ";
                txt += "description:" + channel.description + ", ";
                txt += "serviceReady:" + channel.serviceReady + "； ";
                var de = document.createElement('div');
                de.setAttribute('class', 'button');
                de.setAttribute('onclick', 'pay(this.id)');
                de.id = channel.id;
                de.innerText = channel.description + "支付";
//                content.appendChild(de);
                checkServices(channel);
            }
            info.innerText = txt;
        }, function (e) {
            outLine("获取支付通道失败：" + e.message);
        });
    }

// 检测是否安装支付服务
    function checkServices(pc) {
        if (!pc.serviceReady) {
            var txt = null;
            switch (pc.id) {
                case "alipay":
                    txt = "检测到系统未安装“支付宝快捷支付服务”，无法完成支付操作，是否立即安装？";
                    break;
//                default:
//                    txt = "系统未安装“" + pc.description + "”服务，无法完成支付，是否立即安装？";
//                    break;
            }
            plus.nativeUI.confirm(txt, function (e) {
                if (e.index == 0) {
                    pc.installService();
                }
            }, pc.description);
        }
    }

    var w = null;

    var PAYSERVER = 'http://city.5656111.com/Member/GetAjax/alipay_test';

// 支付
    function pay(id, price, order_id, uid, psd_time) {

        if (w) {
            return;
        }//检查是否请求订单中
        console.log(("----- 请求支付 -----"));
        var url = PAYSERVER;
        var type;
        if (id == 'alipay' || id == 'wxpay') {
            type = 'type=' + id;
        } else {
            plus.nativeUI.alert("不支持此支付通道！", null, "支付");

            return;
        }
        var uidEnd = '&uid=' + uid + '&total=';
        var orderId = '&order_id=' + order_id;//协议编号
        var psdTime = '&psd_time=' + psd_time;//psd_time
        w = plus.nativeUI.showWaiting();
        // 请求支付订单
        var amount = price;
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            switch (xhr.readyState) {
                case 4:
                    w.close();
                    w = null;
                    if (xhr.status == 200) {
                        outLine("----- 请求订单成功 -----");
                        outLine('服务器返回结果' + xhr.responseText);
                        var order = xhr.responseText;
                        var deal_id = editDealId(order);

                        saveDbOrderId(order);//记录数据库deal_id
                        plus.payment.request(pays[id], order, function (result) {
                            outLine("----- 支付成功 -----");
                            outLine('result', JSON.stringify(result));
                            plus.nativeUI.alert("支付成功：跳转到协议中心", function () {
                                //var thisV = plus.webview.currentWebview();//获取创建者
                                //mui.fire(thisV, 'doSuccess', {type: 'danbao'});

                                /**
                                 * 拼装deal_id
                                 * 16/4/12 */
                                successGoUrl(uid, psd_time, deal_id);//跳转到协议页面
                            }, "支付");
                        }, function (e) {
                            outLine("----- 支付失败 -----");
                            outLine("[" + e.code + "]：" + e.message);
                            plus.nativeUI.alert("支付失败,请联系客服" + e.message, null, "支付失败：" + e.code);
                        });
                    } else {
                        outLine("----- 请求订单失败 -----");
                        outLine('xhrStatus', xhr.status);
                        plus.nativeUI.alert("获取订单信息失败！", null, "支付");
                    }
                    break;
                default:
                    break;
            }
        };
        xhr.open('POST', url);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.send(type + uidEnd + amount + orderId + psdTime);
    }

    /**
     * 记录数据库deal_id
     * 16/3/24 */
    function saveDbOrderId(order) {
        order = editDealId(order);

        g.save2DB('tempDeal_id', order);

        g.save2DB(g.storage_key.yi_chang, "");
        g.save2DB(g.storage_key.yi_kuan, "");
        g.save2DB(g.storage_key.yi_gao, "");
    }

    /**
     * 拼装deal_id
     * 16/4/12 */
    function editDealId(order) {

        order = order.split('&');
        order = order[12];
        order = order.split('\"');
        order = order[1];

        return order;
    }

    /**
     * 支付成功跳转动作
     * 16/3/24 */
    function successGoUrl(uid, psd_time, deal_id) {

        _postAutoDeal(function () {

            g.save2DB(g.storage_key.cur_deal_id, g.read2DB('tempDeal_id'));
            g.save2DB('tempDeal_id', '');

            //g.save2DB(g.storage_key.cur_deal_code, re.data.deal_code);//服务器 接口未返回
            g.save2DB(g.storage_key.autoSign, '1');

            setTimeout(function () {
                var trueComplete = plus.webview.getWebviewById('signComplete.html');
                if(trueComplete){
                    plus.webview.show('signComplete.html');
                }else{
                    plus.webview.open('signComplete.html');
                }
            }, 0);
        });


        /**
         * post 车主自动签约接口
         * 16/4/12 */
        function _postAutoDeal(callBack) {
            var postUrl = 'http://city.5656111.com/Api/AppHuo/autoDeal';
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                switch (xhr.readyState) {
                    case 4:
                        if (xhr.status == 200) {
                            callBack();
                        } else {
                            plus.nativeUI.alert("司机自动签署失败,等待司机手动签约");
                            callBack();
                        }
                        break;
                    default:
                        callBack();
                        break;
                }
            };

            /**
             * 组合post url
             * 16/4/13 */
            uid = 'uid=' + uid;
            psd_time = '&psd_time=' + psd_time;
            deal_id = '&deal_id=' + deal_id;
            xhr.open('POST', postUrl);
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhr.send(uid + psd_time + deal_id);
        }
    }


    function outLine(str) {
        console.log(str);
    }

    plusReady();
    return pay;

});