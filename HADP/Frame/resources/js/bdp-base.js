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
/* 基础的JS库，提供一些基于JS本身的一些功能，不依赖于其它任何第三方JS库
*
*  www.51uns.com
*/
//#region 公共方法

// 获取地址上的查询参数值
function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
}

// 调入资源文件，脚本或样式表. 参数为js或css文件名. 
// 文件名可以包括相对路径或绝对路径，如果没有路径则在BDP平台的JS路径或CSS路径下查找.
function loadResources(resArray) {
    var ts = BDP_JS_VERSION || new Date().getTime(),
        scripts = document.getElementsByTagName('script'),
        links = document.getElementsByTagName('link'),
        arrScripts = [], arrLinks = [];
    for (var i = 0, len = scripts.length; i < len; i++) {
        var s = absUrl(scripts[i].src || '');
        if (typeof s == 'string' && s != '') {
            arrScripts.push(s);
        }
    }
    for (var i = 0, len = links.length; i < len; i++) {
        var s = absUrl(links[i].href || '');
        if (typeof s == 'string' && s != '') {
            arrLinks.push(s);
        }
    }
    var fExists = function (sUrl, islink) {
        var arr = islink ? arrLinks : arrScripts;
        for (var i = 0, len = arr.length; i < len; i++) {
            var s = absUrl(sUrl);
            if (s == arr[i]) return true;
        }
        return false;
    };
    for (var i = 0; i < resArray.length; i++) {
        //s = $.trim(resArray[i]);      // 这时还不能用jQuery
        s = resArray[i].trim();
        cantAddPath = s.substring(0, 1) == '/' || s.substring(0, 1) == '.' || s.substring(0, ROOT_PATH.length) == ROOT_PATH;
        switch (s.substring(s.lastIndexOf('.') + 1)) {
            case "css":
                if (!cantAddPath) s = CSS_PATH + s;
                s = absUrl(s);
                if (!fExists(s, true)) {
                    document.writeln("<link href='" + s + "?ts=" + ts + "' rel='stylesheet' type='text/css' />");
                }
                break;
            case "js":
                if (!cantAddPath) s = SCRIPT_PATH + s;
                s = absUrl(s);
                if (!fExists(s, false)) {
                    document.writeln("<script src='" + s + "?ts=" + ts + "' type='text/javascript'></script>");
                }
                break;
        }
    }
}

////// 从源字符串中移除SessionId
////function removeSessionId(src) {
////    var p1 = src.toLowerCase().indexOf("/(s("),
////        p2 = src.toLowerCase().indexOf("))/");
////    if (p1 >= 0 && p2 > p1) {
////        return src.substring(0, p1) + src.substring(p2 + 2);
////    } else {
////        p1 = src.toLowerCase().indexOf("/(f(");
////        if (p1 >= 0 && p2 > p1) {
////            return src.substring(0, p1) + src.substring(p2 + 2);
////        }
////    }
////    return src;
////}

