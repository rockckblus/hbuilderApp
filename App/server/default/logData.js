/**
 * log记录server
 * 15/11/18 */
define(function(require) {
	var g = require('../../controller/public/g.js');
	var tools = require('../../controller/public/tools.js');
	/**
	 * 声明接口地址
	 */
	var logUrl = {
		info: g.apiHost + '/Home/Log/infoLog/',
//		infoTest: 'http://123.150.38.2:8083/index.php/Home/Log/infoLog',
	}
	

	/**
	 * 公共方法(get,post)
	 */
	var fun = {
		post: function($http, url, dataObj, func) {
			tools.angular.postJsp($http, url, dataObj, function(re) {
				if (re) {
					func(re);
				}
			})
		},

		infoLog: function($http, dataObj, func) {
			
			if (g.read2DB(g.storage_key.log_onff)=="1") {
				dataObj['uid'] = g.read2DB(g.storage_key.user_id);
				
				fun.post($http, logUrl.info, dataObj, function(re) {
					//				func(re);
				})
			}
		}
	};

	var re = {
		fun: fun,
	}

	return re;
})