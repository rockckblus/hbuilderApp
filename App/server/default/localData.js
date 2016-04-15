/**
 * Created by rockblus on 15/11/10.
 * 本地数据
 */

define(function (require) {
    var g = require('../../controller/public/g.js');
    var tools = require('../../controller/public/tools.js');
    g.app.factory('localData', function ($http) {


        /**
         * 本地数据
         * 15/11/11 */
        var re = {

            leftNav: {
                list: [
                    {
                        id: 1,
                        icon: '../../../../../../Public/images/leftNav/icon_nav5.png',
                        url: '../../../../../aTpl/bidding/mineOrder_main.html',
                        title: '我的订单',
                        rightCount: false,
                        thisItem: 0
                    },
                    {
                        id: 2,
                        icon: '../../../../../../Public/images/leftNav/icon_nav4.png',
                        url: '../../../../../aTpl/member/integral.html',
                        title: '我的积分',
                        rightCount: 0,//此处如果有数字 就是 右侧带图标的 数字
                        thisItem: 0
                    },
                    {
                        id: 3,
                        icon: '../../../../../../Public/images/leftNav/icon_nav6.png',
                        url: '../../../../../aTpl/member/quit.html',
                        title: '退出登录',
                        rightCount: false,
                        thisItem: 0

                    }
                ]
            },

            /**
             * topNav
             * 15/12/1 */
            topNav: {
                logo: function () {
                    return plus.io.convertLocalFileSystemURL("_www/Public/images/logoTop.png");
                },
                item: {},
                getUrl: function () {
                    var url = tools.tools.getUrl();
                    switch (url) {
                        case '/App/aTpl/goods/index.html': //发货首页
                            re.topNav.item.left = '个人中心';
                            re.topNav.item.leftBack = false; //是否左侧需要响应 mui.back()事件
                            re.topNav.item.logo = this.logo();
                            re.topNav.item.right = '我的发货';
                            break;
                        case '/App/aTpl/goods/line_index.html': //发货首页
                            re.topNav.item.left = '个人中心';
                            re.topNav.item.leftBack = false; //是否左侧需要响应 mui.back()事件
                            re.topNav.item.logo = this.logo();
                            re.topNav.item.right = '我的发货';
                            break;
                        case '/App/aTpl/goods/car_type.html': //车型选择
                            re.topNav.item.leftBack = true; //是否左侧需要响应 mui.back()事件
                            re.topNav.item.center = '车型选择';
                            re.topNav.item.right = '确定';
                            break;
                        case '/App/aTpl/goods/add_service.html': //附加服务
                            re.topNav.item.leftBack = true; //是否左侧需要响应 mui.back()事件
                            re.topNav.item.center = '附加服务';
                            re.topNav.item.right = '确定';
                            break;
                        case '/App/aTpl/goods/goods_message.html': //货物信息
                            re.topNav.item.leftBack = true; //是否左侧需要响应 mui.back()事件
                            re.topNav.item.center = '货物信息';
                            re.topNav.item.right = '确定';
                            break;
                        case '/App/aTpl/goods/historical_line.html': //货物信息
                            re.topNav.item.leftBack = true; //是否左侧需要响应 mui.back()事件
                            re.topNav.item.center = '货物信息';
                            re.topNav.item.right = '';
                            break;
                        case '/App/aTpl/goods/confirmation_order.html': //发货确认
                            re.topNav.item.leftBack = true; //是否左侧需要响应 mui.back()事件
                            re.topNav.item.center = '货源发布';
                            re.topNav.item.right = '保存';
                            break;
                        case '/App/aTpl/goods/confirmation_order_line_bidding.html': //发货确认
                            re.topNav.item.leftBack = true; //是否左侧需要响应 mui.back()事件
                            re.topNav.item.center = '货源发布';
                            re.topNav.item.right = '保存';
                            break;
                        case '/App/aTpl/goods/editAddrLine.html': //线路竞标 编辑装卸货时间地址
                            re.topNav.item.leftBack = true; //是否左侧需要响应 mui.back()事件
                            re.topNav.item.center = '线路地址添加';
                            re.topNav.item.right = '历史线路';
                            break;

                        case '/App/aTpl/bidding/mineOrder_main.html': //发货确认
                            re.topNav.item.leftBack = true; //是否左侧需要响应 mui.back()事件
                            re.topNav.item.center = '我的订单';
                            re.topNav.item.right = '已完成';
                            break;

                        case '/App/aTpl/bidding/mineOrder_main.html': //发货确认
                            re.topNav.item.leftBack = true; //是否左侧需要响应 mui.back()事件
                            re.topNav.item.center = '我的订单';
                            re.topNav.item.right = '已完成';
                            break;
                        case '/App/aTpl/bidding/completeOrder.html': //已完成协议
                            re.topNav.item.leftBack = true; //是否左侧需要响应 mui.back()事件
                            re.topNav.item.center = '已完成订单';
                            re.topNav.item.right = '';
                            break;

                        case '/App/aTpl/bidding/mineBidding_main.html': //我的货源
                            re.topNav.item.leftBack = true; //是否左侧需要响应 mui.back()事件
                            re.topNav.item.center = '我的发货';
                            re.topNav.item.right = '待发布货源';
                            break;
                        case '/App/aTpl/bidding/draftGoods.html': //临时货源
                            re.topNav.item.leftBack = true; //是否左侧需要响应 mui.back()事件
                            re.topNav.item.center = '待发布货源';
                            re.topNav.item.right = '';
                            break;
                        case '/App/aTpl/goods/pay_type.html': //支付方式
                            re.topNav.item.leftBack = true; //是否左侧需要响应 mui.back()事件
                            re.topNav.item.center = '支付方式';
                            re.topNav.item.right = '确定';
                            break;
                        case '/App/aTpl/bidding/signUpDeal.html': //发起协议
                            re.topNav.item.leftBack = true; //是否左侧需要响应 mui.back()事件
                            re.topNav.item.center = '协议签署';
                            break;
                        case '/App/aTpl/bidding/deal_detail.html': //协议详情
                            re.topNav.item.leftBack = true; //是否左侧需要响应 mui.back()事件
                            re.topNav.item.center = '协议详情';
                            break;
                        case '/App/aTpl/member/integral.html': //积分详情
                            re.topNav.item.leftBack = true; //是否左侧需要响应 mui.back()事件
                            re.topNav.item.center = '会员积分';
                            re.topNav.item.right = '积分规则';
                            break;
                        case '/App/aTpl/member/score_rule.html': //积分规则
                            re.topNav.item.leftBack = true; //是否左侧需要响应 mui.back()事件
                            re.topNav.item.center = '积分规则';
                            break;
                        case '/App/aTpl/default/baiduMap.html': //gps跟踪
                            re.topNav.item.leftBack = true; //是否左侧需要响应 mui.back()事件
                            re.topNav.item.center = '货物跟踪';
                            break;
                        default:
                            re.topNav.item.left = '个人中心';
                            re.topNav.item.leftBack = false; //是否左侧需要响应 mui.back()事件
                            re.topNav.item.center = '物流帮';
                            re.topNav.item.right = '我的发货';
                            break;
                    }
                }
            }

        }


        re.topNav.getUrl(); //遍历网址 给top导航数据
        return re;
    })
})