// 分析url，返回json对象
function parseURI(url) {
    var m = String(url).replace(/^\s+|\s+$/g, '').match(/^([^:\/?#]+:)?(\/\/(?:[^:@]*(?::[^:@]*)?@)?(([^:\/?#]*)(?::(\d*))?))?([^?#]*)(\?[^#]*)?(#[\s\S]*)?/);
    // authority = '//' + user + ':' + pass '@' + hostname + ':' port
    return (m ? {
        href: m[0] || '',
        protocol: m[1] || '',
        authority: m[2] || '',
        host: m[3] || '',
        hostname: m[4] || '',
        port: m[5] || '',
        pathname: m[6] || '',
        search: m[7] || '',
        hash: m[8] || ''
    } : null);
}
// 从url中移除IE自动加的内容. 有问题，不能用！
function removeDotSegments(input) {
    return input;
    //var output = [];
    //input.replace(/^(\.\.?(\/|$))+/, '')
    //     .replace(/\/(\.(\/|$))+/g, '/')
    //     .replace(/\/\.\.$/, '/../')
    //     .replace(/\/?[^\/]*/g, function (p) {
    //         if (p === '/..') {
    //             output.pop();
    //         } else {
    //             output.push(p);
    //         }
    //     });
    //return output.join('').replace(/^\//, input.charAt(0) === '/' ? '/' : '');
}
// 获取绝对路径
function absolutizeURI(base, href) {// RFC 3986
    href = parseURI(href || '');
    base = parseURI(base || '');
    return !href || !base ? null : (href.protocol || base.protocol) +
           (href.protocol || href.authority ? href.authority : base.authority) +
           removeDotSegments(href.protocol || href.authority || href.pathname.charAt(0) === '/' ? href.pathname : (href.pathname ? ((base.authority && !base.pathname ? '/' : '') + base.pathname.slice(0, base.pathname.lastIndexOf('/') + 1) + href.pathname) : base.pathname)) +
           (href.protocol || href.authority || href.pathname ? href.search : (href.search || base.search)) +
           href.hash;
}
// 获取绝对路径
function absUrl(url) {
    if (url && url.substring(0, 2) === '~/') {
        url = ROOT_PATH + url.substring(2);
    }
    return absolutizeURI(CURRENT_PATH, url);
}

// 获取公共数据提供地址：/Frame/Data/jdp.ashx?...
//  fn: 功能名称，必须 。
//  args: 相关参数，可选。可以是参数串，也可以是对象。如果布尔值则指定是否可以写Session, 此时不需要再指定第3个参数。
//  allowWriteSession:  是否可以写Session，可选，缺省为Session只读。若为true,Session可写，若为false,Session只读，若为none,Session不可访问。
function getCommonDataUrl(fn, args, allowWriteSession) {
    var s = "jdp.ashx";
    if (typeof args === 'boolean') {
        if (args === true) s = "jdpsw.ashx";
        args = false;
    }
    if (args === 'none') {
        s = "jdpns.ashx";
        args = false;
    }
    if (allowWriteSession === true) {
        s = "jdpsw.ashx";
    }
    if (allowWriteSession === 'none') {
        s = "jdpns.ashx";
    }
    var s = ROOT_PATH + "Frame/Data/" + s + "?rnd=" + new Date().getTime() + "&fn=" + fn;
    if (typeof (args) === "object") {
        for (var key in args) {
            var v = args[key];
            if (typeof (v) != 'undefined')
                s += "&" + escape(key) + "=" + escape(args[key]);
            //s += "&" + key + "=" + JSON.stringify(args[key]);
        }
    } else if (args) {
        s += "&" + args;
    }
    return s;
}
// 获取生成验证码的地址
function getVerifyCodeUrl() {
    var s = ROOT_PATH + "Frame/Data/verify_code.ashx?ts=" + new Date().getTime();
    return s;
}
// 以同步AJAX的方式访问一个JDP地址，可指定POST的数据或成功后的回调函数。
// jdpAddress   必须，地址串
// data     可选，要提交的数据
// callback 可选，成功后的回调函数
// 注： 一般用于数据操纵类的JDP，即不返回业务数据集。
function jdpExec(jdpAddress, data, callback) {
    var fdata = data, fcb = callback;
    if (typeof (fcb) == 'undefined' && typeof (fdata) == 'function') {
        fcb = fdata;
        fdata = null;
    }
    if (typeof (fcb) == 'undefined') {
        fcb = function (ajaxResult) {
            if (ajaxResult) {
                $.omMessageBox.alert({
                    type: ajaxResult.Succeed ? 'success' : 'error',
                    title: ajaxResult.Succeed ? "操作成功" : "操作失败",
                    content: ajaxResult.Message
                });
            }
        };
    }
    if (typeof (fdata) == 'undefined') {
        fdata = null;
    }
    if (typeof (fdata) == 'object')
        fdata = JSON.stringify(fdata);
    $.ajax({
        url: jdpAddress,
        type: 'POST',
        async: false,
        data: fdata,
        dataType: 'json',
        success: fcb
    });
}
//#endregion

//#region JS类扩展

// 为String扩展一个trim函数
if (typeof String.prototype.trim != 'function') {
    String.prototype.trim = function () {
        return this.replace(/(^\s*)|(\s*$)/g, "");
    };
}

if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function (s) {
        if (this == '' || !s || s == '') return false;
        return this.indexOf(s) == 0;
    };
};
if (typeof String.prototype.endsWith != 'function') {
    String.prototype.endsWith = function (s) {
        if (this == '' || !s || s == '') return false;
        var p = this.lastIndexOf(s);
        return p >= 0 && p + s.length == this.length;
    };
}

// 数值格式化
if (typeof Number.prototype.fmt != 'function') {
    // 格式化数值，格式串由整数、类型、小数位数三部分组成，整数后以冒号分隔，类型有：
    //  N 数值，P 百分数, C 货币，类型后面是小数位数。如：
    //  0:N2    表示两位小数,
    //  0:N     表示整数
    Number.prototype.fmt = function (pattern) {
        if (!pattern || pattern == '') return this.toString();
        var n = this, sfmt = pattern;
        if (sfmt.startsWith('{')) sfmt = sfmt.substring(1);
        if (sfmt.endsWith("}")) sfmt = sfmt.substring(0, sfmt.length - 1);
        var fmtArr = sfmt.split(':'), hasInt = fmtArr[0] != '', decLen = 2, t = 'N';
        if (fmtArr.length > 1 && fmtArr[1] != '') {
            t = fmtArr[1].substring(0, 1).toUpperCase();
            decLen = parseInt(fmtArr[1].substring(1));
            if (isNaN(decLen)) decLen = 2;
        }
        if (t == 'P') n = n * 100;
        var s = n.toFixed(decLen);
        if (t == 'P') s += "%";
        else if (t == "C") {
            var ts = s, len = ts.length, p = ts.indexOf('.'), s = '', q = 0;
            if (p >= 0) {
                s = ts.substring(p);
                ts = ts.substring(0, p);
                len = ts.length;
            }
            for (var i = len - 1; i >= 0; i--) {
                s = ts.substring(i, i + 1) + s;
                if (q >= 2 && i > 0 && ts.substring(i - 1, i) != '-') {
                    s = ',' + s;
                    q = 0;
                } else {
                    q++;
                }
            }
        }
        return s;
    };
}
/*
  修正JSON.parse的一个问题：当json文本中的某个字符串属性值中有特殊字符（如换行）时，
JSON.parse函数将发生异常，原因是换行后字符串不正确了。因此，这里在parse之前替换掉双引号
中的换行符。
*/
if (window.JSON && typeof window.JSON._parse == 'undefined') {
    window.JSON._parse = window.JSON.parse;
    window.JSON.parse = function (text, reviver) {
        text = text.replace(/"([^"]*)"/g, function (word) {
            return word.replace(/[\n|\r|\t]/g, function (ch) {
                switch (ch) {
                    case "\r":
                        return "\\r";
                    case "\n":
                        return "\\n";
                    case "\t":
                        return "\\t";
                    default:
                        return ch;
                }
            });
        });
        return window.JSON._parse(text, reviver);
    };
}
//#endregion

