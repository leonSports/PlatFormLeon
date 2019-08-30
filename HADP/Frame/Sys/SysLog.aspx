<%@ Page Title="" Language="C#" MasterPageFile="~/Frame/Master/SingleTable.Master" AutoEventWireup="true" CodeBehind="SysLog.aspx.cs" Inherits="Hongbin.Web.Frame.Sys.SysLog" %>

<asp:Content ID="Content1" ContentPlaceHolderID="PlaceCss" runat="server">
    <style type="text/css">
        /*.btn-table td.om-state-focus {
            background-color: transparent;
        }*/
    </style>
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="head" runat="server">
    <script type="text/javascript">
        $(document).ready(function () {
            $('#tools').omButtonbar({
                btns: [{
                    id: 'cx', label: '设置查询',
                    icons: { leftCss: "bdp-icons-search" },
                    onClick: function (event) {
                        var isClosed = $('#cc').omBorderLayout('isClosed', 'north');
                        if (!isClosed) {
                            $('#cc').omBorderLayout('closeRegion', 'north');
                        } else {
                            $('#cc').omBorderLayout('openRegion', 'north');
                        }
                        $(window).resize();
                    }
                }, {
                    id: 'del', label: '删除',
                    icons: { leftCss: "bdp-icons-delete" },
                    onClick: function (event) {
                        var selections = $('#grid').omGrid('getSelections', true);
                        if (selections.length > 0) {
                            $.omMessageBox.confirm({
                                title: '确认删除',
                                content: "您确定要删除选中的" + selections.length + "条日志信息吗？",
                                onClose: function (value) {
                                    if (value) {
                                        var values = [];
                                        $.each(selections, function (i, rd) { values.push(rd.LogId); });
                                        jdpExec(getCommonDataUrl("LogDelete"), JSON.stringify(values));
                                        $('#grid').omGrid('reload');
                                    }
                                }
                            })
                        }
                    }
                }, {
                    id: 'clear', label: '清空',
                    icons: { leftCss: 'bdp-icons-clear' },
                    onClick: function (event) {
                        $.omMessageBox.confirm({
                            title: "确认清除",
                            content: "该操作将清空符合条件的所有日志信息，您确定要执行吗？",
                            onClose: function (value) {
                                if (value) {
                                    jdpExec(getCommonDataUrl("LogDelete"), "[]");
                                    $('#grid').omGrid('reload');
                                }
                            }
                        });
                    }
                }, { separtor: true }, {
                    id: 'refresh', label: '刷新',
                    icons: { leftCss: 'bdp-icons-refresh' },
                    onClick: function (event) {
                        $('#grid').omGrid('reload');
                    }
                }, { separtor: true }, {
                    id: 'clearbuffer', label: '清除系统缓存',
                    onClick: function (event) {
                        jdpExec(getCommonDataUrl("ClearSystemBuffer"));
                    }
                }]
            });
            $('#cc').omBorderLayout({
                fit: true, spacing: 7,
                panels: [{
                    id: 'ct',
                    region: 'north',
                    header: false,
                    closable: true,
                    closed: true
                }, {
                    id: 'cl',
                    region: 'west',
                    resizable: true,
                    header: false
                }, {
                    id: 'cr',
                    region: 'center',
                    header: false
                }],
                onAfterDrag: function (element, event) {
                    $('#grid').omGrid('resize');
                }
            });

            $('#searchbox').width('80%').bdpEditPanel({
                columnCount: 4, gridLine: true,
                colModel: [{
                    header: '开始日期', name: 'StartDate', editor: { type: 'date' }
                }, {
                    header: '结束日期', name: 'EndDate', editor: { type: 'date' }
                }, {
                    header: '系统用户', name: 'UserName', editor: { hint: '模糊匹配' }
                }, {
                    header: '客户机IP', name: 'IP', editor: { hint: '模糊匹配' }
                }, {
                    header: "事件级别", name: "LogLevels",
                    editor: {
                        colspan: 2,
                        onCreateEditControl: function (ctrlId, cm, parent) {
                            return $('div.xzjb').prop('id', ctrlId).appendTo(parent).show();
                        },
                        onSetValue: function (cm, value) {
                            var vArr = $.isArray(value) ? value : [];
                            $('div.xzjb :checkbox').each(function (i, input) {
                                $(input).attr('checked', $.inArray($(input).val(), vArr) != -1);
                            });
                        },
                        onGetValue: function (cm) {
                            var vArr = [];
                            $('div.xzjb :checkbox').each(function (i, input) {
                                if ($(input).attr('checked'))
                                    vArr.push($(input).val());
                            });
                            return vArr;
                        }
                    }
                }, {
                    header: "", name: "op",
                    editor: {
                        colspan: 2,
                        onCreateEditControl: function (ctrlId, cm, parent) {
                            var div = $('<div></div>').prop('id', ctrlId).appendTo(parent);
                            $('<a>').appendTo(div).omButton({
                                label: '清除',
                                icons: { leftCss: 'bdp-icons-clear' },
                                onClick: function (event) {
                                    $('#searchbox').bdpEditPanel('setValues', {});
                                }
                            });
                            $('<a>').appendTo(div).omButton({
                                label: '查询',
                                icons: { leftCss: 'bdp-icons-search' },
                                onClick: function (event) {
                                    var args = $('#searchbox').bdpEditPanel('getValues').newValues;
                                    s = getCommonDataUrl('LogGetData', "QueryParam=" + JSON.stringify(args));
                                    $('#grid').omGrid('setData', s);
                                }
                            });
                            return div;
                        }
                    }
                }]
            });

            $('#grid').omGrid({
                dataSource: getCommonDataUrl("LogGetData"),
                keyFieldName: 'LogId',
                autoFit: true,
                width: 'fit',
                height: 'fit',
                singleSelect: false,
                showIndex: true,
                editMode: 'fixpanel',
                fixPanelId: "logDetail",
                editOnDblclick: true,
                editOptions: {
                    editors: {
                        gridLine: true,
                        isView: true,
                        columnCount: 2
                    }
                },
                colModel: [{
                    header: '级别', name: 'LogLevelName', width: 60,
                    renderer: function (colValue, rowData, rowIndex) {
                        var icon = rowData.LogLevel == 0 ? "bdp-icons-debug" :
                                   rowData.LogLevel == 1 ? "bdp-icons-alert" :
                                   rowData.LogLevel == 2 ? "bdp-icons-warning" : "bdp-icons-error";
                        var span = $('<span>&nbsp;&nbsp;&nbsp;&nbsp;</span>').addClass(icon).width(16).height(16).css('margin-right', 5);
                        var s = span[0].outerHTML;
                        return s + colValue;
                        //var ht = '<div style="position:relative;">'
                        //ht += '<span style="width:16px; height:16px;" class="';
                        //switch (rowData.LogLevel) {
                        //    case 0: ht += "bdp-icons-debug"; break;
                        //    case 1: ht += "bdp-icons-alert"; break;
                        //    case 2: ht += "bdp-icons-warning"; break;
                        //    case 3: ht += "bdp-icons-error"; break;
                        //}
                        //ht += '"></span>';
                        //ht += '<span style="position: absolute; top:5px; left: 23px;">';
                        //ht += colValue;
                        //ht += "</span>";
                        //ht += "</div>";
                        //return ht;
                    },
                    editor: {
                        caption: '事件级别', index: 1
                    }
                }, {
                    header: '时间', name: 'LogDateTime', width: 150, editor: { index: 2 }
                }, {
                    header: '用户', name: 'LogUserName', width: 80, editor: {
                        caption: '系统用户', index: 3
                    }
                }, {
                    header: '公司', name: 'Company', visible: false, editor: { index: 4 }
                }, {
                    header: '部门', name: 'Department', visible: false, editor: { index: 5 }
                }, {
                    header: '客户机IP', name: 'UserIp', visible: false, editor: { index: 6 }
                }, {
                    header: '请求地址', name: 'RequestAddress', visible: false,
                    editor: { type: 'memo', index: 7, colspan: 2 }
                }, {
                    header: '信息', name: 'LogMessage', width: 'autoExpand',
                    editor: {
                        index: -1
                    }
                }, {
                    header: '详细信息', name: 'DetailMessage', visible: false,
                    editor: {
                        type: 'memo',
                        index: 8,
                        colspan: 2
                    }
                }]
            });
            //$('img[class^="bdp-icons-"]').css({ width: 16, height: 16, 'margin-left': 5 });

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
<asp:Content ID="Content4" ContentPlaceHolderID="PlaceSearch" runat="server">
</asp:Content>
<asp:Content ID="Content5" ContentPlaceHolderID="PlaceContent" runat="server">
    <div id="cc">
        <div id="ct">
            <div id="searchbox">
                <%--<input type="checkbox" value="0" name />--%>
            </div>
        </div>
        <div id="cl">
            <table id="grid"></table>
        </div>
        <div id="cr">
            <div id="logDetail" style="padding: 5px;"></div>
        </div>
    </div>
    <div class="xzjb" style="display: none;">
        <div class="xzjb-g">
            <input type="checkbox" value="0" name="debug" id="chk-debug" />
            <label class="xzjb-l" for="chk-debug">
                <img class="bdp-icons-debug" />调试
            </label>
        </div>

        <div class="xzjb-g">
            <input type="checkbox" value="1" name="info" id="chk-info" />
            <label class="xzjb-l" for="chk-info">
                <img class="bdp-icons-alert" />信息
            </label>
        </div>
        <div class="xzjb-g">
            <input type="checkbox" value="2" name="warning" id="chk-warning" />
            <label class="xzjb-l" for="chk-warning">
                <img class="bdp-icons-warning" />警告
            </label>
        </div>
        <div class="xzjb-g">
            <input type="checkbox" value="3" name="error" id="chk-error" />
            <label class="xzjb-l" for="chk-error">
                <img class="bdp-icons-error" />错误
            </label>
        </div>

    </div>
    <style type="text/css">
        div.xzjb {
            position: relative;
        }

        div.xzjb-g {
            display: inline-block;
            float: left;
            padding-right: 17px;
        }

        label.xzjb-l {
            display: inline-block;
        }

            label.xzjb-l > img {
                width: 16px;
                height: 16px;
            }
    </style>
</asp:Content>
