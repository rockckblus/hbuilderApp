/**
 * 公共侧滑导航 directive
 */
define(function (require) {
    //全局对象，包括angular bodyAll 控制器
    var g = require('../../../../../controller/public/g.js');
    var tools = require('../../../../../controller/public/tools.js');

    //载入本地数据localData
    require('../../../../../server/default/localData.js');
    //载入publicServer
    require('../../../../../server/default/publicServer.js');

    g.app.directive('leftnav', function (localData) {
        return {
            restrict: 'E',//E:包裹标签  A:属性 C:class
            //require:其他directive,
            replace: true,
            //此处可以引用外部html文件,添加对象名 templateUrl  todo (新架构路径不对)
            templateUrl: "../../../../html/default/webView/leftNav/leftNavDirective.html",
            controller: function ($scope, $timeout) {

                /**
                 * 给高亮
                 * 16/2/6 */
                var thisV = plus.webview.currentWebview().opener(); //获取创建者
                for (var vo in localData.leftNav.list) {
                    if (localData.leftNav.list[vo].url == thisV.id) {
                        localData.leftNav.list[vo].thisItem = 1;
                    }
                }

                $scope.listItem = localData.leftNav.list;//左侧导航List Item
                $scope.userData = {
                    tel: g.read2DB(g.storage_key.telphone),//电话
                    exchange_score: g.read2DB(g.storage_key.exchange_score)//积分
                };

                /**
                 * 联系客服
                 * 16/2/26 */
                $timeout(function () {
                    var kefuTel = document.getElementById('keFuTel');
                    kefuTel.addEventListener('tap', function () {
                        plus.device.dial("4008118311", false);//直接拨打电话
                    })
                }, 0)


            },
            link: function (scope, element, attrs) {


            }
        }
    });

    //主要图片根据div自适应 directive 目前主要 hackleftNav
    g.app.directive('hackimgcenter', function (publicServer, $timeout) {
            return{
                link: function (scope, element, attrs) {
                    //默认用户头像
                    scope.userHeader = '../../../../../../Public/images/leftNav/5d5510db212c57caffb13925e68bf1c5.jpg';
                    var frontImg = {};
                    var isLeftNav = false;//判断是否有需要 hack前景图片大小的 变量
                    var count = true;//判断重复加载变量
                    var topDiv = {};

                    tools.driver.trueAI(function () {//hack android 侧栏 自动变 70%
                        topDiv.width = element[0].offsetWidth;
                    }, function () {
                        topDiv.width = element[0].offsetWidth * 0.7;
                    });
                    topDiv.height = element[0].offsetHeight;


                    //方法相关
                    var fun = {

                        //判断是否img 外面有一层position，hack 这层div的 宽高 为 topDiv 的宽高。 调用标示 class = “needHackOutPositonDiv”
                        hackImgOutDiv: function () {
                            var topDivJq = $(element[0]);
//                            var height = document.getElementById('top2').offsetHeight;
                            setTimeout(function () {

                                var width = document.getElementById('top2').offsetWidth;
                                console.log('topDiv1,width', width);
                            }, 2000);

//                            console.log('topDiv1,height',height);
//                            topDiv.width = width;
//                            topDiv.height = height;
                            topDivJq.find('.needHackOutPositonDiv').each(function () {
                                $(this).css({
//                                    width: width + 'px',
//                                    height: height + 'px',
                                    overflow: 'hidden'
                                })
                            })
                        },

                        //获取遮罩层 图片大小
                        getFrontImg: function () {
                            var fImg = $("#leftNavUrlHackTopDivImg");

                            frontImg.width = fImg.width();
                            frontImg.height = fImg.height();
                            frontImg.left = fImg[0].offsetLeft;
                        },


                        //判断topDiv  img 横竖返回 1，2，3 公共方法 正方 1 ，横 2 ，竖3
                        truePublic: function (width, height) {
                            if (width == height) {
                                return 1;
                            }
                            if (width > height) {
                                return 2;
                            }
                            if (width < height) {
                                return 3;
                            }

                        },

                        //判断topDiv 是否正方形  返回
                        trueTopDiv: function () {
                            return fun.truePublic(topDiv.width, topDiv.height);
                        },

                        //判断图片横竖  返回 正方 1 ，横 2 ，竖3
                        trueImg: function (imgWidth, imgHeight) {
                            return fun.truePublic(imgWidth, imgHeight);
                        },

                        //setImgFun对象 实际 9种情况  目前只hack了 leftNav头像部分，要求 头像图片必须 为 方 todo
                        setImgFun: {
                            one: function (imgJq) {//div方，img方
                                imgJq.css({'height': '100%',
                                    'width': 'auto'});

                            },
                            two: function (imgJq) {//div方，img横  放大到长相等，宽居中，2边超出隐藏 todo
                                imgJq.css({'height': '100%',
                                    'width': 'auto'});
                            },
                            three: function (imgJq) {//div方，img竖 todo
                                imgJq.css('h', topDiv.width);
                            },
                            four: function (imgJq) {//div横，img方
                                imgJq.css({'height': topDiv.height,
                                    'width': 'auto'})
                                fun.hackEditHeader(imgJq.offset().top, imgJq.height());// hack 编辑图标 位置
                            },
                            five: function (imgJq) {//div横，img横 todo
                                console.log(topDiv.width);
                                imgJq.css('width', topDiv.width);
                            },
                            six: function (imgJq) {//div横，img竖 todo
                                imgJq.css('width', topDiv.width);
                                var more = imgJq.height() - topDiv.height;//计算变化高后的 img height，
                                more = more / 2;//计算偏移量
                                imgJq.css('margin-top', -more);
                            },
                            seven: function (imgJq) {//div竖，img方 todo

                                tools.driver.trueAI(function () {
                                    imgJq.css({'width': '100%',
                                        'height': 'auto'})
                                    setTimeout(function () {
                                        var more = topDiv.height - imgJq.height();//计算变化高后的 img height，
                                        more = more / 2;//计算偏移量
                                        if (more != 3) {//hack 边框尺寸
                                            imgJq.css('margin-top', more);
                                        }
                                        fun.hackEditHeader(imgJq.offset().top, imgJq.height());// hack 编辑图标 位置
                                    }, 500)
                                }, function () {
                                    imgJq.css({'width': topDiv.width,
                                        'height': 'auto'})
                                    setTimeout(function () {
                                        console.log('w', topDiv.height);
                                        var more = topDiv.height - imgJq.height();//计算变化高后的 img height，
                                        more = more / 2;//计算偏移量
                                        if (more != 3) {//hack 边框尺寸
                                            imgJq.css('margin-top', more);
                                        }

                                        fun.hackEditHeader(imgJq.offset().top, imgJq.height());// hack 编辑图标 位置


                                    }, 0)

                                })


                            },
                            eight: function (imgJq) {//div竖，img横 todo
                                imgJq.css('width', topDiv.width);
                            },
                            nine: function (imgJq) {//div竖，img竖 todo
                                imgJq.css('width', topDiv.width);
                            },
                        },

                        //给图片宽高
                        setImg: function (imgJq) {
                            var img = {  //图片宽高
                                width: imgJq.width(),
                                height: imgJq.height()
                            }

                            var topDivTrue = fun.trueTopDiv();//外部div 方1 横竖  2 , 3
                            var imgTrue = fun.trueImg(img.width, img.height);//方1 横竖 2 , 3

//                        组合遍历条件
                            var condition = 0;

                            //按照topDiv形状遍历
                            switch (topDivTrue) {
                                case 1://div 方形
                                    if (imgTrue == 1) {//img 方形
                                        condition = 1;
                                    }
                                    if (imgTrue == 2) {//img 横
                                        condition = 2;
                                    }
                                    if (imgTrue == 3) {//img 竖
                                        condition = 3
                                    }
                                    break;
                                case 2://div 横
                                    if (imgTrue == 1) {//img 方形
                                        condition = 4;
                                    }
                                    if (imgTrue == 2) {//img 横
                                        condition = 5;
                                    }
                                    if (imgTrue == 3) {//img 竖
                                        condition = 6
                                    }
                                    break;
                                case 3://div 竖
                                    if (imgTrue == 1) {//img 方形
                                        condition = 7;
                                    }
                                    if (imgTrue == 2) {//img 横
                                        condition = 8;
                                    }
                                    if (imgTrue == 3) {//img 竖
                                        condition = 9
                                    }
                                    break;
                            }


//                            console.log('condirion', condition);
                            switch (condition) {
                                case 1:
                                    fun.setImgFun.one(imgJq);
                                    break;
                                case 2:
                                    fun.setImgFun.two(imgJq);
                                    break;
                                case 3:
                                    fun.setImgFun.three(imgJq);
                                    break;
                                case 4:
                                    fun.setImgFun.four(imgJq);
                                    break;
                                case 5:
                                    fun.setImgFun.five(imgJq);
                                    break;
                                case 6:
                                    fun.setImgFun.six(imgJq);
                                    break;
                                case 7:
                                    fun.setImgFun.seven(imgJq);
                                    break;
                                case 8:
                                    fun.setImgFun.eight(imgJq);
                                    break;
                                case 9:
                                    fun.setImgFun.nine(imgJq);
                                    break;
                            }

                        },

                        //遍历页面有左侧导航 头像 需要hack标签
                        isLeft: function () {
                            var isLeft = $('#leftNavUrlHackTopDiv');
                            if (isLeft.length) {
                                isLeftNav = true;
                            }
                        },

                        //hackEditHeader 导航头像 编辑 按钮
                        hackEditHeader: function (imgTop, imgWidth) {
                            var editIcon = $('#editIcon');
                            var width = topDiv.width * (4 / 12);

                            editIcon.css({
                                'width': width,
                            })

                            //计算自己的一半
                            var twoOne = editIcon.width();
                            twoOne = twoOne / 2;

                            var top = imgTop + imgWidth - twoOne + 'px';
                            editIcon.css({
                                'margin-left': '-' + twoOne + 'px',
                                'top': top
                            })


                        },
                        //开始动作，判断是否需要hack前景遮罩，来重复执行 start

                        start: function () {
                            //遍历里面需要hack的图片 ,class标示 "needHack"
                            var t = $(element[0]);

                            t.find('.needHack').each(function () {
                                fun.setImg($(this));
                            })
                        }
                    }


                    fun.start();


                    /**
                     * 上传图片相关
                     * 15/11/26 */

                    var editHeader = {
                        /**
                         * 绑定编辑按钮点击事件
                         * 15/11/26 */
                        bindEditClick: function () {
                            document.getElementById('editIcon').addEventListener('tap', function () {
                                // 弹出系统选择按钮框
                                plus.nativeUI.actionSheet({title: "编辑头像", cancel: "取消", buttons: [
                                    {title: "拍照"},
                                    {title: "从相册选择"}
                                ]}, function (e) {
                                    if (e.index == 1) {
                                        editHeader.getImage();
                                    }
                                    if (e.index == 2) {
                                        editHeader.galleryImg();
                                    }
                                });
                            })
                        },

                        // 拍照
                        getImage: function () {
                            var cmr = plus.camera.getCamera();
                            cmr.captureImage(function (p) {
                                console.log("成功：" + p);
                                plus.io.resolveLocalFileSystemURL(p, function (entry) {
                                    setTimeout(function () {
                                        editHeader.setMyImg(entry.fullPath);
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
                                    editHeader.setMyImg(path);
                                }, 0);
                            })
                        },
                        setMyImg: function (path) {
                            localStorage.setItem('tempImgPath', path);
                            publicServer.goUrl("../../../../../directive/html/default/webView/gallery2/index.html");
                        },

                        //默认载入判断 html5 localstore 里面有没有用户头像，如果有就调用
                        changeImg: function () {
                            var userHeader = localStorage.getItem(g.storage_key.user_header);
                            if (userHeader) {
                                setTimeout(function () {
                                    scope.$apply(function () {
                                        scope.userHeader = userHeader;
                                    })
                                }, 0);
                            } else {//去服务器取头像数据 ,再解码
                                try {
                                    var imgUrl = g.headRootUrl + g.read2DB(g.storage_key.user_header_url);
                                    if (imgUrl) {
                                        tools.tools.convertImgToBase64(imgUrl, function (baseImg) {
                                            localStorage.setItem(g.storage_key.user_header, baseImg);
                                            $timeout(function () {
                                                scope.userHeader = baseImg;
                                            }, 0);
                                        })
                                    }
                                }
                                catch (e) {
                                    console.error(e);
                                }
                            }
                        },

                        //自定义响应头像回传事件
                        comHeaderFire: function () {
                            window.addEventListener('backLeftNav', function () {
                                editHeader.changeImg();
                                var main = plus.webview.currentWebview().opener();
                                mui.fire(main, 'openLeft');
                            })
                        },

                        start: function () {
                            editHeader.bindEditClick();
                            editHeader.changeImg();
                            editHeader.comHeaderFire();
                        },

                    }

                    editHeader.start();

                }
            }
        }
    );


    //


});
