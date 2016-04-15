/**
 * 统计服务
 * 15/11/16 */
define(function(require) {
	var g = require('../../controller/public/g.js');
	var tools = require('../../controller/public/tools.js');
	var log = require('./logData.js');

	g.app.factory('count', function($http) {
		var fun = {
			/**
			 * 页面载入Start方法
			 * 15/11/16 */
			startPostCount: function() {
				//获取www路径后面的网址 ()
				var url = tools.tools.getUrl();
				//去服务器post数据
				var postJsonObj = {
					'node': url,
					'subnode': '0', //画面打开
				};
				log.fun.infoLog($http, postJsonObj);

				fun.endPostCount();
			},
			endPostCount: function() {
				mui.init({
					beforeback: function() {
						var url = tools.tools.getUrl();
						//去服务器post数据
						var postJsonObj = {
							'node': url,
							'subnode': '1',  //画面关闭
						};

						log.fun.infoLog($http, postJsonObj);
					}
				})
			}
		}
		return fun;

	})
})