<%@ Page Title="" Language="C#" MasterPageFile="~/Frame/Master/SingleTable.Master" AutoEventWireup="true" CodeBehind="WfAuditObj.aspx.cs" Inherits="Hongbin.Web.Frame.Wf.WfAuditObj" %>

<asp:Content ID="Content1" ContentPlaceHolderID="PlaceCss" runat="server">
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="head" runat="server">
    <script type="text/javascript">
        $(document).ready(function () {

            //#region 菜单
            var setBtnStatus = function () {
                var editing = $('#grid').omGrid("isEditing"),
                    isMultiRowEditing = $('#grid').omGrid('options').editMode == 'multirow',
                    rows = $('#grid').omGrid('getSelections');
                $('#add').omButton(!isMultiRowEditing && editing ? 'disable' : 'enable');
                $("#opt,#refresh").omButton(editing ? 'disable' : 'enable');
                $("#addCopy,#edit,#del").omButton(editing || rows.length == 0 ? 'disable' : 'enable');
                var item = $('#opt-menu').omMenu('findItem', '007');
                $('#edit').omButton(editing || (!item.checked && rows.length == 0) ? 'disable' : 'enable');
                if (item && item.checked) {
                    $("#save,#cancel").closest('.om-btn').show();
                    $("#save,#cancel").omButton(!editing ? 'disable' : 'enable');
                } else {
                    $("#save,#cancel").closest('.om-btn').hide();
                }
            };

            $("#menu").omButtonbar({
                btns: [{
                    id: "add",
                    label: "新增",
                    icons: { left: getImageUrl('add') },
                    onClick: function (event) {
                        var isMultiRowEditing = $('#grid').omGrid('options').editMode == 'multirow';
                        if (!isMultiRowEditing) {
                            $('#grid').omGrid('createNew', false);
                        } else {
                            $('#grid').omGrid('appendRows', 5);
                        }
                    }
                }, {
                    id: "addCopy",
                    label: "复制",
                    icons: { left: getImageUrl('add') },
                    onClick: function (event) {
                        $('#grid').omGrid('createNew', true);
                    }
                }, {
                    id: "edit",
                    label: "修改",
                    icons: { left: getImageUrl('modify') },
                    onClick: function (event) {
                        $('#grid').omGrid('startEdit');
                    }
                }, {
                    id: "del",
                    label: "删除",
                    icons: { left: getImageUrl('del') },
                    onClick: function (event) {
                        var rs = $('#grid').omGrid('getSelections', true);
                        if (rs.length > 0) {
                            $.omMessageBox.confirm({
                                title: '确认删除',
                                content: '确定要删除选中的 ' + rs.length + ' 条数据吗？',
                                onClose: function (v) {
                                    if (v) {
                                        $('#grid').omGrid('deleteSelections');
                                    }
                                }
                            });
                        }
                    }
                },
                {
                    id: "save",
                    label: "保存",
                    icons: { left: getImageUrl('save') },
                    onClick: function (event) {
                        $('#grid').omGrid('updateEdit');
                    }
                },
                {
                    id: "cancel",
                    label: "取消",
                    icons: { left: getImageUrl('cancel') },
                    onClick: function (event) {
                        $('#grid').omGrid('cancelEdit');
                    }
                },
                { separtor: true },
                {
                    id: "opt",
                    label: "选项",
                    icons: { right: getImageUrl('down.png') },
                    onClick: function (event) {
                        $('#opt-menu').omMenu("show", this);
                    }
                },
                { separtor: true }, {
                    id: "refresh",
                    label: "刷新",
                    icons: { left: getImageUrl('refresh') },
                    onClick: function (event) {
                        $('#grid').omGrid('reload');
                    }
                }, { separtor: true }, {
                    id: "export",
                    label: "导出",
                    icons: { left: getImageUrl('excel.jpg') },
                    onClick: function (event) {
                        $("#grid").omGrid('toExcel');
                    }
                }]

            });
            if ($('#opt-menu').length == 0) {
                $('body').append($('<div id="opt-menu" style="z-index: 2000;"></div>'));
            }
            $('#opt-menu').omMenu({
                minWidth: 150,
                maxWidth: 200,
                dataSource: [
                    { id: '001', label: '显示行号', icon: '#', seperator: true, checked: true },
                    { id: '002', label: '单选', icon: '#', checked: false, group: 'selmode' },
                    { id: '003', label: '多选', icon: '#', checked: true, group: 'selmode', seperator: true },
                    {
                        id: '004', label: '编辑模式',
                        children: [
                            { id: '005', label: '行内编辑', icon: '#', checked: false, group: 'editmode' },
                            { id: '006', label: '弹出对话框', icon: '#', checked: true, group: 'editmode' },
                            { id: '007', label: '多行编辑', icon: '#', checked: false, group: 'editmode' }
                        ]

                    }
                ],
                onSelect: function (item, event) {
                    var gridOptions = {};// $('#grid').omGrid('options');
                    switch (item.id) {
                        case '001':
                            gridOptions.showIndex = item.checked;
                            break;
                        case '002':
                            gridOptions.singleSelect = true;
                            break;
                        case '003':
                            gridOptions.singleSelect = false;
                            break;
                        case '005':
                            gridOptions.editMode = 'rowpanel';
                            break;
                        case '006':
                            gridOptions.editMode = 'dialog';
                            break;
                        case '007':
                            gridOptions.editMode = 'multirow';
                            break;
                        default:
                            return;
                    }
                    $('#grid').omGrid(gridOptions);
                    setBtnStatus();
                }

            });
            //#endregion

            //#region 用户表格
            $("#grid").omGrid({
                dataSource: getCommonDataUrl('DEQuery', 'type=Hongbin.WorkFlow.Model.BdpWfBillKind&orderby=BillKindName'),
                keyFieldName: 'BillKindId',
                autoFit: false,
                limit: 15,
                width: 'fit',
                height: 'fit',
                singleSelect: false,
                showIndex: true,
                editMode: 'dialog',
                editOnDblclick: true,
                editOptions: {
                    title: '审批对象',
                    width: 650,
                    editors: {
                        isView: false,
                        gridLine: true,
                        height: 'auto',
                        columnCount: 1
                    },
                    updateUrl: getCommonDataUrl('DEUpdate', 'type=Hongbin.WorkFlow.Model.BdpWfBillKind'),
                    onNewRecord: function (args) {

                    }
                },
                method: 'POST',
                deleteUrl: getCommonDataUrl('DEDelete', 'type=Hongbin.WorkFlow.Model.BdpWfBillKind'),

                //singleSelect: true,
                onRowClick: function (rowIndex, rowData, event) {
                    setBtnStatus();
                },
                onStartEdit: function () {
                    setBtnStatus();
                },
                onCancelEdit: function () {
                    setBtnStatus();
                },
                colModel: [{
                    name: "BillKindName", sort: 'serverSide',
                    header: "名称",
                    width: 110,
                    editor: {
                        index: 1,
                        name: "BillKindName",
                        editable: true,
                        type: "text",
                        rules: [["maxlength", 50, "单据类别名称超长！"]]
                    }
                }, {
                    name: "AuditUrl", sort: 'serverSide',
                    header: "审批地址",
                    width: 260,
                    editor: {
                        index: 2,
                        name: "AuditUrl",
                        editable: true,
                        type: "text",
                        rules: [["maxlength", 200, "审核页面地址超长！"]]
                    }
                }, {
                    name: "ViewUrl", sort: 'serverSide',
                    header: "查看地址",
                    width: "autoExpand",
                    editor: {
                        index: 3,
                        name: "ViewUrl",
                        hint: '对象查看地址，可使用{oid}代表对象的主键值, 如：id={oid}。',
                        editable: true,
                        type: "text",
                        rules: [["maxlength", 200, "查看地址超长！"]]
                    }
                }, {
                    name: "BillTableName", sort: 'serverSide',
                    header: "实体类名",
                    width: 250,
                    editor: {
                        index: 4,
                        name: "BillTableName",
                        editable: true,
                        type: "combo",
                        hint: "实体类名",
                        rules: [["maxlength", 150, "单据表名超长！"]],
                        options: {
                            dataSource: getCommonDataUrl('BdpEntityTypeNames'),
                            inputField: 'value',
                            valueField: 'value',
                            optionField: 'text'
                        },
                        onValueChanged: function (target, newValue, oldValue) {
                            var dsUrl = getCommonDataUrl('BdpTypeProperties', 'type=' + newValue);
                            var coFldKey = $('#grid').omGrid('findEditor', 'FldKey'),
                                coFldLabel = $('#grid').omGrid('findEditor', 'FldLabel'),
                                coFldAuditPerson = $('#grid').omGrid('findEditor', 'FldAuditPerson'),
                                coFldAuditDate = $('#grid').omGrid('findEditor', 'FldAuditDate'),
                                coFldAuditOpinion = $('#grid').omGrid('findEditor', 'FldAuditOpinion'),
                                coFldAuditState = $('#grid').omGrid('findEditor', 'FldAuditState');

                            if (coFldKey) coFldKey.omCombo('setData', dsUrl);
                            if (coFldLabel) coFldLabel.omCombo('setData', dsUrl);
                            if (coFldAuditPerson) coFldAuditPerson.omCombo('setData', dsUrl);
                            if (coFldAuditDate) coFldAuditDate.omCombo('setData', dsUrl);
                            if (coFldAuditOpinion) coFldAuditOpinion.omCombo('setData', dsUrl);
                            if (coFldAuditState) coFldAuditState.omCombo('setData', dsUrl);
                        }
                    }
                }, {
                    name: "FldKey", sort: 'serverSide',
                    header: "主键字段名",
                    width: "60px",
                    visible: false,
                    editor: {
                        index: 5,
                        name: "FldKey",
                        editable: true,
                        type: "combo",
                        rules: [["maxlength", 50, "主键字段名超长！"]],
                        options: {
                            inputField: 'value',
                            valueField: 'value',
                            optionField: 'text'
                        }
                    }
                }, {
                    name: "FldLabel", sort: 'serverSide',
                    header: "显示标签字段名",
                    width: "60px",
                    visible: false,
                    editor: {
                        index: 6,
                        name: "FldLabel",
                        editable: true,
                        type: "combo",
                        rules: [["maxlength", 50, "标签字段名超长！"]],
                        options: {
                            inputField: 'value',
                            valueField: 'value',
                            optionField: 'text'
                        }
                    }
                }, {
                    name: "FldAuditPerson", sort: 'serverSide',
                    header: "执行人字段名",
                    width: "60px",
                    visible: false,
                    editor: {
                        index: 7,
                        name: "FldAuditPerson",
                        editable: true,
                        type: "combo",
                        rules: [["maxlength", 50, "审核人字段名超长！"]],
                        options: {
                            inputField: 'value',
                            valueField: 'value',
                            optionField: 'text'
                        }
                    }
                }, {
                    name: "FldAuditDate", sort: 'serverSide',
                    header: "日期字段名",
                    width: "60px",
                    visible: false,
                    editor: {
                        index: 8,
                        name: "FldAuditDate",
                        editable: true,
                        type: "combo",
                        rules: [["maxlength", 50, "审核日期字段超长！"]],
                        options: {
                            inputField: 'value',
                            valueField: 'value',
                            optionField: 'text'
                        }
                    }
                }, {
                    name: "FldAuditOpinion", sort: 'serverSide',
                    header: "意见字段名",
                    width: "60px",
                    visible: false,
                    editor: {
                        index: 9,
                        name: "FldAuditOpinion",
                        editable: true,
                        type: "combo",
                        rules: [["maxlength", 50, "审核意见字段名超长！"]],
                        options: {
                            inputField: 'value',
                            valueField: 'value',
                            optionField: 'text'
                        }
                    }
                }, {
                    name: "FldAuditState", sort: 'serverSide',
                    header: "状态字段名",
                    width: "60px",
                    visible: false,
                    editor: {
                        index: 10,
                        name: "FldAuditState",
                        editable: true,
                        type: "combo",
                        rules: [["maxlength", 50, "审核状态字段名超长！"]],
                        options: {
                            inputField: 'value',
                            valueField: 'value',
                            optionField: 'text'
                        }
                    }
                }]
            });
            //#endregion

            $(window).resize(function (e) {
                $("#grid").omGrid("resize");
            });
            // 设置一次按钮状态
            setBtnStatus();
        });
    </script>
</asp:Content>
<asp:Content ID="Content3" ContentPlaceHolderID="PlaceToolbar" runat="server">
    <div id="menu"></div>
</asp:Content>
<asp:Content ID="Content4" ContentPlaceHolderID="PlaceSearch" runat="server">
</asp:Content>
<asp:Content ID="Content5" ContentPlaceHolderID="PlaceContent" runat="server">
    <table id="grid"></table>
</asp:Content>
