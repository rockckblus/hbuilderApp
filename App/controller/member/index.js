/**
 * 货主会员中心首页
 * 15/10/25 */
define(function (require) {

    //全局对象，包括angular bodyAll 控制器
    var g = require('../public/g.js');
    var tools = require('../public/tools.js');
//  //topNav
    var topNav = require('../../directive/js/default/topNav.js');
//  //侧栏
    var leftNav = require('../../directive/js/default/webView/leftNav/leftNav.js');

    //getFile 测试文件操作directive
//    require('../../directive/js/default/file/getFile.js');

    g.app.controller('huoIndex', function ($http, $scope) {
        tools.tools.hackGoUrl();
    })
})