//#region 定义一些全局变量

// 网站根路径
var ROOT_PATH = '';
// 当前页路径
var CURRENT_PATH = '';
// BDP平台版本号
var BDP_JS_VERSION = '2.0.0.000';

// 初始化算出正确的ROOT_PATH和平台版本号
; (function () {
    var s = removeDotSegments(window.location.href).toLowerCase();
    CURRENT_PATH = s.substring(0, s.lastIndexOf('/') + 1);

    var js = document.scripts;
    var src = '';   //absUrl(removeDotSegments(js[js.length - 1].src)).toLowerCase();
    for (var i = 0; i < js.length; i++) {
        src = (removeDotSegments(js[i]).src || '').toLowerCase();
        if (src.indexOf('/bdp-base.js') > 0) break;
    }
    // bdp-base.js 文件一定是在 frame/resources 目录下
    ROOT_PATH = src.substring(0, src.indexOf('/frame/resources') + 1);
    var vpos = src.indexOf('version=');
    if (vpos > 0) {
        BDP_JS_VERSION = src.substring(vpos + 8);
    } else if (typeof GlbVar === 'object' && GlbVar.BDP_VERSION) {
        BDP_JS_VERSION = GlbVar.BDP_VERSION;
    }
})();



// BDP平台资源路径，即 /frame/resources
var RESOURCE_PATH = ROOT_PATH + "frame/resources/";
// BDP平台脚本路径
var SCRIPT_PATH = RESOURCE_PATH + 'js/';
// BDP平台图片路径
var IMAGE_PATH = RESOURCE_PATH + 'css/default/images/bdp/';
// BDP平台样式表路径
var CSS_PATH = RESOURCE_PATH + 'css/default/';

//; (function () {
//    var scripts = document.getElementsByTagName('script')
//    var customJs = scripts[scripts.length - 1].getAttribute('js');
//    // 调入缺省的样式表和脚本文件
//    loadResources([
//        'om-default.css',
//        'bdp-common.css',
//        'bdp-icons.css',
//        'bdp-editor.css',
//        //'jquery.js',
//        'jquery.min.js',
//        //'jquery-migrate-1.1.0.js',
//        'json2.js',
//        'operamasks-ui.min.js',
//        //'operamasks-ui.js',
//        'operamasks-ui-fix.js',
//        'bdp-utils.js',
//        'bdp-ext.js',
//        'bdp-images.js',
//        'bdp-editor.js',
//        'bdp-grid-edit.js',
//        'bdp-grid-tree.js'
//    ]);
//    if (customJs) loadResources(customJs.split(','));
//})();



//#endregion

