/**
 * galleryDefault.js
 * 15/11/26 */

define(function (require) {

    //全局对象，包括angular bodyAll 控制器
    var g = require(plus.io.convertLocalFileSystemURL("_www/App/controller/public/g.js"));
    var tools = require(plus.io.convertLocalFileSystemURL("_www/App/controller/public/tools.js"));


    g.app.controller('gallery', function ($http, $scope) {

        $scope.myImage = localStorage.getItem('tempImgPath');

        var handleFileSelect = function (evt) {
            $scope.$apply(function () {
                $scope.myImage = evt;
            });
        };

        //把选好的图片 存到到本地数据库
        var setLocalImg = {


            //缓存图片到本地
            catchHeader: function (imgData) {

                localStorage.setItem(g.storage_key.user_imgTemp, imgData);

                //传缓存后的头像地址 imgDAta
                setLocalImg.backLeftNav(imgData);
            },

            //关闭当前页面 mui。back
            backLeftNav: function (imgData) {
                if (imgData) {
                    var thisV = plus.webview.currentWebview().opener(); //获取创建者
                    mui.fire(thisV, 'photoBack'); //通知自定义事件
                    mui.back();
                } else {
                    plus.nativeUI.toast('获取图片失败');
                }
            }

        }

        var result;
        //图片插件
        var setMyImg = function () {
            $('#image').cropper("destroy");
            var $previews = $('.preview');
            result = $('#image').cropper({
                aspectRatio: 1 / 1,
                background: false,
                build: function (e) {
                    var $clone = $(this).clone();
                    $clone.css({
                        display: 'block',
                        minWidth: 0,
                        minHeight: 0,
                        maxWidth: 'none',
                        maxHeight: 'none'
                    });

                    $previews.css({
                        width: '110px',
                        overflow: 'hidden'
                    }).html($clone);
                },

                crop: function (e) {
                    var imageData = $(this).cropper('getImageData');
                    var previewAspectRatio = e.width / e.height;

                    $previews.each(function () {
                        var $preview = $(this);
                        var previewWidth = $preview.width();
                        var previewHeight = previewWidth / previewAspectRatio;
                        var imageScaledRatio = e.width / previewWidth;

                        $preview.height(previewHeight).find('img').css({
                            width: imageData.naturalWidth / imageScaledRatio,
                            height: imageData.naturalHeight / imageScaledRatio,
                            marginLeft: -e.x / imageScaledRatio,
                            marginTop: -e.y / imageScaledRatio
                        });
                    });
                },
            })


            var res = result.cropper("getCroppedCanvas", {
                width: 110,
                height: 110
            });
            handleFileSelect(res.toDataURL());
        }

        setTimeout(function () {
            setMyImg();
            tools.tools.hackGoUrl();
        }, 800);

        //绑定提交图片事件
        var subBut = document.getElementById('selectImg');
        subBut.addEventListener('tap', function () {
            var res = result.cropper("getCroppedCanvas", {
                width: 300,
                height: 300
            });
            setLocalImg.catchHeader(res.toDataURL());
        })

    })


})


