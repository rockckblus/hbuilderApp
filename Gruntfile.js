module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        jshint: {
            //此处是 需要 测试 的文件路径，可自己修改
//            build: ['App/controller/**/*.js'],
            build: ['App/directive/js/default/*.js', 'App/directive/js/default/block/block.goBaiduMap.directive.js','App/controller/default/default.baiduMap.controller.js'],
            options: {
                //此处是 验证规则配置文件
                jshintrc: '.jshintrc'
            }
        },

        /**
         * 自动化
         * 16/1/22 */
        watch: {
            build: {
                files: ['App/**/**/*.js'],//监控目录
                tasks: ['jshint'],
                options: {
                    spawn: false
                }
            }
        }


    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('default', ['jshint', 'watch']);

};