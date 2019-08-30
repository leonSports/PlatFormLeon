/***************************************************************
 * 产品名称：红彬应用程序开发平台
 * 英文名称：Hongbin Application Develop Platform
 * 产品代号：HADP
 * 版 本 号：V3.0
 * 版权所有：西安红彬科技发展有限公司 Copyright@2016
 * 开发人员：彭正府
 * ------------------------------------------------------------
 * 模块功能：
 *   
 *   
 **************************************************************/
/* www.51uns.com
功能：平台常用js库的加载器
依赖：
    bdp-base.js

www.51uns.com
*/
// 页面必须先引用bdp-base.js
; (function () {
    var scripts = document.getElementsByTagName('script')
    var customJs = scripts[scripts.length - 1].getAttribute('js');
    var src = scripts[scripts.length - 1].src.toLowerCase();
    var vpos = src.indexOf('version=');
    if (vpos > 0) {
        BDP_JS_VERSION = src.substring(vpos + 8);
    } else if (typeof GlbVar === 'object' && GlbVar.BDP_VERSION) {
        BDP_JS_VERSION = GlbVar.BDP_VERSION;
    };
    // 调入缺省的样式表和脚本文件
    loadResources([
        //'jquery.qtip.css',
        'om-default.css',
        'bdp-common.css',
        'bdp-icons.css',
        'bdp-editor.css',
		//'compack.css',
        //'jquery.js',
        'jquery.min.js',
        //'jquery.qtip.js',
        //'jquery-migrate-1.1.0.js',
        'json2.js',
        'operamasks-ui.min.js',
        //'operamasks-ui.js',
        'operamasks-ui-fix.js',
        'rules.js',
        'bdp-utils.js',
        'bdp-ext.js',
        'bdp-images.js',
        'bdp-editor.js',
        'bdp-grid-edit.js',
        'bdp-grid-tree.js'
    ]);
    if (customJs) loadResources(customJs.split(','));
})();


