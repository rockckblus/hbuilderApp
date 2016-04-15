/**
 * 全局对象
 * 15-7-29 */

define(function (require) {
    require('../../../Public/js/angular.min.js'); //angular

    $(function () {
        //设置高度
        var h = $(window).outerHeight();
        $('body').height(h);
        $('[role=segment] a').click(function () {
            $(this).addClass('selected').siblings().removeClass('selected');
        });
    });

    //修改post传值为标准格式
    var app = angular.module('city', [], function ($httpProvider) {
        // Use x-www-form-urlencoded Content-Type
        $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
        $httpProvider.defaults.headers.put['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

        /**
         * The workhorse; converts an object to x-www-form-urlencoded serialization.
         * @param {Object} obj
         * @return {String}
         */
        var param = function (obj) {
            var query = '',
                name, value, fullSubName, subName, subValue, innerObj, i;

            for (name in obj) {
                value = obj[name];

                if (value instanceof Array) {
                    for (i = 0; i < value.length; ++i) {
                        subValue = value[i];
                        fullSubName = name + '[' + i + ']';
                        innerObj = {};
                        innerObj[fullSubName] = subValue;
                        query += param(innerObj) + '&';
                    }
                } else if (value instanceof Object) {
                    for (subName in value) {
                        subValue = value[subName];
                        fullSubName = name + '[' + subName + ']';
                        innerObj = {};
                        innerObj[fullSubName] = subValue;
                        query += param(innerObj) + '&';
                    }
                } else if (value !== undefined && value !== null) {
                    query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
                }
            }

            return query.length ? query.substr(0, query.length - 1) : query;
        };

        // Override $http service's default transformRequest
        $httpProvider.defaults.transformRequest = [

            function (data) {
                return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
            }
        ];
    });

    /*
     * 将值保存到db中，类似于原生的往prefrence写
     */
    var save2DB = function (key, value) {
        window.localStorage.setItem(key, value);
    };

    /*
     * 从db里读取值，类似于从原生的prefrence读取
     */
    var read2DB = function (key) {
        var value = window.localStorage.getItem(key);
        if (!value && typeof(value) != "undefined" && value !== 0) {
            value = "";
        }

        return value;
    };
    /**
     * 移除指定的数据
     * @param {Object} key
     */
    var removeBykey = function (key) {
        return window.localStorage.removeItem(key);
    };

    /*
     @function     JsonSort 对json排序
     @param        json     用来排序的json
     @param        key      排序的键值
     */
    var JsonSort = function (json, key) {
        for (var j = 1, jl = json.length; j < jl; j++) {
            var temp = json[j],
                val = temp[key],
                i = j - 1;
            while (i >= 0 && json[i][key] > val) {
                json[i + 1] = json[i];
                i = i - 1;
            }
            json[i + 1] = temp;

        }
        //console.log(json);
        return json;
    };

    /** 全局对象 */
    var g = {};
    g.app = app;
    //线上
    g.headRootUrl = 'http://www.5656111.com:8080/publicIndex/upData/images';
    g.apiHost = 'http://city.5656111.com';


    //线下
    //g.headRootUrl = 'http://123.150.38.2:8080/publicIndex/upData/images';
    //g.apiHost = 'http://123.150.38.2:8081/index.php';

    //----------------------------

//  g.oldApi = 'http://182.92.192.250:8080'; //8080api接口
    g.overTime = 25000; //页面跳转超时设置 以及http请求超时时间
    g.sortOverTime = 5000; //页面跳转短超时设置
    g.hackGoUrlcount = false;
    g.save2DB = save2DB;
    g.read2DB = read2DB;
    g.removeBykey = removeBykey;
    g.JsonSort = JsonSort;

    //存储在storage里的key
    g.storage_key = {
        log_onff: 'logSwitch', //是否向服务器投送log开关 0-不提交  1-提交
        telphone: 'tel', //当前用户的电话号码
        user_id: 'userId', //当前登录的用户id
        role_type: 'roleType', //1-普通货主 2-线路竞标货主
        pay_type: 'payType', //当前登录的结算方式
        locale_stlimits: 'payLimit', //0-禁止现场结算 1-可以
        goods_time_touch: 'goodsTimeTouch', //touch选择时间空间临时存储key 按type 分为 one和two 两个对象 转json串
        user_header: 'userHeader', //用户头像
        user_header_url: 'userHeaderUrl', //用户头像(保存在服务器的url)
        user_imgTemp: 'userImgTemp', //用户拍照，或者相册选择的临时图像
        user_token: 'token', //当前用户的token
        owner_id: 'ownerID', //当前用户的老板的uid
        real_name: 'realName', //当前用户的真实姓名
        credit_score: 'creditScore', //信誉积分
        exchange_score: 'exchangeScore', //兑换积分
        level: 'level', //货主等级
        nextstep: 'nextStep', //到下一级别还差多少积分

        goods_info: 'goodsInfo', //当前货源详情
        up_pic_url: 'upPicUrl', //上传商品图片的url，正式发布后需要清空

        cur_address: 'curAddress', //当前地址
        cur_lat: 'curLat', //当前纬度
        cur_lng: 'curLng', //当前经度

        yi_chang: 'yiChang', //异形件设定的长
        yi_kuan: 'yiKuan', //异形件设定的宽
        yi_gao: 'yiGao', //异形件设定的高

        all_fahuo: 'allFahuo', //记录保存的所有发货起的名字(用这些名字保存在db中)

        deal_push: 'dealPush',  //跳转到发起协议画面时，临时保存的中间变量
        cur_deal_id: 'curDealId',  //发起协议成功后，得到服务器传回的deal_id
        cur_deal_code: 'curDealCode',  //发起协议成功后，得到服务器传回的deal_code

        danbao_can: 'danbao_can', //是否支持担保支付 0-不支持 1-支持
        autoSign: 'auto_sign'  //0-发起协议时，替车主签署不成功  1-成功
    };


    return g;


});