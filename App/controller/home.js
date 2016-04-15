//首页js(未登录)

define(function (require) {

    //全局对象，包括angular bodyAll 控制器
    var tools = require('./public/tools.js');
    var topNav = require('./directive/js/default/topNav.js');
//  //侧栏
    var leftNav = require('./directive/js/default/webView/leftNav/leftNav.js');
     tools.tools.hackGoUrl();
})