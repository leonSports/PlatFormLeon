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
/* 
功能：
    基于基础类库做的一些扩展功能

依赖：
    bdp-base.js
    jQuery
    omui
    bdp-utils.js
    bdp-editor.js
    bdp-grid-edit.js
    bdp-grid-tree.js

*/

//#region 公共资源
; (function ($) {
    // 全局命名空间
    $.bdp = {
        // 自定义查询全局配置参数
        filterConfig: {
            // 条件运算符
            operatorItems: null,
            // 条件组合方式
            combinateItems: null,
            // 自定义查询参数对象封装到后台时使用的参数名字
            pnCustomFilter: null
        },
        //#region 定义一个条件项类。一个条件项指定查询中的一个条件，包括比较项、比较符和比较值
        // fn 字段名,op 比较符,fv 比较值,cc 条件组合
        FilterItem: function (fn, op, fv, cc, type) {
            // 比较项名，即字段名，取列模型中的editor.name,若未指定则取列模型的name.
            this.fn = fn;
            // 比较符字符串
            this.op = op;
            // 比较值，若不需要比较值的为null
            this.fv = fv;
            // 与下一个条件项的组合方式：and,or，或为空则忽略后续的条件项
            this.cc = cc;
            //比较项类型
            this.tp = type || '';
        },
        //#endregion

        //#region 提供一批有关列模型的辅助功能函数
        colModelHelper: {
            // 将列模型转换为清单，返回数组，元素为对象：
            //  {label:列标题,colInfo:{列信息对象}}
            // 调用参数：colModel 列模型，labelSplit 标签分隔串，缺省是>
            toList: function (colModel, labelSplit) {
                labelSplit = labelSplit || '>';
                var result = [], tempColModel = $.extend(true, [], colModel);
                var fAdd = function (s, acm) {
                    var elem = { label: s, colInfo: acm, index: result.length };
                    result.push(elem);
                };
                if ($.isArray(tempColModel[0])) {
                    var f = function (index, count, s) {
                        var row = tempColModel[index];
                        for (var j = 0; j < count && row.length > 0; j++) {
                            var rd = row[0];
                            fAdd(s + labelSplit + rd.header, rd);
                            if (!rd.name) {
                                f(index + 1, rd.colspan, s + labelSplit + rd.header);
                                j += rd.colspan - 1;
                            }
                            row.splice(0, 1);
                        }
                    };
                    for (var i = 0, len = tempColModel[0].length; i < len; i++) {
                        var cm = tempColModel[0][i];
                        fAdd(cm.header, cm);
                        if (!cm.name) {
                            f(1, cm.colspan, cm.header);
                        }
                    }
                } else {
                    for (var k = 0, colCount = tempColModel.length; k < colCount; k++) {
                        fAdd(tempColModel[k].header, tempColModel[k]);
                    }
                }
                tempColModel = undefined;
                return result;
            },
            // 从列信息清单(toList函数的结果)中移除指定列信息
            remove: function (colInfoList, index, labelSplit) {
                var info = $.grep(colInfoList, function (elem) { return elem.index == index; })[0];
                if (!info) return;
                if (!info.colInfo.name) {
                    var subList = $.grep(colInfoList, function (elem) {
                        return elem.label.indexOf(info.label + labelSplit) == 0;
                    });
                    for (var i = 0; i < subList.length; i++) {
                        var idx1 = colInfoList.indexOf(subList[i]);
                        colInfoList.splice(idx1, 1);
                    }
                }
                var idx = colInfoList.indexOf(info);
                colInfoList.splice(idx, 1);
                var arrLabel = info.label.split(labelSplit);
                arrLabel.splice(arrLabel.length - 1, 1);
                while (arrLabel.length > 0) {
                    var s = arrLabel.join(labelSplit),
                        temp = $.grep(colInfoList, function (elem) { return elem.label == s; })[0];
                    if (temp) {
                        var subList1 = $.grep(colInfoList, function (elem) {
                            return (elem.label.indexOf(s + labelSplit) == 0) && elem.colInfo.name;
                        });
                        if (subList1.length == 0) {
                            idx = colInfoList.indexOf(temp);
                            colInfoList.splice(idx, 1);
                        } else {
                            temp.colInfo.colspan = subList1.length;
                        }
                    }
                    arrLabel.splice(arrLabel.length - 1, 1);
                }
            },
            // 将列信息清单(toList函数的结果)转换为列模型
            toColModel: function (colInfoList, labelSplit) {
                var arrColModel = [];
                for (var i = 0, len = colInfoList.length; i < len; i++) {
                    var info = colInfoList[i],
                        sArr = info.label.split(labelSplit),
                        r = sArr.length - 1;
                    if (typeof arrColModel[r] == 'undefined') {
                        arrColModel[r] = [];
                    }
                    arrColModel[r].push(info.colInfo);
                }
                return arrColModel.length > 1 ? arrColModel : arrColModel[0];
            },
            // 按指定字段名/值查找列信息，没找到返回null
            findBy: function (colModel, fn, fv) {
                if (!$.isArray(colModel)) return null;
                if (colModel.length == 0) return null;
                for (var i = 0, len = colModel.length; i < len; i++) {
                    var col = colModel[i];
                    if ($.isArray(col)) {
                        for (var j = 0, jlen = col.length; j < jlen; j++) {
                            if ((col[j][fn] || '') == fv) {
                                return col[j];
                            }
                        }
                    } else if ((col[fn] || '') == fv) {
                        return col;
                    }
                }
                return null;
            },

            done: false
        },
        //#endregion

        done: true
    };

    //#region 安装支持全局性提示信息对话框，样式由bdp-common.css中的tooltip类控制
    /*
    $(document).on('mouseover focus', '[data-hint],[alt],[title]', function () {
        if (window.id_tooltip_timeout) clearTimeout(window.id_tooltip_timeout);

        var tip = $("#tooltip"),
            e = $(this),
            p = e.offset(),
            c = e.attr('data-hint');
        if (typeof c == 'undefined') {
            c = e.attr('alt') || e.attr('title') || '';
            if (c == '') return;
            e.attr('data-hint', c);
            e.removeAttrs('alt title');
        }
        c = c.replace(/\n|\\n/g, '<br />');

        if ($('div.tooltip-fixed').size() > 0) {
            $('div.tooltip-fixed').empty().html(c);
            return;
        }

        window.id_tooltip_timeout = setTimeout(function () {
            if (tip.size() == 0) {
                tip = $('<div id="tooltip" class="bdpTip"><div class="bdpTip-arrow bdpTip-arrow-top"></div><div class="bdpTip-content"></div></div>').appendTo('body');
            }
            tip.hide();
            $('div.bdpTip-arrow', tip).removeClass('bdpTip-arrow-top bdpTip-arrow-down');
            $('div.bdpTip-content').empty().html(c);

            var x = p.left, y = p.top - tip.outerHeight() - 8;
            var x1 = 15;
            if (x + tip.outerWidth() > $(window).width()) {
                x = $(window).width() - tip.outerWidth();
                x1 = p.left - x + 15;
            }
            if (y < 0) {
                y = p.top + e.outerHeight() + 7;
                $('div.bdpTip-arrow', tip).addClass('bdpTip-arrow-down');
            } else {
                $('div.bdpTip-arrow', tip).addClass('bdpTip-arrow-top');
            }
            $('div.bdpTip-arrow', tip).css({ left: x1 + 'px' });
            tip.css({ left: x + "px", top: y + "px", opacity: "0.85" }).show();

            window.id_tooltip_timeout = undefined;
        }, 300);
    }).on('mouseout blur', '[data-hint],[alt],[title]', function () {
        if (window.id_tooltip_timeout) clearTimeout(window.id_tooltip_timeout);
        window.id_tooltip_timeout = undefined;
        $("#tooltip").hide();
    });
    // 鼠标点击时隐藏显示着的提示框
    $(document).bind('mousedown', function () {
        $("#tooltip").hide();
    });
    */
    //#endregion

    //#region Ajax全局性事件
    $(document).ajaxSuccess(function (event, xhr, settings) {
        var obj = xhr.responseJSON;
        if (!obj && xhr.responseText) {
            try { obj = JSON.parse(xhr.responseText); } catch (e) { }
        }
        if (typeof obj == 'object' && obj != null && obj.Succeed === false && (obj.ErrCode == 'E998' || obj.ErrCode == 'E999') && (obj.Data || '') != '') {
            relogin(obj.Data, obj.ErrCode);
            return false;
        }
    });
    //#endregion

})(jQuery);
// 全局的重新登录函数，如果在后台检查到需要重新登录，会生成调用该函数的脚本
function relogin(url, reason) {
    $.ACP_Relogin(url, reason);
}
//#endregion

//#region 浏览器兼容性方面的扩展.  让火狐也支持 innerText
try {
    // 让火狐也支持 innerText
    if (window.navigator.userAgent.toLowerCase().indexOf("msie") == 0) { //firefox innerText   
        HTMLElement.prototype.__defineGetter__("innerText", function () {
            var anyString = "";
            var childS = this.childNodes;
            for (var i = 0; i < childS.length; i++) {
                if (childS[i].nodeType == 1)
                    anyString += childS[i].tagName == "BR" ? '\n' : childS[i].textContent;
                else if (childS[i].nodeType == 3)
                    anyString += childS[i].nodeValue;
            }
            return anyString;
        });
        HTMLElement.prototype.__defineSetter__("innerText",
            function (sText) {
                this.textContent = sText;
            }
        );
    }
} catch (err) { };

//#endregion

//#region 扩展jQuery本身：获取URL中的参数值、日期分析、转换、判断是否为空、导出和下载等
jQuery.extend({

    //#region 获取URL中的参数值
    getUrlParam: function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]); return null;
    },
    //#endregion

    //#region 日期相关
    // 分析日期字符串，扩展处理c#后台序列化的日期格式串
    parseDate: function (v) {
        if (v == null || v == '') return null;  // new Date(0, 0, 0);
        var dt = v;
        if (typeof (v) == "string") {
            if (v.indexOf("/Date") >= 0) {
                dt = eval("new " + v.replace(/(\/)/g, ""));
            } else {
                dt = new Date(v.replace(/(\-)/g, '/'));
            }
        }
        if ($.isEmptyDate(dt)) dt = null;
        return dt;
    },
    // 格式化日期，返回字符串
    formatDate: function (v, fmt) {
        if (v == null || v == '') return '';
        var dt = v;
        if (typeof (v) == 'string') {
            dt = this.parseDate(v.replace(/(\-)/g, '/'));
        }
        // 空日期
        if (v.valueOf() == new Date(0, 0, 0).valueOf())
            return '';
        var s = dt.toString();
        if (fmt) {
            s = $.omCalendar.formatDate(dt, fmt);
        }
        return s;
    },
    // 是否为空日期
    isEmptyDate: function (v) {
        return v == null || v == '' || isNaN(v) || isNaN(v.valueOf()) || v.valueOf() == new Date(0, 0, 0).valueOf();
    },
    //#endregion


    //#region 导出和下载

    /* 根据设置将数据导出到Excel表, setting中可以设置如下参数：
        dataSource : 必须，数据源地址或json格式数据对象
        colModel: 必须，列模型，与omGrid的列模型兼容，但列宽度以字节为单位
        allowSelectColumn:  可选，是否允许用户选择列，缺省为否
        exportUrl : 可选，执行导出的地址，缺省为：ROOT_PATH + 'frame/data/down.aspx'
        exportMethod : 可选，导出方法名称，取值根据exportUrl的约定而定。 缺省是 GridToExcel
        title : 可选，Excel表格的标题，缺省空，表示不生成标题行
        titleFontName: '宋体',   可选，     
        titleFontSize: 36,  可选，
        titleRowHeight: 62, 可选，
        UploadFilePath: 可选，文件存放路径，缺省使用系统上传文件目录
        filename: 可选，文件名，缺省由系统自动计算
        sheet:  Sheet名称, 可选，缺省为 Sheet1
        extraData: 可选，传递给数据提供服务的扩展参数
        showColoumnTitle: 可选，是否显示列标题，缺省为True
        headers: 可选，表头定义，格式为对象数组，每个对象包括以下属性：
        　　x     开始列号，从1开始。必须
        　　y     开始行号，从1开始。必须，相对于标题行的偏移，例如标题1行，y=1，在Excel实际则是2
        　　x1    结束列号，可选。如果大于x，表示要合并列
        　　y1    结束行号，可选。如果大于y，表示要合并行
        　　value     值，可选，一般是文本，缺省为空串。
                value中可以写Excel公式，公式必须符合Excel的语法。其中可以使用$函数计算单元格地址。
                $函数的语法为：
                    $(<开始列[,开始行,结束列,结束行]>)
                说明：行列均为相对于数据起始位置的偏移量。比如，如果指定了标题（1行），表首1行，表格头
                占1行，那么数据起始行是4，起始列是1. $函数中的行相对于4，列相对于1.因此：
                    $(0,0)对应的就是单元格 A4，$(2,1)对应的单元格是C5。
                特殊处理：
                    如果只指定了起始列，地址为指定列的所有行；
                    如果只指定了起始列和起始行，地址是一个具体的单元格；
                    如果指定了起始列、起始行、结束列，地址是同一行上多个单元格；
                    如果指定了4个参数，地址是一个矩形区间。
    
        　　border     边框，可选，数值类型，表示边框粗细，缺省为0，表示没有边框
            wrap    是否换行，可选，缺省为不允许
            align   对齐方式，可选，left,center,right
            rowHeight   行高，同一行定义多个则以第1个为准，缺省为20
            mergeRowBy  合并行，可选。根据指定字段的值合并数据行，指定的字段可以不在列模型中，但必须在数据源中存在
            format  数据格式，可选。
                0  General  General  
                1  Decimal  0  
                2  Decimal  0.00  
                3  Decimal  #,##0  
                4  Decimal  #,##0.00  
                5  Currency  $#,##0;$-#,##0  
                6  Currency  $#,##0;[Red]$-#,##0  
                7  Currency  $#,##0.00;$-#,##0.00  
                8  Currency  $#,##0.00;[Red]$-#,##0.00  
                9  Percentage  0%  
                10  Percentage  0.00%  
                11  Scientific  0.00E+00  
                12  Fraction  # ?  
                13  Fraction  # /  
                14  Date  m/d/yy  
                15  Date  d-mmm-yy  
                16  Date  d-mmm  
                17  Date  mmm-yy  
                18  Time  h:mm AM/PM  
                19  Time  h:mm:ss AM/PM  
                20  Time  h:mm  
                21  Time  h:mm:ss  
                22  Time  m/d/yy h:mm  
                37  Currency  #,##0;-#,##0  
                38  Currency  #,##0;[Red]-#,##0  
                39  Currency  #,##0.00;-#,##0.00  
                40  Currency  #,##0.00;[Red]-#,##0.00  
                41  Accounting  _ * #,##0_ ;_ * "_ ;_ @_  
                42  Accounting  _ $* #,##0_ ;_ $* "_ ;_ @_  
                43  Accounting  _ * #,##0.00_ ;_ * "??_ ;_ @_  
                44  Accounting  _ $* #,##0.00_ ;_ $* "??_ ;_ @_  
                45  Time  mm:ss  
                46  Time  h :mm:ss  
                47  Time  mm:ss.0  
                48  Scientific  ##0.0E+00  
                49  Text  @  

        tails:  可选，表尾定义，格式与headers相同，但行列号是相对于表体最后一行的偏移
        dataRowHeight:  可选，数据行高，缺省为20
        colModel中列信息扩展：
            width:              列宽度，字节为单位. -1 表示自动列宽
            wrap:               允许换行
            headerAngle:        列标题角度, 255表示文字竖排
            replaceZero:        数值单元格遇零替换为
            headerHeight:          列头行高. -1 表示自动列高，0 表示缺省高度（20）
            hideWhenAllZero:    该数值全为零是否隐藏
            fontName:           字体名称，缺省为宋体
            fontSize:           字体大小，缺省为10
    
        todo:
            1. 支持多个Sheet, done
            2. 支持插入图片
    */
    toExcel: function (setting) {
        if (!setting) {
            alert('必须设置导出参数！'); return;
        }
        // 参数setting如果是数组，表示需要导出多个数据源，生成多个Sheet页。
        // 这里将setting转换为数组好统一处理
        var settings = $.makeArray(setting);
        var settingIndexes = [];
        var sUrl = ROOT_PATH + 'frame/data/down.aspx' + "?rnd=" + new Date().getTime();
        // 先遍历一次检查各个导出参数是否齐备，并检查出需要用户选择导出列的数据源
        for (var i = 0, len = settings.length; i < len; i++) {
            var exp = settings[i];
            if (!exp.dataSource) {
                alert('必须设置 dataSource'); return;
            }
            if (!exp.colModel || !$.isArray(exp.colModel)) {
                alert('必须设置 colModel'); return;
            }
            if (exp.exportUrl) sUrl = exp.exportUrl;
            //exp.exportUrl = exp.exportUrl || ROOT_PATH + 'frame/data/down.aspx';
            exp.exportMethod = exp.exportMethod || "GridToExcel";
            exp.title = exp.title || '';
            if (exp.headers && !$.isArray(exp.headers)) {
                alert('header格式不正确，必须是数组'); return;
            }
            if (exp.tails && !$.isArray(exp.tails)) {
                alert('tails格式不正确，必须是数组'); return;
            }
            exp.allowSelectColumn = exp.allowSelectColumn || false;
            if (exp.allowSelectColumn) {
                settingIndexes.push(i);
            }
        }

        if (settingIndexes.length > 0) {
            //#region 选择列
            var selector = $('div.bdp-columnSelector');
            if (selector.size() == 0) {
                $('<div class="bdp-columnSelector"></div>').appendTo('body');
                selector = $('div.bdp-columnSelector');
            }
            $(selector).omDialog({
                title: '选择导出列',
                autoOpen: false,
                width: 450,
                height: 425,
                modal: true,
                buttons: [{
                    text: "执行导出", width: 55,
                    click: function () {
                        var tabs = selector.find('div.bdp-columnSelector-tabs');
                        for (var i = 0; i < settingIndexes.length; i++) {
                            var exp = settings[settingIndexes[i]],
                                columns = $('div[data-settingIndex="' + i + '"]', tabs).bdpListBox('getSelections');
                            if (columns.length > 0) {
                                exp.colModel = $.bdp.colModelHelper.toColModel(columns, '>');
                            } else {
                                exp.colModel = [];
                            }
                        }
                        $(selector).omDialog("close");
                        // 真正的导出由down.aspx在后台执行，这里只需要将结果下载到客户端。
                        $.download_executing(sUrl, settings);
                    }
                }, {
                    text: "取消", width: 55,
                    click: function () {
                        selector.omDialog('close');
                    }
                }],
                onClose: function () {
                    //$('div.bdp-columnSelector').closest('.om-dialog').remove();
                    //$('div.bdp-columnSelector').remove();
                },
                onOpen: function (event) {
                    var tabs = selector.find('div.bdp-columnSelector-tabs');
                    if (tabs.size() == 0) {
                        selector.css({ "overflow": "hidden", "padding": "0 0px 0 0px" })
                            .append('<div class="bdp-columnSelector-tabs"><ul></ul></div>')
                        tabs = selector.find('div.bdp-columnSelector-tabs');
                        tabs.css({ width: "100%", height: "100%" });
                        tabs.omTabs({ height: 'fit' });

                        for (var i = 0, len = settingIndexes.length; i < len; i++) {
                            var expIndex = settingIndexes[i], exp = settings[expIndex];
                            var id = "cs-tab-" + Math.round(Math.random() * 999999);
                            var s = exp.title || ('Sheet' + (expIndex + 1));
                            tabs.omTabs('add', {
                                title: exp.title || ('Sheet' + (expIndex + 1)),
                                content: '<div id="' + id + '"></div>',
                                activateNew: i == 0
                            });
                            $('#' + id, tabs)
                                .attr('data-settingIndex', i)
                                .width('100%').height('100%')
                                .css({ "overflow": "hidden", "display": "block" })
                                .bdpListBox({
                                    height: 'fit',
                                    dataSource: $.bdp.colModelHelper.toList(exp.colModel, '>'),
                                    textField: 'label',
                                    valueField: 'label'
                                })
                                .bdpListBox('selectAll');
                        }

                    }
                },
                onResize: function (event, ui) {
                    var tabs = selector.find('div.bdp-columnSelector-tabs');
                    tabs.omTabs('resize');
                    tabs.find('div.bdp-listbox').bdpListBox('resize');
                }
            });
            selector.omDialog('open');
            //#endregion

        } else {
            // 真正的导出由down.aspx在后台执行，这里只需要将结果下载到客户端。
            $.download_executing(sUrl, settings);
        }
    },

    download_waitting: function (pid) {
        $.ajax({
            url: getCommonDataUrl("BdpProgress", { id: pid }),
            dataType: 'json',
            success: function (ajaxResult) {
                var info = ajaxResult.Data || { Status: 0 };
                if (info.Status == 0) {
                    var progress = $('.om-messageBox-content div.progress'),
                        extraData = info.ExtraData || {},
                        fname = extraData.FileName || '',
                        exportResult = extraData.ExportResult || extraData,
                        f = progress.data('callback');
                    if (f && $.isFunction(f))
                        f(fname, exportResult);
                    $.omMessageBox.waiting('close');
                } else {
                    var msglabel = $('.om-messageBox-content .msglabel'),
                        progress = $('.om-messageBox-content div.progress'),
                        pos = info.Position || 0,
                        min = info.MinValue || 0,
                        max = info.MaxValue || 0,
                        v = Math.round((pos + 1) / (max - min + 1) * 100);
                    var msg = info.Message || '';
                    if (pos > 0) msg += "[" + pos + "]";
                    msglabel.text(msg);
                    if (max > 0)
                        progress.omProgressbar({ value: v });
                    setTimeout("$.download_waitting('" + pid + "')", 500);
                }
            }
        });
    },
    // 下载数据，必须指定服务器处理地址，data是传递到后台的数据，可以是对象或字符串。
    // 后台通过Request["options"]获取参数
    download_executing: function (actionUrl, data, callback) {
        var sData = (data != null) && (typeof (data) == 'object') ? JSON.stringify(data) : data;
        //参数中可能有html标签，所以需要编码。后台将解码。
        sData = escape(sData.replace(/<[^>]+>/g, ""));
        // console.log('sData:', sData);
        $.ajax({
            url: getCommonDataUrl('BdpExport'),
            type: "POST",
            data: sData,
            dataType: 'json',
            success: function (ajaxResult) {
                if (ajaxResult.Succeed) {
                    $.omMessageBox.waiting({
                        title: '等待',
                        content: '<label class="msglabel">服务器正在处理请求，请稍候...</label><br/><br/><div class="progress"></div><br/>'
                    });
                    var progress = $('.om-messageBox-content div.progress');
                    progress.data('callback', function (fname, exportResult) {
                        if ((fname || '') != '')
                            $.download_file(actionUrl, fname);
                        if ($.isFunction(callback)) {
                            callback(exportResult);
                        }
                    });
                    setTimeout("$.download_waitting('" + ajaxResult.Data + "')", 500);
                } else {
                    $.omMessageTip.show({ type: 'error', content: ajaxResult.Message || '下载失败！', timeout: 3000 });
                }
            }
        });
    },
    // 下载，其实是下载导出器exporter的导出结果
    download: function (exporter, options, callback) {
        var sUrl = ROOT_PATH + 'frame/data/down.aspx' + "?rnd=" + new Date().getTime(),
            ops = options || {};
        ops.exportMethod = exporter;
        $.download_executing(sUrl, $.makeArray(ops), callback);
    },
    // 第2个参数可以直接是文件名，也可以是对象，但对象可以包括以下属性：
    // SrcFilename  要下载的文件名(文件在服务器上存在且有权访问). 必须
    // DstFilename  下载到客户端的文件名(仅文件名不需要目录). 可选
    // eg： download_file('down.aspx',{SrcFilename:'??',DstFilename:''})
    download_file: function (actionUrl, filename) {
        //$.download_file()
        if (typeof filename == 'undefined') {
            filename = actionUrl;
            actionUrl = ROOT_PATH + 'frame/data/down.aspx' + "?rnd=" + new Date().valueOf();
        }
        var ops = typeof filename == 'object' ? filename : { SrcFilename: filename }
        var sData = escape(JSON.stringify(ops));
        //console.log(sData);
        var sForm = '<form action="' + actionUrl + '" method="POST" target="_self"><input type="hidden" name="options" /></form>';
        $('iframe[id^="export_"]').remove();
        var iframeStyle = 'position:absolute;width:0px;height:0px;left:-500px;top:-500px;';
        var iframeId = "export_" + (Math.round(Math.random() * 99999)).toString();
        iframe = document.createElement("IFRAME");
        $(iframe).attr({ id: iframeId, style: iframeStyle });
        document.body.appendChild(iframe);
        var doc = iframe.contentWindow.document;
        doc.write(sForm);
        $(doc).find('input[name="options"]').val(sData);

        $(doc).find('form').submit();
    },
    // 下载，fn 为特殊的jdp函数（函数负责写响应流），options为参数对象
    jdpDownload: function (fn, options) {
        var ht = [];
        ht.push('<form action="', getCommonDataUrl(fn, { download: 1 }), '" method="POST" target="_self">');
        if (options) {
            for (var key in options) {
                ht.push('<input type="hidden" name="', key, '" value="', options[key], '" />');
            }
        }
        ht.push('</form>');
        var iframeId = "jdpdownload_" + (Math.round(Math.random() * 99999)).toString();
        var iframeStyle = 'position:absolute;width:0px;height:0px;left:-500px;top:-500px;';
        $('iframe[id^="jdpdownload_"]').remove();
        var iframe = document.createElement("IFRAME");
        $(iframe).attr({ id: iframeId, style: iframeStyle });
        document.body.appendChild(iframe);
        var doc = iframe.contentWindow.document;
        doc.write(ht.join(''));
        $(doc).find('form').submit();
    },
    // 直接下载文件
    downFile: function (fileUrl) {
        var iframeId = "downloadFile_" + (Math.round(Math.random() * 99999)).toString();
        var iframeStyle = 'position:absolute;width:0px;height:0px;left:-500px;top:-500px;';
        $('iframe[id^="downloadFile_"]').remove();
        var iframe = document.createElement("IFRAME");
        $(iframe).attr({ id: iframeId, style: iframeStyle });
        document.body.appendChild(iframe);
        fileUrl += (fileUrl.indexOf('?') > 0 ? '&' : '?') + 'rnd=' + new Date().valueOf();
        $(iframe).attr('src', fileUrl);
    },
    // 显示任务进度提示框
    showProgress: function (progressId, allowCancel, onClose) {
        window.progressBox = window.progressBox || {
            pid: "",
            allowCancel: false,
            onClose: null,
            process: function () {
                $.getJSON(getCommonDataUrl("BdpProgress", { id: window.progressBox.pid }),
                    function (ajaxResult) {
                        var info = ajaxResult.Data || { Status: 0 };
                        if (info.Status == 0) {
                            var progress = $('.om-messageBox-content div.progress'),
                                extraData = info.ExtraData || {},
                                f = window.progressBox.onClose;
                            if (f && $.isFunction(f))
                                f(extraData);
                            //$('.om-messageBox-content div.progress').omProgressbar({ value: 75 });
                            $.omMessageBox.waiting('close');
                        } else {
                            var msglabel = $('.om-messageBox-content .msglabel'),
                                progress = $('.om-messageBox-content div.progress'),
                                pos = info.Position || 0,
                                min = info.MinValue || 0,
                                max = info.MaxValue || 0,
                                v = Math.round((pos + 1) / (max - min + 1) * 100);
                            var msg = info.Message || '';
                            if (pos > 0) msg += "[" + pos + "]";
                            msglabel.text(msg);
                            if (max > 0)
                                progress.omProgressbar({ value: v });
                            setTimeout(function () {
                                window.progressBox.process();
                            }, 500);
                        }
                    });
            },
            show: function () {
                $.omMessageBox.waiting('close');
                $.omMessageBox.waiting({
                    title: '请稍候',
                    content: '<label class="msglabel">服务器正在处理请求，请稍候...</label><br/><br/><div class="progress"></div><br/>'
                });
                if (window.progressBox.allowCancel) {
                    var pdiv = $('.om-messageBox-titlebar');
                    $('<span class="om-messageBox-title">中止</span>').appendTo(pdiv)
                        .css({ "cursor": "pointer", "float": "right" })
                        .click(function () {
                            $.post(getCommonDataUrl('BdpProgressCancel', { id: window.progressBox.pid }));
                        });
                }

                setTimeout(function () {
                    window.progressBox.process();
                }, 500);
            }
        };
        var pbox = window.progressBox;
        if (progressId != pbox.pid) {
            pbox.pid = progressId;
            pbox.allowCancel = allowCancel;
            pbox.onClose = onClose;
            pbox.show();
        }
    },

    //#endregion

    //#region 数据批量更新方法
    /*  单表数据批量更新。
        支持的参数：
            // 实体类名，必须
            type: '',
            // 主键字段名, 可选，没有后台根据类名自动判断
            keyField: '',
            // 主键值数组，可选
            keyValues: [],
            // esql语法的单表条件，可选
            filterSql: 'Sex=1||Sex=2',
            // 自定义查询条件，bdpFilterBox.getFilters()的返回值，可选
            customFilter: null,
            // 需要更新的值，必须
            values: {
                Code: '123',
                Notes: 'xxxx'
            },
            // 调用成功后执行
            success:null
    */
    batchUpdate: function (options) {
        var ops = options || {};
        if (!ops.type) { alert('必须提供实体类名！type'); return; }
        if (!ops.values) { alert('必须提供需要更新的数据！values'); return; }
        $.ajax({
            url: getCommonDataUrl('DEBatchUpdate'),
            method: 'POST',
            data: JSON.stringify(ops),
            dataType: 'json',
            success: function (ajaxResult) {
                if (ops.success) ops.success(ajaxResult);
            }
        });
    },
    //#endregion

    done: true
});
//#endregion

