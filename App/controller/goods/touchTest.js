/**
 * touchTest
 * 15/10/25 */
define(function (require) {
    //全局对象，包括angular bodyAll 控制器
    var g = require('../public/g.js');
    var tools = require('../public/tools.js');
    //topNav
    var topNav = require('../../directive/js/default/topNav.js');
    //侧栏
    var leftNav = require('../../directive/js/default/webView/leftNav/leftNav.js');

    //发货touch三级
    require("../../directive/js/goods/touchThreeFh.js");


    g.app.controller('touchTest', function () {

        tools.tools.hackGoUrl();
    })


});

