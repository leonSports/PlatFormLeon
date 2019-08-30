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


$(document).ready(function () {
    //#region 工具条
    var setBtnStatus = function () {
        var kind = $('#edt_wfcls').omCombo('value') ? true : false,
            flow = $('#grid_flows').omGrid('getSelections'),
            node = $('#grid_nodes').omGrid('getSelections'),
            spr = $('#grid_spr').omGrid('getSelections'),
            tzr = $('#grid_tzr').omGrid('getSelections');
        $('#addFlow').omButton(kind ? 'enable' : 'disable');
        $('#editFlow,#delFlow,#nodeAdd').omButton(flow.length > 0 ? 'enable' : 'disable');
        $('#nodeEdit').omButton(node.length == 1 ? 'enable' : 'disable');
        $('#nodeDel,#sprAdd,#tzrAdd').omButton(node.length > 0 ? 'enable' : 'disable');
        $('#sprEdit,#sprDel').omButton(spr.length > 0 ? 'enable' : 'disable');
        $('#tzrEdit,#tzrDel').omButton(tzr.length > 0 ? 'enable' : 'disable');
    }

    $('#wfmenu').omButtonbar({
        btns: [{
            id: 'addFlow', icons: { leftCss: 'bdp-icons-add' }, label: '新建',
            onClick: function (event) {
                $('#grid_flows').omGrid('createNew');
            }
        }, {
            id: 'editFlow', icons: { leftCss: 'bdp-icons-edit' }, label: '修改',
            onClick: function (event) {
                $('#grid_flows').omGrid('startEdit');
            }
        }, {
            id: 'delFlow', icons: { leftCss: 'bdp-icons-delete' }, label: '删除',
            onClick: function (event) {
                var rs = $('#grid_flows').omGrid('getSelections', true);
                if (rs.length > 0) {
                    $.omMessageBox.confirm({
                        title: '确认删除',
                        content: '确定要删除选中的 ' + rs.length + ' 条流程吗？',
                        onClose: function (v) {
                            if (v) {
                                $('#grid_flows').omGrid('deleteSelections');
                            }
                        }
                    });
                }
            }
        }]
    });

    //#endregion

    //#region 布局
    $('#pcntr').omBorderLayout({
        fit: true,
        panels: [{
            id: 'ptop',
            region: 'north',
            resizable: true,
            collapsible: false,
            header: false,
            height: "40%"
        }, {
            id: 'pclt',
            region: 'center',
            header: false
        }],
        onAfterDrag: function (element, event) {
            $('#wftabs').omTabs('resize');
            $('#grid_flows,#grid_nodes,#grid_spr,#grid_tzr').omGrid('resize');
        }
    });
    $('#ptop').omBorderLayout({
        fit: true,
        panels: [{
            id: 'pwfcls',
            region: 'north',
            height: 50,
            header: false
        }, {
            id: 'pflows',
            region: 'center',
            resizable: false,
            collapsible: false,
            header: false
        }]
    });
    $('#pwfcls').css('padding', 7);

    $('#wftabs').omTabs({
        width: 'fit',
        height: 'fit'
    });
    $('#wftab1').omBorderLayout({
        fit: true,
        panels: [{
            id: 'pnodes', region: 'west', header: false, width: '60%', resizable: true
        }, {
            id: 'pspr_tzr', region: 'center', header: false
        }],
        onAfterDrag: function (element, event) {
            $('#sprtabs').omTabs('resize');
            $('#grid_nodes,#grid_spr,#grid_tzr').omGrid('resize');
        }
    });
    $('#sprtabs').omTabs({
        width: 'fit',
        height: 'fit',
        onActivate: function (n, event) {
            $(n > 0 ? '#grid_tzr' : 'grid_spr').omGrid('resize');
        }
    });
    //#endregion

    //#region 流程分类, 选择分类时刷新流程表格
    $('#edt_wfcls').omCombo({
        dataSource: getCommonDataUrl('BdpCodes', {
            type: 'Hongbin.WorkFlow.Model.BdpWfFlowCategory',
            key: 'CategoryId',
            text: 'Name',
            order: 'Code'
        }),
        inputField: 'Name',
        optionField: 'Name',
        valueField: 'CategoryId',
        editable: false,
        allowClearValue: false,
        dropGrid: true,
        onValueChange: function (target, newValue, oldValue, event) {
            var s = getCommonDataUrl('DEQuery', { type: "Hongbin.WorkFlow.Model.BdpWfFlow", filter: 'a.CategoryId="' + newValue + '"' });
            $('#grid_flows').omGrid('setData', s);
            setBtnStatus();
        }
    });
    // 流程分类新建按钮
    $('#btn_wfcls_add').addClass('bdp-icons-add')
        .css({ 'display': 'inline-block', 'width': '16px', 'height': '16px' })
        .attr('title', '增加流程分类')
        .click(function () {
            var dlg = $('#dlg-wfcls-add');
            if (dlg.length == 0) {
                dlg = $('<div></div>').prop('id', 'dlg-wfcls-add').appendTo('body');
                dlg.bdpEditor({
                    title: '新建流程分类',
                    width: 320,
                    editors: {
                        dataSource: { CategoryId: '', Name: '' },
                        colModel: [{
                            header: '分类名称', name: 'Name',
                            editor: { rules: [['required', true, '流程名称不能为空！']] }
                        }]
                    },
                    onBeforeSave: function (args) {
                        args.cancel = true;     //自己处理保存了
                        var s = getCommonDataUrl('DEUpdate', 'type=Hongbin.WorkFlow.Model.BdpWfFlowCategory');
                        jdpExec(s, args.values, function (ajaxResult) {
                            if (ajaxResult.Succeed) {
                                var s = getCommonDataUrl('BdpCodes', {
                                    type: 'Hongbin.WorkFlow.Model.BdpWfFlowCategory',
                                    key: 'CategoryId',
                                    text: 'Name',
                                    order: 'Code'
                                });
                                $('#edt_wfcls').omCombo('setData', s);
                                $('#dlg-wfcls-add').bdpEditor('close');
                            } else {
                                $.omMessageBox.alert({ content: '创建流程分类失败！' });
                            }
                        });
                    }
                });
            }
            dlg.bdpEditor('setData', {});
            dlg.bdpEditor('open');
        });
    // 流程分类删除按钮
    $('#btn_wfcls_del').addClass('bdp-icons-close')
        .css({ 'display': 'inline-block', 'width': '16px', 'height': '16px' })
        .attr('title', '删除流程分类')
        .click(function () {
            var id = $('#edt_wfcls').omCombo('value');
            if (id) {
                var data = $('#grid_flows').omGrid('getData');
                if (data.rows.length > 0) {
                    $.omMessageBox.alert({ content: '该分类下有' + data.rows.length + '个流程，不能删除！' })
                } else {
                    $.omMessageBox.confirm({
                        content: '你确定要删除吗？',
                        onClose: function (value) {
                            if (value) {
                                var s = getCommonDataUrl('DEDelete', { type: "Hongbin.WorkFlow.Model.BdpWfFlowCategory" });
                                var idArr = $.makeArray(id);
                                jdpExec(s, idArr, function (ajaxResult) {
                                    if (ajaxResult.Succeed) {
                                        var s = getCommonDataUrl('BdpCodes', {
                                            type: 'Hongbin.WorkFlow.Model.BdpWfFlowCategory',
                                            key: 'CategoryId',
                                            text: 'Name',
                                            order: 'Code'
                                        });
                                        $('#edt_wfcls').omCombo('setData', s);
                                    } else {
                                        $.omMessageBox.alert({ content: '删除失败！' });
                                    }
                                });
                            }
                        }
                    });
                }
            }
        });
    //#endregion

    //#region 流程表格
    $('#grid_flows').omGrid({
        //dataSource: getCommonDataUrl('DEQuery', { type: "Hongbin.WorkFlow.Model.BdpWfFlow", filter: 'a.CategoryId="-1"' }),
        keyFieldName: 'FlowId',
        autoFit: false,
        limit: 15,
        width: 'fit',
        height: 'fit',
        singleSelect: true,
        showIndex: true,
        editMode: 'dialog',
        editOnDblclick: true,
        editOptions: {
            title: '流程信息',
            width: '550px',
            editors: {
                isView: false,
                gridLine: true,
                height: 'auto',
                columnCount: 2
            },
            updateUrl: getCommonDataUrl('DEUpdate', 'type=Hongbin.WorkFlow.Model.BdpWfFlow'),
            onNewRecord: function (args) {
                args.record.CategoryId = $('#edt_wfcls').omCombo('value');
            }
        },
        method: 'POST',
        extraData: {
            recc: -1,

            esql: ''
        },
        onSuccess: function (data, testStatus, XMLHttpRequest, event) {
            this.omGrid('options').extraData.recc = data.total;
        },
        deleteUrl: getCommonDataUrl('DEDelete', 'type=Hongbin.WorkFlow.Model.BdpWfFlow'),
        onBeforeDelete: function (args) {
        },
        onAfterDelete: function () {
        },
        onRowSelect: function (rowIndex, rowData, event) {
            s = getCommonDataUrl('DEQuery', {
                type: "Hongbin.WorkFlow.Model.BdpWfFlowNode",
                orderby: "NodeOrder",
                filter: 'a.FlowId="' + rowData.FlowId + '"'
            }),
            $('#grid_nodes').omGrid('setData', s);
            setBtnStatus();
        },
        colModel: [{
            name: "FlowName",
            header: "流程名称",
            width: 150,
            editor: {
                index: 1, colspan: 2,
                name: "FlowName",
                editable: true,
                type: "text",
                rules: [['required', true, '流程名称不能为空！'], ["maxlength", 60, "流程名称超长！"]]
            }
        }, {
            name: "Description",
            header: "流程说明",
            width: "autoExpand",
            editor: {
                index: 2, colspan: 2,
                name: "Description",
                editable: true,
                type: "memo",
                rows: 7,
                rules: [["maxlength", 1000, "流程说明超长！"]]
            }
        }, {
            name: "BackToPrevenient",
            header: "逐级拒绝",
            width: "60px",
            align: "center",
            visible: true,
            renderer: function (v, rowData, rowIndex) {
                return v ? "√" : "×";
            },
            editor: {
                index: 4,
                name: "BackToPrevenient",
                caption: '是否逐级拒绝',
                editable: true,
                type: "checkbox"
            }
        }, {
            name: "AllowEdit",
            header: "允许编辑",
            width: "60px",
            align: "center",
            visible: true,
            renderer: function (v, rowData, rowIndex) {
                return v ? "√" : "×";
            },
            editor: {
                index: 5,
                name: "AllowEdit",
                editable: true,
                caption: '是否允许编辑',
                type: "checkbox",
                hint: "审批人在审批时是否允许修改单据"
            }
        }, {
            name: "AllowSelectNode",
            header: "允许选择",
            width: "60px",
            align: "center",
            visible: true,
            renderer: function (v, rowData, rowIndex) {
                return v ? "√" : "×";
            },
            editor: {
                index: 6,
                name: "AllowSelectNode",
                caption: '是否允许选择节点',
                editable: true,
                type: "checkbox"
            }
        }, {
            name: "PreserveTraces",
            header: "保存痕迹",
            width: "60px",
            align: "center",
            visible: true,
            renderer: function (v, rowData, rowIndex) {
                return v ? "√" : "×";
            },
            editor: {
                index: 7,
                name: "PreserveTraces",
                editable: true,
                type: "checkbox",
                hint: "弃核后是否保存痕迹"
            }
        }, {
            name: "EnableFlag",
            header: "是否启用",
            width: "60px",
            align: "center",
            renderer: function (v, rowData, rowIndex) {
                return v ? "√" : "×";
            },
            editor: {
                index: 8,
                name: "EnableFlag",
                editable: true,
                type: "checkbox"
            }
        }, {
            header: '分类', name: 'CategoryId', visible: false, editor: { index: -1 }
        }]
    });
    //#endregion

    //#region 流程节点表格
    $('#grid_nodes').omGrid({
        //dataSource: getCommonDataUrl('DEQuery', { type: "Hongbin.WorkFlow.Model.BdpWfFlowNode", filter: 'a.FlowId="-1"' }),
        keyFieldName: 'NodeId',
        autoFit: false,
        limit: 15,
        width: 'fit',
        height: 'fit',
        singleSelect: false,
        showIndex: true,
        toolbar: {
            btns: [{
                id: 'nodeAdd', icons: { leftCss: 'bdp-icons-add' }, label: '增加',
                onClick: function (event) {
                    $('#grid_nodes').omGrid('createNew');
                }
            }, {
                id: 'nodeEdit', icons: { leftCss: 'bdp-icons-edit' }, label: '编辑',
                onClick: function (event) {
                    $('#grid_nodes').omGrid('startEdit');
                }
            }, {
                id: 'nodeDel', icons: { leftCss: 'bdp-icons-delete' }, label: '删除',
                onClick: function (event) {
                    var rs = $('#grid_nodes').omGrid('getSelections', true);
                    if (rs.length > 0) {
                        $.omMessageBox.confirm({
                            title: '确认删除',
                            content: '确定要删除选中的 ' + rs.length + ' 条流程节点吗？',
                            onClose: function (v) {
                                if (v) {
                                    $('#grid_nodes').omGrid('deleteSelections');
                                }
                            }
                        });
                    }
                }
            }]
        },
        editMode: 'dialog',
        editOnDblclick: true,
        editOptions: {
            title: '流程节点',
            width: '450px',
            editors: {
                isView: false,
                gridLine: true,
                height: 'auto',
                columnCount: 2
            },
            updateUrl: getCommonDataUrl('DEUpdate', 'type=Hongbin.WorkFlow.Model.BdpWfFlowNode'),
            onNewRecord: function (args) {
                var flows = $('#grid_flows').omGrid('getSelections', true);
                if (flows.length > 0) args.record.FlowId = flows[0].FlowId;
            }
        },
        method: 'POST',
        extraData: {
            recc: -1,

            esql: ''
        },
        onSuccess: function (data, testStatus, XMLHttpRequest, event) {
            this.omGrid('options').extraData.recc = data.total;
        },
        deleteUrl: getCommonDataUrl('DEDelete', 'type=Hongbin.WorkFlow.Model.BdpWfFlowNode'),
        onBeforeDelete: function (args) {
        },
        onAfterDelete: function () {
        },
        onRowClick: function (rowIndex, rowData, event) {
            s = getCommonDataUrl('WfQueryAuditors', 'nodeid=' + rowData.NodeId);
            $('#grid_spr').omGrid('setData', s);
            s = getCommonDataUrl('WfQueryNotifyPersons', 'nodeid=' + rowData.NodeId);
            $('#grid_tzr').omGrid('setData', s);
            setBtnStatus();
        },
        colModel: [{
            name: "FlowId",
            header: "审批流ID",
            width: "60px",
            visible: false,
            editor: { index: -1, }
        }, {
            name: "NodeOrder",
            header: "序号",
            width: "60px",
            align: "center",
            editor: {
                index: 2,
                name: "NodeOrder",
                editable: true,
                caption: "\u003cb\u003e节点序号\u003c/b\u003e",
                type: "number",
                hint: "同一流程下的节点序号是唯一的",
                rules: [["required", true, "节点序号不能为空！"]]
            }
        }, {
            name: "NodeName",
            header: "名称",
            width: "autoExpand",
            editor: {
                index: 1,
                name: "NodeName",
                editable: true,
                colspan: 2,
                type: "text",
                rules: [["required", true, "节点名称不能为空！"], ["maxlength", 50, "节点名称超长！"]]
            }
        }, {
            name: "AuditMode",
            header: "模式",
            width: "60px",
            align: "center",
            renderer: function (v, rowData, rowIndex) {
                return v == 0 ? "抢先" : "会签";
            },
            editor: {
                index: 6,
                name: "AuditMode",
                editable: true,
                colspan: 1,
                //type: "combo",
                hint: "如果该节点有多个审批人，确定他们是抢先审批还是会签审批.\r\n0:抢先;1:会签",
                onCreateEditControl: function (ctrlId, cm, parent) {
                    return $('<div></div>').prop('id', ctrlId).appendTo(parent)
                        .append('<span style="display:inline-block;">' +
                            '<input type="radio" value="0" id="' + ctrlId + '_0" name="AuditMode" />' +
                            '<label for="' + ctrlId + '_0">&nbsp;抢先</label></span>' +
                            '<span style="display:inner-block; padding-left: 22px;">' +
                            '<input type="radio" value="1" id="' + ctrlId + '_1" name="AuditMode" />' +
                            '<label for="' + ctrlId + '_1">&nbsp;会签</label></span>'
                        );
                },
                onSetValue: function (cm, value) {
                    var v = parseInt(value) || 0;
                    $('input[name="AuditMode"]').eq(v).attr('checked', 'checked');
                },
                onGetValue: function (cm) {
                    return $('input[name="AuditMode"]').eq(0).propAttr('checked') ? 0 : 1;
                }
            }
        }, {
            name: "AllowSelectAuditor",
            header: "允许选择",
            width: "60px",
            align: "center",
            renderer: function (v, rowData, rowIndex) {
                return v ? "√" : "×";
            },
            editor: {
                index: 7,
                name: "AllowSelectAuditor",
                editable: true,
                type: "checkbox",
                hint: "是否允许在发起流程节点时选定审批人.如果不允许，但某一节点有多个审批人，则视为多人审批\r\n"
            }
        }, {
            name: "AllowTerminate",
            header: "允许终止",
            width: "60px",
            align: "center",
            renderer: function (v, rowData, rowIndex) {
                return v ? "√" : "×";
            },
            editor: {
                index: 8,
                name: "AllowTerminate",
                editable: true,
                type: "checkbox"
            }
        }, {
            name: "AllowEdit",
            header: "允许修改",
            width: "60px",
            align: "center",
            visible: true,
            renderer: function (v, rowData, rowIndex) {
                return v ? "√" : "×";
            },
            editor: {
                index: 5,
                name: "AllowEdit",
                editable: true,
                type: "checkbox",
                hint: "是否允许该节点的审批人修改单据内容"
            }
        }, {
            name: "NextNodeOrder",
            header: "下节点序号",
            width: "60px",
            align: "right",
            visible: false,
            editor: {
                index: 9,
                name: "NextNodeOrder",
                editable: true,
                type: "number"
            }
        }, {
            name: "NextNodeExp",
            header: "下节点公式",
            width: "60px",
            visible: false,
            editor: {
                index: 10,
                name: "NextNodeExp",
                editable: true,
                colspan: 2,
                type: "memo",
                hint: "下一流程节点序号的计算公式，返回流程序号, 数值型",
                rows: 9,
                rules: [["maxlength", 500, "下一流程公式超长！"]]
            }
        }, {
            name: "NotifyAttn",
            header: "通知经办人",
            width: "60px",
            align: "center",
            renderer: function (v, rowData, rowIndex) {
                return v ? "√" : "×";
            },
            editor: {
                index: 11,
                name: "NotifyAttn",
                editable: true,
                type: "checkbox",
                hint: "该节点处理时是否通知相关经办人，包括流程发起者、已流转节点的审批人\r\n是否通知已流转节点的审批人？"
            }
        }, {
            name: "NotifyMode",
            header: "通知方式",
            width: "60px",
            align: "center",
            renderer: function (v, rowData, rowIndex) {
                return v == 0 ? "主页消息" : v == 1 ? "EMail" : "SMS";
            },
            editor: {
                index: 12,
                name: "NotifyMode",
                editable: true,
                type: "combo",
                hint: "0 主页消息\r\n1 邮件\r\n2 手机短信\r\n",
                options: {
                    dataSource: [
                        { text: '主页消息', value: '0' },
                        { text: '邮件', value: '1' },
                        { text: '手机短信', value: '2' },
                    ]
                }
            }
        }]
    });

    //#endregion

    //#region 审批人和通知人的类别发生变量化，重新创建参照框.
    // ctrl为bdpReferEdit
    var recreateReferBox = function (ctrl, IsRole) {
        $(ctrl).bdpReferEdit('reCreateDialog', IsRole);
    }
    $.omWidget.addInitListener('bdp.bdpReferEdit', function () {
        var self = this;
        $.extend(this, {
            reCreateDialog: function (IsRole) {
                var ops = this.options, dlgId = ops.dialogId;
                ops.mode = 'pick';
                if (IsRole) {
                    ops.valueField = "id";
                    ops.textField = "text";
                    ops.editOptions = {
                        title: '选择角色',
                        width: 650,
                        height: 450,
                        // 是否快速搜索
                        allowQuickSearch: false,
                        // 是否单选
                        singleSelect: true,
                        // 过滤串参数名
                        qnSearch: "filter",
                        // 树节点id的参数名
                        qnTreeId: 'id',
                        // 树节点上级id的参数名
                        qnTreePid: 'pid',
                        treeDataSource: getCommonDataUrl("getRoleTreeData"),
                        tree: {
                            // 有tree表示要显示左边的树，其它参数不用设置，如果设了将原来传给omTree控件
                            simpleDataModel: true
                        },
                        onCloseQuery: function (sender) {
                            if (sender.isSureClosed()) {
                                var nodes = sender.getSelections();
                                if (nodes.length < 1 || nodes[0].classes != 'role') {
                                    $.omMessageBox.alert({ content: '请选择一个角色！' });
                                    return false;
                                }
                            }
                        }
                    }
                } else {
                    ops.valueField = "UserId";
                    ops.textField = "UserName";
                    ops.editOptions = {
                        title: '选择用户',
                        width: 650,
                        height: 450,
                        // 是否快速搜索
                        allowQuickSearch: true,
                        // 是否单选
                        singleSelect: true,
                        // 过滤串参数名
                        qnSearch: "filter",
                        // 树节点id的参数名
                        qnTreeId: 'id',
                        // 树节点上级id的参数名
                        qnTreePid: 'pid',
                        // 表格主键字段名
                        qnGridKey: 'UserId',
                        // 是否包括下级标志的参数名,1为包括下级。
                        qnSub: 'sub',
                        treeDataSource: getCommonDataUrl("getUserClassifyData"),
                        gridDataSource: getCommonDataUrl("getUsers"),
                        tree: {
                            // 有tree表示要显示左边的树，其它参数不用设置，如果设了将原来传给omTree控件
                            simpleDataModel: true
                        },
                        grid: {
                            // 有grid表示要显示右边的表格，其它参数不用设置，如果设了将原来传给omGrid控件
                            autoFit: true,
                            height: 'fit',
                            width: 'fit',
                            // 一般应该要有列模型
                            colModel: [
                                { header: '帐户', name: 'UserName', width: 100, align: 'center' },
                                { header: '姓名', name: 'RealName', width: 100, align: 'center' },
                                { header: '单位', name: 'CompanyName', width: 200, align: 'center' },
                                { header: '部门', name: 'DeptName', width: 'autoExpand', align: 'center' }
                            ],
                            // 小技巧，避免调整前面的参数多了逗号
                            done: true
                        },
                        onBeforeRequestData: function (args, node, forGrid) {
                            if (forGrid) {
                                args.dwid = node.id;
                                args.bmid = '';
                                if (node.classes == 'dept') {
                                    args.dwid = node.tag;
                                    args.bmid = node.id;
                                }
                            } else {
                                args.dwid = node.classes == 'company' ? node.id : node.tag;
                                args.bmid = node.classes == 'company' ? '' : node.id;
                            }
                        },
                        onCloseQuery: function (sender) {
                            if (sender.isSureClosed()) {
                                var nodes = sender.getSelections();
                                if (nodes.length < 1) {
                                    $.omMessageBox.alert({ content: '请选择一个用户！' });
                                    return false;
                                }
                            }
                        }
                    }
                }

                if (self.editor) {
                    self.editor.remove();
                    self.editor = null;
                }
                if (self.dialog) {
                    self.dialog.remove();
                    self.dialog = null;
                }
            }
        });
    });
    //#endregion

    //#region 审批人
    $('#grid_spr').omGrid({
        keyFieldName: 'AuditPersonId',
        autoFit: false,
        limit: 15,
        width: 'fit',
        height: 'fit',
        singleSelect: true,
        showIndex: true,
        toolbar: {
            btns: [{
                id: 'sprAdd', icons: { leftCss: 'bdp-icons-add' }, label: '增加',
                onClick: function (event) {
                    $('#grid_spr').omGrid('createNew');
                }
            }, {
                id: 'sprEdit', icons: { leftCss: 'bdp-icons-edit' }, label: '编辑',
                onClick: function (event) {
                    $('#grid_spr').omGrid('startEdit');
                }
            }, {
                id: 'sprDel', icons: { leftCss: 'bdp-icons-delete' }, label: '删除',
                onClick: function (event) {
                    var rs = $('#grid_spr').omGrid('getSelections', true);
                    if (rs.length > 0) {
                        $.omMessageBox.confirm({
                            title: '确认删除',
                            content: '确定要删除选中的 ' + rs.length + ' 条流程审批人吗？',
                            onClose: function (v) {
                                if (v) {
                                    $('#grid_spr').omGrid('deleteSelections');
                                }
                            }
                        });
                    }
                }
            }]
        },
        editMode: 'dialog',
        editOnDblclick: true,
        editOptions: {
            title: '审批人',
            width: '450px',
            editors: {
                isView: false,
                gridLine: true,
                height: 'auto',
                columnCount: 1
            },
            updateUrl: getCommonDataUrl('DEUpdate', 'type=Hongbin.WorkFlow.Model.BdpWfAuditPerson'),
            onNewRecord: function (args) {
                var nodes = $('#grid_nodes').omGrid('getSelections', true);
                if (nodes.length > 0) args.record.NodeId = nodes[0].NodeId;
            }
        },
        method: 'POST',
        onSuccess: function (data, testStatus, XMLHttpRequest, event) {
            this.omGrid('options').extraData.recc = data.total;
        },
        deleteUrl: getCommonDataUrl('DEDelete', 'type=Hongbin.WorkFlow.Model.BdpWfAuditPerson'),
        onBeforeDelete: function (args) {
        },
        onAfterDelete: function () {
        },
        onRowSelect: function (rowIndex, rowData, event) {
            setBtnStatus();
        },
        colModel: [{
            header: '类别', name: 'AuditorKindText', width: 60,
            editor: {
                type: 'text',
                name: 'AuditorKind',
                onCreateEditControl: function (ctrlId, cm, parent) {
                    var c = $('<div></div>').prop('id', ctrlId).appendTo(parent)
                        .append('<span style="display:inline-block;">' +
                            '<input type="radio" value="0" id="' + ctrlId + '_0" name="AuditorKind" />' +
                            '<label for="' + ctrlId + '_0">&nbsp;用户</label></span>' +
                            '<span style="display:inner-block; padding-left: 22px;">' +
                            '<input type="radio" value="1" id="' + ctrlId + '_1" name="AuditorKind" />' +
                            '<label for="' + ctrlId + '_1">&nbsp;角色</label></span>'
                        );
                    $('input[name="AuditorKind"]', c).change(function () {
                        var ctrl = $('#grid_spr').omGrid('findEditor', 'AuditorValue'),
                            IsRole = $('input[id$="AuditorKind_1"]').propAttr('checked') ? true : false;
                        recreateReferBox(ctrl, IsRole);
                        var ec = $('#grid_spr').omGrid('findEditCtrl', 'AuditorValue');
                        $(ec).bdpEditCtrl('value', '');
                    });
                    return c;
                },
                onSetValue: function (cm, value) {
                    var id = 'AuditorKind_' + (value || '0');
                    $('input[id$="' + id + '"]').propAttr('checked', true);
                    var ctrl = $('#grid_spr').omGrid('findEditor', 'AuditorValue'),
                        IsRole = value == 1;
                    recreateReferBox(ctrl, IsRole);
                },
                onGetValue: function (cm) {
                    return $('input[name="AuditorKind"]').eq(0).propAttr('checked') ? 0 : 1;
                }
            }
        }, {
            header: '名称', name: 'AuditorValueText', width: 120,
            editor: {
                name: 'AuditorValue',
                type: 'refer',
                options: {
                    allowInput: false
                }
            }
        }, {
            header: '适用条件', name: 'AuditorCondition', width: 'autoExpand',
            editor: {
                type: 'memo',
                rows: 13
            }
        }]
    });
    //#endregion

    //#region 通知人
    $('#grid_tzr').omGrid({
        keyFieldName: 'NotifyPersonId',
        autoFit: false,
        limit: 15,
        width: 'fit',
        height: 'fit',
        singleSelect: true,
        showIndex: true,
        toolbar: {
            btns: [{
                id: 'tzrAdd', icons: { leftCss: 'bdp-icons-add' }, label: '增加',
                onClick: function (event) {
                    $('#grid_tzr').omGrid('createNew');
                }
            }, {
                id: 'tzrEdit', icons: { leftCss: 'bdp-icons-edit' }, label: '编辑',
                onClick: function (event) {
                    $('#grid_tzr').omGrid('startEdit');
                }
            }, {
                id: 'tzrDel', icons: { leftCss: 'bdp-icons-delete' }, label: '删除',
                onClick: function (event) {
                    var rs = $('#grid_tzr').omGrid('getSelections', true);
                    if (rs.length > 0) {
                        $.omMessageBox.confirm({
                            title: '确认删除',
                            content: '确定要删除选中的 ' + rs.length + ' 条流程通知人吗？',
                            onClose: function (v) {
                                if (v) {
                                    $('#grid_tzr').omGrid('deleteSelections');
                                }
                            }
                        });
                    }
                }
            }]
        },
        editMode: 'dialog',
        editOnDblclick: true,
        editOptions: {
            title: '通知人',
            width: '450px',
            editors: {
                isView: false,
                gridLine: true,
                height: 'auto',
                columnCount: 1
            },
            updateUrl: getCommonDataUrl('DEUpdate', 'type=Hongbin.WorkFlow.Model.BdpWfNotifyPerson'),
            onNewRecord: function (args) {
                var nodes = $('#grid_nodes').omGrid('getSelections', true);
                if (nodes.length > 0) args.record.NodeId = nodes[0].NodeId;
            }
        },
        method: 'POST',
        onSuccess: function (data, testStatus, XMLHttpRequest, event) {
            this.omGrid('options').extraData.recc = data.total;
        },
        deleteUrl: getCommonDataUrl('DEDelete', 'type=Hongbin.WorkFlow.Model.BdpWfNotifyPerson'),
        onBeforeDelete: function (args) {
        },
        onAfterDelete: function () {
        },
        onRowSelect: function (rowIndex, rowData, event) {
            setBtnStatus();
        },
        colModel: [{
            header: '类别', name: 'NotifyKindText', width: 60,
            editor: {
                type: 'text',
                name: 'NotifyKind',
                onCreateEditControl: function (ctrlId, cm, parent) {
                    var c = $('<div></div>').prop('id', ctrlId).appendTo(parent)
                       .append('<span style="display:inline-block;">' +
                           '<input type="radio" value="0" id="' + ctrlId + '_0" name="NotifyKind" />' +
                           '<label for="' + ctrlId + '_0">&nbsp;用户</label></span>' +
                           '<span style="display:inner-block; padding-left: 22px;">' +
                           '<input type="radio" value="1" id="' + ctrlId + '_1" name="NotifyKind" />' +
                           '<label for="' + ctrlId + '_1">&nbsp;角色</label></span>'
                       );
                    $('input[name="NotifyKind"]', c).change(function () {
                        var ctrl = $('#grid_tzr').omGrid('findEditor', 'NotifyKind'),
                            IsRole = $('input[id$="NotifyKind_1"]').propAttr('checked') ? true : false;
                        recreateReferBox(ctrl, IsRole);
                        var ec = $('#grid_tzr').omGrid('findEditCtrl', 'NotifyKind');
                        $(ec).bdpEditCtrl('value', '');
                    });
                    return c;
                },
                onSetValue: function (cm, value) {
                    var id = 'NotifyKind_' + value;
                    $('input[id$="' + id + '"]').propAttr('checked', true);
                    var ctrl = $('#grid_tzr').omGrid('findEditor', 'NotifyKind'),
                        IsRole = value == 1;
                    recreateReferBox(ctrl, IsRole);
                },
                onGetValue: function (cm) {
                    return $('input[name="NotifyKind"]').eq(0).propAttr('checked') ? 0 : 1;
                }
            }
        }, {
            header: '名称', name: 'NotifyValueText', width: 120,
            editor: {
                name: 'NotifyValue',
                type: 'refer',
                options: {
                    allowInput: false
                }
            }
        }, {
            header: '适用条件', name: 'NotifyCondition', width: 'autoExpand',
            editor: {
                type: 'memo',
                rows: 13
            }
        }]
    });
    //#endregion

    setBtnStatus();
    $(window).resize(function () {
        $('#pcntr').omBorderLayout('resize');
        $('#ptop').omBorderLayout('resize');
        $('#wftabs').omTabs('resize');
        $('#wftab1').omBorderLayout('resize');
        $('#sprtabs').omTabs('resize');
        $('#grid_flows,#grid_nodes,#grid_spr,#grid_tzr').omGrid('resize');
    })
    $(window).resize();

});