//#region 自定义控件
(function ($) {

    //#region 为任意对象增加或取消屏蔽层
    //屏蔽，适合单个元素.
    $.fn.mask = function () {
        if (this.length == 1) {
            var divmask = $(this).parent().find(".divMask");
            if (divmask.length == 0) {
                var divHtml = $('<div class="divMask" style="position: absolute; left: 0px; top: 0px; background: none repeat scroll 0 0 #cccccc;opacity: 0.7;"> </div>');
                divHtml.width($(this).width()).height($(this).height());
                $(this).wrap('<div style="position: relative"></div>');
                $(this).parent().append(divHtml);
                $(this).data("mask", true);
            }
        } else if (this.length > 0) {
            this.each(function () { $(this).mask(); });
        }
    }; //取消屏蔽
    $.fn.unmask = function () {
        if (this.length == 1) {
            if ($(this).data('mask') === true) {
                var divmask = $(this).parent().find(".divMask");
                if (divmask.length > 0) {
                    divmask.remove();
                    $(this).unwrap();
                    $(this).data("mask", false);
                }
            }
        } else if (this.length > 0) {
            this.each(function () { $(this).unmask(); });
        }
    }; //#endregion

    //#region 为任意对象增加启用/禁用方法. om-ui虽然有扩展，但在Firefox下不管用
    // 启用或禁用元素
    $.fn.enable = function (b) {
        if (b === undefined) {
            b = true;
        }
        return this.each(function () {
            this.disabled = !b;
            if (b) $(this).removeAttr('disabled');
            else $(this).attr('disabled', 'disabled');
        });
    };
    //#endregion

    //#region 下拉树控件
    $.omWidget('bdp.bdpComboTree', {
        options: {
            // 是否出现清除值按钮
            allowClearValue: true,
            dropHeight: 230,        // 下拉框高度
            valueField: 'id',       //值字段名
            textField: 'text',      //显示文本字段名或函数 function(nodeData)
            resizable: false,        // 下拉框是否允许调整尺寸
            tree: false,             //下拉树的设置
            //值修改事件
            // onValueChanged: function(newValue,oldValue,event){}
            // 是否可以选择某节点, 返回false不允许
            // onCanSelect: function (node) {}
            droplistId: "CTDL"
        },
        _create: function () {
            var self = this,
                $ele = this.element,
                ops = this.options;

            $ele.attr('readonly', 'readOnly');
            $ele.wrap('<span class="om-combo om-widget om-state-default"></span>')
                .parent()
                .append('<span id="' + this._getId('choose') + '" class="om-combo-trigger"></span>');

            this.choose = $ele.parent().find('#' + this._getId('choose'));

            this.choose.click(function () {
                if (!self.droplist || self.droplist.css('display') == 'none') {
                    self._showDropList();
                } else {
                    self._hideDropList();
                }
            });
            $ele.val('').click(function () {
                if (!self.droplist || self.droplist.css('display') == 'none') {
                    self._showDropList();
                } else {
                    self._hideDropList();
                }
            });
            if (ops.allowClearValue) {
                this.choose.before('<span id="' + this._getId('clear') + '" class="om-combo-clear" title="清除"></span>');
                this.clear = $ele.parent().find('#' + this._getId('clear'));
                $ele.css('margin-right', '-39px');
                this.clear.click(function () {
                    self.value('');
                });
            }
        },

        _init: function () {
            var self = this,
                $ele = this.element,
                ops = this.options,
                span = this.element.parent();

            var unusable = ops.disabled || ops.readOnly;
            if (unusable) {
                span.addClass('om-state-disabled');
            } else {
                span.removeClass('om-state-disabled')
                    .mouseenter(function () { span.addClass('om-state-hover'); })
                    .mouseleave(function () { span.removeClass('om-state-hover'); });
            }
        },
        //#region 接口函数

        // 获取或设置值
        value: function (v) {
            var self = this,
                ops = this.options,
                fn = ops.valueField.toLowerCase() === "id" ? "id" : ops.valueField,
                attrValueName = fn + '_value',
                $ele = this.element;
            if (typeof v === 'undefined') {
                var v1 = this.element.attr(attrValueName);
                return v1 ? v1 : '';
            } else {
                this._setValue(v);
            }
        },
        // 获取或设置input中的内容，即显示文本
        text: function (s) {
            return this.element.val(s);
        },
        // 获取当前树中选中的节点对象, 没有找到返回null
        getSelected: function () {
            var tree = this.getTree(), ops = this.options;
            if (tree.length > 0) {
                var fn = ops.valueField.toLowerCase() === "id" ? "id" : ops.valueField;
                return tree.omTree('findNode', fn, this.value());
            }
            return null;
        },
        // 获取树对象
        getTree: function () {
            //return $('#' + this._getId('tree'));
            return $('#' + this.options.droplistId + "_tree");
        },
        //#endregion

        _getId: function (id) {
            return this.element.prop('id') + '_' + id;
        },
        _showDropList: function () {
            var self = this,
                ops = this.options,
                input = this.element,
                span = this.element.parent(),
                offset = input.offset();

            var topnum = offset.top + input.outerHeight();
            if ($.browser.msie && ($.browser.version == "6.0" || $.browser.version == "7.0")) {
                topnum = topnum + 2;
            }

            self._createDropList();
            this.droplist.css({ left: offset.left + "px", top: topnum + "px" }).show();
            this._adjuestDroplistSize();
            // 朝下显示不全就朝上
            var height = this.droplist.height(),
                windowHeight = $(window).height();
            if (topnum + height > windowHeight) {
                this.droplist.css('top', topnum - height - span.outerHeight());
            }
            //body绑定mousedown事件，当事件对象非下拉框、下拉按钮等下拉列表隐藏。
            $(document.body).bind("mousedown", function (event) {
                var choose = self._getId('choose'),
                    droplist = self.options.droplistId,  // self._getId('droplist');
                    input = self.element.prop('id');
                if (!(event.target.id == input
                    || event.target.id == choose
                    || event.target.id == droplist
                    || $(event.target).parents("#" + droplist).length > 0)) {
                    self._hideDropList();
                }
            });
            // 定位节点
            var v = self.value() || '', tree = self.getTree();
            if (v != '') {
                var fn = ops.valueField.toLowerCase() === "id" ? "id" : ops.valueField,
                    node = tree.omTree('findNode', fn, v);
                if (node) {
                    tree.omTree('select', node);
                    var container = self.treeContainer,
                        scrollTo = $('#' + node.nid);
                    container.animate({
                        scrollTop: scrollTo.offset().top - container.offset().top + container.scrollTop()
                    });
                }
            }
        },
        _hideDropList: function () {
            this.droplist.hide();
            $(document.body).unbind("mousedown");
        },
        _getSender: function () {
            return this.droplist.data('_sender');
        },
        _createDropList: function () {
            var self = this, ops = this.options, dlid = ops.droplistId;
            self.droplist = $('#' + dlid);
            if (self.droplist.length > 0) {
                self.droplist.data('_sender', self);
                self.treeContainer = self.droplist.find('div:first');
            } else {
                self.droplist = $('<div class="om-widget om-widget-content om-droplist"></div>')
                    .prop('id', dlid)
                    .css({ 'position': 'absolute', 'z-index': 2000, overflow: 'hidden' })
                    .hide();
                $(document.body).append(self.droplist);
                self.droplist.data('_sender', self);

                self.treeContainer = $("<div></div>").appendTo(self.droplist)
                    .css({ width: 'auto', height: '100%', 'overflow-y': 'auto', 'overflow-x': 'hidden' });
                self.treeContainer.append('<ul id="' + dlid + "_tree" + '" style="text-align:left;padding-right: 23px;"></ul>');
                if (ops.resizable && $.fn.omResizable) {
                    self._makeResizable();
                }

                var treeoptions = $.extend(true, {}, ops.tree);
                // 双击选中
                treeoptions._onDblClick = ops.tree.onDblClick;
                treeoptions.onDblClick = function (nodeData, event) {
                    var canSelect = ops.onCanSelect;
                    if (!canSelect || canSelect(nodeData) != false) {
                        var sender = self._getSender();
                        sender._setValue(nodeData);
                        sender._hideDropList();
                    }
                    if (treeoptions._onDblClick) treeoptions._onDblClick(nodeData, event);
                };
                // 数据调入成功后设置输入框的值
                treeoptions._onSuccess = ops.tree.onSuccess;
                treeoptions.onSuccess = function (data) {
                    var sender = self._getSender();
                    sender._setValue(self.value());
                    if (treeoptions._onSuccess) treeoptions._onSuccess(data);
                },
                    treeoptions._onExpand = ops.tree.onExpand;
                treeoptions.onExpand = function (nodeData) {
                    var sender = self._getSender();
                    sender._adjuestDroplistSize();
                    if (treeoptions._onExpand) treeoptions._onExpand(nodeData);
                };
                // 如果没有提供动态附加子节点的处理，则需要自动处理
                treeoptions.onBeforeExpand = treeoptions.onBeforeExpand || function (node) {
                    var nodeDom = $("#" + node.nid);
                    if (nodeDom.hasClass("hasChildren")) {
                        nodeDom.removeClass("hasChildren");
                        if (typeof treeoptions.dataSource === 'string') {
                            var dataUrl = treeoptions.dataSource;
                            dataUrl += (dataUrl.indexOf('?') > 0 ? '&' : '&') + 'pid=' + node.id;
                            $.ajax({
                                url: dataUrl,
                                method: 'POST',
                                dataType: 'json',
                                success: function (data) {
                                    var $tree = self.getTree();
                                    $tree.omTree("insert", data, node);
                                }
                            });
                        }
                    }
                    return true;
                };

                var $tree = this.getTree();
                $tree.empty();
                $tree.omTree(treeoptions);

            }

        },
        _adjuestDroplistSize: function () {
            var self = this,
                ops = self.options,
                input = self.element,
                dl = self.droplist;

            if (ops.dropHeight != 'auto') {
                dl.height(ops.dropHeight);  //.css('overflow-y', 'auto');
            }
            //if (dl.width() < input.parent().innerWidth())
            //    dl.width(input.parent().innerWidth());
            dl.css('min-width', input.parent().innerWidth());
        },
        _setValue: function (value) {
            var self = this,
                ops = this.options,
                fn = ops.valueField.toLowerCase() === "id" ? "id" : ops.valueField,
                attrValueName = fn + '_value',
                onValueChanged = ops.onValueChanged,
                $ele = this.element,
                $tree = this.getTree(),
                oldValue = this.element.attr(attrValueName) || '',
                newValue = typeof value == 'object' ? value[fn] || '' : value;
            this.element.attr(attrValueName, newValue);

            if (newValue == '') {
                $ele.val('');
            } else {
                // 1. 设值时可能树还没有创建，2.可能值对应的节点还没有加载
                var textField = ops.textField;
                var node = typeof value == 'object' ? value :
                    $tree.length > 0 ? $tree.omTree('findNode', fn, newValue) : null;
                if (node == null) {
                    // 树没创建或节点没找到，想办法到后台去取
                    // 代价太大，还是让调用setText直接设置吧
                } else {
                    try {
                        if (typeof textField === 'string') {
                            fn = textField.toLowerCase() === "text" ? "text" : textField;
                            $ele.val(node[fn]);
                        } else {
                            $ele.val(textField(node));
                        }
                    }
                    catch (e) { $ele.val(''); }
                }
            }
            onValueChanged && this._trigger('onValueChanged', null, newValue, oldValue);
        },


        _makeResizable: function () {
            var self = this,
                options = self.options,
                position = self.droplist.css('position'),
                resizeHandles = 's,e,se';

            function filteredUi(ui) {
                return {
                    originalPosition: ui.originalPosition,
                    originalSize: ui.originalSize,
                    position: ui.position,
                    size: ui.size
                };
            }

            self.droplist.omResizable({
                //cancel: '.om-dialog-content',
                containment: 'document',
                alsoResize: self.droplist.element,
                //maxWidth: options.maxWidth,
                //maxHeight: options.maxHeight,
                minWidth: self.element.width(),
                minHeight: self.element.height(),
                handles: resizeHandles,
                done: true
            })
                .css('position', position)
                .find('.om-resizable-se').addClass('om-icon om-icon-grip-diagonal-se');
        }

    });
    //#endregion

    //#region om-ui控件扩展

    //#region 扩展 omTree, 绘制节点时专门增加一个span来显示图标，节点数据中支持image指定单个图标文件，也可以通过classes指定图标样式名
    $.omWidget.addCreateListener('om.omTree', function () {
        var self = this, base = $.om.omTree.prototype;
        $.extend(this, {
            updateNode: function (target) {
                base.updateNode.apply(self, [target]);
                _updateTreeNodeImages(self);
            },
            insert: function (target, pNode, bNode, isDrop) {
                // modify是先remove节点然后再调insert，存在的一个bug是：当修改的节点没有兄弟节点时会移出ul，而再增加时没有检查，还是在往ul中增加，导致增加不成功。
                if (pNode && $("#" + pNode.nid).children("ul").length == 0) {
                    $("#" + pNode.nid).append('<ul></ul>');
                }
                base.insert.apply(self, [target, pNode, bNode, isDrop]);
                _updateTreeNodeImages(self);
            }
        });
    });

    _updateTreeNodeImages = function ($tree) {
        if (!$tree.options.showIcon) return;
        var $elem = $tree.element,
            nodes = $elem.find('li>span.file,li>span.folder');
        $(nodes).each(function (i, span) {
            var $span = $(span),
                hasFolder = $span.hasClass('folder'),
                hasFile = $span.hasClass('file'),
                nid = $span.parent().attr('id'),
                data = $tree.findByNId(nid),
                img = $('<span style="margin-right: 5px; padding: 1px 0 1px 1px; vertical-align: top; width:16px; height: 16px;">&nbsp;&nbsp;</span>'),
                cls = !data ? '' : data.image || data.classes || '';
            $span.attr('class', '');
            if (cls.indexOf('.') >= 0 || cls.indexOf('/') >= 0) {
                img.css("background", "url('" + cls + "') no-repeat");
            } else {
                if (cls == '') {
                    if (hasFile) cls = 'file';
                    else if (hasFolder) cls = 'folder';
                }
                img.addClass(cls);
            }
            //if (hasFile) img.addClass('file');
            //if (hasFolder) img.addClass('folder');
            $span.prepend(img);
        });
    };
    //#endregion


    //#region 扩展 omCombo, 增加下拉表格选择
    $.omWidget.addCreateListener('om.omCombo', function () {
        var self = this, ops = self.options, base = $.om.omCombo.prototype;
        if (ops.dropGrid) {
            /* 设定了dropGrid参数，则扩展为下拉表格选择。
             * options.dropGrid可以为true，自动转化为omGrid参数对象。
             * 除了支持所有omGrid参数外，还支持:
             *  selectedEventName:'dblclick'    // 选中事件：click或dblclick
             * 
             */
            if (typeof ops.dropGrid != 'object') {
                ops.dropGrid = {
                    width: 'fit',
                    height: 'fit',
                    limit: -1
                }
            }
            if (!$.isArray(ops.dropGrid.colModel) || ops.dropGrid.colModel.length < 1) {
                var cm = { header: '名称', width: 'autoExpand' };
                if (typeof ops.optionField === 'string') {
                    cm.name = ops.optionField;
                } else {
                    cm.name = 'text';
                    cm.renderer = function (value, rowData, rowIndex) {
                        return ops.optionField.call(self, rowData, rowIndex);
                    }
                }
                ops.dropGrid.colModel = [cm];
            }

            if (typeof ops.dataSource == 'string') {
                // 如果设定了地址，则传给omGrid. 
                ops.dropGrid.dataSource = ops.dropGrid.dataSource || ops.dataSource;
                // dataSource总是保存最全的下拉选择项数据, omGrid每加载一页数据，都应该加入到omCombo的dataSource中
                ops.dataSource = [];
            }
            ops.dataSource = ops.dataSource || [];
            // 选中事件名:click或dblclick
            ops.dropGrid.selectedEventName = ops.dropGrid.selectedEventName || 'click';
            // 是否允许改变大小
            ops.dropGrid.resizable = typeof ops.dropGrid.resizable != 'boolean' ? true : ops.dropGrid.resizable;
            // 
            ops.dropGrid.preProcess = function (data) {
                ops.dataSource = ops.dataSource || [];
                var rows = $.isArray(data) ? data : data.rows || [];
                $.each(rows, function (i, r) {
                    var exists = $.grep(ops.dataSource, function (r1) { return r1[ops.valueField] == r[ops.valueField] })[0];
                    if (!exists) ops.dataSource.push(r);
                });
                self._setValue(ops.value);
                if ($.isArray(data)) {
                    return { total: data.length, rows: data };
                }
                return data;
            }
        }
        $.extend(this, {
            _ajaxLoad: function (url) {
                if (ops.dropGrid) {
                    self.dropGrid.find('table.grid').omGrid('setData', url);
                    self._toggleLoading('remove');
                    return;
                }
                base._ajaxLoad.call(self, url);
            },
            _loadData: function (records) {
                // console.log('records1:', records);
                if (ops.dropGrid) {
                    ops.dataSource = records;
                    self.dataHasLoaded = true;
                    _createDropGrid();
                    self._setValue(ops.value);
                    return;
                }
                base._loadData.call(self, records);
            },
            // 如果下拉框超出了当前窗口则在上方显示
            _showDropList: function () {
                self.dropList.show();
                var dropListContainer = self.dropList.parent();
                if (ops.dropGrid) {
                    _createDropGrid();
                    var input = self.textInput;
                    var inputOffset = input.offset();
                    dropListContainer.css({
                        top: inputOffset.top + input.outerHeight(),
                        left: inputOffset.left - 1
                    });
                    self._resize();
                } else {
                    base._showDropList.call(self);
                }
                var pos = dropListContainer.position(),
                    height = dropListContainer.height(),
                    windowHeight = $(window).height();
                var span = self.textInput.parent('span');
                if (pos.top + height > windowHeight) {
                    dropListContainer.css("top", pos.top - height - span.outerHeight());
                }
                // 自动宽度时，最小宽度与控件宽度一样
                if (ops.listAutoWidth) {
                    var sw = span.outerWidth(),
                        lw = dropListContainer.width();
                    if (lw < sw) dropListContainer.width(sw);
                }
                ops.onDropList && ops.onDropList.call(this);
                //self.dropList.trigger('shown', [this]);
            },
            _setValue: function (value) {
                if (ops.dropGrid) {
                    var input = self.textInput, valueEl = self.element;
                    var oldValue = valueEl.val();
                    valueEl.val(value);
                    ops.value = value;
                    var allData = self.getData() || [];
                    var rdIndex = -1;
                    var rd = $.grep(allData, function (r, i) {
                        rdIndex = i;
                        return r[ops.valueField] == value;
                    })[0];
                    var txt = '' + value;
                    if (rd) txt = typeof ops.optionField === 'string' ? rd[ops.optionField] || '' : ops.optionField(rd, rdIndex) || '';
                    input.val(txt);
                    // trigger onValueChange event
                    if (ops.onValueChange && value != oldValue) {
                        this._trigger("onValueChange", null, input, value, oldValue);
                    }
                    return;
                }
                base._setValue.call(self, value);
            },
            _resize: function () {
                self.dropGrid.find('div.container').height(self.dropGrid.height() - self.dropGrid.find('div.toolbar').outerHeight() - 1);
                self.dropGrid.find('table.grid').omGrid('resize');
            },
            done: false
        });

        function _createDropGrid() {
            if (self.dropGrid) return;
            var ht = [];
            ht.push('<div class="dropGrid" style="width:100%;height:100%;">');
            ht.push('<div class="toolbar" style="height:30px;">',
                '<div title="搜索" style="display: block; top: 3px; float: right; margin-right: 5px; position: relative;">',
                '<input type="text" class="search" style="width: 140px; font-size: 12px;">',
                '<span class="img_sousuo" style="padding-left: 7px; padding-right: 13px;"></span>',
                '</div></div>');
            ht.push('<div class="container">');
            ht.push('<table class="grid"></table>');
            ht.push('</div>');
            ht.push('</div>');
            var dropList = self.dropList.css({ "overflow-y": "hidden", "min-width": 230 }).height(261).show();
            self.dropGrid = $(ht.join('')).appendTo(dropList.empty());
            if (ops.dropGrid.resizable) {
                _makeResizable();
            }
            self.dropGrid.find('div.container')
                .css({
                    "padding": "2px",
                    "height": self.dropGrid.height() - self.dropGrid.find('div.toolbar').outerHeight() - 1
                });
            ops.dropGrid.height = 'fit';
            self.dropGrid.find('table.grid')
                .omGrid(ops.dropGrid)
                .on(ops.dropGrid.selectedEventName, 'tr.om-grid-row', function () {
                    var grid = self.dropGrid.find('table.grid');
                    var data = grid.omGrid('getData');
                    var index = grid.find('tr.om-grid-row').index($(this));
                    var rd = data.rows[index];
                    self.value(rd ? rd[ops.valueField || 'value'] : '');
                    self.dropList.hide();
                });
            self.dropGrid.find('span.img_sousuo').click(function () {
                _filteRows();
            }).trigger('click');

            self.dropGrid.find('input.search').keydown(function (event) {
                if (typeof ops.dropGrid.dataSource === 'string' || typeof ops.dropGrid.dataSource == 'undefined') {
                    if (event.keyCode == 13) {
                        _filteRows();
                    }
                } else {
                    var inputEl = $(this);
                    var delayTimer = $.data(inputEl, 'delayTimer');
                    if (delayTimer) {
                        clearTimeout(delayTimer);
                    }
                    delayTimer = setTimeout(function () {
                        _filteRows();
                    }, 2000);
                    $.data(inputEl, 'delayTimer', delayTimer);
                }
            });

            dropList.hide();
        }
        function _makeResizable() {
            var position = self.dropList.css('position'),
                resizeHandles = 's,e,se,sw';
            function filteredUi(ui) {
                return {
                    originalPosition: ui.originalPosition,
                    originalSize: ui.originalSize,
                    position: ui.position,
                    size: ui.size
                };
            }
            self.dropList.omResizable({
                cancel: '.om-dialog-content',
                containment: 'document',
                alsoResize: self.dropList,
                //maxWidth: ops.dropGrid.maxWidth || $(window).width(),
                //maxHeight: ops.dropGrid.maxHeight || $(window).height(),
                minWidth: 131,
                minHeight: 161,
                handles: resizeHandles,
                start: function (event, ui) {
                    //$(this).addClass("om-dialog-resizing");
                    //self._trigger('onResizeStart', event, filteredUi(ui));
                },
                resize: function (event, ui) {
                    //self._trigger('onResize', event, filteredUi(ui));
                },
                stop: function (event, ui) {
                    //$(this).removeClass("om-dialog-resizing");
                    //ops.dropGrid.height = $(this).height();
                    //ops.dropGrid.width = $(this).width();
                    //self._trigger('onResizeStop', event, filteredUi(ui));
                    self.dropGrid.find('div.container').height(self.dropGrid.height() - self.dropGrid.find('div.toolbar').outerHeight() - 1);
                    self.dropGrid.find('table.grid').omGrid('resize');
                }
            })
                .css('position', position)
                .find('.om-resizable-se').addClass('om-icon om-icon-grip-diagonal-se');
        }
        function _filteRows() {
            var txt = self.dropGrid.find('input.search').val() || '';
            if (typeof ops.dropGrid.dataSource == 'string' || typeof ops.dropGrid.dataSource == 'undefined') {
                var gridOps = self.dropGrid.find('table.grid').omGrid('options');
                gridOps.extraData = gridOps.extraData || {};
                gridOps.extraData.filter = txt;
                self.dropGrid.find('table.grid').omGrid('reload');
            } else {
                var records = self.getData();
                var rows = $.grep(records, function (rd, i) {
                    var v = typeof ops.optionField === 'string' ? rd[ops.optionField] || '' : ops.optionField.call(self, rd, i) || '';
                    return v.indexOf(txt) >= 0;
                });
                self.dropGrid.find('table.grid').omGrid('setData', { total: rows.length, rows: rows });
            }
        }
    });
    //#endregion

    //#region 扩展下拉控件:
    // 1. 如果下拉框超出了当前窗口则在上方显示
    // 2. 下拉框显示时触发 shown事件
    $.omWidget.addInitListener('om.omCombo', function () {
        var self = this, ops = this.options,
            $elem = self.element,
            input = self.textInput,
            span = input.parent('span'),
            expandTrigger = self.expandTrigger;
        // 增加清除值的按钮
        if (ops.allowClearValue && !this.btnClear) {
            expandTrigger.before('<span class="om-combo-clear" title="清除"></span>');
            this.btnClear = $elem.parent().find('span.om-combo-clear');
            input.css({ width: '100%', 'margin-right': '-41px' });
            this.btnClear.click(function () {
                self.value('');
            });
        } else if (this.btnClear) {
            this.btnClear.remove();
            this.btnClear = null;
        }

        // 已经显示了就隐藏
        span.mousedown(function (e) {
            if (self.dropList.is(":visible")) self.dropList.hide();
            else self._showDropList();
        });
        // 不要一聚焦就下拉出来，很烦的
        expandTrigger.unbind();
        input.focus(function () {
            self.dropList.hide();
        });


        $.extend(this, {
            // 获取选中的对象
            getSelectedItem: function () {
                var data = this.getData();
                if (data) {
                    var idfld = this.options.valueField;
                    var value = this.value();
                    var item = $.grep($.makeArray(data), function (ele) { return ele[idfld] == value; })[0];
                    if (item) return item;
                }
                return null;
            },
            // 获取当前选中项的文本
            text: function () {
                return $(this.textInput).val();
            }
        });

    });
    //#endregion

    //#region 扩展日期控件 
    $.omWidget.addCreateListener('om.omCalendar', function () {
        if (this._extended) return;
        var self = this, ops = this.options;
        var base_render = this._render;
        $.extend(this, {
            _render: function (o) {
                if (o) o.date = o.date || new Date();
                base_render.call(this, o);
                ops.clear = ops.clear || false;
                ops.today = ops.today || false;
                if (ops.popup && (ops.clear || ops.today)) {
                    self.con.find('.om-cal-bd')
                        .append('<div style="position: relative; display: block;">' +
                            '<a href="javascript:void(0);" class="cal-btn today">' + (ops.today === true ? '今天' : ops.today) + '</a>' +
                            '<a href="javascript:void(0);" class="cal-btn clear">' + (ops.clear === true ? '清除' : ops.clear) + '</a>' +
                            '</div>');
                    self.con.find('.cal-btn').css({
                        "color": '#1C62CB',
                        "text-decoration": 'none',
                        "padding": "10px 7px 7px 13px",
                        "display": "inline-block"
                    });
                    self.con.on('click', 'a.today', function (e) {
                        var dt = new Date();
                        self.setDate(dt);
                        var dateStr = $.omCalendar.formatDate(dt, ops.dateFormat || self._defaultFormat);
                        $(self.element).val(dateStr).focus().blur();
                        self.hide();
                        self._trigger("onSelect", e, dt);
                    }).on('click', 'a.clear', function (e) {
                        var dt = new Date(0, 0, 0);
                        self.setDate(dt);
                        $(self.element).val('').focus().blur();
                        self.hide();
                        self._trigger("onSelect", e, dt);
                    });
                }
            },
            _handleDate: function () {
                var date = this.options.date;
                if (date) {
                    this.day = date.getDate();//几号
                    this.month = date.getMonth();//月份
                    this.year = date.getFullYear();//年份
                } else {
                    this.day = 0;
                    this.month = 0;
                    this.year = 0;
                }
            }
        });
        this._extended = true;
    });
    //#endregion

    //#region 扩展对话框控件，增加窗口标题图标参数
    // icons: true/false
    $.omWidget.addInitListener('om.omDialog', function () {
        var self = this, ops = this.options;
        var tbar = self.uiDialogTitlebar;
        if (typeof ops.icons == 'undefined' || ops.icons === false) {
            tbar.find('.om-dialog-title-icon').hide();
            tbar.find('.om-dialog-title').css({ "margin-left": "11px" });
        } else {
            tbar.find('.om-dialog-title-icon').show();
            tbar.find('.om-dialog-title').css({ "margin-left": "38px" });
        }
    });
    //#endregion

    //#region 扩展布局控件, 增加resize函数
    $.omWidget.addInitListener('om.omBorderLayout', function () {
        var self = this;
        $.extend(this, {
            //#region 修正没有proxy时报错的问题
            closeRegion: function (region) {
                var panel = this._getPanelOpts(region);
                if (!panel || !panel.closable) {
                    return;
                }
                var $region = this._getRegion(region);
                $body = $region.find(">.om-panel-body");
                if ($region) {
                    var panelInstance = $.data($body[0], "omPanel");
                    if (panelInstance.options.closed) return;

                    $region.find(">.om-panel-body").omPanel("close");
                    var proxy = this._getRegionProxy(region);
                    if (proxy) proxy.hide();
                    this._resizeRegion();
                }
            },
            openRegion: function (region) {
                var panel = this._getPanelOpts(region);
                if (!panel || !panel.closable) {
                    return;
                }
                var $region = this._getRegion(region);
                $body = $region.find(">.om-panel-body");
                if ($region) {
                    var panelInstance = $.data($body[0], "omPanel");
                    if (!panelInstance.options.closed) return;

                    $region.find(">.om-panel-body").omPanel("open");
                    var proxy = this._getRegionProxy(region);
                    if (proxy) proxy.hide();
                    this._resizeRegion();
                }
            },
            //#endregion

            resize: function () {
                self._resizeRegion(true);
            },
            // 返回某个区域是否已经关闭
            isClosed: function (region) {
                var $region = this._getRegion(region);
                $body = $region.find(">.om-panel-body");
                if ($region) {
                    var panelInstance = $.data($body[0], "omPanel");
                    return panelInstance.options.closed;
                }
                return false;
            }
        });
    });
    //#endregion

    //#region 扩展omTab, 增加resize函数
    $.omWidget.addInitListener('om.omTabs', function () {
        var self = this;
        $.extend(this, {
            resize: function () {
                //self._render();
                var $self = $(this.element);
                var options = this.options;
                if (options.width == 'fit') {
                    $self.outerWidth($self.parent().width());
                } else if (options.width != 'auto') {
                    $self.css('width', options.width);
                    // 解决IE7下，tabs在table>tr>td中ul把table的宽度撑宽的问题
                    //            omtabs.children(':first').css('width',options.width);
                    var isPercent = isNaN(options.width) && options.width.indexOf('%') != -1;
                    $self.children(':first').outerWidth(isPercent ? '100%' : options.width);
                }
                if (options.height == 'fit') {
                    $self.outerHeight($self.parent().height());
                } else if (options.height != 'auto') {
                    $self.css('height', options.height);
                }
                this._renderBody();
            }
        });
    });
    //#endregion

    //#region 扩展菜单控件 omMenu
    //  如果菜单项设置了checked, 则点击时自动切换其选中状态。
    //  如果菜单项指定了group，则选中点击项，同组的其它项都置为非选中状态。
    $.omWidget.addInitListener('om.omMenu', function () {
        var self = this,
            lis = self.element.find('li'),
            source = self.options.dataSource,
            $doc = $(document);
        // 解决有菜单的页面，录入框不能按光标键的问题
        $doc.unbind('keydown.omMenu');
        self._userSelectEvent = self.options.onSelect;
        self.options.onSelect = function (item, event) {
            if (item && (typeof (item.checked) != 'undefined')) {
                var checked = item.checked ? false : true,
                    group = item.group || '';
                if (group != '') {
                    _eachSource(source, function (item) {
                        if (typeof (item.checked) != 'undefined' && item.group == group) {
                            self.check(item, false);
                        }
                    });
                    checked = true;
                }
                self.check(item, checked);
            }
            if (self._userSelectEvent) {
                self._userSelectEvent(item, event);
            }
        };
        $.extend(this, {
            check: function (item, checked) {
                if (!item) return;
                item.checked = checked;
                var img = self.element.find("li[id='" + item.id + "']")
                    .find("img.om-menu-icon");
                //.addClass("bdp-icons-dev2");
                if (item.checked) {
                    //img.removeClass("bdp-menu-unchecked");
                    img.addClass("bdp-icons-checked");
                    img.removeClass("bdp-icons-unchecked");
                } else {
                    img.removeClass("bdp-icons-checked");
                    img.addClass("bdp-icons-unchecked");
                }
                //self._trigger("onSelect", event, item);
            },
            findItem: function (itemId) {
                return $(self.element).data($(self.element).attr('id') + "_" + itemId);
            }
        });

        _eachSource(source, function (item) {
            if (item && (typeof (item.checked) != 'undefined'))
                self.check(item, item.checked);
        });

        function _eachSource(source, callback) {
            $(source).each(function (index, item) {
                callback(item);
                var children = item.children;
                if (children && $.isArray(children)) {
                    _eachSource(children, callback);
                }
            });
        }

    });
    //#endregion

    //#region 扩展按钮控件 omButton
    // icons选项中增加leftCss、rightCss属性，可以指定图标样式
    $.omWidget.addCreateListener('om.omButton', function () {
        var self = this, options = this.options, element = this.element;
        //element.css({ 'background-position': 'left bottom' });
        var base = $.om.omButton.prototype;
        $.extend(this, {
            _initButton: function () {
                base._initButton.call(self);
                if (options.hint) $(self.element).attr('title', options.hint);
                if (this.type == 'a' || this.type == 'button') {
                    if (options.icons.leftCss) {
                        $('<span></span>')
                            //.width(16).height(16)
                            //.css({ 'display': 'inline-block', 'margin-right': '3px', 'vertical-align': 'middle' })
                            .addClass('licon om-btn-span')
                            .addClass(options.icons.leftCss)
                            .prependTo(element);
                    }
                    if (options.icons.rightCss) {
                        $('<span></span>')
                            //.width(16).height(16)
                            //.css({ 'display': 'inline-block', 'margin-left': '3px', 'vertical-align': 'middle' })
                            .addClass('ricon om-btn-span')
                            .addClass(options.icons.rightCss)
                            .appendTo(element);
                    }
                }
            },
            changeLabel: function (label) {
                if (options.icons.leftCss) {
                    label = '<span class="licon om-btn-span bdp-icons-information"></span>' + label;
                }
                if (options.icons.rightCss) {
                    label += '<span class="ricon om-btn-span bdp-icons-expand"></span>';
                }
                if (this.type == "a") {
                    this.element.text(label);
                } else if (this.type == "input") {
                    this.element.val(label);
                } else if (this.type == "button") {
                    this.element.html(label);
                }
            },
            changeIcons: function (icons) {
                if (icons.leftCss || icons.rightCss) {
                    if (options.icons.leftCss) {
                        $(element).find('.licon').removeClass(options.icons.leftCss);
                    }
                    if (options.icons.rightCss) {
                        $(element).find('.ricon').removeClass(options.icons.rightCss);
                    }
                    $.extend(true, options.icons, icons);
                    if (options.icons.leftCss) {
                        $(element).find('.licon').addClass(options.icons.leftCss);
                    }
                    if (options.icons.rightCss) {
                        $(element).find('.ricon').addClass(options.icons.rightCss);
                    }
                    return;
                }
                base.changeIcons.call(self, icons);
            },
            //_addClass: function (state) {
            //    if (state != 'focus') {
            //        base._addClass.call(self, state);
            //    }
            //},
            disable: function () {
                base.disable.call(self);
                self._removeClass('focus');
                self._removeClass('hover');
            },
            // 返回按钮是否可用
            enabled: function () {
                return this.element.closest('.om-btn').hasClass('om-state-disabled') !== true;
            },
            // 返回按钮当前是否已经被禁用. 命名不好，为兼容保留。用enabled代替
            isDisabled: function () {
                return !this.enabled();
            },
            isVisible: function () {
                return (this.element.closest('.om-btn').css('display') || '') !== 'none';
            },
            done: true
        });
    });
    //#endregion

    //#endregion

    //#region 通用选择对话框, 支持单表选择、单树选择和树表选择，支持单选和多选
    $.omWidget('bdp.bdpSelector', $.om.omDialog, {
        // 基类
        base: $.om.omDialog.prototype,
        options: {
            autoOpen: false,
            modal: true,
            width: 550,
            height: 350,
            // 选择框的标题
            title: '请选择',
            // 是否单选
            singleSelect: true,
            /* 是否允许出现快速搜索框, 缺省允许。
                如果允许快速搜索，在树或表需要后台查询数据时，搜索的内容将拼接到ajax地址中，
            并命名为searchQueryName参数设定的名字。
            */
            allowQuickSearch: true,
            // 过滤串参数名
            qnSearch: "filter",
            // 树节点id的参数名
            qnTreeId: 'id',
            // 树节点上级id的参数名
            qnTreePid: 'pid',
            // 表格主键字段名
            qnGridKey: 'key',
            // 是否包括下级标志的参数名,1为包括下级。
            qnSub: 'sub',

            // 树的数据源提供地址，自动拼接pid,sub,filter参数
            treeDataSource: '',
            // 表的数据源提供地址，自动拼接nid(当前选中树节点值),sub,filter参数
            gridDataSource: '',
            /* tree和grid至少得有一个
            tree: {
                // 支持树的所有设置
            },
            grid: {
                // 支持表格的所有设置
            },
            // 请求数据前事件
            // 触发获取数据前事件, 用户可以修改或增加args中的参数，这些参数将封装到请求地址上.
            // 例如：可以增加 args['dwid']=node.id。node参数为当前选中树节点，不显示树时为null
            onBeforeRequestData: function(args,node, forGrid){}
            // 选择框关闭前事件，返回false不能关闭
            onCloseQuery:function(sender){}
            */

            done: true
        },
        //#region 重载
        _create: function () {
            var self = this, ops = this.options;
            if (!ops.tree && !ops.grid) {
                throw "tree或grid至少需设置一项！";
            }
            this.options.buttons = [
                {
                    text: '确定', id: this._getId('btnOk'),
                    click: function () {
                        //self._doClose(true);
                        self._returnValues = $.merge([], self._selectedValues);
                        self._sureClosed = true;
                        self.close();
                    }
                },
                {
                    text: '取消', id: this._getId('btnCancel'),
                    click: function () {
                        //self._doClose(false);
                        self._sureClosed = false;
                        self.close();
                    }
                }
            ];
            this.options.onResize = function () {
                self._resize();
            };

            this.base._create.apply(this, []);
            $('#' + this._getId('btnOk') + ',#' + this._getId('btnCancel')).width(65);

            // 选中的值, 操作过程中使用的
            this._selectedValues = [];
            // 返回值，最先保存初始值，只有按确定后才会更新
            this._returnValues = [];

            // 创建布局
            this._createLayout();

            // 修正参数
            if (ops.grid) {
                if (typeof (ops.gridDataSource) == 'undefined') ops.gridDataSource = ops.grid.dataSource;
                ops.grid.onRowSelect = function (rowIndex, rowData, event) {
                    self._select(rowData);
                };
                ops.grid.onRowDeselect = function (rowIndex, rowData, event) {
                    self._deselect(rowData);
                };
                ops.grid.onRefresh = function (nowPage, pageRecords, event) {
                    var rows = [];
                    $(pageRecords).each(function (i, data) {
                        if (self._indexOfSelected(data) >= 0) {
                            rows.push(i);
                        }
                    });
                    self.uiGrid.omGrid('setSelections', rows);
                };
            }
            if (ops.tree) {
                if (typeof (ops.treeDataSource) == 'undefined') ops.treeDataSource = ops.tree.dataSource;
                ops.tree.onBeforeExpand = function (node) {
                    var nodeDom = $("#" + node.nid);
                    if (nodeDom.hasClass("hasChildren")) {
                        nodeDom.removeClass("hasChildren");
                        var args = self._createDefaultRequestArgs(node);
                        args[ops.qnTreePid] = node[ops.qnTreeId];
                        args.pid = node[ops.qnTreeId];
                        self._doBeforeRequestData(args, node, false);
                        args.id = undefined;
                        $.ajax({
                            url: self._checkUrl(self.options.treeDataSource, args),
                            method: 'POST',
                            dataType: 'json',
                            success: function (data) {
                                self.uiTree.omTree("insert", data, node);
                            }
                        });
                    }
                    return true;
                };
                ops.tree.onBeforeSelect = function (nodeData) {
                    if (!self.uiGrid && self.options.singleSelect) {
                        var node = self.uiTree.omTree('getSelected');
                        if (node) {
                            self._deselect(node);
                        }
                    }
                };
                ops.tree.onSelect = function (nodeData) {
                    if (self.uiGrid) {
                        var node = self.uiTree.omTree('getSelected'),
                            args = self._createDefaultRequestArgs(node);
                        self._doBeforeRequestData(args, node, true);
                        var s = self._checkUrl(self.options.gridDataSource, args);
                        self.uiGrid.omGrid('setData', s);
                    } else {
                        if (self.options.singleSelect) {
                            self._select(nodeData);
                        }
                    };
                };
                ops.tree.onCheck = function (nodeData) {
                    if (!self.uiGrid && !self.options.singleSelect) {
                        var nodes = self.uiTree.omTree('getChecked', true);
                        self._selectedValues = [];
                        if ($.isArray(nodes)) {
                            $.each(nodes, function (i, node) {
                                self._selectedValues.push(node);
                            });
                            self._updateSelected();
                        }
                    }
                };
                ops.tree.onSuccess = function (data) {
                    if (!ops.grid && $.isArray(data) && self._selectedValues.length > 0) {
                        $.each(data, function (i, node) {
                            if (self._indexOfSelected(node) >= 0) {
                                if (self.options.singleSelect) {
                                    self.uiTree.omTree('select', node);
                                } else {
                                    self.uiTree.omTree('check', node);
                                }
                            }
                        });
                    }
                };
            }
        },
        _init: function () {
            this.base._init.apply(this, []);
            var self = this,
                $ele = this.element,
                ops = this.options;
            if (ops.tree) {
                if (ops.grid) {
                    ops.tree.showCheckbox = false;
                } else {
                    ops.tree.showCheckbox = !ops.singleSelect;
                }
                self.uiTree.omTree(ops.tree);
            }
            if (ops.grid) {
                //ops.grid.showIndex = false;
                ops.grid.singleSelect = ops.singleSelect;
                self.uiGrid.omGrid(ops.grid);
            }
            self._sureClosed = false;
        },
        //todo: 要求只能传入对象作为缺省选择，实际应用中可能更希望传入ID.
        //  目前只是简单处理，传入的不是对象自动创建一个对象，但新建对象除了主键外其它为空值。
        open: function (selectedValues) {
            var self = this, ops = this.options;
            self.base.open.apply(self, []);
            self._resize();
            self.uiClearBtn.omButton('click');

            self._selectedValues = [];
            self._returnValues = [];
            if (selectedValues) {
                var objPropName = self.uiGrid ? self.options.qnGridKey : self.options.qnTreeId,
                    addObj = function (v) {
                        if (typeof (v) == 'object') {
                            self._selectedValues.push(v);
                        } else {
                            var obj = {}; obj[objPropName] = v;
                            self._selectedValues.push(obj);
                        }
                    };
                if (typeof selectedValues === 'string') {
                    selectedValues = selectedValues.split(',');
                }
                if ($.isArray(selectedValues)) {
                    if (self.options.singleSelect && selectedValues.length > 1) {
                        addObj(selectedValues[0]);
                    } else {
                        $.each(selectedValues, function (i, v) {
                            addObj(v);
                        });
                    }
                } else {
                    addObj(selectedValues);
                }

                if (self.uiGrid) {
                    var op = self.uiGrid.omGrid('options').dataSource;
                    if (op) self.uiGrid.omGrid('refresh');
                } else {
                    //if (self.options.singleSelect && self._selectedValues.length > 0) {
                    //    var target = self.uiTree.omTree("findNode", self.options.qnTreeId,
                    //            self._selectedValues[0][self.options.qnTreeId]);
                    //    if (target) self.uiTree.omTree('unselect', target);
                    //} else {
                    //    self.uiTree.omTree('checkAll', false);
                    //}
                }

                self._returnValues = $.merge([], self._selectedValues);  //保存初始值
            }
            self._updateSelected();

            if (self.uiTree) {
                var s = self.uiTree.omTree("options").dataSource;
                if (s != ops.treeDataSource) {
                    self.uiTree.omTree({ dataSource: ops.treeDataSource });
                }
            } else {
                self._refresh();
                //var s = self.uiGrid.omGrid("options").dataSource;
                //if (s != ops.gridDataSource) {
                //    self.uiGrid.omGrid('setData', s);
                //}
            }

            self._sureClosed = false;
        },
        close: function (event) {
            var self = this, ops = self.options;
            if (ops.onCloseQuery && false === self._trigger('onCloseQuery', event, self)) {
                return;
            }
            self.base.close.apply(this, [event]);
        },
        //#endregion

        //#region 内部函数
        _select: function (value) {
            var self = this;
            if (self.options.singleSelect) {
                self._selectedValues = [value];
            } else {
                var index = self._indexOfSelected(value);    //$.inArray(value, self._selectedValues);
                if (index < 0) {
                    self._selectedValues.push(value);
                }
            }
            self._updateSelected();
        },
        _deselect: function (value) {
            var self = this;
            if (self.options.singleSelect) {
                self._selectedValues = [];
            } else {
                var index = self._indexOfSelected(value);   // $.inArray(value, self._selectedValues);
                if (index >= 0) {
                    self._selectedValues.splice(index, 1);
                }
            }
            self._updateSelected();
        },
        // 返回指定对象在选中对象中的索引号，如果没有则返回-1
        _indexOfSelected: function (value) {
            var self = this,
                qn = self.uiGrid ? self.options.qnGridKey : self.options.qnTreeId;
            for (var i = 0, len = self._selectedValues.length; i < len; i++) {
                var obj = self._selectedValues[i];
                if (obj[qn] == value[qn]) {
                    // 修正只有ID的对象
                    for (var pn in value) {
                        if (typeof obj[pn] == 'undefined') {
                            obj[pn] = value[pn];
                        }
                    }
                    return i;
                }
            }
            return -1;
        },
        // 更新选中值，参数data可以是树节点或表格行对象
        _updateSelected: function () {
            var self = this,
                count = self._selectedValues.length;
            self.statusLabel.html('[ ' + (count == 0 ? '未选中' : '已选 ' + count + ' 条') + ' ]');

            var sTitle = "", qn = self.uiGrid ? self.options.qnGridKey : self.options.qnTreeId;
            $(self._selectedValues).each(function (i, item) {
                if (sTitle != '') sTitle += "\n";
                needId = true;
                if (self.uiGrid) {
                    var s = '', colModel = self.options.grid.colModel || [];
                    $(colModel).each(function (c, cm) {
                        if (s != '') s += ',';
                        if (cm.name) {
                            s += item[cm.name] || '';
                            if (item[cm.name]) needId = false;
                        }
                    });
                    sTitle += s;
                } else {
                    sTitle += item.text || '';
                    if (item.text) needId = false;
                }
                if (needId) sTitle += item[qn] || '';
            });
            self.statusLabel.attr('title', "当前选中：\n" + sTitle);
        },
        // 触发获取数据前事件, 用户可以修改或增加args中的参数，这些参数将封装到请求地址上.
        // 例如：可以增加 args['dwid']=node.id。node参数为当前选中树节点，不显示树时为null
        _doBeforeRequestData: function (args, node, forGrid) {
            var self = this,
                //node = self.uiTree ? self.uiTree.omTree('getSelected') : null,
                onBeforeRequestData = self.options.onBeforeRequestData;
            onBeforeRequestData && onBeforeRequestData.call(self, args, node, forGrid);
        },
        // 检查获取树数据或表数据的url, 指定参数对象args: {pid, sub, filter, nid}
        _checkUrl: function (src, args) {
            var urlArr = src.split('?'),
                urlParams = [],
                queries = urlArr.length > 1 ? urlArr[1].split('&') : [],
                tempArgs = {};
            for (var i = 0, len = queries.length; i < len; i++) {
                var pnv = queries[i].split('=');
                if (pnv.length > 1) {
                    tempArgs[pnv[0]] = unescape(pnv[1]);
                }
            }
            $.extend(tempArgs, args);
            for (var key in tempArgs) {
                urlParams.push(key + '=' + escape(tempArgs[key]));
            }
            return urlArr[0] + '?' + urlParams.join('&');
        },
        // 创建缺省的数据请求参数
        _createDefaultRequestArgs: function (cnode) {
            var self = this,
                node = cnode || (self.uiTree ? self.uiTree.omTree('getSelected') : null),
                args = {};
            if (node) {
                args[self.options.qnTreeId] = node[self.options.qnTreeId];  //.id;
                args[self.options.qnTreePid] = node[self.options.qnTreePid];    //.pid;
                if (self.uiSub) args[self.options.qnSub] = self.uiSub.prop('checked') ? '1' : '0';
            }
            if (self.uiSearch) args[self.options.qnSearch] = self.uiSearch.val();
            if (self.uiGrid && self.uiGrid.omGrid('options').dataSource) {
                var rows = self.uiGrid.omGrid('getSelections', true);
                if (rows.length > 0) args[self.options.qnGridKey] = rows[0][self.options.qnGridKey];
            }
            return args;
        },
        _createLayout: function () {
            var self = this,
                ops = this.options,
                $elem = this.element;

            $elem.empty();
            //#region 创建布局
            var s = "<div>";
            if (ops.allowQuickSearch || ops.tree) {
                s += "<div id='" + this._getId('t') + "'></div>";
            }
            if (ops.tree && ops.grid) {
                s += "<div id='" + this._getId('l') + "'></div>";
            }
            s += "<div id='" + this._getId('c') + "'></div>";
            s += "</div>";
            this.layout = $(s).addClass("bdp-selector-layout").appendTo($elem);
            this.layout.omBorderLayout({
                panels: [{
                    id: this._getId('t'),
                    region: 'north',
                    header: false,
                    height: 40,
                    resizable: false
                }, {
                    id: this._getId('l'),
                    region: 'west',
                    width: '40%',
                    resizable: true,
                    header: false
                }, {
                    id: this._getId('c'),
                    region: 'center',
                    header: false
                }],
                fit: true,
                spacing: 3,
                onAfterDrag: function (s, e) {
                    if (self.uiGrid) {
                        self.uiGrid.omGrid('resize');
                    }
                }
            });
            var t = $('#' + this._getId('t')),
                l = $('#' + this._getId('l')),
                c = $('#' + this._getId('c'));  //.css({ "overflow": "hidden" });
            if (ops.tree && ops.grid) {
                this.uiTree = $("<ul></ul>").prop('id', this._getId('tree')).appendTo(l);
                this.uiGrid = $("<table></table>").prop('id', this._getId('grid')).appendTo(c);
                c.css({ "overflow": "hidden" });
            } else {
                if (ops.tree) {
                    this.uiTree = $("<ul></ul>").prop('id', this._getId('tree')).appendTo(c);
                } else {
                    this.uiGrid = $("<table></table>").prop('id', this._getId('grid')).appendTo(c);
                    c.css({ "overflow": "hidden" });
                }
            }
            //#endregion

            //#region 创建是否包括下级复选框和搜索框
            if (ops.tree) {
                $('<label><input type="checkbox" class="sub" /> 包括下级</label>')
                    .css({
                        display: 'block',
                        top: '5px',
                        'padding-left': '5px',
                        position: 'absolute'
                    })
                    .appendTo(t);
                // 包括下级
                self.uiSub = t.find('input.sub').attr('checked', 'checked').click(function () { self._refresh(); });
            }
            if (ops.allowQuickSearch) {
                $('<div title="搜索"><input type="text" class="search" /><span class="img_sousuo"></span></div>')
                    .css({
                        display: 'block',
                        top: '5px',
                        float: 'right',
                        'margin-right': '5px',
                        position: 'relative'
                    })
                    .appendTo(t);
                //搜索框
                self.uiSearch = t.find('input.search').width(140)
                    .css({ 'font-size': '12px' })
                    .keypress(function (event) {
                        if (event.keyCode == 13) {
                            self._refresh();
                        }
                    });
                //搜索按钮
                self.uiSearchBtn = t.find('span.img_sousuo')
                    .css({ 'padding-left': 7, 'padding-right': 13 })
                    .click(function () { self._refresh(); });
            }
            //#endregion

            //#region 创建清除按钮和状态标签
            var uiButtonSet = self.uiDialog.find('.om-dialog-buttonset'),
                uiClearPane = $('<div></div>').addClass('om-dialog-buttonset')
                    .css({ "float": "left" })
                    .insertBefore(uiButtonSet);
            self.uiClearBtn = $('<button type="button"></button>').width(65).appendTo(uiClearPane);
            self.uiClearBtn.omButton({
                label: '清除',
                onClick: function () {
                    if (self.uiGrid) {
                        self.uiGrid.omGrid('setSelections', []);
                    } else {
                        if (self.options.singleSelect && self._selectedValues.length > 0) {
                            var target = self.uiTree.omTree("findNode", self.options.qnTreeId,
                                self._selectedValues[0][self.options.qnTreeId]);
                            if (target) self.uiTree.omTree('unselect', target);
                        } else {
                            self.uiTree.omTree('checkAll', false);
                        }
                    }
                    self._selectedValues = [];
                    self._updateSelected();
                }
            });
            self.statusLabel = $("<label></label>").appendTo(uiClearPane)
                .css({ 'padding-left': '7px', color: 'blue' });
            //#endregion

        },
        _refresh: function () {
            var self = this;
            if (self.uiTree) {
                var node = self.uiTree.omTree('getSelected');
                if (node) self.uiTree.omTree('select', node);
            } else {
                var args = self._createDefaultRequestArgs();
                self._doBeforeRequestData(args, null, true);
                // 允许事件中改变数据源
                var s = args.gridDataSource || self._checkUrl(self.options.gridDataSource, args),
                    s2 = self.uiGrid.omGrid('options').dataSource;
                if (s != s2) {
                    self.uiGrid.omGrid('setData', s);
                }
            }
        },
        _resize: function () {
            if (this.layout) this.layout.omBorderLayout('resize');
            if (this.uiGrid) this.uiGrid.omGrid('resize');
        },
        // 生成子控件id
        _getId: function (id) {
            return this.element.prop('id') + '_' + id;
        },
        //_doClose: function (clickOnOk) {
        //    if (clickOnOk) {
        //        this._returnValues = $.merge([], this._selectedValues);
        //        this._sureClosed = true;
        //    }
        //    this.close();
        //},
        //#endregion

        //#region 公共函数
        //获取选中的内容, 如果只有树返回选中的树节点，否则返回选中的表行。
        //如果单选返回一个对象，如果多选返回对象数组。
        getSelections: function () {
            return this._returnValues;
        },
        // 选择器是否是点击确定按钮关闭的
        isSureClosed: function () {
            return this._sureClosed;
        },
        // 刷新
        refresh: function () {
            this._refresh();
        },
        //#endregion

        done: true
    });
    //#endregion

    //#region 参考编辑控件
    $.omWidget('bdp.bdpReferEdit', {
        options: {
            // 是否允许直接输入内容
            allowInput: false,
            // 对话框模式：
            // memo     常规多行文本
            // html     HTML编辑
            // pick     选择器
            // syn      语法编辑
            // image    图片编辑
            mode: 'memo',
            // 对话框设置，兼容omDialog所有属性
            dialog: {
                autoOpen: false,
                width: 550,
                height: 350,
                modal: true
            },
            // 值字段, mode=pick适用, 选中对象的一个属性，用它的值作为本编辑控件的值
            valueField: 'id',
            // 显示文本字段, mode=pick适用, 选中对象的一个属性，用它的值作为本编辑控件的显示内容
            textField: 'text',
            // 编辑器设置
            editOptions: {},
            // 对话框的ID
            dialogId: 'ReferDialog'
            //// 参照框关闭前事件，一般用于检查参照框中的内容是否合法，返回值决定是否可以关闭。
            //// 事件调用上下文为bdpReferEdit实例
            //onCloseQuery: function (clickOnOk) { }
            //值修改事件
            // onValueChanged: function(newValue,oldValue,event){}
            //对话框打开前事件，返回false则为取消打开
            // beforeOpenDialog: function($dialog){}
        },
        //#region 重载
        _create: function () {
            var self = this, $elem = this.element,
                ops = this.options;
            $elem.wrap('<span class="om-combo om-widget om-state-default"></span>')
                .parent()
                .append('<span id="' + self._getId('choose') + '" class="bdp-refer-trigger">' +
                    '</span>');
            //.append('<span id="' + self._getId('choose') + '" class="om-combo-trigger" style="background-image: none;">' +
            //        '<img class="bdp-icons-dev1 edtEllipsis"></span>');
            var span = $elem.parent();
            span.mouseenter(function () {
                span.addClass("om-state-hover");
            }).mouseleave(function () {
                span.removeClass("om-state-hover");
            });
            // 触发按钮
            self.choose = $elem.parent().find('#' + self._getId('choose'));
            // 事件
            self.choose.click(function () {
                self._openDialog();
            });
            if (ops.allowClearValue) {
                self.choose.before('<span class="om-combo-clear" title="清除"></span>');
                self.btnClear = $elem.parent().find('span.om-combo-clear');
                $elem.css({ width: '100%', 'margin-right': '-39px' });
                self.btnClear.click(function () {
                    self.text('');
                    self.value('');
                });
            }
            self._value = '';
        },
        _init: function () {
            var self = this, $elem = this.element,
                ops = this.options;
            $elem.attr('readonly', !ops.allowInput);

        },
        //#endregion

        //#region 接口函数
        // 获取或设置值
        value: function (v) {
            var self = this;
            if (typeof (v) != 'undefined') {
                var ops = self.options,
                    onValueChanged = ops.onValueChanged,
                    oldValue = self._value;
                self._value = v;
                onValueChanged && self._trigger('onValueChanged', null, self._value, oldValue);
                switch (self.options.mode) {
                    case 'memo':
                        self.text(v);
                        break;
                }
            }
            return self._value;
        },
        // 获取或设置显示文本
        text: function (v) {
            if (typeof (v) != 'undefined') {
                this.element.val(v);
            }
            return this.element.val();
        },
        //#endregion

        //#region 内部函数
        // 打开对话框
        _openDialog: function () {
            var self = this, ops = self.options;
            self._createDialog();
            if (ops.beforeOpenDialog) {
                if (ops.beforeOpenDialog(self.dialog) === false)
                    return;
            }
            switch (ops.mode) {
                case 'memo':
                    if (typeof (self._value) == 'undefined') {
                        self.value(self.element.val());
                    }
                    //self.editor.val(self.value());
                    self.editor.val(self.element.val());
                    self.dialog.omDialog('open');
                    break;
                case 'pick':
                    self.editor.bdpSelector('open', self.value());
                    break;
            }
        },
        // 关闭对话框，参数为是否点击确认按钮关闭
        _closeDialog: function (isSureCloed) {
            var self = this, ops = self.options,
                target = self.dialog.data('referEdit');
            switch (ops.mode) {
                case 'memo':
                    if (isSureCloed && target && target.editor) {
                        target.value(target.editor.val());
                        target.element.val(target.editor.val());
                    }
                    target.dialog.omDialog('close');
                    break;
                case 'pick':
                    //// 在选择器的onClose事件中处理
                    //if (isSureCloed && target && target.editor) {
                    //}
                    break;
            }
        },
        _createDialog: function () {
            var self = this, ops = this.options,
                edtOps = ops.editOptions || {},
                dlgId = ops.dialogId,    // 'referDialog', //self._getId('dlg')
                dlgOptions = ops.dialog || {};

            self.dialog = $('#' + dlgId);
            if (self.dialog.length > 0) {
                self.dialog.data('referEdit', self);
                var header = self.dialog.parent().find('span.om-dialog-title');
                if (header && header.html() != dlgOptions.title)
                    header.html(dlgOptions.title || '');
                self.editor = $('#' + dlgId + '_editor');
            } else {
                // 对话框
                self.dialog = $('<div class="om-widget om-widget-content"></div>')
                    .prop('id', dlgId)
                    .hide();
                $(document.body).append(self.dialog);
                self.dialog.data('referEdit', self);

                dlgOptions.autoOpen = false;
                dlgOptions.buttons = dlgOptions.buttons || [];
                dlgOptions.buttons.push({
                    text: '确定', id: dlgId + '_btnOk',
                    click: function (event) {
                        self._closeDialog(true);
                    }
                });
                dlgOptions.buttons.push({
                    text: '取消', id: dlgId + '_btnCancel',
                    click: function (event) {
                        self._closeDialog(false);
                    }
                });
                self.dialog.omDialog(dlgOptions);
                $('#' + dlgId + '_btnOk' + ',#' + dlgId + '_btnCancel').width(65);
                // 创建一个放在左边的辅助按钮区
                var uiButtonSet = self.dialog.parent().find('.om-dialog-buttonset');
                self.leftTools = $('<div></div>').addClass('om-dialog-buttonset')
                    .css({ "float": "left" })
                    .insertBefore(uiButtonSet);

                // 弹出框内容
                switch (ops.mode) {
                    case 'memo':
                        self.dialog.css({ 'overflow': 'hidden' });
                        self.editor = $("<textarea></textarea>")
                            .prop('id', dlgId + '_editor')
                            .width('100%')
                            .height('98%')
                            .css('resize', 'none')
                            .appendTo(self.dialog);
                        if (edtOps.scrollX) {
                            self.editor.css('overflow-x', 'scroll');
                        }
                        if (edtOps.scrollY) {
                            self.editor.css('overflow-y', 'scroll');
                        }
                        $('<span style="cursor:pointer;"><img class="bdp-icons-dev1 clear" /></span>')
                            .attr('title', '清除')
                            .appendTo(self.leftTools)
                            .click(function () {
                                self.editor.val('');
                            });
                        break;
                    case 'pick':
                        self.editor = $('<div></div>')
                            .prop('id', dlgId + '_editor')
                            .appendTo(self.dialog);
                        self._editor_close_event = edtOps.onClose;
                        edtOps.onClose = function (event) {
                            var isSureClosed = self.editor.bdpSelector('isSureClosed');
                            if (isSureClosed) {
                                var selections = self.editor.bdpSelector('getSelections');
                                if ($.isArray(selections)) {
                                    var ids = [], txts = [];
                                    $.each(selections, function (i, obj) {
                                        ids.push(obj[ops.valueField]);
                                        txts.push(obj[ops.textField]);
                                    });
                                    if (typeof (edtOps.singleSelect) == 'undefined' || edtOps.singleSelect) {
                                        self.value(ids[0] || '');
                                        self.text(txts[0] || '');
                                    } else {
                                        self.text(txts.join(','));
                                        self.value(ids);
                                    }
                                } else {
                                    self.text(selections[ops.textField]);
                                    self.value(selections[ops.valueField]);
                                }
                            }
                            if (self._editor_close_event) {
                                self._editor_close_event.call(self.editor);
                            }
                        };
                        self.editor.bdpSelector(edtOps);
                        break;
                }
            }

        },
        _getId: function (id) {
            return this.element.prop('id') + '_' + id;
        },
        //#endregion

        done: true
    });
    //#endregion

    //#region 适用于树形表的逐步选择器
    $.omWidget('bdp.bdpStepwiseSelector', {
        options: {
            // 实体类名
            type: 'Hongbin.Data.BdpBaseData.BdpCodeRegionalism',
            // 主键字段名
            key: 'RegionalismId',
            // 文本字段名
            text: 'RegionName',
            // 上级字段名
            pkey: 'ParentRegionId',
            // 排序字段名
            order: 'RegionCode',
            // 缺省上级ID
            pid: '-1',
            // 限制可选级别，小于或等于0则不限制
            limitLevel: -1,
            // 数据地址, 缺省调用getCommonDataUrl函数生成
            dataSource: null,
            // 是否创建空值选择项
            createNullOption: true,
            // 空值选择项显示文本
            nullOptionText: '-- 请选择 --',
            disabled: false,
            // 值改变事件，sender:bdpStepwiseSelector对象，target当前下拉框对象
            // onValueChange:function(sender,target){}
            onValueChange: null
        },
        _create: function () {
            var self = this;
            self.valueElement = self.element;
            if (self.valueElement.is('input')) {
                self.pdiv = $('<div></div>');
                self.valueElement.after(self.pdiv);
            } else {
                self.pdiv = self.element;
                self.valueElement = $('<input />').prop('id', self.pdiv.prop('id') + "_EL");
                self.pdiv.before(self.valueElement);
            }
            self.valueElement.hide();
        },
        _init: function () {
            this.valueElement.val('');
            this._clearValue();
        },
        _getDataUrl: function (pid) {
            var ops = this.options,
                sUrl = this.options.dataSource || getCommonDataUrl('BdpTreeNodes', {
                    type: ops.type, key: ops.key, text: ops.text, pkey: ops.pkey, order: ops.order, pid: pid
                });
            return sUrl;
        },
        _createSelectElement: function (nLevel, nodes, defValue) {
            var self = this, $div = this.pdiv,
                $sel = $('<select></select>')
                    .addClass('stepwise')
                    .css({ 'margin-left': '2px' })
                    .attr('data-level', nLevel)
                    .appendTo($div);
            if (this.options.createNullOption) {
                $sel.append('<option value="">' + this.options.nullOptionText + '</option>');
            }
            $.each(nodes, function (i, node) {
                $sel.append($('<option></option>')
                    .val(node.id).text(node.text)
                    .attr('data-hasChildren', node.hasChildren ? 1 : 0)
                );
            });
            if (defValue) {
                $sel.val(defValue);
            }
            self.options.disabled ? $sel.attr('disabled', true) : $sel.removeAttr('disabled');

            $sel.change(function () {
                var currLevel = parseInt($(this).attr('data-level')),
                    currId = $(this).val(),
                    hasChildren = $(this).find('option[value="' + currId + '"]').attr('data-hasChildren');
                $div.find('select:gt(' + (currLevel - 1) + ')').remove();
                if (hasChildren === '1' && (self.options.limitLevel <= 0 || currLevel < self.options.limitLevel)) {
                    self._loadData(currId, currLevel);
                }
                var v = self.value();
                self.valueElement.val(v);
                // 触发值改变事件
                var onValueChange = self.options.onValueChange;
                onValueChange && onValueChange.call(self, self, this);
            });
        },
        _loadData: function (pid, currLevel) {
            var self = this;
            $.ajax({
                url: this._getDataUrl(pid),
                method: 'POST',
                dataType: 'json',
                success: function (nodes) {
                    self._createSelectElement(currLevel + 1, nodes);
                }
            });
        },
        _clearValue: function () {
            var self = this,
                arrSelect = $('select.stepwise', this.pdiv);
            if (arrSelect.length > 0) {
                $(arrSelect[0]).val('');
                for (var i = arrSelect.length - 1; i > 0; i--) {
                    $(arrSelect[i]).remove();
                }
            } else {
                $.ajax({
                    url: self._getDataUrl(self.options.pid || "-1"),
                    method: 'POST',
                    dataType: 'json',
                    async: false,   // 等待返回
                    success: function (nodes) {
                        self._createSelectElement(1, nodes);
                    }
                });
            }
            self.valueElement.val('');
        },
        //#region 接口方法
        // 获取或设置值
        value: function (v) {
            if (typeof (v) != 'undefined') {
                // 设置
                var self = this;
                if (v == '') this._clearValue();
                else {
                    $.ajax({
                        // 指定了具体的ID值表示查询某一节点及其上级节点的数据，返回的数据结构应为数组, 
                        // 有几层则有几个元素.
                        url: self._getDataUrl('') + '&id=' + v,
                        method: 'POST',
                        dataType: 'json',
                        success: function (ajaxResult) {
                            if (ajaxResult.Succeed) {
                                var data = ajaxResult.Data;
                                self.pdiv.empty();
                                for (var i = 0, len = data.length; i < len; i++) {
                                    self._createSelectElement(i + 1, data[i].SiblingNodes, data[i].Record.id);
                                }
                                if (data.length > 0 && data[data.length - 1].Record.hasChildren) {
                                    $.ajax({
                                        url: self._getDataUrl(data[data.length - 1].Record.id),
                                        method: 'POST',
                                        async: false,
                                        dataType: 'json',
                                        success: function (nodes) {
                                            self._createSelectElement(data.length, nodes, "");
                                        }
                                    });
                                }
                            } else {
                                self._clearValue();
                            }
                        }
                    });
                }
                this.valueElement.val(v);
                return v;
            }
            var rv = this.values();
            return rv.length > 0 ? rv[rv.length - 1] : null;
        },
        // 获取值数据，数组中包括父级值，顶级值在前。
        values: function () {
            var varr = [];
            $(this.pdiv).find('select').each(function (i, p) {
                if ($(p).val()) {
                    varr.push($('option:selected', p).val());
                }
            });
            return varr;
        },
        // 返回最后一个节点的显示文本
        text: function () {
            var rv = this.texts(v);
            return rv.length > 0 ? rv[rv.length - 1] : '';
        },
        // 获取或设置显示文本数组，顶级节点文本在前。
        texts: function () {
            var varr = [];
            $(this.pdiv).find('select').each(function (i, p) {
                if ($(p).val()) {
                    varr.push($('option:selected', p).text());
                }
            });
            return varr;
        },
        // 禁用组件
        disable: function () {
            $(this.pdiv).find('select').attr('disabled', true);
            this.options.disabled = true;
            $(this.pdiv).addClass('om-state-disabled');
        },
        // 启用组件
        enable: function () {
            $(this.pdiv).find('select').removeAttr('disabled');
            this.options.disabled = false;
            $(this.pdiv).removeClass('om-state-disabled');
        },
        //#endregion
        done: true
    });
    //#endregion

    //#region 列表框控件，支持单选和多选，支持上下调整顺序
    $.omWidget('bdp.bdpListBox', {
        options: {
            dataSource: '',
            showCheckbox: true,
            allowChangeOrder: true,
            layoutMode: 'table',
            textField: 'text',
            valueField: 'value',
            showHeader: 'auto',
            headerText: '全选/取消',
            height: 261,
            width: 'auto',
            // 当选中条目改变时触发该事件
            onSelectionChanged: null, // function () { },
            // 成功构建了列表项后触发该事件，一般在该事件中进行缺省状态设置
            onBuildItems: null      //function () { }
        },
        _create: function () {
            var self = this, elem = $(this.element);
            //elem.addClass('om-widget bdp-listbox').height(self.options.height);
            elem.addClass('om-widget bdp-listbox');
            this.header = $('<div class="listheader"></div>').appendTo(elem);
            this.listbox = $('<div class="om-widget-content bdp-listbody"></div>').appendTo(elem);
            this.listbox.height(this.listbox.parent().height() - this.header.outerHeight());
        },
        _init: function () {
            var self = this, ops = this.options;
            self.setData(ops.dataSource);
        },
        _buildList: function (records) {
            var self = this, ops = this.options,
                header = self.header,
                listbox = self.listbox;
            header.empty().hide();
            if (ops.showHeader != false && (ops.showCheckbox || ops.allowChangeOrder)) {
                header.show();
                if (ops.showCheckbox) {
                    $('<div><span class="checkbox"></span>' + ops.headerText + '</div>').appendTo(header)
                        .click(function () {
                            $(this).find('.checkbox').toggleClass('selected');
                            $('.listrow .checkbox', listbox).toggleClass('selected', $(this).find('.checkbox').hasClass('selected'));
                            self._causeSelectionEvent();
                        });

                }
                if (ops.allowChangeOrder) {
                    var listtool = $('<div class="listtool"><span class="movedown" title="下移"></span>' +
                        '<span class="moveup" title="上移"></span></div>').appendTo(header);
                    $('.movedown', listtool).click(function () {
                        var row = listbox.find('.om-state-focused');
                        if (row.size() > 0) {
                            row.next('.listrow').after(row);
                            self._makeVisible(listbox, row);
                        }
                    });
                    $('.moveup', listtool).click(function () {
                        var row = listbox.find('.om-state-focused');
                        if (row.size() > 0) {
                            $(row).prev('.listrow').before(row);
                            self._makeVisible(listbox, row);
                        }
                    });
                }
            }

            listbox.empty().height(listbox.parent().height() - header.outerHeight());
            $.each(records, function (index) {
                var text = this[ops.textField] || '',
                    value = this[ops.valueField] || '';
                var row = $('<div class="listrow"></div>')
                    .addClass(ops.layoutMode === 'table' ? 'layout-table' : 'layout-flow')
                    .appendTo(listbox);
                if (ops.showCheckbox) {
                    row.append('<span class="checkbox"></span>');
                }
                row.append('<div class="textblock"><label>' + text + '</label></div>')
                    .data("obj", this).data("value", value);
            });
            var all = listbox.find('.listrow');
            if (all.size() > 0) {
                all.mouseover(function () {
                    all.removeClass('om-state-hover');
                    if (!$(this).hasClass('om-state-focused')) {
                        $(this).addClass('om-state-hover');
                    }
                }).mousedown(function () {
                    all.removeClass('om-state-focused');
                    $(this).addClass('om-state-focused');
                    self._causeSelectionEvent();
                });
                all.find('.checkbox').click(function () {
                    $(this).toggleClass('selected');
                    self._causeSelectionEvent();
                });
            }
            self.resize();
            // 触发事件
            var onBuildItems = ops.onBuildItems;
            onBuildItems && onBuildItems.call(self);
        },
        _makeVisible: function (container, scrollTo) {
            var $c = $(container), $to = $(scrollTo),
                ch = $c.height(), toh = $to.height(),
                ct = $c.offset().top, tot = $to.offset().top;
            if (tot + toh > ct + ch) {
                $c.scrollTop(tot - ct + $c.scrollTop());
            } else if (tot < ct) {
                $c.scrollTop($c.scrollTop() - ch + toh);
            }
        },
        _causeSelectionEvent: function () {
            var self = this,
                onSelectionChanged = self.options.onSelectionChanged;
            onSelectionChanged && onSelectionChanged.call(self);
        },
        //#region 接口函数
        // 调整尺寸
        resize: function () {
            var self = this, ops = this.options,
                $header = $(self.header),
                $listbox = $(self.listbox),
                headerVisible = $header.is(':visible');
            if (ops.width == 'fit') {
                ops.width = '100%';
                $header.width('100%');
                $listbox.width('100%');
            } else if ('auto' !== ops.width) {
                $header.width(ops.width);
                $listbox.width(ops.width);
            } else {
                $header.css('width', '');
                $listbox.css('width', '');
            }
            $listbox.height($listbox.parent().height() - $header.outerHeight());
        },
        // 设置数据源，可以是对象数组，也可以是json服务地址。
        // json服务返回的数据格式一般就为AjaxResult对象，其中Data为数组。也可以是
        //对象数组，还可以是omGrid要求的数据格式，将使用其中的rows数组构建列表。
        setData: function (url) {
            var self = this;
            this.options.dataSource = url;
            if (typeof url === 'string') {
                $.ajax({
                    type: 'POST',
                    url: url,
                    dataType: 'json',
                    success: function (ajaxResult) {
                        if (!ajaxResult) return;
                        if (typeof ajaxResult.Succeed === 'boolean') {
                            if (ajaxResult.Succeed && ajaxResult.Data) {
                                var records = $.makeArray(ajaxResult.Data);
                                self._buildList(records);
                            } else {
                                $.omMessageTip.show({ type: 'error', content: '调入数据失败！' + (ajaxResult.Message || ''), timeout: 3000 });
                            }
                        } else if (typeof ajaxResult.rows === 'object' && $.isArray(ajaxResult.rows)) {
                            self._buildList(ajaxResult.rows);
                        } else {
                            var records = $.makeArray(ajaxResult);
                            self._buildList(records);
                        }
                    }
                });
            } else {
                var records = $.makeArray(url);
                self._buildList(records);
            }
        },
        // 获取所有列表对象，返回最新顺序的数组
        getItems: function () {
            var self = this, listbox = this.listbox,
                res = [];
            $('div.listrow', listbox).each(function (index) {
                res.push($(this).data('obj'));
            });
            return res;
        },
        // 获取当前选中的对象，返回对象数组，如果不允许多选，数组只有一个元素
        getSelections: function () {
            var self = this, listbox = this.listbox,
                res = [],
                rows = self.options.showCheckbox ? "" : listbox.find('.om-state-focused');
            if (self.options.showCheckbox) {
                $('.checkbox', listbox).filter('.selected').each(function (index) {
                    var r = $(this).closest('div.listrow');
                    res.push(r.data('obj'));
                });
            } else {
                listbox.find('.om-state-focused').each(function (index) {
                    res.push($(this).data('obj'));
                });
            }
            return res;
        },
        // 设置选中状态，参数obj若为boolean，则设置所有条目为相应的状态；
        // obj若是函数，则遍历每个项调用回调函数(参数为条目对象)，并根据返回值设置状态；
        // obj若为其它类型，将设置value相等的项为选中状态。
        setSelections: function (obj) {
            var self = this, listbox = this.listbox, header = this.header;
            if (typeof obj === 'boolean') {
                $('.checkbox', self.header).toggleClass('selected', obj);
                $('.listrow .checkbox', listbox).toggleClass('selected', obj);
            } else if (typeof obj === 'function') {
                $('.checkbox', listbox).each(function (index) {
                    var r = $(this).closest('div.listrow'),
                        b = obj.call(self, r.data('obj')) || false;
                    $(this).toggleClass('selected', b);
                });
            } else {
                if (self.options.showCheckbox) {
                    $('.checkbox', listbox).each(function (index) {
                        var r = $(this).closest('div.listrow'),
                            b = r.data('value') === obj;
                        $(this).toggleClass('selected', b);
                    });
                } else {
                    $('div.listrow', listbox).each(function (index) {
                        var item = $(this).data('obj');
                        if (item && item[self.options.valueField] == obj) {
                            $(this).addClass('om-state-focused');
                        } else {
                            $(this).removeClass('om-state-focused');
                        }
                    });
                }
            }
            // 触发选中条目变化事件
            self._causeSelectionEvent();
        },
        selectAll: function () {
            this.setSelections(true);
        },
        unSelectAll: function () {
            this.setSelections(false);
        },
        //#endregion

        done: true
    });

    //#endregion

    //#region 自定义查询

    //#region 单个的条件项编辑控件，可以单独使用

    $.omWidget('bdp.bdpFilterItem', {
        options: {
            // 允许组合条件
            allowCombinate: false,
            // 列模型，兼容omGrid的colModel
            colModel: [],
            // 过滤事件, 当用户选择条件后触发, 参数为一个FilterItem对象
            // function(args){}
            onFilter: null
        },
        // 检查全局的自定义查询设置
        _checkGlobalConfig: function () {
            var cfg = $.bdp.filterConfig;
            if (!cfg.operatorItems) {
                $.ajax({
                    url: getCommonDataUrl('BdpFilterConfig'),
                    type: 'POST',
                    async: false,
                    dataType: 'json',
                    success: function (ajaxResult) {
                        if (ajaxResult.Succeed) {
                            cfg.operatorItems = ajaxResult.Data.operatorItems || null;
                            cfg.combinateItems = ajaxResult.Data.combinateItems || null;
                            cfg.pnCustomFilter = ajaxResult.Data.pnCustomFilter;
                        }
                    }
                });
            }
        },
        _create: function () {
            var self = this, $elem = $(this.element);
            self._checkGlobalConfig();

            $elem.addClass('bdp-filterItem')
                .append('<span class="bdp-filterItem-left"><input /></span>' +
                    '<span class="bdp-filterItem-center"><input /></span>' +
                    '<div class="bdp-filterItem-right"></div>' +
                    '<span class="bdp-filterItem-cc"><input /></span>');
            self.leftInput = $('span.bdp-filterItem-left>input', $elem).omCombo({
                //dataSource: self._getColumnNames(),
                editable: false,
                width: 130,
                listAutoWidth: true,
                onValueChange: function (target, newValue, oldValue, event) {
                    // console.log('operatorItems:', $.bdp.filterConfig.operatorItems);
                    // 根据字段类型过滤比较符
                    var cm = $.grep(self.options.colModel, function (e, i) {
                        return (e.editor ? (e.editor.name || e.name) : e.name) == newValue;
                    })[0];
                    var opItems = $.grep($.bdp.filterConfig.operatorItems, function (e, i) {
                        var typ = !cm || !cm.editor || !cm.editor.type ? 'text' : cm.editor.type;
                        if (['Contains', 'DoesNotContain', 'BeginsWith', 'EndsWith'].indexOf(e.value) >= 0)
                            return ['number', 'date', 'omCalendar', 'omNumberField'].indexOf(typ) < 0;
                        return true;
                    });
                    self.centerInput.omCombo('setData', opItems);
                    self._createValueInputBox();
                    self._causeFilterEvent();
                }
            });
            self.centerInput = $('span.bdp-filterItem-center>input', $elem).omCombo({
                editable: false,
                width: 90,
                listAutoWidth: true,
                onValueChange: function (target, newValue, oldValue, event) {
                    self._createValueInputBox();
                    self._causeFilterEvent();
                }
            });
            self.rightRoot = $('div.bdp-filterItem-right', $elem);
            self.ccInput = $('span.bdp-filterItem-cc>input', $elem).omCombo({
                editable: false,
                width: 50,
                listAutoWidth: true,
                onValueChange: function (target, newValue, oldValue, event) {
                    //self._createValueInputBox();
                    self._causeFilterEvent();
                }
            });
        },
        _init: function () {
            var self = this, $elem = $(this.element);
            self.leftInput.omCombo('setData', self._getColumnNames());
            self.centerInput.omCombo('setData', $.bdp.filterConfig.operatorItems);
            self.rightRoot.empty();
            var ccSpan = $('span.bdp-filterItem-cc');
            if (self.options.allowCombinate) {
                self.ccInput.omCombo('setData', $.bdp.filterConfig.combinateItems);
                ccSpan.show();
            } else {
                ccSpan.hide();
            }
        },
        // 获取字段名清单
        _getColumnNames: function () {
            var self = this, ops = this.options,
                items = [];
            for (var i = 0, len = ops.colModel.length; i < len; i++) {
                var cm = ops.colModel[i],
                    fn = cm.editor ? (cm.editor.name || cm.name) : cm.name,
                    fh = cm.header;
                items.push({ text: fh, value: fn });
            }
            return items;
        },
        // 创建值录入控件
        _createValueInputBox: function () {
            var self = this,
                fn = self.leftInput.omCombo('value') || '',
                op = self.centerInput.omCombo('value') || '';
            if (fn == '' || op == '') return;
            // 查找对象的列模型
            var cm = $.grep(self.options.colModel, function (e, i) {
                return (e.editor ? (e.editor.name || e.name) : e.name) == fn;
            })[0];
            var items = $.bdp.filterConfig.operatorItems;
            var opObj = $.grep(items, function (opo, i) {
                return opo.value === op;
            })[0];

            var tempValue = undefined;
            if (self.editCtrl != null) {
                tempValue = $(self.editCtrl).bdpEditCtrl('value');
            }
            // 清除已有的控件
            self.rightRoot.empty();
            self.editCtrl = null;
            if (!cm || !opObj || opObj.noright) return;
            // 需要录入数据则创建
            var temp = $.extend(true, {}, cm);
            temp.createErrorPlace = false;
            temp.editor = temp.editor || {};
            temp.editor.editable = true;
            temp.onValueChanged = function (target, newValue, oldValue, event) {
                self._causeFilterEvent();
            };
            if (temp.editor.type == 'omCalendar' || temp.editor.type == 'date') {
                temp.editor.dateFormat = 'yy-mm-dd';
                //tempValue = new Date(tempValue);
                //if (!tempValue.valueOf())
                tempValue = new Date();
                self.leftInput.ValueDataType = temp.editor.type;
                tempValue = $.omCalendar.formatDate(tempValue, 'yy-mm-dd');
            }
            self.editCtrl = $('<div class="om-widget"></div>').width(130).appendTo(self.rightRoot)
                .bdpEditCtrl(temp);
            //if (tempValue !== undefined) {
            //    self.editCtrl.bdpEditCtrl('value', tempValue);
            //}
            self.editCtrl.bdpEditCtrl('value', tempValue === undefined ? '' : tempValue);
        },

        _getFilterItem: function () {
            var self = this,
                rdiv = $(self.rightRoot),
                fn = $(self.leftInput).omCombo('value') || '',
                op = $(self.centerInput).omCombo('value') || '',
                fv = self.editCtrl ? self.editCtrl.bdpEditCtrl('value') || '' : null,
                cc = $(self.ccInput).omCombo('value') || '';
            dt = self.leftInput.ValueDataType;
            return new $.bdp.FilterItem(fn, op, fv, cc, dt);
        },

        _causeFilterEvent: function (clicked) {
            var self = this,
                onFilter = self.options.onFilter,
                fi = this._getFilterItem();
            if (onFilter && fi && fi.fn != '' && fi.op != '') {
                fi.clicked = clicked;
                onFilter.call(self, fi);
            }
        },

        //#region 接口函数
        // 获取当前条件项信息对象
        getFilterItem: function () {
            return this._getFilterItem();
        },
        // 设置控件的值
        setFilterItem: function (fi) {
            var self = this;
            if (typeof fi.fn != 'undefined') $(self.leftInput).omCombo('value', fi.fn);
            if (typeof fi.op != 'undefined') $(self.centerInput).omCombo('value', fi.op);
            if (typeof fi.fv != 'undefined' && self.editCtrl) self.editCtrl.bdpEditCtrl('value', fi.fv);
            if (typeof fi.cc != 'undefined') $(self.ccInput).omCombo('value', fi.cc);
        },
        //#endregion

        done: true
    });


    //#endregion

    //#region 自定义条件查询编辑面板，包括多个条件项的组合
    $.omWidget('bdp.bdpFilterBox', {
        options: {
            // 是否自动触发查询，如果是，任意条件发现变化时都触发onFilter事件，否则只有点击“执行查询”按钮时才会触发。
            autoFilter: false,
            // 是否允许多个条件组合
            allowMultiFilterItem: true,
            // 缺省的条件组合方式，缺省值：And
            defaultCombinate: 'And',
            showClearButton: true,
            showSearchButton: true,
            // 列模型，兼容omGrid的colModel
            colModel: [],
            // 查询事件, 参数为一个FilterItem对象数组。
            // 如果autoFilter为true,则每当用户改变任何条件时都会触发该事件，否则只有点击“执行查询”后才会触发。
            // function(args){}
            onFilter: null
            // 新增条件项事件
            //onAddGroup: function () { }
            // 删除条件组事件
            //onDelGroup: function () { }
        },
        _create: function () {
            var self = this, $elem = $(this.element);
            $elem.addClass('bdp-filterBox');
            self.fbody = $('<div></div>').addClass('fbody').appendTo($elem);
            self.ftool = $('<div><a class="fbtnclear" title="清除"></a><a class="fbtnsearch" title="执行查询"></a></div>').addClass('ftool').appendTo($elem);
            self.btnClear = $('a.fbtnclear', self.ftool).omButton({
                //label: '清除',
                icons: { leftCss: 'bdp-icons-close' },
                onClick: function (event) {
                    self._doClear();
                }
            });
            self.btnSearch = $('a.fbtnsearch', self.ftool).omButton({
                //label: '查询',
                icons: { leftCss: 'bdp-icons-search' },
                onClick: function (event) {
                    self._doSearch();
                }
            });
        },
        _init: function () {
            var self = this, ops = self.options;
            //this.element.empty();
            var btn = self.btnClear.closest('.om-btn');
            if (ops.showClearButton) btn.show();
            else btn.hide();
            btn = self.btnSearch.closest('.om-btn');
            if (ops.showSearchButton) btn.show();
            else btn.hide();
            self.fbody.empty();
            self._appendFilterGroup();
        },
        _appendFilterGroup: function (fiObj) {
            var self = this,
                fbody = this.fbody;
            var fgroup = $('<div class="bdp-filterGroup"></div>').appendTo(fbody);
            if (self.options.allowMultiFilterItem) {
                $('<div class="bdp-filterTools om-widget om-state-default">' +
                    '<span class="bdp-filter-btn bdp-icons-glyph-add"></span>' +
                    '<span class="bdp-filter-btn bdp-icons-glyph-delete"></span>' +
                    '</div>').appendTo(fgroup);
                $('span.bdp-icons-glyph-add', fgroup).attr('title', '增加条件项').click(function () {
                    self._appendFilterGroup();
                    if (self.options.autoFilter) {
                        self._causeFilterEvent();
                    }
                });
                $('span.bdp-icons-glyph-delete', fgroup).attr('title', '删除条件项').click(function () {
                    if ($('div.bdp-filterGroup', fbody).length > 1) {
                        $(this).closest('div.bdp-filterGroup').remove();
                        if (self.options.autoFilter) {
                            self._causeFilterEvent();
                        }
                        self.options.onDelGroup && self._trigger('onDelGroup', null);
                    }
                });
            }
            $('<div></div>').appendTo(fgroup).bdpFilterItem({
                allowCombinate: self.options.allowMultiFilterItem,
                colModel: self.options.colModel,
                onFilter: function (args) { //self.options.onFilter
                    if (self.options.autoFilter || args.clicked) {
                        self._causeFilterEvent();
                    }
                }
            }).bdpFilterItem('setFilterItem', fiObj || { cc: self.options.defaultCombinate });
            // 触发新增条件项事件
            self.options.onAddGroup && self._trigger('onAddGroup', null);
        },
        _causeFilterEvent: function () {
            var self = this,
                onFilter = this.options.onFilter;
            if (onFilter) {
                var args = self._getFilterArgs();
                onFilter.call(self, args);
            }
        },
        _getFilterArgs: function () {
            var self = this, fbody = this.fbody, args = [];
            $('div.bdp-filterGroup', fbody).each(function () {
                var fi = $('div.bdp-filterItem', $(this)).bdpFilterItem('getFilterItem');
                if (fi && fi.fn != '' && fi.op != '') {
                    if (!fi.cc) fi.cc = self.options.defaultCombinate;
                    if (fi.tp === 'date') {
                        self._getFilterArgsByDate(fi, args);
                    } else {
                        args.push(fi);
                    }
                }
            });
            return args;
        },
        //处理时间类型的查询操作的相关问题
        _getFilterArgsByDate: function (fi, args) {
            var fis = fi;
            var cc1 = fis.cc;
            var dt = new Date(fi.fv);
            var fve = new Date(dt.setDate(dt.getDate() + 1));
            switch (fi.op) {
                case 'Equals':  //等于    fv<比较项名<fv+1day
                    fis.op = 'Greater';
                    fis.cc = 'And';
                    args.push(fis);
                    var fie = new $.bdp.FilterItem(fi.fn, 'Less', fve, cc1, fi.dt);
                    args.push(fie);
                    break;
                case 'NotEqual'://不等于
                    fis.op = 'Less'; fis.cc = 'Or';
                    args.push(fis);
                    fie = new $.bdp.FilterItem(fi.fn, 'Greater', fve, cc1, fis.dt);
                    args.push(fie);
                    break;
                case 'Greater'://大于
                    fis.fv = fve;
                    args.push(fis);
                    break;
                case 'LessOrEqual'://小于或等于
                    fis.fv = fve;
                    args.push(fis);
                    break;
                default:
                    args.push(fis);
            }
        },
        _doClear: function () {
            var self = this, fbody = this.fbody;
            $('div.bdp-filterGroup', fbody).each(function () {
                $('div.bdp-filterItem', $(this))
                    .bdpFilterItem('setFilterItem', { fn: '', op: '', fv: '', cc: '', dt: '' });
            });
            self._doSearch();
        },
        _doSearch: function () {
            this._causeFilterEvent();
        },

        //#region 接口
        doSearch: function () {
            this._doSearch();
        },
        // 获取当前所有的过滤条件，返回数组
        getFilters: function () {
            return this._getFilterArgs();
        },
        // 设置过滤条件, 参数须是条件信息对象数组
        setFilters: function (filters) {
            if (typeof filters != 'object') return;
            var self = this;
            var items = $.makeArray(filters);
            self.fbody.empty();
            if (items.length > 0) {
                $.each(items, function () {
                    self._appendFilterGroup(this);
                });
            } else {
                self._appendFilterGroup();
            }
        },
        //#endregion

        done: true
    });
    //#endregion

    //#endregion

    //#region 多选面板控件：一个Combobox选中一个在右边的面板上增加一项

    $.omWidget('bdp.bdpMutliSelectPanel', {
        options: {
            dataSource: "",
            textField: 'text',
            valueField: 'value',
            //// 创建新的选中项事件，参数是新创建的选中项的jq对象。
            //onCreateItem: function (item) { },
            // 值改变事件
            onValueChanged: null // function() {},
        },
        _create: function () {
            var self = this, ops = this.options, $elem = $(self.element), id = $elem.prop('id');
            $elem.addClass("mselector")
                .append('<div class="msgroup"></div><div class="ms-sel">' +
                    '<input id="' + id + '_sel" /></div>');
            self.msGroup = $elem.find('div.msgroup');
            // $elem.find('div.ms-sel')
            self.msInput = $('#' + id + '_sel', $elem).omCombo({
                dataSource: ops.dataSource,
                textField: ops.textField,
                valueField: ops.valueField,
                optionField: ops.textField,
                inputField: ops.textField,
                editable: false,
                width: 95,
                allowClearValue: false, //true,
                listAutoWidth: true,
                onValueChange: function (target, newValue, oldValue, event) {
                    self._checkAndAdd(newValue);
                    //self.msInput.omCombo('value', '');
                }
            });
        },
        _init: function () {
            this.selectedValues = [];

        },
        _checkAndAdd: function (value) {
            var self = this, ops = self.options,
                selectedIndex = self.selectedValues.indexOf(value);
            if (selectedIndex < 0) {
                var src = self._findSourceItem(value);
                if (src != null) {
                    var sText = src[ops.textField] || '';
                    self.msGroup.append('<div class="msitem" data-value="' + value + '">' +
                        '<label>' + sText + '</label>' +
                        '<span class="msremove" title="删除" data-abbr="' + value + '"></span>' +
                        '</div>');
                    self.msGroup.find('.msremove[data-abbr="' + value + '"]').click(function () {
                        var v = '' + $(this).data('abbr'),
                            index = self.selectedValues.indexOf(v);
                        if (index >= 0) {
                            self.selectedValues.splice(index, 1);
                            $(this).closest('div.msitem').remove();
                            self._valueChanged();
                        }
                    });
                    var onCreateItem = ops.onCreateItem;
                    onCreateItem && onCreateItem.call(self, self.msGroup.find('div.msitem[data-value="' + value + '"]'));
                    self.selectedValues.push(value);
                    self._valueChanged();
                }
            }
            self.msInput.omCombo('value', '');
        },
        // 在下拉列表中查找
        _findSourceItem: function (value) {
            var self = this, ops = self.options,
                sourceItems = $(self.msInput).omCombo('getData');
            if (sourceItems == null) return null;
            var items = $.grep(sourceItems, function (e) { return e[ops.valueField] == value; });
            if (items.length > 0) return items[0];
            return null;
        },
        _valueChanged: function () {
            var self = this, f = self.options.onValueChanged;
            f && f.call(self);
        },

        //#region 接口
        // 获取当前选中的值，返回数组
        value: function (v) {
            var self = this;
            if (typeof v != 'undefined') {
                self.selectedValues = [];
                self.msGroup.empty();
                if (v != null) {
                    var vArr = $.makeArray(v);
                    $.each(vArr, function (index, e) {
                        self._checkAndAdd(e);
                    });
                }
            }
            return self.selectedValues;
        },
        //#endregion

        done: true
    });

    //#endregion

    //#region 数据统计控件
    $.omWidget('bdp.bdpDataStatisticGrid', {
        options: {
            // 是否允许图形分析
            allowDiagram: false,
            //// 是否允许跟踪查看明细数据. 暂不实现：行列确定两参数，后台查询数据，如何通用？
            //allowTracking: false,
            // 标题
            title: '统计表',
            // 数据，格式一定是：{total,rows,columns}
            data: '',
            // 是否显示数值列
            showNumberColumn: true,
            // 是否显示百分比列
            showPercentColumn: false,
            // 百分比需要保留的小数位数
            percentDigits: 2,
            // 遇零置空
            zeroBlank: false,
            // 表格高度
            height: 'fit',
            // 列宽度
            columnWidths: {
                // 项目栏宽度
                itemColumn: 110,
                // 合计栏宽度
                totalColumn: 65,
                // 数量栏宽度
                numberColumn: 60,
                // 占比栏宽度
                percentColumn: 70
            },
            // 列模型，兼容omGrid的colModel
            colModel: [],

            done: true
        },
        _create: function () {
            var self = this, $elem = $(this.element), id = $elem.prop('id');
            $elem.addClass("bdp-dsgrid");
            self.grid = $('<div id="' + id + '_grd"></div>').appendTo($elem);

        },
        _init: function () {
            var self = this, ops = this.options;
            if (typeof ops.data == 'object') {
                self._showTotalData(ops.data);
            }
        },
        //#region 显示数据统计结果
        _showTotalData: function (data) {
            var self = this, ops = this.options;
            var columns = data.columns || [],
                rows = ops.showNumberColumn && ops.showPercentColumn ? [[], [], []] : [[], []],
                r1 = rows[0],
                r2 = rows[1],
                r3 = rows[2];
            //r3可能没有，没有则说明数据和占比只显示一个, 表头仅需要2行，否则同时显示数量和占比，表头需要3行

            //#region 构造表格列模型
            $.each(columns, function (i, col) {
                col.header = col.header || self._getCaption(col.name);
                if (col.kind != 'Countfor') {
                    var cm = {
                        header: col.header || self._getCaption(col.name) || col.name,
                        name: col.name,
                        rowspan: r3 ? 3 : 2,
                        //align: col.name == "ItemName" ? 'left' : 'right',
                        align: col.kind == 'Total' ? 'right' : 'left',
                        //sort: 'clientSide',
                        renderer: function (colValue, rowData, rowIndex) {
                            return self._showCellData(colValue, rowData, rowIndex, col.name);
                        }
                    };
                    if (col.kind == 'Total') {
                        cm.width = ops.columnWidths.totalColumn;
                        if (ops.allowDiagram) {
                            cm.header += self._getDiagHtml(col.name, -1);
                        }
                    } else {
                        cm.width = ops.columnWidths.itemColumn;
                        if (col.group) cm.header = self._getCaption(col.group);
                    }
                    r1.push(cm);
                } else {
                    var group = col.group;
                    var caption = self._getCaption(group);
                    var gcol = $.grep(r1, function (r) {
                        return r.header == caption && (r.name || '') == '';
                    });
                    if (gcol.length == 0) {
                        var gsub = $.grep(columns, function (c) { return c.group == group; });
                        r1.push({ header: caption, colspan: r3 ? 2 * gsub.length : gsub.length });
                    }
                    if (r3) {
                        r2.push({ header: (col.header || self._getCaption(col.name)) + (ops.allowDiagram ? self._getDiagHtml(col.name, -1) : ''), colspan: 2 });
                        r3.push({
                            header: '数量',
                            name: col.name,
                            align: 'right',
                            width: ops.columnWidths.numberColumn,
                            //sort: 'clientSide',
                            renderer: function (colValue, rowData, rowIndex) {
                                return self._showCellData(colValue, rowData, rowIndex, col.name, false);
                            }
                        });
                        r3.push({
                            header: '占比(%)',
                            name: 'per_' + col.name,
                            align: 'right',
                            width: ops.columnWidths.percentColumn,
                            //sort: 'clientSide',
                            renderer: function (colValue, rowData, rowIndex) {
                                return self._showCellData(colValue, rowData, rowIndex, col.name, true);
                            }
                        });
                    } else {
                        r2.push({
                            header: (col.header || self._getCaption(col.name)) + (ops.showPercentColumn ? "(%)" : "") +
                                (ops.allowDiagram ? self._getDiagHtml(col.name, -1) : ''),
                            name: (ops.showPercentColumn ? 'per_' : '') + col.name,
                            align: 'right',
                            //sort: 'clientSide',
                            width: ops.showPercentColumn ? ops.columnWidths.percentColumn : ops.columnWidths.numberColumn,
                            renderer: function (colValue, rowData, rowIndex) {
                                return self._showCellData(colValue, rowData, rowIndex, col.name, ops.showPercentColumn);
                            }
                        });
                    }
                }
            });
            //#endregion

            var gridData = { total: data.total || 0, rows: data.rows, columns: columns };
            $.each(gridData.rows, function (i, r) {
                var found = false;
                $.each(gridData.columns, function (j, col) {
                    if (col.kind == 'Groupfor' && r[col.name] == '合计') {
                        if (!found) found = true;
                        else r[col.name] = '';
                    }
                });
            });
            self.gridData = gridData;
            $(self.grid).empty().append("<table></table>");
            $('table', self.grid).omGrid({
                //autoFit: true,
                title: ops.title,
                //dataSource: gridData,
                width: 'fit',
                height: ops.height || 261,
                limit: -1,
                colModel: rows,
                onRefresh: function (nowPage, pageRecords, event) {
                    self._afterDrawData();
                }
            }).omGrid('setData', gridData);

            if (ops.allowDiagram) {
                self._afterDrawData();
            }
        },
        _bindEvents: function () {
            var self = this;
            $('span.bdp-diagram-trigger', self.grid).on('click', function (event) {
                event.stopPropagation();
                self._showDiagram($(this));
            });
        },
        _showCellData: function (colValue, rowData, rowIndex, columnName, isPercentColumn) {
            var self = this, ops = this.options,
                col = $.grep(self.gridData.columns, function (e) { return e.name == columnName; })[0];
            var v = rowData[columnName], // colValue,
                isHj = self._isTotalRow(rowData);
            if ((col && col.kind == 'Countfor') && $.isNumeric(v)) {
                if (isPercentColumn) {
                    var fm = rowData.Total || rowData.total || 0, dec = Math.pow(10, ops.percentDigits);
                    v = fm == 0 ? 0 : Math.round(((v / fm * 100) * dec)) / dec;
                    if (typeof rowData['per_' + columnName] == 'undefined') {
                        rowData['per_' + columnName] = v;
                    }
                    v = v.toFixed(ops.percentDigits);
                }
                if (v === 0 && ops.zeroBlank) v = "";
            }
            if (col.kind != 'Total' && col.kind != 'Countfor') {
                if (isHj && v == '合计') v += self._getDiagHtml(col.name, rowIndex);
                if (!isHj) {
                    var lastGroupFld = "";
                    $.each(self.gridData.columns, function (i, e) {
                        if (e.kind == 'Groupfor') lastGroupFld = e.name;
                    });
                    if (lastGroupFld == columnName) v += self._getDiagHtml(col.name, rowIndex);
                }
            }
            if (isHj) v = '<b>' + v + '</b>';
            return v;
        },
        _isTotalRow: function (rowData) {
            var self = this;
            for (var i = 0; i < self.gridData.columns.length; i++) {
                var col = self.gridData.columns[i];
                if (col.kind != 'Total' && col.kind != 'Countfor' && rowData[col.name] == '合计')
                    return true;
            }
            return false;
        },
        _getCaption: function (fldname) {
            var ops = this.options;
            var col = $.bdp.colModelHelper.findBy(ops.colModel, 'name', fldname);
            if (col == null && fldname.length > 4 && fldname.endsWith('Text')) {
                fldname = fldname.substring(0, fldname.length - 4);
                col = $.bdp.colModelHelper.findBy(ops.colModel, 'name', fldname);
            }
            return col ? (col.header || '') : '';
        },
        _getDiagHtml: function (columnName, rowNo) {
            var ht = '<span style="margin-left: 5px; width: 20px;" class="bdp-diagram-trigger bdp-icons-chart_pie"';
            ht += ' data-column="' + columnName + '"';
            ht += ' data-rowno="' + rowNo + '"';
            ht += '>&nbsp;&nbsp;&nbsp;&nbsp;</span>';
            return ht;
        },
        _afterDrawData: function () {
            var self = this,
                rows = self.gridData.rows,
                grColumns = $.grep(self.gridData.columns, function (e) { return e.kind == 'Groupfor'; }),
                allTrs = $("tr.om-grid-row:not([_delete=true])", $('table', self.grid));
            $.each(grColumns, function (i, col) {
                var colValue = '', $td = null, rowspan = 1;
                $.each(allTrs, function (trIndex, tr) {
                    var tdValue = rows[trIndex][col.name],
                        $tr = $(tr),
                        $td1 = $tr.find('td[abbr="' + col.name + '"]');
                    if (tdValue == '' || colValue != tdValue || trIndex == allTrs.length - 1) {
                        if ($td != null && rowspan > 1) {
                            $td.propAttr('rowspan', rowspan); //.css({ 'vertical-align': 'middle' });
                        }
                        $td = $td1;
                        rowspan = 1;
                        colValue = tdValue;
                    } else {
                        rowspan += 1;
                        $td1.remove();
                    }
                });
            });
            // 绑定绘图按钮事件
            self._bindEvents();
        },
        //#region 绘图相关
        // sender为触发按钮
        _showDiagram: function (sender) {
            var self = this, ops = self.options,
                dlgId = self.element.prop('id') + '_diag',
                dlg = $('#' + dlgId);
            var grOptions = {
                rowno: parseInt($(sender).data('rowno')),
                column: $(sender).data('column')
            };
            if (dlg.size() == 0) {
                $('body').append('<div id="' + dlgId + '"></div>');
                dlg = $('#' + dlgId).omDialog({
                    title: '图形分析',
                    autoOpen: false,
                    width: 350,
                    height: 300,
                    //modal: true,
                    buttons: [{
                        text: '关闭',
                        width: 55,
                        click: function () {
                            dlg.omDialog('close');
                        }
                    }],
                    onOpen: function (event) {
                        self._drawGraph();
                    }
                });
                dlg.append('<div id="' + dlgId + '_gr" style="width:100%;height:100%;"></div>');
                dlg.closest('div.om-dialog').find('div.om-dialog-buttonset')
                    .before('<label><input type="radio" name="grtype" value="pie" />饼图</label>' +
                        '<label style="margin-left:12px;"><input type="radio" name="grtype" value="bar" />直方图</label>');
                dlg.closest('div.om-dialog').find(':radio[name="grtype"]').on('click', function () {
                    var grtype = $(this).val();
                    self._drawGraph(grtype);
                });
            }
            dlg.data('grOptions', grOptions);
            if (dlg.omDialog('isOpen')) self._drawGraph();
            else dlg.omDialog('open');
        },
        _drawGraph: function (grType) {
            var self = this,
                dlg = $('#' + self.element.prop('id') + '_diag'),
                ops = dlg.data('grOptions'),
                dlgGr = $('#' + self.element.prop('id') + '_diag_gr');

            var series = self._grGetSeriesData(ops.column, ops.rowno);
            if (!grType) {
                grType = 'pie';
                if (series.length > 0 && series[0].data.length > 10) grType = 'bar';
            }

            var chartOptions = {
                tooltip: { trigger: 'axis', formatter: "{a} <br/>{b} : {c}" },
                toolbox: {
                    show: true,
                    feature: {
                        mark: { show: true },
                        dataView: { show: true, readOnly: false },
                        restore: { show: true },
                        saveAsImage: { show: true }
                    }
                },

                title: {
                    text: self._grGetTitle(ops.column, ops.rowno),
                    subtext: '',
                    x: 'center'
                },
                legend: { x: 'left', orient: 'vertical', data: self._grGetLegendData(ops.rowno >= 0) },
                //series: []
                calculable: true
            };
            switch (grType || 'pie') {
                case 'bar':
                    chartOptions.toolbox.feature.magicType = { show: true, type: ['line', 'bar'] };
                    chartOptions.xAxis = [];
                    chartOptions.yAxis = [];
                    chartOptions.series = [];
                    $.each(series, function (i, e) {
                        var xObj = {
                            type: 'category',
                            axisLabel: { interval: 0, rotate: 30 },
                            data: []
                        };
                        chartOptions.xAxis.push(xObj);
                        chartOptions.yAxis.push({ type: 'value' });
                        var sObj = {
                            name: e.name,
                            type: 'bar',
                            data: [],
                            markPoint: {
                                data: [
                                    { type: 'max', name: '最大值' },
                                    { type: 'min', name: '最小值' }
                                ]
                            },
                            markLine: {
                                data: [
                                    { type: 'average', name: '平均值' }
                                ]
                            }
                        };
                        chartOptions.series.push(sObj);
                        $.each(e.data, function (j, d) {
                            xObj.data.push(d.name);
                            sObj.data.push(d.value);
                        });
                        var w = xObj.data.length * 20 + 200;
                        if (w < dlg.width()) w = dlg.width();
                        dlgGr.width(w);
                    });
                    break;
                default:
                    chartOptions.series = series;
                    dlgGr.width('100%');
                    break;
            }

            var mychart = echarts.init(dlgGr[0]);
            mychart.setOption(chartOptions);
        },
        _grGetTitle: function (column, rowno) {
            var self = this, sTitle = '';
            if (rowno >= 0) {
                var r = self.gridData.rows[rowno];
                $.each(self.gridData.columns, function (i, e) {
                    if (e.kind == 'Groupfor' || e.kind == 'Group') sTitle += r[e.name] || '';
                });
            } else {
                var col = $.grep(self.gridData.columns, function (e) { return e.name == column; })[0];
                if (col.kind == 'Total') sTitle = '合计';
                else sTitle = self._getCaption(col.group) + '_' + col.header;
            }
            return sTitle;
        },
        _grGetLegendData: function (isRow) {
            var self = this, sArr = [];
            $.each(self.gridData.columns, function (i, col) {
                if (isRow && col.kind != 'Countfor') return;
                if (!isRow && col.kind != 'Groupfor') return;
                var sCaption = self._getCaption(col.group);
                if (sArr.indexOf(sCaption) < 0)
                    sArr.push(sCaption);
            });
            return sArr;
        },
        _grGetSeriesData: function (column, rowno) {
            var self = this, series = [];
            if (rowno >= 0) {
                var rd = self.gridData.rows[rowno];
                if (rd) {
                    $.each(self.gridData.columns, function (i, c) {
                        if (c.kind == 'Countfor') {
                            var group = c.group || '';
                            if (group != '') {
                                var sObj = $.grep(series, function (e) { return e.group == group; })[0];
                                if (!sObj) {
                                    sObj = {
                                        name: self._getCaption(group),
                                        type: 'pie',
                                        radius: '55%',
                                        center: ['50%', '60%'],
                                        data: [],
                                        group: group
                                    };
                                    series.push(sObj);
                                }
                                sObj.data.push({ name: c.header, value: rd[c.name] });
                            }
                        }
                    });
                    if (series.length == 0) {
                        series.push({ name: '合计', type: 'pie', radius: '55%', center: ['50%', '60%'], group: '', data: [{ name: '合计', value: rd.Total }] });
                    }
                }
            } else {
                var grColumns = $.grep(self.gridData.columns, function (e) { return e.kind == 'Groupfor' || e.kind == 'Group'; }),
                    col = $.grep(self.gridData.columns, function (e) { return e.name == column; })[0];
                $.each(grColumns, function (gi, gc) {
                    var sObj = {
                        name: self._getCaption(gc.name),
                        type: 'pie',
                        radius: '55%',
                        center: ['50%', '60%'],
                        data: [],
                        group: gc.group
                    };
                    series.push(sObj);
                    $.each(self.gridData.rows, function (ri, dr) {
                        var sName = dr[gc.name];
                        if (gc.kind != 'Group' && (sName == '合计' || sName == '')) return;
                        if (gi < grColumns.length - 1 && dr[grColumns[gi + 1].name] != '合计') return;
                        var value = parseFloat(dr[col.name]);
                        var objData = $.grep(sObj.data, function (dd) { return dd.name == sName; })[0];
                        if (!objData) {
                            objData = { name: sName, value: 0 };
                            sObj.data.push(objData);
                        }
                        objData.value += value;
                    });
                });
            }
            return series;
        },
        //#endregion

        //#endregion

        //#region 接口函数
        // 导出数据到Excel
        toExcel: function (setting) {
            var self = this;
            var tbl = $('table', self.grid);
            if (tbl.size() > 0) {
                tbl.omGrid('toExcel', setting);
            }
        },
        resize: function () {
            var self = this;
            var tbl = $('table', self.grid);
            if (tbl.size() > 0) {
                tbl.omGrid('resize');
            }
        },
        // 获取omGrid对象
        getGrid: function () {
            return $('table', this.grid);
        },
        // 基于现有的数据按照新的选项重绘
        review: function (ops) {
            var self = this;
            if (self.options.data && typeof ops == 'object') {
                self.options = $.extend(self.options, ops);
                self._showTotalData(self.options.data);
            }
        },
        //#endregion

        done: true
    });
    //#endregion

    //#region 数据批量更新对话框
    /*
    批量更新对话框从omDialog继承，除了继承omDialog的功能外，属性扩展支持：
        colModel： 列模型，兼容omGrid的列模型
        beforeExecute：执行更新前的事件，在此设置相关参数
        afterExecute：执行更新后的事件，根据返回结果进行诸如刷新等相关处理
    重载对话框显示方法：
        open    显示对话框，可接受1个数值参数，表示要更新的记录有多少条。如果传递了这个参数
                对话框中的修改范围缺省选择为选择的记录，否则缺省选中全部，并且“选择的”不可
                用。
    对话框中的执行按钮点击后，首先触发beforeExecute事件，如果事件返回false，将中断执行。否则
    封装参数，调用$.batchUpdate扩展函数进行数据更新处理，返回后触发afterExecute事件。
    */
    $.omWidget('bdp.bdpBatchUpdate', $.om.omDialog, {
        base: $.om.omDialog.prototype,
        options: {
            title: '批量修改',
            width: 450,
            height: 320,
            modal: true,
            // 执行前事件，在该事件中提供批量更新的参数，
            // 其中s.scope是用户选择的更新范围，s.values是用户输入的要更新的字段和值。
            // 返回false则不执行
            beforeExecute: function (s) { return true },
            // 执行后事件，参数是后台返回结果对象
            afterExecute: function (ajaxResult) { },

            // 列模型
            colModel: []
        },
        _create: function () {
            var self = this, ops = this.options, $elem = this.element;
            //if (!ops.type) throw "必须设置type(实体类名)!";
            self.options.buttons = [{
                text: '执行', id: this._getId('btnOk'),
                click: function () {
                    self._doExecute();
                }
            }, {
                text: '关闭', id: this._getId('btnCancel'),
                click: function () {
                    self.close();
                }
            }];
            this.base._create.apply(this, []);
            $('#' + this._getId('btnOk') + ',#' + this._getId('btnCancel')).width(65);
            $elem.empty().append('<div class="batchUpdater">' +
                '<div class="row"><span class="cellLabel">修改范围：</span><span class="cellEdit">' +
                '   <label class="radio"><input type="radio" name="buscope" value="0" checked="checked" id="'
                + self._getId('e1') + '" />当前选中的<span style="color:blue;" id="' + self._getId('e5') + '"></span>条记录</label>' +
                '   <br /><label class="radio"><input type="radio" name="buscope" value="1" id="'
                + self._getId('e2') + '" />符合条件的全部记录</label>' +
                '</span></div>' +
                '<div class="row"><span class="cellLabel">修改项目：</span><span class="cellEdit"><input id="' + self._getId('e3') + '" /></span></div>' +
                '<div class="row"><span class="cellLabel">修改为：</span><span class="cellEdit" id="' + self._getId('e4') + '"></span></div>' +
                '<div class="status">正在执行...</div>' +
                '</div>');
            self.btnOk = $('#' + self._getId('btnOk'));
            self.recCountSpan = $('#' + self._getId('e5'), $elem);
            self.scopeInput1 = $('#' + self._getId('e1'), $elem);
            self.scopeInput2 = $('#' + self._getId('e2'), $elem);
            self.fieldInput = $('#' + self._getId('e3'), $elem).omCombo({
                //dataSource: self._getColumnNames(),
                editable: false,
                width: 275,
                listAutoWidth: true,
                onValueChange: function (target, newValue, oldValue, event) {
                    self._createValueInputBox();
                }
            });
            self.valInputContainer = $('#' + self._getId('e4'), $elem);
            self.status = $('div.status', $elem).hide();
        },
        _init: function () {
            var self = this, $elem = $(this.element);
            self.fieldInput.omCombo('setData', self._getColumnNames());

        },

        //#region 内部函数
        // 创建值录入控件
        _createValueInputBox: function () {
            var self = this,
                fn = self.fieldInput.omCombo('value') || '';
            if (fn == '') return;
            // 查找字段的列模型
            var cm = $.grep(self.options.colModel, function (e, i) {
                return (e.editor ? (e.editor.name || e.name) : e.name) == fn;
            })[0];

            //var tempValue = undefined;
            //if (self.editCtrl) {
            //    tempValue = $(self.editCtrl).bdpEditCtrl('value');
            //}
            // 清除已有的控件
            self.valInputContainer.empty();
            self.editCtrl = null;
            if (!cm) return;
            // 需要录入数据则创建
            var temp = $.extend(true, {}, cm);
            temp.createErrorPlace = false;
            temp.editor = temp.editor || {};
            temp.editor.editable = true;
            temp.onValueChanged = function (target, newValue, oldValue, event) {

            };
            self.editCtrl = $('<div class="om-widget"></div>').width(275)
                .appendTo(self.valInputContainer)
                .bdpEditCtrl(temp);
            self.editCtrl.bdpEditCtrl('value', null);
            //if (tempValue !== undefined) {
            //    self.editCtrl.bdpEditCtrl('value', tempValue);
            //}
        },
        // 获取字段名清单
        _getColumnNames: function () {
            var self = this, ops = this.options,
                items = [];
            for (var i = 0, len = ops.colModel.length; i < len; i++) {
                var cm = ops.colModel[i],
                    fn = cm.editor ? (cm.editor.name || cm.name) : cm.name,
                    fh = cm.header;
                items.push({ text: fh, value: fn });
            }
            return items;
        },
        // 生成子控件id
        _getId: function (id) {
            return this.element.prop('id') + '_' + id;
        },
        _doExecute: function () {
            var self = this,
                fldname = $(self.fieldInput).val();
            if (!fldname) {
                $.omMessageTip.show({ content: '请选择要批量修改的项目！', timeout: 5000 });
                return;
            }
            var batOps = {
                // 修改范围：0 选中的，1 全部
                scope: self.scopeInput1.propAttr('checked') ? 0 : 1,

                // 实体类名，必须
                type: self.options.type || '',
                // 主键字段名，可选
                keyField: self.options.keyField || '',
                keyValues: self.options.keyValues || [],
                filterSql: self.options.filterSql || '',
                customFilter: self.options.customFilter || null,
                // 要修改的值
                values: {}
            };
            batOps.values[fldname] = self.editCtrl.bdpEditCtrl('value') || null;

            if (!self.options.beforeExecute || self.options.beforeExecute.call(self, batOps) != false) {
                if (!batOps.type) throw "未提供需要批量更新数据的实体类名，即type参数";
                self.start();
                batOps.success = function (ret) {
                    self.stop(ret);
                }
                $.batchUpdate(batOps);
            }
        },
        //#endregion

        //#region 接口函数
        open: function (nCount) {
            var self = this, ops = this.options;
            self.base.open.apply(self, []);
            nCount = typeof nCount == 'number' ? nCount : 0;
            self.recCountSpan.text(nCount);
            //self.scopeInput1.enable(nCount > 0);
            self.scopeInput1.propAttr('checked', true);
            self.scopeInput2.propAttr('checked', false);
        },
        // 标示开始到后台进行数据更新
        start: function () {
            var self = this;
            self.status.text('正在执行...').show();
            self.btnOk.omButton('disable');
            //self.btnOk.enable(false);
        },
        // 标示后台更新完毕
        stop: function (ajaxResult) {
            var self = this;
            if (ajaxResult.Succeed)
                self.status.text('成功修改' + ajaxResult.Data + '条记录！');
            else self.status.text('失败！' + ajaxResult.Message || '');
            self.btnOk.omButton('enable');
            //self.btnOk.enable(true);
            self.options.afterExecute && self.options.afterExecute(ajaxResult);
        },

        //#endregion

        done: true
    });
    //#endregion

})(jQuery);
//#endregion

