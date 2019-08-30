<%@ Page Title="" Language="C#" MasterPageFile="~/Frame/Master/TreeGrid.Master" AutoEventWireup="true" CodeBehind="TreeEditor.aspx.cs" Inherits="Hongbin.Web.Frame.editor.TreeEditor" %>

<asp:Content ID="Content1" ContentPlaceHolderID="PlaceCss" runat="server">
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="head" runat="server">
    <script type="text/javascript">
        $(document).ready(function () {
            //#region 公共函数
            var setBtnStatus = function (editing) {
                var node = $('#tree').omTree('getSelected');
                $("#add").omButton(!editing ? "enable" : "disable");
                $("#addsub").omButton(node != null && !editing ? "enable" : "disable");
                $("#edit").omButton(node != null && !editing ? "enable" : "disable");
                $("#del").omButton(node != null && !editing ? "enable" : "disable");
                $("#save").omButton(editing ? "enable" : "disable");
                $("#cancel").omButton(editing ? "enable" : "disable");
                $("#refresh").omButton(node != null && !editing ? "enable" : "disable");
            };
            //#endregion

            //#region 菜单
            var NewRecord = function (data) {
                var onNewRecord = GlbVar.MP.onNewRecord;
                onNewRecord && onNewRecord(data);
            };
            $("#menu").omButtonbar({
                btns: [{
                    id: "add", label: "新增", icons: { leftCss: 'bdp-icons-add' },
                    onClick: function (event) {
                        var node = $('#tree').omTree('getSelected'),
                            cfg = GlbVar.MP,
                            data = {};
                        data[cfg.key] = data[cfg.pkey] = "";
                        if (node != null) data[cfg.pkey] = node.pid;
                        NewRecord(data);
                        $("#editor").bdpEditPanel("setValues", data);
                        $('#edtpnl').omPanel({ title: '【新增】' });
                        $("#editor").bdpEditPanel("startEdit");
                        setBtnStatus(true);
                    }
                }, {
                    id: "addsub", label: "加子", icons: { leftCss: 'bdp-icons-addcopy' },
                    onClick: function (event) {
                        var node = $('#tree').omTree('getSelected'),
                            cfg = GlbVar.MP,
                            data = {};
                        data[cfg.key] = data[cfg.pkey] = "";
                        data[cfg.pkey] = node.id;
                        NewRecord(data);
                        $("#editor").bdpEditPanel("setValues", data);
                        $('#edtpnl').omPanel({ title: '【新增下级】' });
                        $("#editor").bdpEditPanel("startEdit");
                        setBtnStatus(true);
                    }
                },
                { separtor: true }, {
                    id: "edit", label: "修改", icons: { leftCss: 'bdp-icons-edit' },
                    onClick: function (event) {
                        var node = $('#tree').omTree('getSelected');
                        if (node) $('#edtpnl').omPanel({ title: '【修改】' + node.text });
                        $("#editor").bdpEditPanel("startEdit");
                        setBtnStatus(true);
                    }
                }, {
                    id: "del", label: "删除", icons: { leftCss: 'bdp-icons-delete' },
                    onClick: function (event) {
                        var node = $('#tree').omTree('getSelected');
                        if (!node) return;
                        $.omMessageBox.confirm({
                            title: '确认删除',
                            content: '确定要删除选定的节点及其下级节点吗？',
                            onClose: function (v) {
                                if (v) {
                                    setBtnStatus(true);
                                    //$("#del").omButton("disable");
                                    $.post(getCommonDataUrl('DEDelete', { type: GlbVar.MP.type }),
                                        JSON.stringify($.makeArray(node.id)),
                                        function (ajaxResult) {
                                            $.omMessageTip.show({ content: ajaxResult.Message, timeout: 3000 });
                                            if (ajaxResult.Succeed) {
                                                $('#tree').omTree("remove", node);
                                            }
                                            setBtnStatus(false);
                                            //$("#del").omButton("enable");
                                        }, 'json');
                                }
                            }
                        });
                    }
                }, { separtor: true }, {
                    id: "save", label: "保存", icons: { leftCss: 'bdp-icons-save' },
                    onClick: function (event) {
                        var rec = $('#editor').bdpEditPanel('getValues').newValues;
                        $('#editor').bdpEditPanel('updateEdit', function (ajaxResult) {
                            $.omMessageTip.show({
                                type: ajaxResult.Succeed ? 'success' : 'error',
                                content: ajaxResult.Message,
                                timeout: 3000
                            });
                            if (ajaxResult.Succeed) {
                                $("#editor").bdpEditPanel("cancelEdit");
                                setBtnStatus(false);
                                var node = $('#tree').omTree('getSelected'),
                                    id = ajaxResult.Data.length > 0 ? ajaxResult.Data[0] : '';
                                if (node && node.id == id) {
                                    var pnode = $('#tree').omTree('getParent', node);
                                    if (node.text != rec[GlbVar.MP.text]) {
                                        node.text = rec[GlbVar.MP.text];
                                        $('#tree').omTree('modify', node, node, pnode);
                                        $("#tree").omTree("select", node);
                                    }
                                } else {
                                    var pid = rec[GlbVar.MP.pkey],
                                        pnode = $('#tree').omTree("findNode", "id", pid),
                                        newNode = { id: id, text: rec[GlbVar.MP.text], pid: pid };
                                    $('#tree').omTree('insert', newNode, pnode);
                                    if (pnode) $('#tree').omTree('expand', pnode);
                                    $('#tree').omTree('select', newNode);
                                }
                            }
                        });
                    }
                }, { separtor: true }, {
                    id: "cancel", label: "取消", icons: { leftCss: 'bdp-icons-cancel' },
                    onClick: function (event) {
                        $("#editor").bdpEditPanel("cancelEdit");
                        var node = $('#tree').omTree('getSelected');
                        if (node) $('#edtpnl').omPanel({ title: '【查看】' + node.text });
                        setBtnStatus(false);
                    }
                }, {
                    id: "refresh", label: "刷新", icons: { leftCss: 'bdp-icons-refresh' },
                    onClick: function (event) {
                        $("#tree").omTree("refresh");
                        setBtnStatus(false);
                    }
                }]

            });

            //#endregion

            //#region 树
            getTreeDataSource = function (id) {
                return getCommonDataUrl('BdpTreeNodes', {
                    type: GlbVar.MP.type,
                    key: GlbVar.MP.key,
                    text: GlbVar.MP.text,
                    pkey: GlbVar.MP.pkey,
                    order: GlbVar.MP.order,
                    filter: GlbVar.MP.filter,
                    pid: id || ''
                });
            };

            $('#tree').omTree({
                dataSource: getTreeDataSource(),
                showCheckbox: false,
                simpleDataModel: true,
                onBeforeExpand: function (node) {
                    var nodeDom = $("#" + node.nid);
                    if (nodeDom.hasClass("hasChildren")) {
                        nodeDom.removeClass("hasChildren");
                        $.ajax({
                            url: getTreeDataSource(node.id),
                            method: 'POST',
                            dataType: 'json',
                            success: function (data) {
                                $("#tree").omTree("insert", data, node);
                            }
                        });
                    }
                    return true;
                },
                onSuccess: function (data) {
                    if (data.length > 0) {
                        $('#tree').omTree("expand", data[0]);
                        $('#tree').omTree("select", data[0]);
                    }
                },
                onBeforeSelect: function (nodeData) {
                    if ($('#save').omButton('enabled')) {
                        $.omMessageBox.alert({ content: "正在编辑，不能切换！" });
                        return false;
                    }
                },
                onSelect: function (nodeData) {
                    var node = $('#tree').omTree('getSelected');
                    if (node != null) {
                        $('#edtpnl').omPanel({ title: '【查看】' + node.text });
                        $.ajax({
                            method: "POST",
                            url: getCommonDataUrl('DEQuery', {
                                type: GlbVar.MP.type,
                                filter: 'a.' + GlbVar.MP.key + '="' + node.id + '"'
                            }),
                            dataType: "json",
                            success: function (data) {
                                if (data.rows && data.rows.length > 0) {
                                    $("#editor").bdpEditPanel("setValues", data.rows[0]);
                                } else {
                                    $.omMessageTip.show({
                                        type: 'error', title: '错误',
                                        content: '获取数据失败!<br/>' + JSON.stringify(data),
                                        timeout: 3000
                                    });
                                }
                            }
                        });
                    }
                    setBtnStatus(false);
                }
            });
            //#endregion

            //#region 编辑面板
            $('#edtpnl').omPanel({
                width: 'fit',
                height: 'fit'
            });
            $('#editor').bdpEditPanel({
                columnCount: GlbVar.MP.cc,
                width: GlbVar.MP.width,
                height: 'auto',
                isView: true,
                gridLine: true,
                colModel: GlbVar.MP.colModel,
                updateUrl: getCommonDataUrl('DEUpdate', { type: GlbVar.MP.type }),
                done: true
            });
            //#endregion

            //#region 初始化

            setBtnStatus(false);
            // IE中好象运行太快时面板展不开！
            setTimeout(function () { $('#edtpnl').omPanel('resize'); }, 50);
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
    <ul id="tree"></ul>
</asp:Content>
<asp:Content ID="Content6" ContentPlaceHolderID="PlaceContent" runat="server">
    <div id="edtpnl">
        <div id="editor">
        </div>
    </div>
</asp:Content>
