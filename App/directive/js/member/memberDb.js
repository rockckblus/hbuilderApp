/**
 * memberDb 组件
 * Created by rockblus on 15/10/30.
 */
define(function (require) {
    //全局对象，包括angular bodyAll 控制器
    var g = require('../../../controller/public/g.js');
    var tools = require('../../../controller/public/tools.js');
    //require mebmerData
    require('../../../server/memberData.js');

    g.app.directive('memberdire', function (memberDb) {
        return {
            restrict: 'EA',//E:包裹标签  A:属性 C:class
            //require:其他directive,
            replace: true,
            scope:{},
            //此处可以引用外部html文件,添加对象名 templateUrl
            templateUrl: "../../directive/html/member/memberDb.html",
            link: function (scope, element, attrs, rootScope) {
                var getJsonObj = {
                    num: 3,
                    towns: 883,
                    first: 1,
                    p: 1
                }

                var postJsonObj = {
                    'name': 'rockblus',
                    'password': '111111'
                };

                memberDb.getMember(getJsonObj, function (re) {
                    tools.tools.hackGoUrl();
                    scope.count = re.count;
                    scope.list = re.list;
                })
                memberDb.postMember(postJsonObj,function(re){
                   scope.post = re.sign;
                })


            }
        }
    })
    ;
})
