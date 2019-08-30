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
/// <reference path="resources/js/bdp-base.js" />

//#region 动态增加样式表。 没有必要了
var $dyncsses = [];
// 查找图标类，没有则动态添加
function findcss(image) {
    var $dyncss = $("#dyncss");
    for (var i = 0; i < $dyncsses.length; i++) {
        if ($dyncsses[i].img == image)
            return $dyncsses[i].name;
    }
    var c = { name: "dyncss_" + ($dyncsses.length + 1), img: image };
    var st = ".om-tree li span." + c.name + ", .om-tree li.expandable span." + c.name
                + "{ background: url('" + c.img + "') no-repeat;}\r\n";
    $dyncss.append(st);
    $dyncsses.push(c);
    return c.name;
}
//#endregion

// 调整tab尺寸
var adjuestSize = function () {
    //setTimeout(function () {
    $('#tabs').scrollTop();
    var h = $(window).height() - $('#tabs').offset().top - 30;
    $("div.om-tabs-panels", $("#tabs")).height(h);
    var w = $("div.om-tabs-panels", $("#tabs")).width();
    $("iframe", $("#tabs")).each(function (i, ifr) {
        $(ifr).width('100%').height(h - 5);
        var pnl = $(ifr).parent();
        pnl.css({ padding: '1px 0px' }).omPanel('resize', w, h);
    });
    $("#tabs").omTabs("doLayout");
    //}, 300);
};
// 根据模块信息检查并打开, nodeData中需设置id,url,text
var checkAndOpenModule = function (nodeData) {
    if (!nodeData.url || nodeData.url == "") return true;

    if (nodeData.url.indexOf('?') > 0 && nodeData.url.indexOf('target') > 0) {
        var search = nodeData.url.substring(nodeData.url.indexOf('target'));
        if (search) {
            var reg = new RegExp("(^|&)target=([^&]*)(&|$)");
            var r = search.match(reg);
            var target = r != null ? unescape(r[2]) : null;
            if (target) {
                window.open(nodeData.url, target);
                return;
            }
        }
    }

    var sUrl = nodeData.url;
    sUrl += (sUrl.indexOf('?') > 0 ? "&" : "?") + "accessType=0&nodeid=" + nodeData.id;
    var tabIndex = $("#tabs").omTabs("getAlter", nodeData.id);
    if (tabIndex != null) {
        $('#tabs').omTabs('activate', tabIndex);
        // 地址不一样刷新
        var ifr = $('iframe[tabid="' + nodeData.id + '"]');
        if (ifr && ifr.attr('src') != sUrl) {
            ifr.attr('src', sUrl);
        }
        return true;
    }
    $("#tabs").omTabs("add", {
        title: nodeData.text,
        tabId: nodeData.id,
        content: "<iframe border='0' frameborder='no' tabid='" + nodeData.id + "'></iframe>",
        closable: true,
        activateNew: true
    });
    //$(window).trigger('resize');
    $('iframe[tabid="' + nodeData.id + '"]').attr('src', sUrl);
    adjuestSize();
};
// 页面布局
$(document).ready(function () {
    $('#ptop,#pleft,#pclient').show();
    $(window).data('hideLogo', false);

    $('body').omBorderLayout({
        //spacing: 5,
        spacing: 7,
        hideCollapsBtn: true,
        fit: true,
        panels: [{
            id: "ptop",
            header: false,
            region: "north",
            collapsible: true,
            height: 93
        }, {
            id: "pleft",
            header: false,
            region: "west",
            resizable: true,
            collapsible: true,
            closable: false,
            width: 230,
            onCollapse: function () {
                //adjuestSize();
                $(window).trigger('resize');
            },
            onExpand: function () {
                //adjuestSize();
                $(window).trigger('resize');
            }
        }, {
            id: "pclient",
            region: "center",
            header: false
        }],
        onAfterDrag: function (element, event) {
            //adjuestSize();
            $(window).trigger('resize');
        }
    });
    $("#tools").css({
        top: "64px",
        position: "absolute", width: "100%"
    }).addClass("om-buttonbar");


    //$("#lblUserName").text("<%= Username %>");
    $("#lblToday").html("您好！今天是 " + new Date().toLocaleDateString() + ' <span class="timer"></span>').css({ color: "#636363" });
    setInterval(function () {
        var dt = new Date(); var f = function (n) { return n > 9 ? '' + n : '0' + n; }
        $("#lblToday span.timer").text(' ' + f(dt.getHours()) + ':' + f(dt.getMinutes()) + ':' + f(dt.getSeconds()));
    }, 1000);
    // 顶部快捷菜单项
    $("#nav_right").omButtonbar({
        //width: 320,
        btns: [{
            id: 'btnFullScreen', hint: '全屏', icons: { leftCss: 'bdp-icons-credit_go' },
            onClick: function () {
                window.open(location.href, '_top');
            }
        }, {
            id: 'btnMyinfo',
            //label: "个人信息",
            icons: { left: getImageUrl("myinfo.png") },
            onClick: function () {
                $.ajax({
                    url: getCommonDataUrl("findModule", "txt_or_url=MyInfo.aspx"),
                    method: 'POST',
                    dataType: 'json',
                    success: function (nodedata) {
                        if (nodedata && nodedata.length > 0) {
                            checkAndOpenModule(nodedata[0]);
                        }
                    }
                });
            }
        }, {
            id: 'btnCloseAll',
            //label: "全部关闭",
            icons: { left: getImageUrl("closeall.png") },
            onClick: function () {
                $("#tabs").omTabs("closeAll");
            }
        }, {
            id: 'btnLogout',
            //label: "注销",
            icons: { left: getImageUrl("logout.png") },
            onClick: function () {
                $.omMessageBox.confirm({
                    title: '确认注销',
                    content: '<p>&nbsp;&nbsp;&nbsp;&nbsp;该操作将会取消当前正在进行的工作，然后返回到系统登录界面。</p><p>您确定要注销吗？</p>',
                    onClose: function (v) {
                        if (v) {
                            //callback.PerformCallback("logout");
                            jdpExec(getCommonDataUrl('BdpLogout', '', true), function (ajaxResult) {
                                if (ajaxResult.Succeed) {
                                    var s = ajaxResult.Data || '';
                                    if (s != '') {
                                        //window.open(s, '_top');
                                        $.ACP_Relogin(s);
                                    } else {
                                        window.location.reload();
                                    }
                                }
                            });
                        }
                    }
                });

            }
        }, {
            id: 'btnSelSys',
            //label: "选择系统",
            icons: { left: getImageUrl("treeroot.gif") },
            onClick: function () {
                $('#sysselector').omDialog('open');
            }
        }, {
            separtor: true
        },
        //{
        //    id: "btnTips",
        //    icons: { left: getImageUrl("message.png") }
        //},
        {
            id: "btnTrgger", icons: { left: 'resources/css/default/images/bdp/accordion-expand.gif' },
            onClick: function () {
                var collapsed = $('#btnTrgger').data('collapsed');
                if (collapsed) {
                    $('#btnTrgger').omButton('changeIcons', { left: 'resources/css/default/images/bdp/accordion-expand.gif' });
                    $('#btnTrgger').data('collapsed', false);
                    $('#ptop div.topdiv').show();
                    $('#ptop').omPanel('resize', { height: 91 });
                    $('#tools').css({ "top": "64px" });
                    $('#ptop').css({ "height": "91px" });
                    $('div[region="north"]').css({ "height": "93px" });
                    $('div[region="west"],div[region="center"]').css({ "top": "93px" });
                } else {
                    $('#btnTrgger').omButton('changeIcons', { left: 'resources/css/default/images/bdp/accordion-collapse.gif' });
                    $('#btnTrgger').data('collapsed', true);
                    $('#ptop div.topdiv').hide();
                    $('#ptop').omPanel('resize', { height: 25 });
                    $('#tools').css({ "top": "0" });
                    $('#ptop').css({ "height": "25px" });
                    $('div[region="north"]').css({ "height": "27px" });
                    $('div[region="west"],div[region="center"]').css({ "top": "27px" });
                }
                //adjuestSize();
                $(window).trigger('resize');
            }
        }]
    });
    if (window == window.top) {
        $('#btnFullScreen').hide();
    }
    $('#btnMyinfo').attr('title', '我的信息');
    $('#btnCloseAll').attr('title', '全部关闭');
    $('#btnSelSys').attr('title', '选择系统');
    //// 在线人数即时提示
    //$("#btnTips").bind("mouseenter", function () {
    //    $.ajax({
    //        url: getCommonDataUrl("getOnlineInfo"),
    //        method: 'POST',
    //        dataType: 'json',
    //        success: function (info) {
    //            var sTip = "在线人数：" + (info.count || 0) + " 人\nSID：" + (info.sid || '');
    //            $("#btnTips").attr("title", sTip);
    //        }
    //    });
    //});

    $("#pclient").css({ overflow: "hidden" });
    $("#tabs").omTabs({
        tabMenu: true,
        closable: [],
        width: 'fit',
        height: 'fit',
        onBeforeClose: function (n, event) {
            if (n > 0) {
                var tabid = $("#tabs").omTabs('getAlter', n);
                // 释放内嵌页内存
                var iframe = $("iframe[tabid='" + tabid + "']");
                iframe.contents().empty();
                iframe.removeAttr('src');
                iframe.remove();
                if (typeof CollectGarbage == 'function') {
                    CollectGarbage();
                }
                return true;
            }
            return false;
        },
        onBeforeCloseAll: function (event) {
            var total = $('#tabs').omTabs('getLength');
            for (var i = total - 1; i > 0; i--) {
                $("#tabs").omTabs("close", i);
            }
            return false;
        },
        onAdd: function (config, addEvent) {
            $('a[tabid="' + config.tabId + '"]')
                .removeAttr('href')
                .css({ "cursor": "pointer" })
                .mousedown(function (e) {
                    // 单击滚轮关闭
                    if (e.which == 2) {
                        $(this).parent().find('a.om-icon-close').trigger('click');
                    }
                });
        }
    })
    .css({ width: "100%", height: "100%" });
    // 首页禁止单击滚轮
    $("#tabs").find('a.om-tabs-inner[tabid]').removeAttr('href').css({ "cursor": "pointer" });

    if (GlbVar.HideLogoPanel) {
        $('#btnTrgger').omButton('click');
    }
    if (GlbVar.AllowLogout) {
        $('#btnLogout').closest('.om-btn').show().attr('title', '注销');
    } else {
        $('#btnLogout').closest('.om-btn').hide();
    }

    // 模块导航树

    var activeAccordion = function (index, event) {
        var id = $("div.bdp_module:eq(" + index + ")").attr("id");
        var opt = $("#" + id).omTree("options");
        if (opt && opt.dataSource) return true;
        $("#" + id).omTree({
            dataSource: getCommonDataUrl("getModules", "pid=" + id),
            showCheckbox: false,
            cascadeCheck: false,
            simpleDataModel: false,
            showIcon: true,
            // 首次加载后更新图标
            onSuccess: function (nodedata) {
                //$.each(nodedata, function (i) {
                //    if (this.image) {
                //        $("#" + this.nid).find("span").css("background", "url('" + this.image + "') no-repeat");
                //    }
                //});
            },
            // 动态加载子节点
            onBeforeExpand: function (node) {
                var nodeDom = $("#" + node.nid);
                if (nodeDom.hasClass("hasChildren")) {
                    nodeDom.removeClass("hasChildren");
                    $.ajax({
                        url: getCommonDataUrl("getModules", "pid=" + node.id),
                        method: 'POST',
                        dataType: 'json',
                        success: function (nodedata) {
                            $("#" + id).omTree("insert", nodedata, node);
                            //$.each(nodedata, function (i) {
                            //    if (this.image) {
                            //        $("#" + this.nid).find("span").css("background", "url('" + this.image + "') no-repeat");
                            //    }
                            //});
                        }
                    });
                }
            },
            // 选中时检查并创建模块
            onSelect: function (nodeData) {
                checkAndOpenModule(nodeData);
            }
        });

        $("#mtree").omAccordion("resize");
    };
    var rendererAccordion = function (nid) {
        $.getJSON(getCommonDataUrl("getRootModules", { nid: nid }), function (data) {
            $('#pleft').empty().append('<div id="mtree"><ul></ul></div>');
            var $mtree = $("#mtree"), ul = $("#mtree ul");
            $.each(data, function (i) {
                var li = $('<li><a href="#' + this.id + '" iconCls="rm_' + i + '">' + this.text + '</a></li>');
                ul.append(li);
                var mt = $('<div id="' + this.id + '" class="bdp_module"></div>');
                $mtree.append(mt);
            });
            $mtree.omAccordion({
                width: 'fit',
                height: 'fit',
                collapsible: true,
                onActivate: activeAccordion
            });
            $.each(data, function (i) {
                cls = this.image || '';
                if (cls.indexOf('.') >= 0 || cls.indexOf('/') >= 0) {
                    $(".rm_" + i).css({ background: "url('" + this.image + "') no-repeat" });
                } else {
                    $(".rm_" + i).addClass(cls);
                }
            });
            if (data.length > 0) {
                if (data.length == 1) activeAccordion(0);
                else {
                    $mtree.omAccordion("activate", data.length - 1);
                }
            }
        });
    }

    // 超过一个系统要自动弹出选择框
    if (syses && syses.length > 1) {
        $('#sysselector').omDialog({
            autoOpen: true,
            closeOnEscape: false,
            height: 450,
            modal: true,
            title: '请选择您要进入的系统',
            width: 650
        });
        var ul = $('<ul></ul>').appendTo($('#sysselector'));
        $.each(syses, function (i, sys) {
            ul.append('<li><a class="linksys" data-nid="' + (sys.nodeId) + '">' +
                '<div class="r1"><img style="height:48px;width:48px;" src="' + (sys.iconUrl || '') + '" /></div>' +
                '<div class="r2">' + (sys.text || '') + '</div>' +
                '</a></li>');
        });
        $('#sysselector a.linksys').click(function () {
            $("#tabs").omTabs("closeAll");
            rendererAccordion($(this).data('nid') || '');
            $('#sysselector').omDialog('close');
            $(window).trigger('resize');
        });
        $('#btnSelSys').closest('.om-btn').show();
    } else {
        rendererAccordion(syses && syses.length > 0 ? (syses[0].nodeId || '') : '');
        $('#btnSelSys').closest('.om-btn').hide();
    }
    // 创建多语言选择器, 可事先在html中放置一个id为mlang的div
    createMLangSelector();

    $(window).resize(function () {
        adjuestSize();
        $("#mtree").omAccordion("resize");
    }).trigger('resize');    //.resize();

});

