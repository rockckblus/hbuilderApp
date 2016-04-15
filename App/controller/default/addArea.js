/**
 * 地址添加详细页面js,包括百度api的调用,可被地址输入页面预加载
 * 15/12/3 */
define(function (require) {

    //全局对象，包括angular bodyAll 控制器
    var g = require('../public/g.js');
    var tools = require('../public/tools.js');

    //topNav
    var topNav = require('../../directive/js/default/topNav.js');

    //addAreaDirectiv
    var addAreaJs = require("../../directive/js/default/addArea.js");

    //发货touch三级
    require("../../directive/js/goods/touchThreeFh.js");

    g.app.controller('addArea', function ($http, $scope) {


    });
});