//#region 权限支持
jQuery.extend({
    // 缺省的登录页地址, 
    ACP_Relogin: function (defaultLoginUrl, reason) {
        var sUrl = !localStorage ? defaultLoginUrl : (localStorage.getItem('_sys_login_url') || defaultLoginUrl);
        if (reason == 'E998') {
            var omAlert = $.omMessageBox.alert;
            if (window.top && window.top.$ && window.top.$.omMessageBox)
                omAlert = window.top.$.omMessageBox.alert;
            omAlert({
                content: "对不起！您的帐号因在其它地方登录，已被强制下线。",
                onClose: function () {
                    window.open(sUrl, '_top');
                }
            });
        } else {
            window.open(sUrl, '_top');
        }
    },
    // 系统登录成功后跳转. 在cookie中保存当前登录页面，重新登录时取回
    ACP_LoginSucess: function (redirectUrl) {
        if (localStorage) localStorage.setItem('_sys_login_url', document.location.href);
        document.location.href = redirectUrl;
    },
    /* 加载页面初始数据：公共变量、权限信息、多语言词典...
     *   在非aspx页面，如htm、html等，由于没有经过服务端处理，所以在页面加载后
     * 还缺少服务端自动生成的信息。该函数通过异步方式补充加载这些数据，一般应
     * 写在页面的尾部，但需应写在$.ready之外。
    */
    ACP_PageAfterLoad: function () {
        PageAfterLoad();
    },
    ACP_Initialize: function () {
        if (typeof LIMITED_CTRLS == 'undefined' || !$.isArray(LIMITED_CTRLS)) return;
        $.each(LIMITED_CTRLS, function (i, c) {
            if ($.isArray(c) && c.length > 2 && (c[0] || '') != '' && c[0][0] != '@') {
                var $c = $(c[0]);
                if ($c.length > 0) {
                    ////$c.attr('data-canvisible', c[1] ? true : false);
                    ////$c.attr('data-canenable', c[2] ? true : false);
                    //$c.data('canvisible', c[1] ? true : false);
                    //$c.data('canenable', c[2] ? true : false);
                    if ($c.hasClass('om-btn-txt')) {
                        $c.omButton(c[2] ? 'enable' : 'disable');
                        if (c[1]) $c.closest('.om-btn').show();
                        else $c.closest('.om-btn').hide();
                    } else if ($c.is("li") && $c.parent().is("ul.om-menu")) {
                        if (c[1]) $c.show(); else $c.hide();
                        var eleMenu = $c.parent().parent();
                        eleMenu.omMenu(c[2] ? 'enableItem' : 'disableItem', $c.prop('id'));
                    } else {
                        if (c[1]) $c.show();
                        else $c.hide();
                        if (c[2]) $c.removeAttr('disabled');
                        else $c.attr('disabled', true);
                    }
                }
            }
        });
    },
    ACP_CanEnable: function ($element) {
        if (typeof LIMITED_CTRLS == 'undefined' || !$.isArray(LIMITED_CTRLS)) return true;

        if (typeof $element === 'string') {
            var cArr = $.grep(LIMITED_CTRLS, function (arr, i) { return arr[0] === $element; });
            if (cArr.length > 0) return cArr[0][2] ? true : false;
            return true;
        }

        for (var i = 0, len = LIMITED_CTRLS.length; i < len; i++) {
            var cinfo = LIMITED_CTRLS[i];
            if ($.isArray(cinfo) && cinfo.length > 2 && (cinfo[0] || '') != '') {
                var sid = cinfo[0];
                if (sid[0] !== '@') {
                    var $temp = $(sid);
                    if ($temp.length > 0 && $temp[0] == $element[0]) {
                        return cinfo[2] ? true : false;
                    }
                }
            }
        }
        return true;
    },
    ACP_CanVisible: function ($element) {
        if (typeof LIMITED_CTRLS == 'undefined' || !$.isArray(LIMITED_CTRLS)) return true;

        if (typeof $element === 'string') {
            var cArr = $.grep(LIMITED_CTRLS, function (arr, i) { return arr[0] === $element; });
            if (cArr.length > 0) return cArr[0][1] ? true : false;
            return true;
        }

        for (var i = 0, len = LIMITED_CTRLS.length; i < len; i++) {
            var cinfo = LIMITED_CTRLS[i];
            if ($.isArray(cinfo) && cinfo.length > 2 && (cinfo[0] || '') != '') {
                var sid = cinfo[0];
                if (sid[0] !== '@') {
                    var $temp = $(sid);
                    if ($temp.length > 0 && $temp[0] == $element[0]) {
                        return cinfo[1] ? true : false;
                    }
                }
            }
        }

        return true;
    }
});


