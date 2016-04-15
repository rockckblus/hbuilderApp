/**
 * Created by apple on 15-11-10.
 * getFile button按钮
 */
define(function (require) {
    var g = require('../../../../controller/public/g.js');
    require('./fileFun.js');
    //require fileFun
    g.app.directive('getfile', function () {
        return {
            require:'filefun',
            templateUrl: "../../directive/html/default/getFile.html",
            link: function (scope,elem,attr,rCtrl) {
                scope.getFileObj= function () {
                    rCtrl.getFileObj() ;
                }

            }
        }
    })
})
