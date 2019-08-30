<%@ Page Title="" Language="C#" MasterPageFile="~/Frame/Master/SingleTable.Master" AutoEventWireup="true" CodeBehind="WfDone.aspx.cs" Inherits="Hongbin.Web.Frame.Wf.Apply.WfDone" %>

<asp:Content ID="Content1" ContentPlaceHolderID="PlaceCss" runat="server">
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="head" runat="server">
    <script src="../Common/BdpFlowLoader.js"></script>
    <script type="text/javascript">
        function wfviewobj(detailId) {
            //grid.PerformCallback("viewobj:" + detailId);
        }
        $(document).ready(function () {
            $('#tools').omButtonbar({
                btns: [{
                    id: 'btnRevoke', label: '撤销', icons: { leftCss: 'bdp-icons-clear' },
                    onClick: function () {
                        var rows = $('#grid').omGrid('getSelections', true);
                        if (rows.length > 0) {
                            jdpExec(getCommonDataUrl('WFRevokeAuditing', { wflogid: rows[0].Id }), function (ajaxResult) {
                                $.omMessageBox.alert({
                                    type: ajaxResult.Succeed ? 'alert' : 'error',
                                    title: ajaxResult.Succeed ? '成功' : '失败',
                                    content: ajaxResult.Message,
                                    onClose: function (value) {
                                        if (ajaxResult.Succeed) $('#refresh').click();
                                    }
                                });
                            });
                        }
                    }
                }, {
                    id: 'btnAudit', label: '查看对象', icons: { leftCss: 'bdp-icons-look' },
                    onClick: function () {
                        var rows = $('#grid').omGrid('getSelections', true);
                        if (rows.length > 0) {
                            wfviewobj(rows[0].Id);
                        }
                    }
                }, {
                    id: 'btncx', label: '查询', icons: { leftCss: 'bdp-icons-search' },
                    onClick: function () {
                        if ($('#cx').omPanel('options').collapsed) {
                            $('#cx').omPanel('expand');
                        } else {
                            $('#cx').omPanel('collapse');
                        }
                    }
                }, {
                    id: 'refresh', label: '刷新', icons: { leftCss: 'bdp-icons-refresh' },
                    onClick: function (event) {
                        var args = $('#cxpnl').bdpEditPanel('getValues').newValues;
                        var sUrl = getCommonDataUrl('WfQueryWorks', "dbg=1&done=1&end=" + $.getUrlParam('flag') + "&QueryParam=" + JSON.stringify(args));
                        $('#grid').omGrid('setData', sUrl);
                    }
                }]
            });

            $('#cx').omPanel({
                title: '查询',
                header: false,
                collapsed: true,
                collapsible: true
            });

            $('#ct').omPanel({
                title: '审批',
                collapsible: true
            });
            $('#cb').omPanel({
                title: '审批记录',
                collapsible: false
            });

            $('#cxpnl').bdpEditPanel({
                isView: false,
                gridLine: true,
                columnCount: 3,
                colModel: [{
                    header: '名称', name: 'Name', editor: { hint: "模糊匹配" }
                }, {
                    header: '发起人', name: 'Creator', editor: { hint: "模糊匹配" }
                }, {
                    header: '处理意见', name: 'AuditOpinion', editor: { hint: "模糊匹配" }
                }, {
                    header: '处理日期(开始)', name: 'StartDate', editor: { type: 'date' }
                }, {
                    header: '处理日期(结束)', name: 'EndDate', editor: { type: 'date' }
                }, {
                    header: '', name: 'op', editor: {
                        onCreateEditControl: function (ctrlId, cm, parent) {
                            var div = $('<div></div>').prop('id', ctrlId).appendTo(parent);
                            $('<a>').appendTo(div).omButton({
                                label: '清除',
                                //icons: { leftCss: 'bdp-icons-clear' },
                                width: 75,
                                onClick: function (event) {
                                    $('#cxpnl').bdpEditPanel('setValues', {});
                                }
                            });
                            $('<a>').appendTo(div).omButton({
                                label: '查询',
                                icons: { leftCss: 'bdp-icons-search' },
                                width: 75,
                                onClick: function (event) {
                                    var args = $('#cxpnl').bdpEditPanel('getValues').newValues;
                                    var sUrl = getCommonDataUrl('WfQueryWorks', "dbg=1&done=1&end=" + $.getUrlParam('flag') + "&QueryParam=" + escape(JSON.stringify(args)));
                                    $('#grid').omGrid('setData', sUrl);
                                }
                            });
                            return div;
                        }
                    }
                }]
            });

            $('#grid').omGrid({
                dataSource: getCommonDataUrl('WfQueryWorks', 'dbg=1&done=1&end=' + $.getUrlParam('flag')),
                autoFit: true,
                limit: 10,
                height: 320,
                keyFieldName: 'Id',
                colModel: [{
                    header: '名称', name: 'Name', width: 240, sort: 'serverSide'
                }, {
                    header: '处理时间', name: 'AuditDate', width: 150, sort: 'serverSide'
                }, {
                    header: '发起人', name: 'Creator', width: 80, sort: 'serverSide'
                }, {
                    header: '发起时间', name: 'CreateTime', width: 150, sort: 'serverSide'
                }, {
                    header: '处理意见', name: 'AuditOpinion', width: 'autoExpand', sort: 'serverSide'
                }, {
                    header: '当前状态', name: 'StatusName', width: 80, sort: 'serverSide'
                }],
                onRowSelect: function (rowIndex, rowData, event) {
                    $('#cb').bdpWfViewer({ wfActionId: '', wfLogId: rowData.Id });
                }
            });

            $(window).resize(function () {
                $('#grid').omGrid('resize');
            });
        });
    </script>
</asp:Content>
<asp:Content ID="Content3" ContentPlaceHolderID="PlaceToolbar" runat="server">
    <div id="tools"></div>
</asp:Content>
<asp:Content ID="Content4" ContentPlaceHolderID="PlaceSearch" runat="server">
</asp:Content>
<asp:Content ID="Content5" ContentPlaceHolderID="PlaceContent" runat="server">
    <div id="cx">
        <div id="cxpnl"></div>
    </div>
    <div id="ct">
        <table id="grid"></table>
    </div>
    <div id="cb">
    </div>
</asp:Content>