$.omWidget.addCreateListener('om.omButton', function () {
    var self = this;

    var oldEnable = self.enable;
    self.enable = function () {
        if ($.ACP_CanEnable(self.element)) {
            oldEnable.call(self);
        } else {
            self.disable();
        }
    };
});
//#endregion

//#region 多语言支持

if (typeof MLANG == 'undefined') {
    MLANG = {};
}

(function () {
    // 缺省选择器
    MLANG.defaultSelector = "label,a,h2,span,button,div";
    if (typeof MLANG.translate !== 'function') {
        // 翻译界面为当前语言.
        // 基本算法：
        //     多语言词典是一个二维数组，每个元素均是3个元素的数组，其中：
        // 1. 页面元素选择器，如果为空，表示选择适合第二个元素值的所有元素；
        // 2. 设计时文本，可以是文本串，也可以是正则表达式的模板，以该值为参数创建RegExp. 如果该值为空，表示选择的元素直接替换为第三个元素的值；
        // 3. 需要替换为的值，一般为字符串。如果第二个元素是正则模板，该值可以引用匹配值。如第二个元素为：(\d{1,4})年(\d{1,2})月(\d{1,2})日，
        //    该值可以引用$1代表年份数，$2代表月份数，$3代表日期数，如可使用：$1-$2-$3
        MLANG.translate = function () {
            try {
                var dict = window['LANG_DICT'] || LANG_DICT;
                if (!dict || !$.isArray(dict)) return;
                $.each(dict, function (i, item) {
                    if ($.isArray(item) && item.length > 2) {
                        var selectors = (item[0] || '') == '' ? MLANG.defaultSelector : item[0],
                            src = item[1] || '',
                            dst = item[2] || '',
                            reg = null,
                            targets = $(selectors).filter(function (i) { return this.firstChild && this.firstChild.nodeType == 3; });
                        if (src != '') {
                            reg = new RegExp(src, 'gmi');
                            targets = targets.filter(function (i) { return reg.test(this.firstChild.data); });
                        }
                        targets.each(function (i, node) {
                            var data = node.firstChild.data;
                            if (dst != '') {
                                node.firstChild.data = reg ? data.replace(reg, dst) : dst;
                            }
                        });
                    }
                });
            } catch (e) {
            }
        };
    }
}());

