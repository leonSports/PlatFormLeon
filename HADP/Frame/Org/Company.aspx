<%@ Page Title="" Language="C#" MasterPageFile="~/Frame/Master/TreeGrid.Master" AutoEventWireup="true" CodeBehind="Company.aspx.cs" Inherits="Hongbin.Web.Frame.Org.Company" %>

<asp:Content ID="Content1" ContentPlaceHolderID="PlaceCss" runat="server">
    <%--<script src="../resources/js/jquery.js"></script>--%>
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="head" runat="server">
    <script type="text/javascript">
        $(document).ready(function () {
            //#region 公共函数
            var setBtnStatus = function (editing) {
                var node = $('#botree').omTree('getSelected');
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
            $("#menu").omButtonbar({
                btns: [{
                    id: "add",
                    label: "新增",
                    icons: { left: getImageUrl('add') },
                    onClick: function (event) {
                        var node = $('#botree').omTree('getSelected'),
                            data = { CompanyId: "", FatherId: "" };
                        if (node != null) {
                            data.FatherId = node.pid;
                        }
                        $("#editor").bdpEditPanel("setValues", data);
                        $("#editor").bdpEditPanel("startEdit");
                        setBtnStatus(true);
                    }
                }, {
                    id: "addsub",
                    label: "加子",
                    icons: { left: getImageUrl('addsub.png') },
                    onClick: function (event) {
                        var node = $('#botree').omTree('getSelected'),
                           data = { CompanyId: "", FatherId: "" };
                        data.FatherId = node.id;
                        $("#editor").bdpEditPanel("setValues", data);
                        $("#editor").bdpEditPanel("startEdit");
                        setBtnStatus(true);
                    }
                },
                { separtor: true }, {
                    id: "edit",
                    label: "修改",
                    icons: { left: getImageUrl('modify') },
                    onClick: function (event) {
                        $("#editor").bdpEditPanel("startEdit");
                        setBtnStatus(true);
                    }
                }, {
                    id: "del",
                    label: "删除",
                    icons: { left: getImageUrl('del') },
                    onClick: function (event) {
                        $.omMessageBox.confirm({
                            title: '确认删除',
                            content: '确定要删除选定的公司及其下级公司吗？',
                            onClose: function (v) {
                                if (v) {
                                    $("#del").omButton("disable");
                                    var node = $('#botree').omTree('getSelected');
                                    $.post(getCommonDataUrl("delCompany", "cid=" + node.id),
                                        "",
                                        function (ajaxResult) {
                                            $.omMessageTip.show({ content: ajaxResult.Message || "操作成功！", timeout: 3000 })
                                            if (ajaxResult.Succeed) {
                                                $('#botree').omTree("remove", node);
                                            }
                                            $("#del").omButton("enable");
                                        }, 'json');
                                }
                            }
                        });
                        setBtnStatus(false);
                    }
                },
                { separtor: true },
                {
                    id: "save",
                    label: "保存",
                    icons: { left: getImageUrl('save.png') },
                    onClick: function (event) {
                        if ($("#editor").bdpEditPanel("valid")) {
                            var companyInfo = $("#editor").bdpEditPanel("getValues").newValues;
                            var s = JSON.stringify(companyInfo);
                            $.post(getCommonDataUrl("saveCompanyInfo"), s, function (ajaxResult) {
                                if (ajaxResult.Succeed) {
                                    //编辑器中接受新值
                                    $("#editor").bdpEditPanel("updateEdit");
                                    //退出编辑状态
                                    $("#editor").bdpEditPanel("cancelEdit");
                                    setBtnStatus(false);
                                    //新增公司要刷新树
                                    if (companyInfo.CompanyId == "") {
                                        var pnodeid = companyInfo.FatherId;
                                        var pnode = $('#botree').omTree("findNode", "id", pnodeid);
                                        //必须传回新的公司id
                                        //var cid = JSON.parse(ajaxResult.Data || "");
                                        var cid = ajaxResult.Data || "";
                                        var node = {
                                            id: cid,
                                            text: companyInfo.CompanyName,
                                            pid: pnodeid,
                                            classes: "company",
                                            tag: cid
                                        };
                                        $("#botree").omTree("insert", node, pnode);
                                        if (pnode) $("#botree").omTree("expand", pnode);
                                        $("#botree").omTree("select", node);
                                    } else {
                                        var node = $('#botree').omTree("findNode", "id", companyInfo.CompanyId);
                                        $("#botree").omTree("select", node);
                                    }
                                    $.omMessageTip.show({ content: ajaxResult.Message || "操作成功！", timeout: 3000 })
                                } else {
                                    $.omMessageTip.show({ content: ajaxResult.Message, timeout: 3000 })
                                }
                            }, 'json');
                        } else {
                            $.omMessageBox.alert({ content: "数据不正确！" });
                        }
                    }
                },
                { separtor: true },
                {
                    id: "cancel",
                    label: "取消",
                    icons: { left: getImageUrl('cancel.gif') },
                    onClick: function (event) {
                        $("#editor").bdpEditPanel("cancelEdit");
                        setBtnStatus(false);
                    }
                },
                {
                    id: "refresh",
                    label: "刷新",
                    icons: { left: getImageUrl('refresh') },
                    onClick: function (event) {
                        $("#botree").omTree("refresh");
                        setBtnStatus(false);
                    }
                }]

            });
            setBtnStatus(false);
            //#endregion

            //#region 机构树
            $("#botree").omTree({
                dataSource: getCommonDataUrl("getBOTreeData", { dwid: '', bmid: '', dept: 'no' }),
                showCheckbox: false,
                simpleDataModel: true,
                onBeforeExpand: function (node) {
                    var nodeDom = $("#" + node.nid);
                    if (nodeDom.hasClass("hasChildren")) {
                        nodeDom.removeClass("hasChildren");
                        $.ajax({
                            url: getCommonDataUrl("getBOTreeData", {
                                dwid: node.classes == 'company' ? node.id : node.tag,
                                bmid: node.classes == 'company' ? '' : node.id,
                                dept: 'no'
                            }),
                            method: 'POST',
                            dataType: 'json',
                            success: function (data) {
                                $("#botree").omTree("insert", data, node);
                            }
                        });
                    }
                    return true;
                },
                onSuccess: function (data) {
                    if (data.length > 0) {
                        setBtnStatus(false);
                        $('#botree').omTree("expand", data[0]);
                        $('#botree').omTree("select", data[0]);
                    }
                },
                onBeforeSelect: function (nodeData) {
                    if ($('#save').omButton('enabled')) {
                        $.omMessageBox.alert({ content: "正在编辑，不能切换！" });
                        return false;
                    }
                },
                onSelect: function (nodeData) {
                    var node = $('#botree').omTree('getSelected');
                    if (node != null) {
                        $.ajax({
                            method: "POST",
                            url: getCommonDataUrl("getCompanyInfo", "cid=" + node.id),
                            dataType: "json",
                            success: function (result) {
                                if (result.Succeed) {
                                    $("#editor").bdpEditPanel("setValues", result.Data || {});
                                } else {
                                    $.omMessageTip.show({ content: "读取数据失败。" + (result.Message || ''), timeout: 3000 });
                                }
                            }
                        });
                    }
                    setBtnStatus(false);
                }

            })

            //#endregion

            //#region 公司信息
            $('#edtpnl').omPanel({
                title: GlbVar.MP.ETitle || '机构信息',
                width: 'fit'
            });
            // 基本资料
            $("#editor").css({ "max-width": "450px" }).bdpEditPanel({
                // 列数
                columnCount: GlbVar.MP.EColumnCount || 2,
                // 是否为查看模式
                isView: true,
                // 是否显示表格线
                gridLine: true,
                colModel: GlbVar.MP.colModel
            });

            //#endregion

            setBtnStatus(false);
            $(window).resize(function () {

            }).resize();
        });

    </script>
</asp:Content>
<asp:Content ID="Content3" runat="server" ContentPlaceHolderID="PlaceToolbar">
    <div id="menu"></div>
</asp:Content>
<asp:Content ID="Content4" runat="server" ContentPlaceHolderID="PlaceSearch">
</asp:Content>
<asp:Content ID="Content5" runat="server" ContentPlaceHolderID="PlaceLeft">
    <div id="botree"></div>
</asp:Content>
<asp:Content ID="Content6" runat="server" ContentPlaceHolderID="PlaceContent">
    <div id="edtpnl">
        <div id="editor">
        </div>
    </div>
</asp:Content>

