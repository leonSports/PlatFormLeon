<%@ Page Title="" Language="C#" MasterPageFile="~/Frame/Master/SingleTable.Master" AutoEventWireup="true" CodeBehind="WfView.aspx.cs" Inherits="Hongbin.Web.Frame.Wf.Apply.WfView" %>

<asp:Content ID="Content1" ContentPlaceHolderID="PlaceCss" runat="server">
    <link href="../Common/gooflow/GooFlow.css" rel="stylesheet" />
    <link href="../Common/BdpFlow.css" rel="stylesheet" />
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="head" runat="server">
    <script src="../Common/gooflow/GooFlow.js"></script>
    <script src="../Common/BdpFlow.js"></script>
    <script type="text/javascript">
        $(document).ready(function () {
            $('#tools').omButtonbar({
                btns: [{
                    id: 'btnClose', label: '关闭', icons: { leftCss: 'bdp-icons-close' },
                    onClick: function () {
                        window.close();
                    }
                }, {
                    id: 'btnRefresh', label: '刷新', icons: { leftCss: 'bdp-icons-refresh' },
                    onClick: function (event) {
                        var sUrl = getCommonDataUrl("WFGetFlowExecuteInfo", "id=<%=ActionId%>");
                        jdpExec(sUrl, function (ajaxResult) {
                            if (ajaxResult.Succeed) {
                                // 主表信息
                                $('#minfo').bdpEditPanel('setValues', ajaxResult.Data);
                                if (ajaxResult.Data.AuditObjectViewUrl) {
                                    $('#minfo_edit_ActionName')
                                        .wrapInner('<a href="' + ajaxResult.Data.AuditObjectViewUrl +
                                            '" target="_blank" title="查看审批内容..."></a>');
                                }
                                var logsData = { rows: ajaxResult.Data.Logs || [] };
                                logsData.total = logsData.rows.length;
                                $('#gridlog').omGrid('setData', logsData);
                                createFlowView('flowgraph', ajaxResult.Data)
                                $('.GooFlow_item', $('#flowgraph')).on('mouseenter', function () {
                                    var nodeid = $(this).prop("id").split("_")[1] || "",
                                        logIndexs = [];
                                    $.each(logsData.rows, function (index, log) {
                                        if ((nodeid == "start" && log.NodeOrder == -1) || log.NodeId == nodeid) {
                                            logIndexs.push(index);
                                        }
                                    });
                                    $('#gridlog').omGrid('setSelections', logIndexs);
                                });
                                $(window).resize();
                            } else {
                                alert("获取流程数据错误！" + ajaxResult.Message);
                            }
                        });
                    }
                }]
            });
            //$('#flowlogs').css({ 'padding': '15px' });

            $('#minfo').bdpEditPanel({
                isView: true,
                gridLine: true,
                columnCount: 2,
                colModel: [{
                    header: '<b>业务名称</b>', name: 'ActionName', editor: {
                        colspan: 2,
                        renderer: function (cm, value) {
                            return '<b>' + value + '</b>';
                        }
                    }
                }, {
                    header: '业务类别', name: 'BillKindName'
                }, {
                    header: '提交人', name: 'SubmitPerson'
                }, {
                    header: '提交日期', name: 'SubmitDate'
                }, {
                    header: '审批流程', name: 'FlowName'
                }, {
                    header: '当前结点', name: 'NodeName'
                }, {
                    header: '审批状态', name: 'AuditState'
                }]
            });

            $('#gridlog').omGrid({
                limit: -1,
                height: 260,
                colModel: [{
                    header: '流程结点', name: 'FlowNode', width: 130,
                    renderer: function (value, rowData, rowIndex) {
                        return rowData.NodeOrder <= 0 ? "发起" : rowData.NodeOrder + " - " + rowData.NodeName;
                    }
                }, {
                    header: '审批人', name: 'AuditPerson', align: 'center', width: 70
                }, {
                    header: '时间', name: 'AuditDate', width: 140
                }, {
                    header: '通过', name: 'IsPassed', align: "center", width: 30,
                    renderer: function (value, rowData, rowIndex) {
                        return rowData.State != '已审批' || rowData.AuditOpinion == "(被抢先)" ? "" : value ? "√" : "×";
                    }
                }, {
                    header: '会签', name: 'IsCountersign', align: "center", width: 30,
                    renderer: function (value, rowData, rowIndex) {
                        return value ? "√" : "×";
                    }
                }, {
                    header: '终止', name: 'IsEnd', align: "center", width: 30,
                    renderer: function (value, rowData, rowIndex) {
                        return rowData.AuditOpinion == "(被抢先)" ? "" : value ? "√" : "×";
                    }
                }, {
                    header: '状态', name: 'State', align: 'center', width: 50
                }, {
                    header: '意见', name: 'AuditOpinion', width: 'autoExpand'
                }, {
                    header: '备注', name: 'Remark', width: 150
                }]
            });

            $(window).resize(function () {
                var w = $('#cb').width() - $('#flowgraph').width() - 40;
                $('#flowlogs').width(w);
                $('#gridlog').omGrid('resize');
            }).resize();

            $('#btnRefresh').omButton('click');
        });
    </script>
</asp:Content>
<asp:Content ID="Content3" ContentPlaceHolderID="PlaceToolbar" runat="server">
    <div id="tools"></div>
</asp:Content>
<asp:Content ID="Content4" ContentPlaceHolderID="PlaceSearch" runat="server">
</asp:Content>
<asp:Content ID="Content5" ContentPlaceHolderID="PlaceContent" runat="server">
    <div id="cb" style="position: relative;">
        <div id="flowgraph" style="position: relative; float: left; margin-top: 15px; margin-left: 3px;"></div>
        <div id="flowlogs" style="position: relative; float: left; margin-top: 5px; margin-left: 7px;">
            <div id="minfo" style="width: 98%;"></div>
            <div id="divlogs">
                <table id="gridlog"></table>
            </div>
        </div>
    </div>
</asp:Content>
