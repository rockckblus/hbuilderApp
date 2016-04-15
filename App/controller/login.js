define(function (require) {
    //全局变量
    var g = require('./public/g.js');

    //tools
    var tools = require('./public/tools.js');

    require('../server/mServerData.js');

    require('../server/default/publicServer.js');

    /*(首先判断是否有网络)
     * 1.splash页面的操作
     * 		检测版本更新    是否向服务器发送log  自动登录
     *
     * 1.验证码点击后调用获取验证码的接口
     * 		60秒的倒计时动画
     *
     * 2.点击登录按钮,获取表单中的数据,并封装传递到服务器校验
     * 		本地验证字符是否合法
     * 		服务器验证后返回验证是否通过
     * 			是:将用户名密码保存到plus.storage中,下次登录直接调用联网判断是否正确
     * 			否:错误的原因
     *
     */

    var security_code = '';
    var securityEnable = true;
    g.app.controller('login', function ($scope, mServer, publicServer) {
        document.getElementById("security_btn").addEventListener('tap', function () {
            //请求验证码并执行倒计时动画
            if (securityEnable) {
                getSecurityAnim(mServer);
            }
        });

        //关闭Splash页面之前的操作
        splash(mServer, publicServer, $scope);
        //登录按钮的点击事件
        $scope.btnlogin = function () {
            login(mServer, publicServer);
        };
    });

    var outTime = 0; //设置超时自动关闭splash页面
    /**
     * splash页面逻辑
     * 1.检查版本更新
     * 2.是否向服务器发送log
     * 3.待定...
     * @param {Object} mServer
     */
    function splash(mServer, publicServer) {
        //      g.save2DB(g.storage_key.role_type, "2");

        if (!tools.driver.noNet()) {
            /*
             * 需要设置超时时间,若超时自动关闭splash页面
             */
            if (outTime == -1) {
                //超时了
                outTime = 0;
                closeSplash('连接超时');
                //清空需要存储的数据
                g.removeBykey(g.storage_key.log_onff);
            } else if (outTime == 0) {
                //设置超时,暂定10s超时
                var out = setTimeout(function () {
                    outTime = -1;
                    splash(mServer);
                }, 10000);

                //联网请求数据的操作
                var params = [];

                if (mui.os.ios) {
                    params['phone_type'] = '2';
                } else if (mui.os.android) {
                    params['phone_type'] = '1';
                }

                mServer.getSplash(params, function (re) {
//					var str = JSON.stringify(re);
//					console.log("--splash--成功了--" + str);

                    //清除自定义的超时设置
                    clearTimeout(out);
                    var code = re.code;
                    if (code == 'S') {
                        //1.判断版本号是否需要升级
                        //存储是否需要像服务器发送log
                        g.save2DB(g.storage_key.log_onff, re.data.version_info.log_switch);
                        //升级机制,判断当前版本号和服务器返回的版本号,小于的话提示选择是否升级,否则不提示
                        //提示分为可选和不可选,即根据服务器返回的是否强制升级分为不升级也能使用和必须要升级才能使用





                        autoLogin(mServer, publicServer);
                        if (re.data.version_info.version_wnum) {
                            //获取本地的版本号
                            plus.runtime.getProperty(plus.runtime.appid, function (inf) {
                                var version = inf.version;
                                if (compairVersion(version, re.data.version_info.version_wnum)) {
                                    //判断是否需要强制升级
                                    if (re.data.version_info.upgrade_status == '2') {
                                        //不强制升级
                                        if (mui.os.ios) {
                                            //IOS  TODO
                                        } else if (mui.os.android) {
                                            //android
                                            var btnArray = ['是', '否'];
                                            mui.confirm('检测到新版版' + re.data.version_info.version_wnum + ',是否立即升级?', '版本升级', btnArray, function (e) {
                                                if (e.index == 0) {
                                                    downWgt(re.data.version_info.url, re.data.version_info.upgrade_status, mServer, publicServer);
//													downWgt('http://city.5656111.com/Public/Uploads/ZAPP/49/ZYWT0121.apk',re.data.version_info.upgrade_status,mServer,publicServer);
                                                } else {
                                                    autoLogin(mServer, publicServer);
                                                }
                                            });
                                        }
                                    } else if (re.data.version_info.upgrade_status == '3') {
                                        //强制升级
                                        if (mui.os.ios) {
                                            //IOS TODO

                                        } else if (mui.os.android) {
                                            //android
                                            mui.alert('检测到新版本' + re.data.version_info.version_wnum + ',立即升级!');
                                            downWgt(re.data.version_info.url, re.data.version_info.upgrade_status, mServer, publicServer);
                                        }
                                    }
                                } else {
                                    //不升级
                                    autoLogin(mServer, publicServer);
                                }
                            });
                        } else {
                            //不升级
                            autoLogin(mServer, publicServer);
                        }
                    } else if (code == 'F') {
                        console.log('失败F---Splash');
                        //失败也执行自动登录的方法
                        autoLogin(mServer, publicServer);
                    } else {
                        console.log('失败T---Splash');
                        autoLogin(mServer, publicServer);
                    }
                }, function () {
                    //网络不通
                    console.log('Netfail---Splash');
                    autoLogin(mServer, publicServer);
                });
                //				clearTimeout(out); //有了splash接口后应该去掉此方法
                //				autoLogin(mServer, publicServer);
            }
        } else {
            //网络没有连接
            closeSplash("网络没有连接,请连接后重试");
        }
    }

    /**
     * 自动登录
     */
    function autoLogin(mServer, publicServer) {
        //判断手机是否有网络
        if (!tools.driver.noNet()) {
            //有网络
            //获取本地存储的token 若有进入主页面,若没有,进入登录页面
            var token = g.read2DB(g.storage_key.user_token);

            //判断是否存储
            if (token) {
                //				var role_type = g.read2DB(g.storage_key.role_type);
                //				if ("1" == role_type) {
                //					//普通货主
                //					setTimeout(function() {
                //						publicServer.goUrl('../aTpl/goods/index.html');
                //					}, 0);
                //				} else if ("2" == role_type) {
                //					setTimeout(function() {
                //						//线路竞标货主
                //						publicServer.goUrl('../aTpl/goods/line_index.html');
                //					}, 0);
                //				}
                getUsrInfo(mServer, publicServer);
            } else {
                //至少有一个不存在,跳转到登录页面
                closeSplash();
            }

        } else {
            //没有网络
            closeSplash("网络没有连接,请连接后重试");
        }
    }

    /**
     * 自动登录时，取用户信息
     * @param {Object} mServer
     * @param {Object} publicServer
     */
    function getUsrInfo(mServer, publicServer) {
        //封装参数
        var params = [];
        params['uid'] = g.read2DB(g.storage_key.user_id);

        mServer.getUsrInfo(params, function (re) {
            doLogin(re, publicServer);
        }, function () {
            console.log('自动登录联网失败');
            closeSplash();
        });
    };

    /**
     * 联网获取验证码并执行倒计时动画
     * @param {Object} ele
     * @param {Object} mServer
     */
    function getSecurityAnim(mServer) {
        if (!tools.driver.noNet()) {
            //确认有网络连接
            var phone = $('#tel').val();
            if (!tools.verify.isEmpty(phone)) {
                plus.ui.toast("手机号不能为空");
                return;
            }

            if (!tools.verify.checkMobile(phone)) {
                plus.ui.toast("您输入的手机号格式不正确");
                return;
            }

            var param = [];
            param['phone'] = phone;

            mServer.getSecurity(param, function (re) {
//				console.error(re.data.code);
                //	mui.alert(re.data.code);
                console.log(JSON.stringify(re));
                //解析re,正确不作任何处理;错误-重置验证码按钮(resetTime(ele)),提示信息错误
                if ('S' == re.code) {
                    //正确
                    time();
                    security_code = re.data.code;
                } else {
                    resetTime();
                }
            }, function () {
                resetTime();
            });
        } else {
            //网络没有连接,不执行动画,提示检查网络
            plus.ui.toast("网络没有连接,请连接后重试");
        }
    }

    /**
     * 点击登录按钮操作
     * @param {Object} mServer
     */
    var login = function (mServer, publicServer) {
        var tel = $('#tel').val();
        var psd = $('#psd').val();

        //本地格式检验,手机号,验证码不能为空
        if (!tools.verify.isEmpty(tel)) {
            plus.ui.toast("手机号不能为空");
            return;
        }
        if (!tools.verify.isEmpty(psd)) {
            //验证码不为空
            plus.ui.toast("验证码不能为空");
            return;
        }
        //		console.log("--xie--"+psd);
        //		console.log("--cun--"+security_code);
        if (psd != security_code) {
            plus.ui.toast("您输入的验证码不正确");
            return;
        }
        //封装参数
        var params = [];
        params['phone'] = tel;
        params['code'] = psd;
        params['user_type'] = '2';

        console.error("phone=" + params['phone']);
        console.error("code=" + params['code']);

        mServer.getLogin(params, function (re) {
            doLogin(re, publicServer);
        });
    }

    function doLogin(re, publicServer) {
        //TODO 解析数据,根据数据判断登录成功保存数据,失败提示
        var str = JSON.stringify(re);
        console.log("--成功了--" + str);
        var code = re.code;
        if (code == 'S') {
            //成功
            g.save2DB(g.storage_key.user_id, re.data.uid); //当前登录的用户id
            g.save2DB(g.storage_key.owner_id, re.data.owner_uid); //当前用户的老板的uid
            g.save2DB(g.storage_key.user_token, re.data.token); //当前用户的token
            g.save2DB(g.storage_key.real_name, re.data.real_name); //当前用户的真实姓名
            g.save2DB(g.storage_key.telphone, re.data.telphone); //当前用户的电话号码

            g.save2DB(g.storage_key.role_type, re.data.role_type); //1-普通货主 2-线路竞标货主

            g.save2DB(g.storage_key.pay_type, re.data.settle_type); //当前登录的结算方式
            g.save2DB(g.storage_key.locale_stlimits, re.data.locale_stlimits); //是否允许现场结算
            g.save2DB(g.storage_key.user_header_url, re.data.headimage); //头像

            g.save2DB(g.storage_key.credit_score, re.data.credit_score); //信誉积分
            g.save2DB(g.storage_key.exchange_score, re.data.exchange_score); //兑换积分
            g.save2DB(g.storage_key.level, re.data.level); //级别
            g.save2DB(g.storage_key.nextstep, re.data.nextstep); //距下一等级积分
            //g.save2DB(g.storage_key.danbao_can, re.data.danbao); //是否支持担保支付
            g.save2DB(g.storage_key.danbao_can, 1); //是否支持担保支付

            if ('1' == re.data.role_type) {
                //普通货主
                publicServer.goUrl('../aTpl/goods/index.html');
                $('#stopClick').show(); //阻止点击
                //					goHome('../aTpl/goods/index.html');
            } else if ('2' == re.data.role_type) {
                //线路竞标货主
                publicServer.goUrl('../aTpl/goods/line_index.html');
                $('#stopClick').show(); //阻止点击
                //					goHome('../aTpl/goods/line_index.html');
            }

            if (re.data.isNewUser == '1') {
                mui.alert('欢迎使用物流邦货主版，您也可以是使用该电话号码和密码888888登录物流邦网站获取更多信息');
            }
        } else if (code == 'F') {
            //失败
            plus.ui.toast(re.err_msg);
            closeSplash('登录失败');
        } else if (code == 'T') {
            plus.ui.toast(re.err_msg);
            closeSplash('登录失败');
        }
    }

    /**
     * 跳转到主页面
     * @param {Object} goUrl--页面路径
     */
    function goHome(url) {
        if (url) {
            mui.openWindow({
                url: url,
                id: url,
                createNew: false,
                show: {
                    autoShow: true,
                    aniShow: 'pop-in'
                }
            });
        }
    }

    /**
     * 关闭splash页面
     * @param {Object} str--关闭后需要显示的提示信息,若不需要提示可以不传
     */
    function closeSplash(str) {

        /**
         * 设置login页面显示 hack 启动页面跳转过程 显示login 画面用
         * 16/2/6 */
        $('#loginShow').show();

        setTimeout(_closeSplash, 200);

        function _closeSplash() {
            if (str) {
                plus.navigator.closeSplashscreen();
                plus.ui.toast(str);
            } else {
                plus.navigator.closeSplashscreen();
            }
        }
    }

    /*********************发送验证码按钮倒计时动画**************************/
    var wait = 60;

    /**
     * 验证码倒计时动画
     */
    function time() {
        var btn = document.getElementById("security_btn");

        if (wait == 0) {
            securityEnable = true;
            btn.innerHTML = "发送验证码";
            wait = 60;
        } else {
            securityEnable = false;
            btn.innerHTML = wait + "'";
            wait--;
            setTimeout(function () {
                time();
            }, 1000);
        }
    }

    /**
     * 重置验证码按钮
     * @param {Object} ele
     */
    function resetTime() {
        var btn = document.getElementById("security_btn");
        securityEnable = true;
        btn.value = "发送验证码";
        wait = 60;
    }

    /****************************************************************/

    /**
     * 下载最新版本
     * @param {Object} downUrl
     */
    function downWgt(downUrl, type, mServer, publicServer) {

        console.log('====' + downUrl);

        plus.nativeUI.showWaiting('正在下载最新版本...');
        plus.downloader.createDownload(downUrl, {
            filename: "_doc/update/",
            retry: 1,
            timeout: 15
        }, function (d, status) {
            if (status == 200) {
                //下载成功
//				console.log('成功');
                plus.ui.toast("下载最新版本成功");
                installWgt(d.filename);
            } else {
                //下载失败
//				console.log('失败');
//				plus.ui.toast("下载最新版本失败");
                mui.alert('下载最新版本失败');
                if (type == '3') {
                    plus.runtime.quit();
                } else {
                    autoLogin(mServer, publicServer);
                }
            }
            plus.nativeUI.closeWaiting();
        }).start();
    }

    /**
     * 安装下载好的最新版本
     * @param {Object} path
     */
    function installWgt(path) {
        plus.nativeUI.showWaiting("正在安装最新版本...");
        plus.runtime.install(path, {}, function () {
            plus.nativeUI.closeWaiting();
            plus.nativeUI.alert('最新版本安装完成', function () {
                plus.runtime.restart();
            });
        }, function (e) {
            plus.nativeUI.closeWaiting();
            plus.ui.toast("最新版本安装失败!");
        });
    }

    /**
     * 比较版本号
     * @param {Object} server--服务器版本  形式  00.00.00
     * return  ture--需要升级    false--不需要升级
     */
    function compairVersion(local, server) {
        try {
            var localVersion = local.split('.');
            var serverVersion = server.split('.');

            if (localVersion[0] > serverVersion[0]) {
                //本地版本号大于服务器版本号
                return false;
            } else if (localVersion[0] == serverVersion[0]) {
                if (localVersion[1] > serverVersion[1]) {
                    return false;
                } else if (localVersion[1] == serverVersion[1]) {
                    if (localVersion[2] > serverVersion[2]) {
                        return false;
                    } else if (localVersion[2] == serverVersion[2]) {
                        return false;
                    } else {
                        return true;
                    }
                } else {
                    return true;
                }
            } else {
                //本地版本号小于服务器版本号
                return true;
            }
        } catch (e) {
            return false;
        }
    }

    /**
     * 监听退出登录事件 quit  清空输入，清空倒计时
     * 16/2/5 */
    window.addEventListener('quit', function () {
        var telInput = document.getElementById('tel');
        var codeInput = document.getElementById('psd');
        var btn = document.getElementById("security_btn");

        angular.element(telInput).val('');
        angular.element(codeInput).val('');

        plus.nativeUI.closeWaiting();

        wait = 0;

        /**
         * 设置login页面显示 hack 启动页面跳转过程 显示login 画面用
         * 16/2/6 */
        $('#loginShow').show();
    });

    /**
     * 监听hackGoUrl fire来的 跳转事件，把阻止点击 div 关闭
     * 16/2/6 */
    window.addEventListener('freeStopClick', function () {
        $('#stopClick').hide();
    })

});