(function ($) {
    if (!$.omMessageBox._old_alert) {
        $.omMessageBox._old_alert = $.omMessageBox.alert;
        $.omMessageBox.alert = function (config) {
            $.omMessageBox._old_alert(config);
            MLANG.translate();
        };
    }
    if (!$.omMessageBox._old_confirm) {
        $.omMessageBox._old_confirm = $.omMessageBox.confirm;
        $.omMessageBox.confirm = function (config) {
            $.omMessageBox._old_confirm(config);
            MLANG.translate();
        };
    }
    if (!$.omMessageBox._old_prompt) {
        $.omMessageBox._old_prompt = $.omMessageBox.prompt;
        $.omMessageBox.prompt = function (config) {
            $.omMessageBox._old_prompt(config);
            MLANG.translate();
        };
    }
    if (!$.omMessageBox._old_waiting) {
        $.omMessageBox._old_waiting = $.omMessageBox.waiting;
        $.omMessageBox.waiting = function (config) {
            $.omMessageBox._old_waiting(config);
            MLANG.translate();
        };
    }

    if (!$.omMessageTip._old_show) {
        $.omMessageTip._old_show = $.omMessageTip.show;
        $.omMessageTip.show = function (config) {
            $.omMessageTip._old_show(config);
            MLANG.translate();
        };
    }


    $(document).ready(function () {
        setTimeout(function () {
            MLANG.translate();
        }, 500);
    });


    // multi language ui
    $.omWidget("bdp.bdpMLang", {
        options: {

        },
        _create: function () {

        },
        _init: function () {
            var self = this, $elem = this.element, ops = this.options;
            $.getJSON(getCommonDataUrl('MLangInfos'), function (res) {
                $elem.empty();
                $('.mlang-menu').remove();
                if (res.Succeed && res.Data.MLangSupported) {
                    var lcode = res.Data.SelectedLanguage;
                    var ltext = '';
                    var langItems = [];
                    $.each($.makeArray(res.Data.Languages), function (i, r) {
                        langItems.push({ id: r.value, label: r.text, checked: r.value == lcode });
                        if (r.value == lcode) ltext = r.text;
                    });
                    $elem.addClass("bdpMLang");
                    self.btnEl = $('<a class="mlang-btn"></a>').appendTo($elem);
                    self.itemsEl = $('<div class="mlang-menu" style="z-index: 2000;"></div>').appendTo('body');
                    self.btnEl.omButton({
                        label: ltext,
                        onClick: function () {
                            self.itemsEl.omMenu("show", this);
                        }
                    });
                    self.itemsEl.omMenu({
                        //minWidth: 150,
                        //maxWidth: 200,
                        dataSource: langItems,
                        onSelect: function (item) {
                            $.getJSON(getCommonDataUrl('MLangChange', { lang: item.id }, true), function (res1) {
                                if (res1.Succeed) {
                                    self.btnEl.text(item.label);
                                    window.top.document.location.href = window.top.document.location.href;
                                }
                            });
                        }
                    });

                }
            });
        },

        __done: true
    });


})(jQuery);

