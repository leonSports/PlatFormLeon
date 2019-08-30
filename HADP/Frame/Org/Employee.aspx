<%@ Page Title="" Language="C#" MasterPageFile="~/Frame/Master/SingleTable.Master" AutoEventWireup="true" CodeBehind="Employee.aspx.cs" Inherits="Hongbin.Web.Frame.Org.Employee" %>

<asp:Content ID="Content1" ContentPlaceHolderID="PlaceCss" runat="server">
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="head" runat="server">
    <script type="text/javascript">
        $(document).ready(function () {
            $('#tools').omButtonbar({
                btns: [{
                    id: 'add', label: '新增', icons: { leftCss: 'bdp-icons-add' },
                    onClick: function (event) {
                        $('#grid').omGrid('createNew');
                    }
                }, {
                    id: 'addcopy', label: '复制增加', icons: { leftCss: 'bdp-icons-addcopy' },
                    onClick: function (event) {
                        $('#grid').omGrid('createNew', true);
                    }
                }, {
                    id: 'edit', label: '编辑', icons: { leftCss: 'bdp-icons-edit' },
                    onClick: function (event) {
                        var sel = $('#grid').omGrid('getSelections');
                        if (sel.length > 0) {
                            $('#grid').omGrid('startEdit');
                        }
                    }
                }, {
                    id: 'del', label: '删除', icons: { leftCss: 'bdp-icons-delete' },
                    onClick: function (event) {
                        var sel = $('#grid').omGrid('getSelections');
                        if (sel.length > 0) {
                            $.omMessageBox.confirm({
                                title: '删除确认',
                                content: '确定要删除选中的人员吗?',
                                onClose: function (sureDelete) {
                                    if (sureDelete) {
                                        $('#grid').omGrid('deleteSelections');
                                    }
                                }
                            });
                        }
                    }
                }, { separtor: true }, {
                    id: 'refresh', label: '刷新', icons: { leftCss: 'bdp-icons-refresh' },
                    onClick: function (event) {

                    }
                }, { separtor: true }, {
                    id: 'move', label: '调整部门', icons: { leftCss: 'bdp-icons-goods_Change' },
                    onClick: function (event) {
                        var sel = $('#grid').omGrid('getSelections');
                        if (sel && sel.length > 0) {
                            $('#mbo').bdpSelector('open');
                        }
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
            _setBtnStatus = function () {
                var sel = $('#grid').omGrid('getSelections'),
                    selBo = $('#botree').omGrid('getSelected');
                $('#add,#addcopy').omButton(selBo && selBo.length > 0 ? 'enable' : 'disable');
                $('#edit,#del,#move').omButton(sel && sel.length > 0 ? 'enable' : 'disable');
            };

            $('#cc').omBorderLayout({
                fit: true,
                panels: [{
                    id: 'ct', region: 'north',
                    header: false
                }, {
                    id: 'cl', region: 'west', header: false, width: '30%', resizable: true
                }, {
                    id: 'cr', region: 'center', header: false
                }],
                afterDrag: function (element, event) {
                    $('#grid').omGrid('resize');
                }
            });

            //#region 机构树
            $("#botree").omTree({
                dataSource: getCommonDataUrl("getBOTreeData"),
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
                    //if (!$("#save").attr("disabled")) {
                    //    $.omMessageBox.alert({ content: "正在编辑，不能切换！" });
                    //    return false;
                    //}
                },
                onSelect: function (nodeData) {
                    _setBtnStatus();
                    refreshGridData();
                }

            });
            // 调整部门时的选择树
            $('#mbo').bdpSelector({
                title: '请选择新部门',
                singleSelect: true,
                allowQuickSearch: false,
                treeDataSource: getCommonDataUrl("getBOTreeData"),
                onBeforeRequestData: function (args, node, forGrid) {
                    if (!forGrid) {
                        args.dwid = node.classes == 'company' ? node.id : node.tag;
                        args.bmid = node.classes == 'company' ? '' : node.id;
                    }
                },
                tree: {
                    simpleDataModel: true
                },
                onClose: function (event) {
                    var isSureClosed = $('#mbo').bdpSelector('isSureClosed');
                    if (isSureClosed) {
                        var sel = $('#grid').omGrid('getSelections', true),
                            dst = $('#mbo').bdpSelector('getSelections'),
                            sUrl = getCommonDataUrl('DEUpdate', 'type=Hongbin.Data.BdpBaseData.BdpOrgEmployee');
                        dwid = dst[0].id, bmid = '';
                        if (dst[0].classes == 'dept') {
                            bmid = dst[0].id;
                            dwid = dst[0].tag;
                        }
                        // DEUpdate要求的数据格式是:[{oldValues:{},newValues:{}},...]
                        var data = [{
                            newValues: {
                                EmployeeId: sel[0].EmployeeId,
                                CompanyId: dwid,
                                OrgDepartmentId: bmid
                            }, oldValues: {}
                        }];
                        jdpExec(sUrl, data, function (ajaxResult) {
                            if (ajaxResult.Succeed) {
                                $('#grid').omGrid('reload');
                            } else {
                                $.omMessageBox.alert({ content: '操作失败。' + ajaxResult.Message })
                            }
                        });
                    }
                }
            });
            //#endregion

            //#region 人员表
            $.validator.addMethod("empCodeCheck", function (value) {
                var isvalid = true;
                if (value != '') {
                    var ryid = '',
                        selRy = $('#grid').omGrid('getSelections', false);
                    if (selRy && selRy.length > 0) {
                        selRy = $('#grid').omGrid('getSelections', true);
                        ryid = selRy[0].EmployeeId;
                    }
                    $.ajax({
                        url: getCommonDataUrl("OrgEmpCodeCheck", { EmployeeId: ryid, EmpCode: value }),
                        type: 'POST',
                        async: false,
                        dataType: 'json',
                        success: function (ajaxResult) {
                            isvalid = ajaxResult.Succeed && ajaxResult.Data;
                        }
                    })
                }
                return isvalid;
            }, "编码重复！")
            var cmCode = $.grep(GlbVar.MP.colModel, function (cm, i) { return cm.name == 'EmpCode' })[0];
            if (cmCode) cmCode.editor.rules = [["maxlength", 20, "人员编码超长！"], ['empCodeCheck', true]];
            $('#grid').omGrid({
                //dataSource: getCommonDataUrl('LogOpGetData'),
                autoFit: false,
                limit: 15,
                height: 'fit',
                keyFieldName: 'EmployeeId',
                editMode: 'dialog',
                editOnDblclick: true,
                editOptions: {
                    title: GlbVar.MP.ETitle || '人员信息',
                    width: 650,
                    editors: {
                        gridLine: true,
                        columnCount: GlbVar.MP.EColumnCount || 2
                    },
                    onNewRecord: function (args) {
                        var node = $('#botree').omTree('getSelected'),
                            dwid = node.id;
                        var bmid = '';
                        if (node.classes == 'dept') {
                            dwid = node.tag;
                            bmid = node.id;
                        }
                        args.record.CompanyId = dwid;
                        args.record.OrgDepartmentId = bmid;
                    },
                    updateUrl: getCommonDataUrl('DEUpdate', 'type=Hongbin.Data.BdpBaseData.BdpOrgEmployee'),
                    deleteUrl: getCommonDataUrl('DEDelete', 'type=Hongbin.Data.BdpBaseData.BdpOrgEmployee')
                },
                colModel: GlbVar.MP.colModel,
                /*
                colModel: [{
                    header: '人员编码', name: 'EmpCode', width: 70,
                    editor: {
                        rules: [["maxlength", 20, "人员编码超长！"],
                            ['empCodeCheck', true]]
                    }
                }, {
                    header: '姓名', name: 'EmpName', width: 90,
                    editor: {
                        rules: [['required', true, '姓名不能为空！'], ["maxlength", 50, "姓名超长！"]]
                    }
                }, {
                    header: '性别', name: 'EmpGenderText', width: 50,
                    editor: {
                        type: 'combo',
                        name: 'EmpGender',
                        options: {
                            dataSource: getCommonDataUrl("getCodes", {
                                type: "Hongbin.Data.BdpBaseData.BdpCodeSex",
                                key: "SexId",
                                text: "Name"
                            }),
                            //inputField: "Name",
                            //textField: "Name",
                            valueField: "SexId",
                            optionField: "Name"
                        }
                    }
                }, {
                    header: '曾用名', name: 'UsedName', width: 90, editor: {
                        rules: [["maxlength", 50, "曾用名超长！"]]
                    }
                }, {
                    header: '身份证号', name: 'IdNumberCode', width: 70, editor: { rules: [["maxlength", 20, "身份证号码超长！"]] }
                }, {
                    header: '民族', name: 'NationText', width: 70,
                    editor: {
                        type: 'combo', name: 'Nation',
                        options: {
                            dataSource: getCommonDataUrl("getCodes", {
                                type: "Hongbin.Data.BdpBaseData.BdpCodeNation",
                                key: "NationId",
                                text: "Nation"
                            }),
                            //inputField: "Name",
                            //textField: "Name",
                            valueField: "NationId",
                            optionField: "Nation"
                        }
                    }
                }, {
                    header: '政治面貌', name: 'PoliticalBackgroundText', width: 70,
                    editor: {
                        type: 'combo', name: 'PoliticalBackground',
                        options: {
                            dataSource: getCommonDataUrl("getCodes", {
                                type: "Hongbin.Data.BdpBaseData.BdpCodePolitical",
                                key: "PoliticalStatusId",
                                text: "PoliticalStatus"
                            }),
                            //inputField: "Name",
                            //textField: "Name",
                            valueField: "PoliticalStatusId",
                            optionField: "PoliticalStatus"
                        }
                    }
                }, {
                    header: '上级领导', name: 'LeadershipText', width: 70,
                    editor: {
                        type: 'refer', name: 'Leadership',
                        options: {
                            mode: 'pick',
                            valueField: 'EmployeeId',
                            textField: 'EmpName',
                            editOptions: {
                                qnTreeId: 'id',
                                qnGridKey: 'EmployeeId',
                                treeDataSource: getCommonDataUrl("getBOTreeData"),
                                gridDataSource: getCommonDataUrl("OrgGetEmployees"),
                                tree: {
                                    simpleDataModel: true
                                },
                                grid: {
                                    colModel: [{
                                        header: '人员编码', name: 'EmpCode'
                                    }, {
                                        header: '姓名', name: 'EmpName'
                                    }, {
                                        header: '性别', name: 'EmpGenderText'
                                    }]
                                },
                                onBeforeRequestData: function (args, node, forGrid) {
                                    if (forGrid) {
                                        var dwid = node.id;
                                        var bmid = '';
                                        if (node.classes == 'dept') {
                                            dwid = node.tag;
                                            bmid = node.id;
                                        }
                                        args.dwid = dwid;
                                        args.bmid = bmid;
                                    } else {
                                        args.dwid = node.classes == 'company' ? node.id : node.tag;
                                        args.bmid = node.classes == 'company' ? '' : node.id;
                                    }
                                }
                            }
                        }
                    }
                }, {
                    header: '出生日期', name: 'Birthday', width: 70,
                    editor: { type: 'date' }
                }, {
                    header: '工作时间', name: 'JoinWorkDate', width: 70,
                    editor: { type: 'date' }
                }, {
                    header: '本企业时间', name: 'JoinCompanyDate', width: 70,
                    editor: { type: 'date' }
                }, {
                    header: '文化程度', name: 'CulturalLevelText', width: 70,
                    editor: {
                        type: 'combo', name: 'CulturalLevel',
                        options: {
                            dataSource: getCommonDataUrl("getCodes", {
                                type: "Hongbin.Data.BdpBaseData.BdpCodeEdu",
                                key: "EduId",
                                text: "EduName"
                            }),
                            //inputField: "Name",
                            //textField: "Name",
                            valueField: "EduId",
                            optionField: "EduName"
                        }
                    }
                }, {
                    header: '岗位职务', name: 'DegreeText', width: 70,
                    editor: {
                        type: 'combo', name: 'Degree',
                        options: {
                            dataSource: getCommonDataUrl("getCodes", {
                                type: "Hongbin.Data.BdpBaseData.BdpOrgStation",
                                key: "StationId",
                                text: "Name"
                            }),
                            //inputField: "Name",
                            //textField: "Name",
                            valueField: "StationId",
                            optionField: "Name"
                        }
                    }
                }, {
                    header: '家庭住址', name: 'Address', width: 70,
                    editor: { rules: [["maxlength", 50, "家庭住址超长！"]] }
                }, {
                    header: '邮政编码', name: 'PostalCode', width: 70,
                    editor: { rules: [["maxlength", 10, "邮政编码超长！"]] }
                }, {
                    header: '办公电话', name: 'OfficePhone', width: 70,
                    editor: { rules: [["maxlength", 20, "办公电话超长！"]] }
                }, {
                    header: '家庭电话', name: 'FamilyPhone', width: 70,
                    editor: { rules: [["maxlength", 20, "家庭电话超长！"]] }
                }, {
                    header: '手机', name: 'Phone', width: 70,
                    editor: { rules: [["maxlength", 30, "手机超长！"]] }
                }, {
                    header: '电子邮件', name: 'EMail', width: 70,
                    editor: { rules: [["maxlength", 50, "电子邮件超长！"]] }
                }],
                */
                onRowSelect: function (rowIndex, rowData, event) {
                    _setBtnStatus();
                }
            });
            // 刷新表格数据
            refreshGridData = function () {
                //alert('xx');
                var node = $('#botree').omTree('getSelected');
                if (node == null) return;
                var sub = $('#incsub').prop("checked") ? '1' : '';
                //var filter = escape($('#edtSearchText').val());
                var filter = $('#edtSearchText').val();
                var dwid = node.id;
                var bmid = '';
                if (node.classes == 'dept') {
                    dwid = node.tag;
                    bmid = node.id;
                }
                var s = getCommonDataUrl("OrgGetEmployees", {
                    dwid: dwid, bmid: bmid, sub: sub, filter: filter
                });
                $('#grid').omGrid('setData', s);
            };

            //#endregion

            //#region 快速搜索
            $('#searchbox').show();
            $('#incsub,#btnSearch').click(function (event) {
                refreshGridData();
            });
            $('#edtSearchText').keypress(function (event) {
                if (event.keyCode == 13) refreshGridData();
            });
            //#endregion

            _setBtnStatus();
            $(window).resize(function () {
                $('#cc').omBorderLayout('resize');
                $('#grid').omGrid('resize');
            }).resize();
        });

    </script>
</asp:Content>
<asp:Content ID="Content3" ContentPlaceHolderID="PlaceToolbar" runat="server">
    <div id="tools"></div>
</asp:Content>

<asp:Content ID="Content5" ContentPlaceHolderID="PlaceContent" runat="server">
    <div id="cc">
        <div id="ct"></div>
        <div id="cl">
            <ul id="botree"></ul>
        </div>
        <div id="cr">
            <table id="grid"></table>
        </div>
    </div>
    <div id="mbo"></div>
</asp:Content>
<asp:Content ID="Content6" runat="server" ContentPlaceHolderID="PlaceSearch">
    <div id="searchbox" style="display: none; padding-top: 3px;">
        <input type="checkbox" id="incsub" style="display: inline-block; vertical-align: middle;" />
        <label for="incsub" style="display: inline-block;">包括下级</label>
        <span style="margin-left: 32px; display: inline-block;" title="搜索, 模糊匹配">
            <input id="edtSearchText" style="display: inline-block" />
            <span id="btnSearch" class="bdp-icons-search"
                style="width: 16px; height: 16px; cursor: pointer; display: inline-block">&nbsp;&nbsp;&nbsp;&nbsp;</span>
        </span>
    </div>
</asp:Content>

