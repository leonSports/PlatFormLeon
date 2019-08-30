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

; (function ($) {

    $.extend({
        // 数据导入向导公共设置.
        // 当获取自定义参数时调用 onGetCustomParam
        ImportWizard: {
            // 获取自定义参数值的事件
            //onGetCustomParam: function (options, currsetp) { }
            // 验证某一步骤的事件
            //onValidStep:function(step){}
            // 执行导入后事件，参数为后台返回的AjaxResult对象
            //afterImport:function(ajaxResult){}
        },
        // 导入监控器
        ImpMoniting: function (progressId) {
            $.ajax({
                url: getCommonDataUrl("BdpProgress", { id: progressId }),
                dataType: 'json',
                success: function (ajaxResult) {
                    var info = ajaxResult.Data || { Status: 0 }
                    if (info.Status == 0) {
                        var progress = $('#impProgress'),
                            extraData = info.ExtraData || {},
                            fname = extraData.Data.Logfile || '';

                        $('#impLabel').html('完成导入');
                        progress.omProgressbar({ value: 100 });
                        $('#impResult').empty().append('<label>' + extraData.Message + '</label><br />共耗时：' +
                            (Math.round((info.TimeSpan || 0) * 100) / 100) + ' 秒。');
                        if (fname != '') {
                            $('#impResult').append('<br /><a href="' + absUrl(fname) + '" target="_blank">查看导入记录文件</a>');
                        }
                        var afterImport = $.ImportWizard.afterImport;
                        afterImport && afterImport(extraData);
                        $('.step-btns-prev').enable(true);
                    } else {
                        var msglabel = $('#impLabel'),
                            progress = $('#impProgress'),
                                pos = info.Position || 0,
                                min = info.MinValue || 0,
                                max = info.MaxValue || 0,
                                v = Math.round((pos + 1) / (max - min + 1) * 100);
                        var msg = info.Message || '';
                        if (pos > 0) msg += "[" + pos + "]";
                        msglabel.text(msg);
                        if (max > 0) progress.omProgressbar({ value: v });
                        var extra = info.ExtraData || {};
                        $('#impResult').empty().append('成功：' + (extra.success || 0) +
                            '<br />失败：' + (extra.errors || 0) +
                            '<br />错误：' + (extra.errmsg || '') +
                            '<br />耗时：' + (Math.round((info.TimeSpan || 0) * 100) / 100) + ' 秒');

                        setTimeout("$.ImpMoniting('" + progressId + "')", 500);
                    }
                }
            });
        }


    });

})(jQuery);