function createMLangSelector() {
    var mlang = $('#mlang');
    if (mlang.length < 1) {
        $('body').append('<div id="mlang"></div>');
        mlang = $('#mlang').css({
            "position": "absolute",
            "top": "10px",
            "right": "60px",
            "z-index": "1200"
        });
    }
    mlang.bdpMLang({});
}
//#endregion


/* 加载页面初始数据：公共变量、权限信息、多语言词典...
 *   在非aspx页面，如htm、html等，由于没有经过服务端处理，所以在页面加载后
 * 还缺少服务端自动生成的信息。该函数通过异步方式补充加载这些数据，一般应
 * 写在页面的尾部，但需应写在$.ready之外。
 */
function PageAfterLoad() {
    // 加载页面权限信息   $.getJSON
    jdpExec(getCommonDataUrl('BdpPageInfos', { nodeid: $.getUrlParam('nodeid') }),
        function (res) {
            //console.log('priv info:', res);
            if (res.Succeed) {
                var info = res.Data;
                if (info.GlbVar && !window.GlbVar) {
                    window["GlbVar"] = info.GlbVar;
                }
                if (info.limitedCtrls && !window.LIMITED_CTRLS) {
                    window["LIMITED_CTRLS"] = info.limitedCtrls;
                    //$(document).ready(function () {
                    //    if (typeof ($.ACP_Initialize) === 'function') {
                    //        $.ACP_Initialize();
                    //    }
                    //});
                    $(window).load(function () {
                        if (typeof ($.ACP_Initialize) === 'function') {
                            $.ACP_Initialize();
                        }
                    });
                }
                if (info.MLang && !window.LANG_DICT) {
                    window["LANG_DICT"] = info.MLang;
                    //$(document).ready(function () {
                    //    if (typeof (MLANG) === 'object' && typeof (MLANG.translate) === 'function') {
                    //        MLANG.translate.call(this);
                    //    }
                    //});
                    $(window).load(function () {
                        if (typeof (MLANG) === 'object' && typeof (MLANG.translate) === 'function') {
                            MLANG.translate.call(this);
                        }
                    });
                }
            }
        });

}
