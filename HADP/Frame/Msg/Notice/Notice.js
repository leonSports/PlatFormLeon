
$(document).ready(function () {
    $('#secGrid,#secEditor').css({ height: "100%", width: "100%", overflow: "hidden" });
    $('#peditor').css({ padding: "3px" });

    //#region 菜单
    $("#menu").omButtonbar({
        btns: [{
            id: 'btnSearch', label: '查询', hint: '', icons: { leftCss: 'bdp-icons-glyph-search' },
            onClick: function (event) {
                doSearch();
            }
        }, { separtor: true }, {
            id: 'btnAdd', label: '创建', hint: '创建一份新的通知公告', icons: { leftCss: 'bdp-icons-add' },
            onClick: function (event) {
                startEdit(true);
            }
        }, {
            id: 'btnEdit', label: '修改', hint: '修改选中的通知公告', icons: { leftCss: 'bdp-icons-edit' },
            onClick: function (event) {
                startEdit(false);
            }
        }, {
            id: 'btnDel', label: '删除', hint: '删除选中的通知公告', icons: { leftCss: 'bdp-icons-delete' },
            onClick: function (event) {
                var rowData = $('#grid').omGrid('getSelections', true)[0];
                if (rowData) {
                    $.omMessageBox.confirm({
                        content: "确写要删除吗？", title: "删除确认",
                        onClose: function (value) {
                            if (value) {
                                $.getJSON(getCommonDataUrl('NewsDelete', { id: rowData.Id || '' }),
                                    function (result) {
                                        if (result.Succeed) {
                                            $('#grid').omGrid('reload');
                                        } else {
                                            $.omMessageTip.show({ content: '删除失败！' + (result.Message || ''), timeout: 3000 });
                                        }
                                    });
                            }
                        }
                    });
                }
            }
        }, { separtor: true }, {
            id: 'btnSave', label: '保存', icons: { leftCss: 'bdp-icons-save' },
            onClick: function (event) {
                saveData();
            }
        }, {
            id: 'btnCancel', label: '取消', icons: { leftCss: 'bdp-icons-cancel' },
            onClick: function (event) {
                cancelEdit();
            }
        }, { separtor: true }, {
            id: 'btnDeploy', label: '发布', hint: '发布后的通知公告其他人才能查看', icons: { leftCss: 'bdp-icons-checked' },
            onClick: function (event) {
                var rowData = $('#grid').omGrid('getSelections', true)[0];
                if (rowData && rowData.NoticeState == 0) {
                    $.getJSON(getCommonDataUrl('NewsDeploy', { id: rowData.Id, fb: 1 }),
                        function (result) {
                            if (result.Succeed) {
                                $('#grid').omGrid('reload');
                            }
                        });
                }
            }
        }, {
            id: 'btnUnDeploy', label: '撤消', hint: '', icons: { leftCss: 'bdp-icons-close' },
            onClick: function (event) {
                var rowData = $('#grid').omGrid('getSelections', true)[0];
                if (rowData && rowData.NoticeState == 1) {
                    $.getJSON(getCommonDataUrl('NewsDeploy', { id: rowData.Id, fb: 0 }),
                        function (result) {
                            if (result.Succeed) {
                                $('#grid').omGrid('reload');
                            }
                        });
                }
            }
        }, { separtor: true }, {
            id: 'btnRefresh', label: '刷新', hint: '', icons: { leftCss: 'bdp-icons-refresh' },
            onClick: function (event) {
                $('#grid').omGrid('reload');
            }
        }]
    });
    //#endregion

    //#region 表格页

    $('#pfilter').css({ maxWidth: "650px" }).bdpEditPanel({
        columnCount: 3,
        gridLine: false,
        createErrorPlace: false,
        colModel: [{
            header: '查找', name: 'text', editor: { hint: '输入查询关键字，模糊匹配' }
        }, {
            header: '起始时间', name: 'ksrq', editor: { type: 'date', dateFormat: 'yy/mm/dd' }
        }, {
            header: '结束时间', name: 'jsrq', editor: { type: 'date', dateFormat: 'yy/mm/dd' }
        }]
    });

    $('#grid').omGrid({
        dataSource: getCommonDataUrl('NewsQuery'),
        keyFieldName: 'Id',
        autoFit: false,
        width: 'fit',
        height: 'fit',
        singleSelect: true,
        showIndex: true,
        editOnDblclick: false,
        colModel: [
            {
                header: '', name: 'Id', width: 30, align: 'center',
                renderer: function (v, rowData, rowIndex) {
                    return '<a class="view-notice" href="view.html?id=' + (v || '') + '" target="notice_viewer" style="cursor:pointer;" title="预览"><span class="bdp-icons-notice" style="width:19px;height:19px;display:inline-block"></span></a>';
                }
            },
            {
                header: '状态', name: 'NoticeState', width: 50, align: 'center',
                renderer: function (v, rowData, rowIndex) {
                    return v == 1 ? "已发布" : "草稿";
                }
            },
            { header: '标题', name: 'NoticeTitle', width: 'autoExpand' },
            { header: '类别', name: 'ClassText', width: 90, align: 'center' },
            { header: '时间', name: 'DeployTime', width: 140, align: 'center' },
            { header: '发布人', name: 'DeployUser', width: 90, align: 'center' }
        ],
        onSuccess: function (data, testStatus, XMLHttpRequest, event) {
        },
        onRefresh: function (nowPage, pageRecords, event) {
            setBtnStatus();
        },
        onRowSelect: function (rowIndex, rowData, event) {
            setBtnStatus();
        }
    });

    //#endregion

    //#region 编辑页
    var classUrl = getCommonDataUrl('BdpCodes', {
        type: 'Hongbin.Data.BdpBaseData.BdpCodeCommon',
        key: 'CodeValue', text: 'CodeText', order: 'CodeSeq',
        views: 'CodeId,CodeValue,CodeText',
        filter: "it.CodeKind='news' and it.CodeValue<>'-1'"
    });
    $('#pedbox').css({ maxWidth: 550 }).bdpEditPanel({
        columnCount: 3,
        gridLine: false,
        createErrorPlace: true,
        colModel: [{
            header: '标题', name: 'NoticeTitle',
            editor: { colspan: 3, rules: [['required', true, '标题不能为空！']] }
        }, {
            header: '分类', name: 'ClassText',
            editor: {
                type: 'combo', name: 'ClassCode', colspan: 2,
                options: {
                    dataSource: classUrl,
                    valueField: 'CodeValue',
                    optionField: 'CodeText',
                    inputField: 'CodeText'
                },
                rules: [['required', true, '分类不能为空！']]
            }
        }, {
            header: '', name: 'op',
            editor: {
                onCreateEditControl: function (ctrlId, cm, parent) {
                    return $('<a id="btnClsAdd"></a><a id="btnClsDel"></a>').appendTo(parent);
                }
            }
        }]
    });
    $('#btnClsAdd').omButton({
        hint: "增加分类", icons: { leftCss: 'bdp-icons-glyph-add' },
        onClick: function () {
            $.omMessageBox.prompt({
                content: '分类名称：',
                title: "新建分类",
                onClose: function (value) {
                    if ((value || '') != '') {
                        var ctrl = $('#pedbox').bdpEditPanel('findEditor', 'ClassCode');
                        var items = $(ctrl).omCombo('getData') || [];
                        if ($.grep(items, function (e) { return e.CodeText == value; }).length == 0) {
                            var obj = { CodeId: '', CodeKind: 'news', CodeText: value, CodeSeq: items.length + 1 };
                            obj.CodeValue = (obj.CodeSeq < 10 ? '0' : '') + obj.CodeSeq;
                            $.post(getCommonDataUrl('DEUpdate', { type: 'Hongbin.Data.BdpBaseData.BdpCodeCommon' }),
                                JSON.stringify([obj]),
                                function (result) {
                                    if (result.Succeed) {
                                        $(ctrl).omCombo('setData', classUrl);
                                    }
                                }, 'json');
                        }
                    }
                }
            });
        }
    });
    $('#btnClsDel').omButton({
        hint: "删除分类", icons: { leftCss: 'bdp-icons-glyph-delete' },
        onClick: function () {
            var code = $('#pedbox').bdpEditPanel('getValues').newValues.ClassCode || '';
            if (code != '') {
                var ctrl = $('#pedbox').bdpEditPanel('findEditor', 'ClassCode');
                var item = $.grep($(ctrl).omCombo('getData') || [], function (e) { return e.CodeValue == code; })[0];
                if (item) {
                    $.post(getCommonDataUrl('DEDelete', { type: 'Hongbin.Data.BdpBaseData.BdpCodeCommon' }),
                                JSON.stringify([item.CodeId]),
                                function (result) {
                                    if (result.Succeed) {
                                        $(ctrl).omCombo('setData', classUrl);
                                    }
                                }, 'json');
                }
            }
        }
    });

    //实例化编辑器
    //建议使用工厂方法getEditor创建和引用编辑器实例，如果在某个闭包下引用该编辑器，直接调用UE.getEditor('editor')就能拿到相关的实例
    var ue = UE.getEditor('editor', {
        //fullscreen:true,
        initialFrameWidth: "99%",
        toolbars: [[
            'fontfamily', 'fontsize', '|',
            'bold', 'italic', 'underline', '|',
            'forecolor', 'backcolor', 'formatmatch', '|',
            'justifyleft', 'justifycenter', 'justifyright', 'justifyjustify', '|',
            'simpleupload', 'insertimage', 'emotion', 'attachment', '|'

        ]]
    });

    //#endregion

    //#region 初始化
    cancelEdit();
    $(window).resize(function (e) {
        myresize();
    }).trigger('resize');

    function myresize() {
        if (isEditing()) {
            var maxHeight = $('#secEditor').innerHeight();
            //$('#editor').height(maxHeight - $('#pedbox').outerHeight());
            ue.setHeight(maxHeight - $('#pedbox').outerHeight() - 80);
            return;
        }
        var maxHeight = $('#secGrid').innerHeight();
        $('#pgrid').height(maxHeight - $('#pfilter').outerHeight());
        $("#grid").omGrid("resize");
    }
    function startEdit(isNew) {
        if (isNew) {
            $('#pedbox').bdpEditPanel('setValues', {});
            ue.setContent('', false);
            $('#secGrid').hide();
            $('#secEditor').show();
            myresize();
            setBtnStatus();
            return;
        }
        var rowData = $('#grid').omGrid('getSelections', true)[0];
        if (rowData) {
            $('#pedbox').bdpEditPanel('setValues', rowData);
            $.getJSON(getCommonDataUrl('NewsQueryContent', { id: rowData.Id || '' }),
                function (result) {
                    if (result.Succeed) {
                        ue.setContent(result.Data.content || '', false);
                    } else {
                        ue.setContent('', false);
                        $.omMessageTip.show({ content: '获取数据失败！' + (result.Message || ''), timeout: 3000 });
                    }
                    $('#secGrid').hide();
                    $('#secEditor').show();
                    myresize();
                    setBtnStatus();
                });
        }
    }
    function saveData() {
        if (!$('#pedbox').bdpEditPanel('valid')) {
            $.omMessageBox.alert({ content: '数据不正确！' });
            return;
        }
        var rowData = $('#pedbox').bdpEditPanel('getValues').newValues;
        rowData.NoticeContent = ue.getContent();
        rowData.ClassText = $('#pedbox_edit_ClassCode').val();
        $.post(getCommonDataUrl('NewsSave'), JSON.stringify(rowData),
            function (result) {
                if (result.Succeed) {
                    $('#grid').omGrid('reload');
                    cancelEdit();
                } else {
                    $.omMessageTip.show({ content: '保存数据失败！' + (result.Message || ''), timeout: 3000 });
                }
            }, 'json');
    }
    function cancelEdit() {
        $('#secGrid').show();
        $('#secEditor').hide();
        myresize();
        setBtnStatus();
    }
    function isEditing() {
        return $('#secEditor').is(':visible');
    }
    function setBtnStatus() {
        var editing = isEditing();
        var rows = $('#grid').omGrid('getData').rows ? $('#grid').omGrid('getSelections', true) : [];

        $('#btnSearch,#btnAdd,#btnRefresh').omButton(editing ? 'disable' : 'enable');
        $('#btnEdit,#btnDel').omButton(editing || rows.length == 0 ? 'disable' : 'enable');
        $('#btnSave,#btnCancel').omButton(!editing ? 'disable' : 'enable');
        var state = rows.length > 0 ? parseInt(rows[0].NoticeState) : 0;
        $('#btnDeploy').omButton(editing || rows.length == 0 || state != 0 ? 'disable' : 'enable');
        $('#btnUnDeploy').omButton(editing || rows.length == 0 || state == 0 ? 'disable' : 'enable');
    }
    function doSearch() {
        var values = $('#pfilter').bdpEditPanel('getValues').newValues;
        var args = { cxword: values.text || '' };
        if (values.ksrq) args.ksrq = $.omCalendar.formatDate(values.ksrq, 'yy-mm-dd');
        if (values.jsrq) args.jsrq = $.omCalendar.formatDate(values.jsrq, 'yy-mm-dd');
        $('#grid').omGrid({ extraData: args }).omGrid('reload');
    }
    //#endregion
});