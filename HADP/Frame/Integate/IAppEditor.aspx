<%@ Page Title="" Language="C#" MasterPageFile="~/Frame/Master/TreeGrid.Master" AutoEventWireup="true" CodeBehind="IAppEditor.aspx.cs" Inherits="Hongbin.Web.Frame.Integate.IAppEditor" %>

<asp:Content ID="Content1" ContentPlaceHolderID="PlaceCss" runat="server">
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="head" runat="server">
    <script type="text/javascript">
        $(document).ready(function () {
            var setBtnStatus = function (editing) {
                var node = $('#tree_iapp').omTree('getSelected');
                $("#add").omButton(!editing ? "enable" : "disable");
                $("#addsub").omButton(node != null && !editing ? "enable" : "disable");
                $("#edit").omButton(node != null && !editing ? "enable" : "disable");
                $("#del").omButton(node != null && !editing ? "enable" : "disable");
                $("#save").omButton(editing ? "enable" : "disable");
                $("#cancel").omButton(editing ? "enable" : "disable");
                $("#refresh,#move").omButton(node != null && !editing ? "enable" : "disable");
            };
            //#region 菜单
            $("#menu").omButtonbar({
                btns: [{
                    id: "add",
                    label: "新增",
                    icons: { leftCss: 'bdp-icons-add' },
                    onClick: function (event) {
                        var node = $('#tree_iapp').omTree('getSelected'),
                           data = { SystemId: "", ParentSystemId: "", NodeType: '分类', Target: '_blank' };
                        if (node != null) { 
                            data.ParentSystemId = node.pid;
                        }
                        $("#pnl_iapp").bdpEditPanel("setValues", data);
                        $("#pnl_iapp").bdpEditPanel("startEdit");
                        setBtnStatus(true);
                    }
                }, {
                    id: "addsub",
                    label: "加子",
                    icons: { leftCss: 'bdp-icons-addcopy' },
                    onClick: function (event) {
                        var node = $('#tree_iapp').omTree('getSelected'),
                           data = { SystemId: "", ParentSystemId: "", NodeType: '分类', Target: '_blank' };
                        data.ParentSystemId = node.id;
                        $("#pnl_iapp").bdpEditPanel("setValues", data);
                        $("#pnl_iapp").bdpEditPanel("startEdit");
                        setBtnStatus(true);
                    }
                },
                { separtor: true }, {
                    id: "edit",
                    label: "修改",
                    icons: { leftCss: 'bdp-icons-edit' },
                    onClick: function (event) {
                        $("#pnl_iapp").bdpEditPanel("startEdit");
                        setBtnStatus(true);
                    }
                }, {
                    id: "del",
                    label: "删除",
                    icons: { leftCss: 'bdp-icons-delete' },
                    onClick: function (event) {
                        $.omMessageBox.confirm({
                            title: '确认删除',
                            content: '确定要删除吗？',
                            onClose: function (v) {
                                if (v) {
                                    var node = $('#tree_iapp').omTree('getSelected');
                                    $.post(getCommonDataUrl("IAppDelete", "id=" + node.id),
                                        "",
                                        function (ajaxResult) {
                                            $.omMessageTip.show({ content: ajaxResult.Message || '操作成功！', timeout: 3000 });
                                            if (ajaxResult.Succeed) {
                                                $('#tree_iapp').omTree("remove", node);
                                            }
                                        },
                                        'json'
                                    );
                                }
                            }
                        });
                        setBtnStatus(false);
                    }
                }, { separtor: true }, {
                    id: 'move', label: '移动', icons: { leftCss: 'bdp-icons-addcopy' },
                    onClick: function (event) {
                        var currNode = $('#tree_iapp').omTree('getSelected');
                        if (!currNode) return;

                        var dlg = $('#dlgMove');
                        if (dlg.length == 0) {
                            $('body').append('<div id="dlgMove">移动到：<br/><div id="dlgMTree" ' +
                                'style="border-style:solid; border-color: #86A3C4;border-width:1px; margin-top:3px; margin-bottom:5px; height:300px;overflow:auto;"></div>' +
                                '<input type="checkbox" id="chk" /><label for="chk">&nbsp;&nbsp;拷贝</label>' +
                                '</div>'
                            );
                            dlg = $('#dlgMove').omDialog({
                                title: "移动",
                                autoOpen: false,
                                modal: true,
                                width: 550,
                                height: 450,
                                buttons: [{
                                    text: "确定", width: 75,
                                    click: function () {
                                        var currNode = $('#tree_iapp').omTree('getSelected');
                                        var dstNode = $('#dlgMTree').omTree('getSelected');
                                        if (!dstNode) {
                                            $.omMessageBox.alert({ content: "请选中目标节点！" });
                                            return false;
                                        }

                                        if (currNode.id == dstNode.id) {
                                            $('#dlgMove').omDialog('close');
                                        } else {
                                            var iscopy = $('#chk').prop('checked');

                                            jdpExec(getCommonDataUrl("IAppMoveNode", { src: currNode.id, dst: dstNode.id, copy: iscopy }), function (ajaxResult) {
                                                if (ajaxResult.Succeed) {
                                                    if (!iscopy) {
                                                        var pnode = $('#tree_iapp').omTree('getParent', currNode);
                                                        $('#tree_iapp').omTree('remove', currNode, pnode);
                                                    }
                                                    dstNode = $('#tree_iapp').omTree('findNode', 'id', dstNode.id, '', true);
                                                    if (dstNode) {
                                                        var node = null;
                                                        if (iscopy) {
                                                            node = $.extend(true, {}, currNode);
                                                            node.id = ajaxResult.Data;
                                                            node.Data.SystemId = node.id;
                                                        } else {
                                                            node = currNode;
                                                        }
                                                        node.pid = dstNode.id;
                                                        $('#tree_iapp').omTree('insert', node, dstNode);
                                                        $('#tree_iapp').omTree('select', node);
                                                    }
                                                    $('#dlgMove').omDialog('close');
                                                }

                                                $('#dlgMove').omDialog('close');
                                                $.omMessageTip.show({ content: ajaxResult.Message || '操作成功！', timeout: 3000 });
                                            });
                                        }
                                    }
                                }, {
                                    text: "取消", width: 75,
                                    click: function () {
                                        $('#dlgMove').omDialog('close');
                                    }
                                }]
                            });
                        }
                        $('#dlgMove').omDialog({ title: '移动: ' + currNode.text });
                        $('#dlgMTree').omTree({
                            dataSource: getCommonDataUrl('IAppQuery'),
                            // 动态加载子节点
                            onBeforeExpand: function (nodeData) {
                                var nodeDom = $("#" + nodeData.nid);
                                if (nodeDom.hasClass("hasChildren")) {
                                    nodeDom.removeClass("hasChildren");
                                    $.ajax({
                                        url: getCommonDataUrl("IAppQuery", "pid=" + nodeData.id),
                                        method: 'POST',
                                        dataType: 'json',
                                        success: function (subNodeData) {
                                            $("#dlgMTree").omTree("insert", subNodeData, nodeData);
                                        }
                                    });
                                }
                            }
                        });
                        dlg.omDialog('open');
                    }
                }, { separtor: true },
                {
                    id: "save",
                    label: "保存",
                    icons: { leftCss: 'bdp-icons-save' },
                    onClick: function (event) {
                        if (!$("#pnl_iapp").bdpEditPanel("valid")) {
                            $.omMessageBox.alert({ content: "数据不正确！" });
                        } else {
                            var iapp = $("#pnl_iapp").bdpEditPanel("getValues").newValues;
                            $.post(getCommonDataUrl("IAppSave"),
                                JSON.stringify(iapp),
                                function (ajaxResult) {
                                    if (ajaxResult.Succeed) {
                                        iapp.CompanyName = $('#pnl_iapp').bdpEditPanel('findEditor', 'CompanyId').val();
                                        iapp.RoleName = $('#pnl_iapp').bdpEditPanel('findEditor', 'RoleId').val();
                                        //编辑器中接受新值
                                        $("#pnl_iapp").bdpEditPanel("updateEdit");
                                        //退出编辑状态
                                        $("#pnl_iapp").bdpEditPanel("cancelEdit");
                                        setBtnStatus(false);
                                        //新增的要刷新树
                                        if (iapp.SystemId == "") {
                                            var pnodeid = iapp.ParentSystemId;
                                            var pnode = $('#tree_iapp').omTree("findNode", "id", pnodeid);
                                            //必须传回新的id
                                            iapp.SystemId = ajaxResult.Data || "";
                                            var node = {
                                                id: iapp.SystemId,
                                                text: iapp.SystemTitle,
                                                hasChildren: false,
                                                Data: iapp
                                            };
                                            $("#tree_iapp").omTree("insert", node, pnode);
                                            if (pnode) $("#tree_iapp").omTree("expand", pnode);
                                            $("#tree_iapp").omTree("select", node);
                                        } else {
                                            var node = $('#tree_iapp').omTree("findNode", "id", iapp.SystemId);
                                            if (node) {
                                                $.extend(node.Data, iapp);
                                                var s = iapp.SystemTitle;
                                                if (s != node.text) {
                                                    node.text = s;
                                                    $('#tree_iapp').omTree("modify", node, node);
                                                }
                                                $("#tree_iapp").omTree("select", node);
                                            }
                                        }
                                        $.omMessageTip.show({ content: ajaxResult.Message || "操作成功！", timeout: 3000 })
                                    } else {
                                        $.omMessageTip.show({ content: ajaxResult.Message, timeout: 3000 })
                                    }
                                },
                                'json'
                            );
                        }
                    }
                },
                { separtor: true },
                {
                    id: "cancel",
                    label: "取消",
                    icons: { leftCss: 'bdp-icons-cancel' },
                    onClick: function (event) {
                        $("#pnl_iapp").bdpEditPanel("cancelEdit");
                        setBtnStatus(false);
                    }
                },
                {
                    id: "refresh",
                    label: "刷新",
                    icons: { leftCss: 'bdp-icons-refresh' },
                    onClick: function (event) {
                        $("#tree_iapp").omTree("refresh");
                        setBtnStatus(false);
                    }
                }]

            });
            setBtnStatus(false);
            //#endregion

            //#region 系统树
            $("#tree_iapp").omTree({
                dataSource: getCommonDataUrl("IAppQuerySimple"),
                showCheckbox: false,
                simpleDataModel: true,
                onSuccess: function (data) {
                    if (data.length > 0) {
                        $('#tree_iapp').omTree("expand", data[0]);
                        $('#tree_iapp').omTree("select", data[0]);
                    }
                },
                onBeforeSelect: function (nodeData) {
                    if (!$("#save").attr("disabled")) {
                        $.omMessageBox.alert({ content: "正在编辑，不能切换！" });
                        return false;
                    }
                },
                onSelect: function (nodeData) {
                    var node = $('#tree_iapp').omTree('getSelected');
                    if (node != null) {
                        $('#pnl_iapp').bdpEditPanel('setValues', node.Data);
                    }
                    setBtnStatus(false);
                }

            });
            //#endregion

            //#region 系统信息
            $('#pnlInfo').css({ 'padding': 12 }).omPanel({ width: 650, title: '系统详细信息' });
            $('#pnl_iapp').bdpEditPanel({
                // 列数
                columnCount: 2,
                // 是否为查看模式
                isView: true,
                // 是否显示表格线
                gridLine: true,
                colModel: [{
                    header: '系统ID', name: 'SystemId', editor: {
                        editable: false, rules: [["required", true, "系统ID不能为空！"]]
                    }
                }, {
                    header: '类型', name: 'NodeType', editor: {
                        type: 'combo',
                        options: {
                            dataSource: [{ text: '分类', value: '分类' }, { text: '系统', value: '系统' }, { text: '应用组', value: '应用组' }]
                        }
                    }
                }, {
                    header: '系统标题', name: 'SystemTitle', editor: {
                        colspan: 1,
                        rules: [['required', true, '系统标题不能为空！'], ["maxlength", 100, "系统标题超长！"]]
                    }
                }, {
                    header: '系统简称', name: 'SystemShortName', editor: {
                        rules: [["maxlength", 50, "系统简称超长！"]]
                    }
                }, {
                    header: '系统编码', name: 'SystemCode', editor: {
                        rules: [["maxlength", 10, "系统编码超长！"]]
                    }
                }, {
                    header: '是否启用', name: 'IsActive', editor: {
                        type: 'checkbox'
                    }
                }, {
                    header: '是否集成', name: 'IsIntegated', editor: {
                        type: 'checkbox', hint: '区分是否为集成系统'
                    }
                }, {
                    header: '目标窗口', name: 'Target', editor: {
                        type: 'combo', rules: [["maxlength", 20, "目标窗口超长！"]],
                        options: {
                            dataSource: [{ "text": "_self", "value": "_self" }, { "text": "_blank", "value": "_blank" }, { "text": "_top", "value": "_top" }]
                        }
                    }
                }, {
                    header: '登录地址', name: 'LoginUrl', editor: {
                        colspan: 2, rules: [["maxlength", 200, "登录地址超长！"]]
                    }
                }, {
                    header: '首页地址', name: 'HomeUrl', editor: {
                        colspan: 2, hint: "有些系统无法改造，则直接挂个链接",
                        rules: [["maxlength", 200, "首页地址超长！"]]
                    }
                }, {
                    header: '系统图标', name: 'SystemIcon', editor: {
                        type: 'image', hint: "可以是图片地址或图片类名",
                        rules: [["maxlength", 100, "系统图标超长！"]],
                        uploadPath: "images/app"
                    }
                }, {
                    header: '系统快照', name: 'Snapshot', editor: {
                        type: 'image', hint: "系统快照图片地址",
                        rules: [["maxlength", 100, "系统快照超长！"]],
                        uploadPath: "images/app"
                    }
                }, {
                    header: '系统说明', name: 'SystemDescription', editor: {
                        type: "memo",
                        hint: "不超过200字",
                        rows: 5,
                        rules: [["maxlength", 200, "系统说明超长！"]],
                        colspan: 2
                    }
                }, {
                    header: '适用公司', name: 'CompanyName', editor: {
                        type: 'combotree',
                        name: 'CompanyId',
                        options: {
                            //dataSource: getCommonDataUrl('getTreeNodes', 'type=Hongbin.Data.BdpBaseData.BdpOrgCompany&key=CompanyId&text=CompanyName&order=CompanyOrder&pkey=FatherId'),
                            valueField: "id",
                            inputField: "text",
                            optionField: "text",
                            textField: "text",
                            tree: {
                                dataSource: getCommonDataUrl('getBOTreeData', { dept: 'no' }),
                                simpleDataModel: true,
                                onBeforeExpand: function (node) {
                                    var nodeDom = $('#' + node.nid), theTree = this;
                                    if (nodeDom.hasClass('hasChildren')) {
                                        nodeDom.removeClass('hasChildren');
                                        $.ajax({
                                            url: getCommonDataUrl('getBOTreeData', {
                                                dwid: node.classes == 'company' ? node.id : node.tag,
                                                bmid: node.classes == 'company' ? '' : node.id,
                                                dept: 'no'
                                            }),
                                            method: 'POST',
                                            dataType: 'json',
                                            success: function (nodedata) {
                                                $(theTree).omTree('insert', nodedata, node);
                                            }
                                        });
                                    }
                                }
                            }

                        }
                    }
                }, {
                    header: '适用角色', name: 'RoleName', editor: {
                        type: 'combotree',
                        name: 'RoleId',
                        options: {
                            valueField: "id",
                            inputField: "text",
                            optionField: "text",
                            textField: "text",
                            tree: {
                                dataSource: getCommonDataUrl('getRoleTreeData', { pid: '' }),
                                simpleDataModel: true,
                                onBeforeExpand: function (node) {
                                    var nodeDom = $('#' + node.nid), theTree = this;
                                    if (nodeDom.hasClass('hasChildren')) {
                                        nodeDom.removeClass('hasChildren');
                                        $.ajax({
                                            url: getCommonDataUrl("getRoleTreeData", { pid: node.id }),
                                            method: 'POST',
                                            dataType: 'json',
                                            success: function (nodedata) {
                                                $(theTree).omTree('insert', nodedata, node);
                                            }
                                        });
                                    }
                                }
                            },
                            onCanSelect: function (node) {
                                if (node.classes != 'role') {
                                    $.omMessageTip.show({ content: "请选择一个角色！", timeout: 3000 });
                                    return false;
                                }
                            }

                        }
                    }
                }, {
                    header: '适用用户', name: 'UserType', editor: {
                        type: 'combo', options: {
                            dataSource: getCommonDataUrl('getCodes', 'type=Hongbin.Data.BdpBaseData.BdpCodeUserType&key=Name&text=Name'),
                            valueField: "Name",
                            inputField: "Name",
                            optionField: "Name",
                            allowClearValue: true
                        }
                    }
                }, {
                    header: '适用标志', name: 'ApplianceSign'
                }]
            });
            //#endregion

        });
    </script>
</asp:Content>
<asp:Content ID="Content3" ContentPlaceHolderID="PlaceToolbar" runat="server">
    <div id="menu"></div>
</asp:Content>
<asp:Content ID="Content4" ContentPlaceHolderID="PlaceSearch" runat="server">
</asp:Content>
<asp:Content ID="Content5" ContentPlaceHolderID="PlaceLeft" runat="server">
    <div id="tree_iapp"></div>
</asp:Content>
<asp:Content ID="Content6" ContentPlaceHolderID="PlaceContent" runat="server">
    <div id="pnlInfo">
        <div id="pnl_iapp">
        </div>
    </div>
</asp:Content>
