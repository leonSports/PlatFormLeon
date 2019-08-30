<%@ Page ValidateRequest="false" Title="" Language="C#" MasterPageFile="~/Frame/Master/SingleTable.Master" AutoEventWireup="true" CodeBehind="GridEditor.aspx.cs" Inherits="Hongbin.Web.Frame.editor.GridEditor" %>

<asp:Content ID="Content1" ContentPlaceHolderID="PlaceCss" runat="server">
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="head" runat="server">
    <script type="text/javascript">
        $(document).ready(function () {

            //#region 菜单
            var setBtnStatus = function () {
                var editing = $('#grid').omGrid("isEditing"),
                    editmode = $('#grid').omGrid('options').editMode,   // rowpanel,multirow,dialog,fixpanel
                    isMultiRowEditing = editmode == 'multirow',
                    rows = $('#grid').omGrid('getSelections');

                $('#add').omButton(!isMultiRowEditing && editing ? 'disable' : 'enable');
                $("#opt,#refresh").omButton(editing ? 'disable' : 'enable');
                $("#addCopy,#edit,#del").omButton(editing || rows.length == 0 ? 'disable' : 'enable');
                if (editmode == "fixpanel") {
                    $('#edit').closest('.om-btn').hide();
                } else {
                    $('#edit').closest('.om-btn').show();
                }
                $('#edit').omButton(editing || (editmode != 'multirow' && rows.length == 0) ? 'disable' : 'enable');

                $("#save,#cancel").closest('.om-btn').hide();
                $("#cancel").closest('.om-btn').next('.om-buttonbar-sep').hide();
                if (editmode == "multirow" || editmode == "fixpanel") {
                    $("#save").closest('.om-btn').show();
                    $("#cancel").closest('.om-btn').next('.om-buttonbar-sep').show();
                    if (editmode == "multirow") {
                        $("#cancel").closest('.om-btn').show();
                    }
                    if (editmode == "fixpanel") {
                        $("#save").omButton('enable');
                    } else {
                        $("#save,#cancel").omButton(!editing ? 'disable' : 'enable');
                    }
                }
            };

            var menuBtns = [{
                id: "add",
                label: "新增", hint: "新增记录",
                icons: { leftCss: 'bdp-icons-add' },
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
                label: "复制", hint: "新增记录并复制当前选定行的数据",
                icons: { leftCss: 'bdp-icons-addcopy' },
                onClick: function (event) {
                    $('#grid').omGrid('createNew', true);
                }
            }, {
                id: "edit",
                label: "修改",
                icons: { leftCss: 'bdp-icons-edit' },
                onClick: function (event) {
                    $('#grid').omGrid('startEdit');
                }
            }, {
                id: "del",
                label: "删除",
                icons: { leftCss: 'bdp-icons-delete' },
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
            }, { separtor: true }, {
                id: "save",
                label: "保存",
                icons: { leftCss: 'bdp-icons-save' },
                onClick: function (event) {
                    $('#grid').omGrid('updateEdit');
                }
            }, {
                id: "cancel",
                label: "取消",
                icons: { leftCss: 'bdp-icons-cancel' },
                onClick: function (event) {
                    $('#grid').omGrid('cancelEdit');
                }
            }, { separtor: true }, {
                id: "opt",
                label: "选项",
                icons: { right: getImageUrl('down.png') },
                onClick: function (event) {
                    $('#opt-menu').omMenu("show", this);
                }
            }, { separtor: true }, {
                id: "refresh",
                label: "刷新",
                icons: { leftCss: 'bdp-icons-refresh' },
                onClick: function (event) {
                    $('#grid').omGrid('reload');
                }
            }, { separtor: true }, {
                id: "export",
                label: "导出",
                icons: { leftCss: 'bdp-icons-excel_07' },
                onClick: function (event) {
                    $("#grid").omGrid('toExcel');
                }
            }];
            // 允许自定义查询才出现“查询”按钮
            var ops = $("#grid").omGrid('options');
            if (ops && ops.filterBox) {
                menuBtns.push({
                    id: "filter", label: '查询', hint: '显示或隐藏高级查询面板',
                    icons: { leftCss: 'bdp-icons-search' },
                    onClick: function (event) {
                        $('#grid').omGrid('fbToggle');
                    }
                });
            }

            $("#menu").omButtonbar({ btns: menuBtns });

            if ($('#opt-menu').length == 0) {
                $('body').append($('<div id="opt-menu" style="z-index: 2000;"></div>'));
            }
            $('#opt-menu').omMenu({
                minWidth: 150,
                maxWidth: 200,
                dataSource: [
                    { id: '001', label: '显示行号', icon: ' ', seperator: true, checked: true },
                    { id: '002', label: '单选', icon: ' ', checked: false, group: 'selmode' },
                    { id: '003', label: '多选', icon: ' ', checked: true, group: 'selmode', seperator: true },
                    {
                        id: '004', label: '编辑模式', seperator: true,
                        children: [
                            { id: '005', label: '行内编辑', icon: ' ', checked: false, group: 'editmode' },
                            { id: '006', label: '弹出对话框', icon: ' ', checked: false, group: 'editmode' },
                            { id: '007', label: '多行编辑', icon: ' ', checked: false, group: 'editmode' },
                            { id: '008', label: '固定面板', icon: ' ', checked: false, group: 'editmode' }
                        ]
                    },
                    { id: '101', label: '设置显示列' }
                ],
                onSelect: function (item, event) {
                    var gridOptions = {};   // $('#grid').omGrid('options');
                    $('#editpanel').hide();
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
                            gridOptions.height = 'fit';
                            gridOptions.editMode = 'rowpanel';
                            break;
                        case '006':
                            gridOptions.height = 'fit';
                            gridOptions.editMode = 'dialog';
                            break;
                        case '007':
                            gridOptions.height = 'fit';
                            gridOptions.editMode = 'multirow';
                            break;
                        case '008':
                            //gridOptions.singleSelect = true;
                            gridOptions.height = 261;
                            gridOptions.editMode = 'fixpanel';
                            gridOptions.fixPanelId = 'editpanel';
                            //gridOptions.editOptions = { editors: { isView: true, gridLine: true } };
                            $('#editpanel').show();
                            break;
                        case '101':
                            $('#grid').omGrid('setupViewOptions');
                            return;
                        default:
                            return;
                    }
                    $('#grid').omGrid(gridOptions);
                    setBtnStatus();
                }

            });

            var item = $('#opt-menu').omMenu('findItem', '<%=GetEditModeMenuId()%>');
            $('#opt-menu').omMenu('check', item, true);
            var onSelect = $('#opt-menu').omMenu('options').onSelect;
            if (onSelect) onSelect(item);
            //#endregion

            //#region 用户表格
            $("#grid").omGrid({
                //singleSelect: true,
                onRowClick: function (rowIndex, rowData, event) {
                    setBtnStatus();
                },
                onStartEdit: function () {
                    setBtnStatus();
                },
                onCancelEdit: function () {
                    //$('#grid').omGrid('options').extraData.recc = -1; //重新记录总记录数
                    setBtnStatus();
                }
            });
            //#endregion

            $('#editpanel').css({ 'padding': '7px' });
            // 设置一次按钮状态
            setBtnStatus();
            $(window).resize(function (e) {
                $("#grid").omGrid("resize");
            });
            $(window).resize();
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
    <div id="editpanel"></div>
</asp:Content>
