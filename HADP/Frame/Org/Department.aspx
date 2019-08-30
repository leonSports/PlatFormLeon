<%@ Page Title="" Language="C#" MasterPageFile="~/Frame/Master/TreeGrid.Master" AutoEventWireup="true" CodeBehind="Department.aspx.cs" Inherits="Hongbin.Web.Frame.Org.Department" %>

<asp:Content ID="Content1" ContentPlaceHolderID="PlaceCss" runat="server">
    <link href="../resources/css/default/bdp-editor.css" rel="stylesheet" />
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="head" runat="server">
    <script src="../resources/js/bdp-editor.js"></script>
    <script type="text/javascript">
        $(document).ready(function () {
            //#region 公共函数
            // 获取数据提供地址
            var getDataUrl = function (fn, args) {
                return getCommonDataUrl(fn, args);
            };
            var setBtnStatus = function (editing) {
                var node = $('#botree').omTree('getSelected'),
                    isdept = node != null && node.classes == "dept";
                $("#add").omButton(node != null && !editing ? "enable" : "disable");
                $("#addsub").omButton(node != null && !editing ? "enable" : "disable");
                $("#edit").omButton(isdept && !editing ? "enable" : "disable");
                $("#del").omButton(isdept && !editing ? "enable" : "disable");
                $("#save").omButton(editing ? "enable" : "disable");
                $("#cancel").omButton(editing ? "enable" : "disable");
                $("#refresh").omButton(isdept && !editing ? "enable" : "disable");
            };
            //#endregion

            //#region 菜单
            $("#menu").omButtonbar({
                btns: [{
                    id: "add",
                    label: "新增",
                    icons: { left: getImageUrl('add') },
                    onClick: function (event) {
                        var node = $('#botree').omTree('getSelected');
                        if (node == null) {
                            $.omMessageBox.alert({ content: "请先选中公司或部门！" });
                            return;
                        }
                        var isdept = node != null && node.classes == "dept",
                            data = { OrgDepartmentId: "", DeptParent: "", DeptParentName: "", CompanyId: "" };
                        if (!isdept) {
                            data.CompanyId = node.id;
                            data.CompanyName = node.text;
                            data.DeptParent = "";
                        } else {
                            var pnode = $("#botree").omTree('getParent', node);
                            data.CompanyId = node.tag;  //部门节点用这个属性保存公司ID
                            data.DeptParent = pnode.classes == "dept" ? pnode.id : "";
                            data.DeptParentName = pnode.classes == "dept" ? pnode.text : "";
                        }
                        $("#deptinfo").bdpEditPanel("setValues", data);
                        $("#deptinfo").bdpEditPanel("startEdit");
                        setBtnStatus(true);
                    }
                }, {
                    id: "addsub",
                    label: "加子",
                    icons: { left: getImageUrl('addsub.png') },
                    onClick: function (event) {
                        var node = $('#botree').omTree('getSelected');
                        if (node == null) {
                            $.omMessageBox.alert({ content: "请先选中公司或部门！" });
                            return;
                        }
                        var isdept = node != null && node.classes == "dept",
                            data = { OrgDepartmentId: "", DeptParent: "", DeptParentName: "", CompanyId: "" };
                        if (!isdept) {
                            data.CompanyId = node.id;
                            data.CompanyName = node.text;
                            data.DeptParent = "";
                        } else {
                            data.CompanyId = node.tag;  //部门节点用这个属性保存公司ID
                            data.DeptParent = node.id;
                            data.DeptParentName = node.text;
                        }
                        $("#deptinfo").bdpEditPanel("setValues", data);
                        $("#deptinfo").bdpEditPanel("startEdit");
                        setBtnStatus(true);
                    }
                },
                { separtor: true }, {
                    id: "edit",
                    label: "修改",
                    icons: { left: getImageUrl('modify') },
                    onClick: function (event) {
                        $("#deptinfo").bdpEditPanel("startEdit");
                        setBtnStatus(true);
                    }
                }, {
                    id: "del",
                    label: "删除",
                    icons: { left: getImageUrl('del') },
                    onClick: function (event) {
                        $.omMessageBox.confirm({
                            title: '确认删除',
                            content: '确定要删除选定的部门及其下级部门吗？',
                            onClose: function (v) {
                                if (v) {
                                    var node = $('#botree').omTree('getSelected');
                                    $.post(getDataUrl("delDept", "deptid=" + node.id),
                                        "",
                                        function (ajaxResult) {
                                            $.omMessageBox.alert({ content: ajaxResult.Message });
                                            if (ajaxResult.Succeed) {
                                                $('#botree').omTree("remove", node);
                                            }
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
                        if ($("#deptinfo").bdpEditPanel("valid")) {
                            $("#deptinfo").bdpEditPanel("updateEdit");
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
                        $("#deptinfo").bdpEditPanel("cancelEdit");
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
                dataSource: getDataUrl("getBOTreeData", { dept: 'yes' }),
                showCheckbox: false,
                simpleDataModel: true,
                onBeforeExpand: function (node) {
                    var nodeDom = $("#" + node.nid);
                    if (nodeDom.hasClass("hasChildren")) {
                        nodeDom.removeClass("hasChildren");
                        $.ajax({
                            url: getDataUrl("getBOTreeData", {
                                dwid: node.classes == 'company' ? node.id : node.tag,
                                bmid: node.classes == 'company' ? '' : node.id,
                                dept: 'yes'
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
                    if (data.length > 0)
                        $('#botree').omTree("expand", data[0]);
                },
                onBeforeSelect: function (nodeData) {
                    if (!$("#save").attr("disabled")) {
                        $.omMessageBox.alert({ content: "正在编辑，不能切换！" });
                        return false;
                    }
                },
                onSelect: function (nodeData) {
                    var node = $('#botree').omTree('getSelected');
                    if (node != null && node.classes == "dept") {
                        $.ajax({
                            method: "POST",
                            url: getDataUrl("getDeptInfo", "deptid=" + node.id),
                            dataType: "json",
                            success: function (data) {
                                //$("#deptinfo").bdpEditPanel({ isView: true });
                                $("#deptinfo").bdpEditPanel("setValues", data);
                            }
                        });
                    }
                    setBtnStatus(false);
                }

            })

            //#endregion
            //#region 部门信息
            $("#pdeptinfo").omPanel({
                title: "部门信息",
                width: 550
            });

            $("#deptinfo").bdpEditPanel({
                // 列数
                columnCount: 2,
                // 是否为查看模式
                isView: true,
                // 是否显示表格线
                gridLine: true,
                // 数据更新地址，字符串或函数, 函数需返回地址串
                //updateUrl: getDataUrl("saveDeptInfo"),
                // 验证设置
                //validator: false,
                //#region 列模型，兼容表格的列模型
                colModel: [
                    {
                        header: "", name: "OrgDepartmentId",
                        editor: {
                            index: -1       //有这个字段但是不在编辑面板中出来
                        }
                    },
                    {
                        header: "所属公司", name: "CompanyName",
                        editor: {
                            index: 1,        //面板中出现的顺序号
                            editable: false     // 面板中出现但是不能编辑
                        }
                    },
                    {
                        header: "上级部门", name: "DeptParentName",
                        editor: { index: 2, editable: false }
                    },
                    {
                        header: "部门名称", name: "DeptName",
                        editor: {
                            index: 3,
                            colspan: 2,      //跨2列
                            //数据验证规则
                            rules: [
                                ["required", true, "部门名称不能为空"],
                                ['maxlength', 50, '部门名称不能超过50字']
                            ]
                        }
                    },
                    {
                        header: "部门编码", name: "DeptCode",
                        editor: { index: 4, rules: [["maxlength", 16, "部门编码太长"]] }
                    },
                    {
                        header: "部门简称", name: "DeptShortName",
                        editor: { index: 5, rules: [["maxlength", 20, "部门简称太长"]] }
                    },
                    {
                        header: "部门序号", name: "DeptOrder",
                        editor: {
                            index: 6,
                            type: "number"  //参见 omNumberField的选项
                        }
                    },
                    {
                        header: "部门层级", name: "DeptLevel",
                        editor: {
                            index: 7,
                            rules: [["maxlength", 10, "部门层级太长"]]
                        }
                    },
                    {
                        header: "部门性质", name: "DeptKind",
                        editor: { index: 8, rules: [["maxlength", 50, "部门性质太长"]] }
                    },
                    {
                        header: "部门负责人", name: "DeptPrincipal",
                        editor: { index: 9, rules: [["maxlength", 50, "部门性质太长"]] },
                        editor: {
                            index: 9,
                            name: "DeptPrincipalId",
                            type: "combo",   //参见 omCombo 的选项
                            options: {
                                dataSource: ""
                            },
                            // 初始化时更新下拉框的数据源
                            onInitEditControl: function (ctrl, cm) {
                                if (cm.editor.editable) {
                                    var node = $('#botree').omTree('getSelected'),
                                        sUrl = getDataUrl("getDeptEmployees", "deptid=" + node.id);
                                    ctrl.omCombo('setData', sUrl);
                                }
                            },
                            onValueChanged: function (target, newValue, oldValue) {
                                var data = $(this.editControl).omCombo("getData");
                                if ($.isArray(data)) {
                                    for (var i = 0, len = data.length; i < len; i++) {
                                        if (data[i].value == newValue) {
                                            $("#deptinfo").bdpEditPanel("setValue", "DeptPrincipal", data[i].text);
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    },
                    {
                        header: "备注", name: "DeptNote",
                        editor: {
                            index: 10, colspan: 2,
                            type: "memo",    //或 multirow, 多行文本编辑
                            rows: 7,        // 行数
                            resize: "none",    // 是否允许调整尺寸
                            scrollX: false,      //允许横向滚动条
                            scrollY: true,      //允许纵向滚动条
                            rules: [["maxlength", 100, "备注内容太多"]]
                        }
                    },
                    {
                        header: "创建日期", name: "InnerCreateTime",
                        editor: {
                            index: 11, type: "date",
                            options: {
                                dateFormat: "yy-mm-dd",
                                pages: 3,
                                showTime: true,
                                editable: false,
                                popup: true
                            }
                        }
                    }
                ],
                //#endregion

                // 数据更新前事件. onBeforeSave(args:{cancel:false,processUrl,values:[{},...]})
                onBeforeSave: function (args) {
                    // 自己处理数据保存
                    args.cancel = true;

                    var deptData = args.values[0].newValues;
                    var s = JSON.stringify(deptData);
                    $.post(getDataUrl("saveDeptInfo"), s, function (ajaxResult) {
                        if (ajaxResult.Succeed) {
                            $("#deptinfo").bdpEditPanel("cancelEdit");
                            setBtnStatus(false);
                            //新增部门要刷新树
                            if (deptData.OrgDepartmentId == "") {
                                var pnodeid = deptData.DeptParent;
                                if (pnodeid == "") pnodeid = deptData.CompanyId;
                                var pnode = $('#botree').omTree("findNode", "id", pnodeid);
                                //var deptid = JSON.parse(ajaxResult.Data || "");
                                var deptid = ajaxResult.Data || "";
                                var node = {
                                    id: deptid,
                                    text: deptData.DeptName,
                                    pid: pnodeid,
                                    classes: "dept",
                                    tag: deptData.CompanyId
                                };
                                $("#botree").omTree("insert", node, pnode);
                                $("#botree").omTree("expand", pnode);
                                $("#botree").omTree("select", node);
                            }
                        } else {
                            $.omMessageBox.alert({ content: ajaxResult.Message })
                        }
                    }, 'json')
                }
            });
            //#endregion
            //$("#master_content").css("padding", "1px");
        });
    </script>
</asp:Content>
<asp:Content ID="Content3" ContentPlaceHolderID="PlaceToolbar" runat="server">
    <div id="menu"></div>
</asp:Content>
<asp:Content ID="Content4" ContentPlaceHolderID="PlaceSearch" runat="server">
    <%--如果要显示搜索框，请将下行的none改为block--%>
    <div style="display: none; top: 2px; margin-right: 3px; position: relative;"
        title="搜索, 模糊匹配">
        <input id="edtSearchText" />
        <img id="btnSearch" alt="搜索" src="" />
    </div>
    <script type="text/javascript">
        $(document).ready(function () {
            $('#edtSearchText:visible').omSuggestion({
                dataSource: '',
                minChars: 3,
                listMaxHeight: 40
            }).width(75);
            $("#btnSearch:visible").attr("src", getImageUrl("sousuo.gif"));
        });
    </script>
</asp:Content>
<asp:Content ID="Content6" ContentPlaceHolderID="PlaceLeft" runat="server">
    <div id="botree"></div>
</asp:Content>
<asp:Content ID="Content5" ContentPlaceHolderID="PlaceContent" runat="server">
    <div id="pdeptinfo">
        <div id="deptinfo"></div>
    </div>
</asp:Content>
