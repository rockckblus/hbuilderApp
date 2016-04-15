/**
 * photo照相服务
 * 15/11/16 */
define(function (require) {
    var g = require('../../controller/public/g.js');
    var tools = require('../../controller/public/tools.js');
    var publicserver = require('../../server/default/publicServer.js');

    g.app.factory('photo', function (publicServer) {
        var fun = {
            /**
             * 点击事件,弹出相机，还是相册
             * 15/11/26 */
            alertItem: function () {
                // 弹出系统选择按钮框
                plus.nativeUI.actionSheet({ cancel: "取消", buttons: [
                    {title: "拍照"},
                    {title: "从相册选择"}
                ]}, function (e) {
                    if (e.index == 1) {
                        fun.getImage();
                    }
                    if (e.index == 2) {
                        fun.galleryImg();
                    }
                });
            },

            // 拍照
            getImage: function () {
                var cmr = plus.camera.getCamera();
                cmr.captureImage(function (p) {
//                  console.log("成功：" + p);
                    plus.io.resolveLocalFileSystemURL(p, function (entry) {
                        setTimeout(function () {
                            fun.setMyImg(entry.fullPath);
                        }, 0);
                    }, function (e) {
                        console.log("读取拍照文件错误：" + e.message);
                    });
                }, function (e) {
                    console.log("失败：" + e.message);
                }, {filename: "_doc/camera/", index: 1});
            },

            //从相册选择
            galleryImg: function () {
                plus.gallery.pick(function (path) {
                    setTimeout(function () {
                        fun.setMyImg(path);
                    }, 0);
                })
            },
            setMyImg: function (path) {
                localStorage.setItem('tempImgPath', path);
                var url = "_www/App/directive/html/default/webView/gallery2/default.html";
                publicServer.goUrl(url);
            },


            //自定义响应图片回传事件
            comHeaderFire: function (backFun) {
                window.addEventListener('photoBack', function (ev) {//响应一个监听方法todo 有可能出现重复事件情况 todo
                    try {
                        backFun(ev);
                    } catch (e) {
                        console.warn(e);
                    }
                })
            },

            start: function (backFun) {
                fun.alertItem();
                fun.comHeaderFire(backFun);
            }

        };

        return fun.start;
    })
})