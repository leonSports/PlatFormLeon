<%@ Page Title="" Language="C#" MasterPageFile="~/Frame/Master/SingleTable.Master" AutoEventWireup="true" CodeBehind="SysLogOper.aspx.cs" Inherits="Hongbin.Web.Frame.Sys.SysLogOper" %>

<asp:Content ID="Content1" ContentPlaceHolderID="PlaceCss" runat="server">
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="head" runat="server">
    <script type="text/javascript">
        $(document).ready(function () {
            $('#tools').omButtonbar({
                btns: [{
                    id: 'clear', label: '清空日志',
                    icons: { leftCss: 'bdp-icons-clear' },
                    onClick: function (event) {
                        $.omMessageBox.confirm({
                            content: "确定要清除吗？",
                            onClose: function (value) {
                                if (value) {
                                    var args = $('#cxpnl').bdpEditPanel('getValues').newValues;
                                    s = getCommonDataUrl('LogOpDelete', "QueryParam=" + JSON.stringify(args));
                                    jdpExec(s);
                                    $('#refresh').click();
                                }
                            }
                        })
                    }
                }, { separtor: true }, {
                    id: 'refresh', label: '刷新', icons: { leftCss: 'bdp-icons-refresh' },
                    onClick: function (event) {
                        $('#cxpnl').bdpEditPanel('setValues', {});
                        $('#grid2').omGrid('setData', '');
                        $('#grid1').omGrid('setData', getCommonDataUrl("LogOpGetData"));
                    }
                }, { separtor: true }, {
                    id: "export", label: "导出",
                    icons: { leftCss: 'bdp-icons-excel_07' },
                    onClick: function (event) {
                        var args = $('#cxpnl').bdpEditPanel('getValues').newValues;
                        var sUrl = getCommonDataUrl('LogOpExpData', "QueryParam=" + JSON.stringify(args));
                        var options = {
                            title: '系统操作记录',
                            allowSelectColumn: false,
                            dataSource: sUrl,
                            colModel: [
                                { header: '用户名', name: 'UserName', width: 12, mergeRowBy: 'LoginId' }
                                , { header: '登录时间', name: 'LoginTime', width: 20, mergeRowBy: 'LoginId' }
                                , { header: '登录IP', name: 'RemoteAddress', width: 20, mergeRowBy: 'LoginId' }
                                , { header: '操作时间', name: 'OperTime', width: 20 }
                                , { header: '模块', name: 'OperModule', width: 20 }
                                , { header: '操作说明', name: 'OperDesc', width: 40 }
                            ]
                        };
                        $.toExcel(options);
                    }
                }]
            });
            $('#cx').omPanel({
                //title: "设置查询条件",
                //collapsible: true
                header: false
            });
            $('#ct').omPanel({
                //title: "登录批次",
                //collapsible: true
                header: false
            });
            $('#cb').omPanel({
                //title: "操作日志",
                //collapsible: true
                header: false
            });

            $('#cxpnl').width('80%').bdpEditPanel({
                columnCount: 3,
                gridLine: true,
                colModel: [{
                    header: '仅在线用户', name: 'online', editor: { type: 'checkbox' }
                }, {
                    header: '用户名', name: 'UserName'
                }, {
                    header: '登录IP', name: 'RemoteAddress'
                }, {
                    header: '登录时间段-开始', name: 'LoginTimeStart',
                    editor: { type: 'date', options: { showTime: true } }
                }, {
                    header: '结束', name: 'LoginTimeEnd',
                    editor: { type: 'date', options: { showTime: true } }
                }, {
                    header: '', name: 'op', editor: {
                        onCreateEditControl: function (ctrlId, cm, parent) {
                            var div = $('<div></div>').prop('id', ctrlId).appendTo(parent);
                            $('<a>').appendTo(div).omButton({
                                label: '重置',
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
                                    s = getCommonDataUrl('LogOpGetData', "QueryParam=" + JSON.stringify(args));
                                    $('#grid1').omGrid('setData', s);
                                }
                            });
                            return div;
                        }
                    }
                }]
            });

            $('#grid1').omGrid({
                title: '登录',
                dataSource: getCommonDataUrl('LogOpGetData'),
                autoFit: true,
                limit: 10,
                height: 320,
                keyFieldName: 'LoginId',
                colModel: [{
                    header: '用户名', name: 'UserName', width: 120
                }, {
                    header: '登录时间', name: 'LoginTime', width: 130
                }, {
                    header: '登录IP', name: 'RemoteAddress', width: 120
                }, {
                    header: '当前模块', name: 'CurrentModule', width: 120
                }, {
                    header: '最近操作时间', name: 'LastActiveTime', width: 130
                }, {
                    header: '在线', name: 'IsOnline', width: 120
                }, {
                    header: '退出时间', name: 'LogoutTime', width: 130
                }],
                onRowSelect: function (rowIndex, rowData, event) {
                    var s = getCommonDataUrl("LogOpGetDetailData", "loginid=" + rowData.LoginId);
                    $('#grid2').omGrid('setData', s);
                }
            });

            $('#grid2').omGrid({
                title: '操作日志',
                autoFit: true,
                limit: 10,
                height: 320,
                editOnDblclick: true,
                colModel: [{
                    header: '操作时间', name: 'OperTime', width: 150
                }, {
                    header: '模块', name: 'OperModule', width: 120
                }, {
                    header: '操作机', name: 'RemoteAddress', width: 110
                }, {
                    header: '操作说明', name: 'OperDesc', width: 'autoExpand',
                    editor: {
                        type: 'memo', rows: 5
                    }
                }],
                editOptions: {
                    title: '操作日志',
                    width: 550,
                    editors: {
                        gridLine: true,
                        columnCount: 1,
                        isView: true
                    }
                }
            });

            $(window).resize(function () {
                $('#grid1,#grid2').omGrid('resize');
            }).resize();
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
        <table id="grid1"></table>
    </div>
    <div id="cb">
        <table id="grid2"></table>
    </div>
</asp:Content>