$(document).ready(function () {
    // 导入参数
    var DIP = { FChanged: false }, ios = GlbVar.ImportOptions || {};
    DIP.Options = $.extend(true, {}, ios);
    DIP.ImportClassName = DIP.Options.ImportClassName || '';
    DIP.EntityClassName = DIP.Options.EntityClassName || '';
    //if (DIP.EntityClassName == '' && DIP.ImportClassName == '')
    //    throw "必须设置导入实现方法！";

    //#region 向导
    var getCustomParam = function (currStep) {
        var f = $.ImportWizard.onGetCustomParam;
        if (f) f(DIP.Options, currStep);
    };

    $('#step-tabs').css({ 'margin': '5px' }).omTabs({
        //width: '96%',
        height: 461
    });
    // 走步
    var gotoStep = function (index) {
        // 步骤数
        var stepcount = $('#step-tabs').omTabs('getLength');
        if (index >= 0 && index < stepcount) {
            $('#step-tabs li:not(:eq(' + index + '))').hide();
            $('#step-tabs li:eq(' + index + ')').show();
            $('#step-tabs').omTabs('activate', index);
            $('.step-btns-prev').enable(index > 0);
            $('.step-btns-next').enable(index < stepcount);
        }
    };

    // 检查并执行某一步
    var execStep = function (index, nextIndex) {
        switch (index) {
            case 0:
                gotoStep(nextIndex);
                break;
            case 1:
                //#region 上传文件，成功处理后再到下一步
                DIP.DataFileName = DIP.DataFileName || '';
                //var cfg = {
                //    class_name: DIP.EntityClassName,
                //    imp_class: DIP.ImportClassName,
                //    imp_mode: $('input[name="impmode"]:checked').val(),
                //    imp_log: $('input[name="implog"]').prop('checked'),
                //    file_type: $('#skExcel').prop('checked') ? 'EXCEL' : 'DBF',
                //    sheet_name: $('#srcSheet').val() || '',
                //    start_row: parseInt($('#srcRow').val()) - 1
                //};
                //if (cfg.start_row < 0) cfg.start_row = 0;

                DIP.ImportMode = $('input[name="impmode"]:checked').val();
                DIP.CreateLogfile = $('input[name="implog"]').prop('checked');
                DIP.LogAllDataRow = $('input[name="logall"]').prop('checked');
                DIP.FileType = $('#skExcel').prop('checked') ? 'EXCEL' : 'DBF';
                DIP.SheetName = $('#srcSheet').val() || '';
                DIP.StartRow = parseInt($('#srcRow').val()) - 1;
                DIP.DbfType = $('#dtDBase').prop('checked') ? 'dBASE' : 'Foxpro';
                if (DIP.StartRow < 0) DIP.StartRow = 0;

                var file = $('#srcFile').val() || '';
                if (DIP.DataFileName == '' && file == '') {
                    alert("请选择文件！");
                    return false;
                }
                if (!DIP.FChanged && DIP.DataFileName != '') {

                    gotoStep(nextIndex);
                    return true;
                }
                getCustomParam(1);

                $.omMessageBox.waiting({
                    title: '请等待',
                    content: '正在上传文件，请等待...'
                });
                $.ajaxFileUpload({
                    url: getCommonDataUrl('BdpImpUploadFile'),
                    secureuri: false,
                    //data: cfg,
                    data: { "DIP": escape(JSON.stringify(DIP)) },
                    dataType: 'json',
                    fileElementId: 'srcFile',
                    success: function (html, status) {
                        $.omMessageBox.waiting('close');
                        if (html && html.Succeed) {
                            $('#gridMap').omGrid('resize');
                            // 复制后台返回的数据导入参数
                            DIP = $.extend(true, DIP, html.Data);
                            DIP.FChanged = false;

                            var gdata = { total: DIP.Mappings.length, rows: DIP.Mappings };
                            //$('#gridMap').data('SourceFields', html.Data.SourceFields);
                            $('#gridMap').omGrid('setData', gdata);
                            $('input.srcfld').omCombo({
                                dataSource: DIP.SourceFields,
                                editable: false,
                                allowClearValue: true,
                                valueField: 'FldId',
                                //inputField: 'FldName',
                                //optionField: 'FldName',
                                listAutoWidth: true,
                                width: '99%',
                                optionField: function (data, index) {
                                    return data.FldId == data.FldName ? data.FldName : "[$" + data.FldId + "] " + data.FldName;
                                },
                                inputField: function (data, index) {
                                    return data.FldId == data.FldName ? data.FldName : "[$" + data.FldId + "] " + data.FldName;
                                }
                            }).each(function () {
                                var v = $(this).val() || '';
                                $(this).omCombo('value', v);
                            });
                            gotoStep(nextIndex);
                        }
                        else {
                            var s = "";
                            if (html) s = html.Message;
                            if (html.Data && html.Data != '')
                                s += '<br /><a href="' + ROOT_PATH + html.Data + '" target="_blank">详细信息</a>';
                            $.omMessageBox.alert({ title: "导入失败", content: s });
                        }
                    },
                    error: function (html, status, e) {
                        $.omMessageBox.waiting('close');
                        $.omMessageBox.alert({ title: "上传文件失败", content: '上传文件失败:' + html });
                        fileUploadResult = 2;
                    }
                });
                //#endregion
                break;
            case 2:
                //#region 检查映射是否正确
                var rows = DIP.Mappings, // $('#gridMap').omGrid('getData').rows,
                    canNext = true;
                $.each(rows, function (i, r) {
                    var fld = $('#edt_' + r.PropName).omCombo('value') || '';
                    if (r.Requred && fld == '') {
                        alert("必须设置[" + r.PropDesc + "]的数据源！");
                        canNext = false;
                        return false;
                    }
                    r.SrcFldId = fld;
                });
                if (canNext) {
                    $('#impLabel').text('');
                    $('#impProgress').omProgressbar({ value: 0 });
                    $('#impResult').empty();
                    gotoStep(nextIndex);
                }
                //#endregion
                break;
            case 3:
                //#region 执行导入，为下一步填写导入结果信息
                getCustomParam(3);
                $('.step-btns-prev').enable(false);
                $('.step-btns-next').enable(false);
                $.ajax({
                    url: getCommonDataUrl('BdpImpExecute'),
                    type: 'POST',
                    dataType: 'json',
                    data: JSON.stringify(DIP),
                    success: function (ajaxResult) {
                        if (ajaxResult.Succeed) {
                            setTimeout("$.ImpMoniting('" + ajaxResult.Data + "')", 500);
                            //gotoStep(nextIndex);
                        } else {
                            $.omMessageTip.show({ type: 'error', content: ajaxResult.Message || '操作失败！', timeout: 3000 });
                            $('.step-btns-prev').enable(true);
                            $('.step-btns-next').enable(true);
                        }
                    }
                });
                //#endregion
                break;
        }
    };

    // 上一步、下一步按钮事件
    $('.step-btns-prev,.step-btns-next').on('click', function () {
        var isnext = $(this).hasClass('step-btns-next'),
            tabid = $('#step-tabs').omTabs('getActivated'),
            curStep = $('#step-tabs').omTabs('getAlter', tabid),
            index = isnext ? curStep + 1 : curStep - 1;
        $('a.step-btns-next').text(index > 2 ? "执行导入" : "下一步");
        if (!isnext) {
            gotoStep(index);
            return;
        }
        var func = $.ImportWizard.onValidStep;
        if (!$.isFunction(func) || func(curStep)) {
            execStep(curStep, index);
        }
    });
    // 初始化到第1步
    gotoStep(0);

    //#endregion

    //#region 步骤1:
    //$('#dstBox').empty();
    //var tables = ImportTables || [];
    //$.each(tables, function (i, tbl) {
    //    $('#dstBox').append('<label class="radio"><input type="radio" name="table" value="' + tbl.value + '" />' + tbl.text + '</label><div style="clear: both"></div>');
    //});

    //#endregion

    //#region 步骤2：选择上传文件

    // 开始行号只能输入正数
    $('#srcRow').omNumberField({
        allowDecimals: false,
        allowNegative: false
    }).on('change', function () {
        DIP.FChanged = true;
    });
    // 类型变化时改变工作表、开始行号的可用状态
    $('#skExcel,#skDBF').on('change', function () {
        var sk = parseInt($(this).val());
        //$('#srcSheet').enable(sk == 0);
        //$('#srcRow').omNumberField(sk == 0 ? 'enable' : 'disable');
        if (sk == 0) {
            $('.rowExcel').show();
            $('.rowDbf').hide();
        } else {
            $('.rowExcel').hide();
            $('.rowDbf').show();
        }
        DIP.FChanged = true;
    });
    $('.rowDbf').hide();
    $('#srcFile').on('change', function () {
        DIP.FChanged = true;
        var isDbf = $('#srcFile').val().toLowerCase().endsWith('.dbf');
        if (isDbf) {
            $('#skDBF').click();
        } else {
            $('#skExcel').click();
        }
    });
    $('input[name="impmode"],input[name="implog"],input[name="logall"],#srcSheet').on('click', function () {
        DIP.FChanged = true;
    });
    //#endregion 

    //#region 步骤3
    $('#gridMap').omGrid({
        limit: -1,
        //autoFit: true,
        width: '100%',
        height: 'fit',
        //editMode: 'multirow',
        colModel: [{
            header: '数据项', name: 'PropName', align: 'center', width: 110
        }, {
            header: '名称', name: 'PropDesc', align: 'center', width: 140
        }, {
            header: '是否必填', name: 'Requred', align: 'center', width: 60,
            renderer: function (colValue, rowData, rowIndex) {
                return colValue ? '<font color="red">必填</font>' : "选填";
            }
        }, {
            header: '导入数据项', name: 'SrcFldId', width: 190,
            renderer: function (colValue, rowData, rowIndex) {
                var ht = [];
                ht.push('<input id="edt_' + rowData.PropName + '" class="srcfld" value="' + (colValue || '') + '"');
                ht.push('/>');
                return ht.join('');
            }
        }, {
            header: '说明', name: 'Remark', width: 210
        }]
    });
    //#endregion

});


