/**
 *
 * 文件操作相关方法 directive
 */

define(function (require) {
    var g = require('../../../../controller/public/g.js');
    var tools = require('../../../../controller/public/tools.js');

    g.app.directive('filefun', function () {
        return {
            restrict: 'A',//E:包裹标签  A:属性 C:class
            replace: false,
            //此处可以引用外部html文件,添加对象名 templateUrl
            controller:function(){
             this.getFileObj = function()   {
                 plus.ui.alert(2222);
             }
            },
        }


    })
})

