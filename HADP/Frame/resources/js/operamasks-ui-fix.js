/// <reference path="jquery.js" />


//#region jquery升级到1.9后，兼容以前的版本

(function ($, undefined) {
    $.curCSS = $.css;
    $.browser = $.support;
    $.browser.mozilla = /firefox/.test(navigator.userAgent.toLowerCase());
    $.browser.webkit = /webkit/.test(navigator.userAgent.toLowerCase());
    $.browser.opera = /opera/.test(navigator.userAgent.toLowerCase());
    $.browser.msie = /msie/.test(navigator.userAgent.toLowerCase());

    if (jQuery.event.dispatch && !jQuery.event.handle) {
        jQuery.event.handle = jQuery.event.dispatch;
    }

    // 如果没有传值则返回外宽或外高，但是jquery1.9以后必须要传一个逻辑值表明是否包括外宽或外高，否则返回的不是数值而是对象
    $.each(["Width", "Height"], function (i, name) {
        var orig = {
            outerWidth: $.fn.outerWidth,
            outerHeight: $.fn.outerHeight
        };
        $.fn["outer" + name] = function (size, margin) {
            if (typeof size == "undefined" && typeof margin == "undefined")
                return orig["outer" + name].call(this, true);
            return orig["outer" + name].call(this, size, margin);
        }
    });
    //addInitListener
    $.omWidget.addCreateListener("om.omGrid", function () {
        var self = this, base = $.om.omGrid.prototype;
        $.extend(this, {
            _getTrs: function () {
                // 新版jq中对选择器语法要求更为严格，不能写成：[_delete]=true
                return this.tbody.find("tr.om-grid-row:not([_delete=true])");
            },
            //_bindScrollEnvent: function () {
            //    this.tbody.closest('.bDiv').scroll(function () {
            //        if (self.hDiv) {
            //            self.hDiv.scrollLeft($(this).scrollLeft());
            //        }
            //    });
            //},

            done: true
        });
    });

})(jQuery);

//#endregion

