<%@ Page Title="" Language="C#" MasterPageFile="~/Frame/Master/SingleTable.Master" AutoEventWireup="true" CodeBehind="DataStatistic.aspx.cs" Inherits="Hongbin.Web.Frame.editor.DataStatistic" %>

<asp:Content ID="Content1" ContentPlaceHolderID="PlaceCss" runat="server">
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="head" runat="server">
    <script type="text/javascript">
        $(document).ready(function () {
            $('#btns').omButtonbar({
                btns: [{
                    id: 'btnSet', label: '设置',
                    onClick: function () {
                        $('#dlg').omDialog('open');
                    }
                }, {
                    id: 'test', label: '统计',
                    onClick: function () {
                        $.ajax({
                            url: getCommonDataUrl('BdpDataCount', {
                                type: 'Hongbin.Data.BdpBaseData.BdpPrivUser',
                                mgf: 'CompanyId,UserType',
                                sgf: 'SexText,UserType'
                            }),
                            dataType: 'json',
                            success: function (ajaxResult) {
                                if (ajaxResult.Succeed) {
                                    $('#grid').bdpDataStatisticGrid({
                                        data: ajaxResult.Data,
                                        zeroBlank: true,
                                        showNumberColumn: true,
                                        showPercentColumn: true,
                                        percentDigits: 2,
                                        colModel: [
                                            { header: '公司', name: 'CompanyId' },
                                            { header: '性别', name: 'SexText' },
                                            { header: '用户类型', name: 'UserType' }
                                        ]
                                    });
                                } else {
                                    $.omMessageTip.show({ type: 'error', content: ajaxResult.Message || '操作失败', timeout: 3000 });
                                }
                            }

                        });

                    }
                }, {
                    id: 'toexcel', label: '导出',
                    onClick: function () {
                        $('#grid').bdpDataStatisticGrid('toExcel', { title: '用户数统计表' });
                    }
                }]
            });

            $('#rtcntr').css({ 'padding': '1px' });
            $('#opsbox').omPanel({
                height: 200,
                title: '设置',
                collapsible: true

            });

        });
    </script>
</asp:Content>
<asp:Content ID="Content3" ContentPlaceHolderID="PlaceToolbar" runat="server">
    <div id="btns"></div>
</asp:Content>
<asp:Content ID="Content4" ContentPlaceHolderID="PlaceSearch" runat="server">
</asp:Content>
<asp:Content ID="Content5" ContentPlaceHolderID="PlaceContent" runat="server">
    <div id="rtcntr">
        <div id="opsbox"></div>
    </div>
    <div id="grid"></div>

    <div id="dlg">
        <form id="myform">
            <input id="cbx" name="cbx" />
        </form>
    </div>
    <script type="text/javascript">
        $(document).ready(function () {
            $('#dlg').omDialog({
                width: 450,
                height: 350,
                buttons: [{
                    text: '确定',
                    click: function () {
                        if ($('#myform').valid()) {
                            $('#dlg').omDialog('close');
                        }
                    }
                }]
            });

            $('#cbx').omCombo({
                dataSource: [{ text: '男', value: '1' }, { text: '女', value: '0' }, { text: '', value: '' }],
                value: ''
            });
            $('#myform').validate({
                rules: {
                    cbx: {
                        required: true
                    }
                },
                messages: {
                    cbx: {
                        reqyuired: '必须选择一个值！'
                    }
                }
            });
        });

    </script>


    <a id="a1"></a>
</asp:Content>
