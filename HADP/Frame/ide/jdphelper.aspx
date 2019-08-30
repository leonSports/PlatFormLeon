<%@ Page Title="" Language="C#" MasterPageFile="~/Frame/Master/SingleTable.Master" AutoEventWireup="true" CodeBehind="jdphelper.aspx.cs" Inherits="Hongbin.Web.Frame.ide.jdphelper" %>

<asp:Content ID="Content1" ContentPlaceHolderID="PlaceCss" runat="server">
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="head" runat="server">
    <link href="../resources/jsoneditor/jsoneditor.css" rel="stylesheet" />
    <script src="../resources/jsoneditor/jsoneditor.js"></script>
    <script src="../resources/js/bdp-grid-edit.js"></script>
    <script type="text/javascript">
        $(document).ready(function () {
            $("#menu").omButtonbar({
                btns: [{
                    id: "refresh",
                    label: "刷新",
                    icons: { left: getImageUrl('refresh') },
                    onClick: function (event) {
                        $('#jdp').omTree('refresh');
                    }
                }, { separtor: true }, {
                    id: "export",
                    label: "导出",
                    icons: { left: getImageUrl('excel.jpg') },
                    onClick: function (event) {
                        $("#jdp").omGrid('toExcel');
                    }
                }]
            });
            $("#cntr").omBorderLayout({
                panels: [{
                    id: "p1",
                    header: false,
                    region: "center"
                }, {
                    id: "p2",
                    header: false,
                    region: "east",
                    resizable: true,
                    width: "50%"
                }],
                fit: true,
                onAfterDrag: function (s, e) {
                    $("#jdp").omGrid('resize');
                }
            });

            $("#jdp").omGrid({
                title: "数据提供函数列表",
                dataSource: getCommonDataUrl("help"),
                autoFit: true,
                width: 'fit',
                height: 'fit',
                singleSelect: true,
                showIndex: true,
                //limit: 0,
                editMode: "fixpanel",
                fixPanelId: "info",
                editOnDblclick: true,
                editOptions: {
                    //title: '数据提供函数',
                    //width: '100%',
                    editors: {
                        isView: true,
                        gridLine: true,
                        columnCount: 1
                    }
                },
                colModel: [
                    { header: "类名", name: "TypeFullName", width: 220 },
                    { header: "函数", name: "FuncName", width: 150 },
                    { header: "别名", name: "FuncAlia", width: 150 },
                    {
                        header: "说明", name: "FuncDesc", width: 200,
                        editor: {
                            type: "memo",
                            rows: 7,        // 行数
                            resize: "none",    // 是否允许调整尺寸
                            scrollX: false,      //允许横向滚动条
                            scrollY: true,      //允许纵向滚动条
                            renderer: function (cm, value) {
                                return "<pre>" + value + "</pre>"
                            }
                        }
                    },
                    { header: "文件名", name: "AssemblyFile", width: "autoExpand" }
                ],
                onRowSelect: function (rowIndex, rowData, event) {
                    var sUrl = ROOT_PATH + 'frame/data/jdp.ashx?fn=' + rowData.FuncName;
                    $("#test-editor").bdpEditPanel("setValue", 'url', sUrl);
                    $("#test-editor").bdpEditPanel("setValue", 'funcName', rowData.FuncName);
                }
            })

            $('#info').omPanel({
                title: '详细信息',
                collapsible: true
            });
            $('#test').omPanel({
                title: '测试',
                collapsed: true,        //组件创建后为收起状态
                collapsible: true           //渲染收起与展开按钮
            });
            $('#presult').omPanel({
                title: '结果',
                collapsed: true,//组件创建后为收起状态
                collapsible: true,//渲染收起与展开按钮
                done: true
            });

            $("#test-editor").bdpEditPanel({
                gridLine: false,
                columnCount: 1,
                colModel: [
                    { header: 'URL', name: 'url' },
                    {
                        header: '参数', name: 'query',
                        editor: {
                            type: 'memo', hint: '必须输入键值对，如：Sex=男',
                            rows: 5
                        }
                    },
                    {
                        header: '数据', name: 'data',
                        editor: {
                            type: 'memo', hint: '可直接输入文本，也可以输入数组（中括号开始）或对象（大括号开始）',
                            rows: 5
                        }
                    }
                ]
            });
            $("#testSend").omButton({
                label: "执行",
                onClick: function (event) {
                    var info = $("#test-editor").bdpEditPanel("getValues").newValues,
                        arrArgs = (info.query || '').trim().split("\n"),
                        objQuery = {},
                        sData = (info.data || '').trim();
                    for (var i = 0, len = arrArgs.length; i < len; i++) {
                        var p = arrArgs[i].trim().split('=');
                        if (p.length > 0) {
                            var k = p[0];
                            if ((k || '') != '') {
                                p.splice(0, 1);
                                objQuery[k] = p.join('=');
                            }
                        }
                    }
                    var objData = null;
                    if (sData != '' && (s[0] == '{' || s[0] == '[')) {
                        eval('objData=' + sData);
                        sData = JSON.stringify(objData);
                    }

                    $.ajax({
                        url: getCommonDataUrl(info.funcName, objQuery),   //   info.url,  // + "&" + sData.split("\n").join("&"),
                        method: 'POST',
                        data: sData,
                        success: function (data) {
                            $("#result").text(data).show();
                            //jsonEditor.setText(data);
                            $('#presult').omPanel('expand');
                            //$.post(getCommonDataUrl("BdpJsonFormat"), data,
                            //    function (fmtResult) {
                            //        if (fmtResult.Succeed) {
                            //            $("#result").text(fmtResult.Data).show();
                            //        } else {
                            //            $("#result").text(data).show();
                            //        }
                            //        $('#presult').omPanel('expand');
                            //    }, 'json');
                        }
                    });
                }
            });

            $('#dlgJson').omDialog({
                title: '服务结果',
                autoOpen: false,
                modal: true,
                width: 920,
                height: 530
            });

            var jsonEditor = null;
            $('#btnLarge').css({ float: 'right' }).omButton({
                label: '', icons: { leftCss: 'bdp-icons-search' },
                onClick: function () {
                    if (!jsonEditor) {
                        jsonEditor = new JSONEditor($('#dlgJson')[0]);
                        jsonEditor.setMode('code');
                    }
                    jsonEditor.setText($('#result').val());
                    $('#dlgJson').omDialog('open');
                }
            });

            $(window).resize(function () {
                $("#jdp").omGrid('resize');
            }).trigger('resize');
        });
    </script>
</asp:Content>
<asp:Content ID="Content3" ContentPlaceHolderID="PlaceToolbar" runat="server">
    <div id="menu"></div>
</asp:Content>
<asp:Content ID="Content5" ContentPlaceHolderID="PlaceContent" runat="server">
    <div id="cntr">
        <div id="p1" style="position: relative;">
            <table id="jdp"></table>
        </div>
        <div id="p2" style="position: relative; width: 450px; padding: 2px">
            <div id="info"></div>
            <div id="test">
                <div id="test-editor">
                </div>
                <a id="testSend"></a>
            </div>
            <div id="presult">
                <a id="btnLarge"></a>
                <textarea id="result" rows="10" style="width: 100%; display: none; resize: both;" readonly="readonly"></textarea>
            </div>
        </div>
    </div>
    <div id="dlgJson">
    </div>
</asp:Content>
<asp:Content ID="Content6" runat="server" ContentPlaceHolderID="PlaceSearch">
    <div id="searchbox" style="display: none;">
        <span style="display: block; top: 5px; position: relative; float: left;">
            <input id="edtSearchText" />
            <img id="btnSearch" alt="搜索" src="" />
        </span>
    </div>
    <script type="text/javascript">
        $(document).ready(function () {
            //如果要显示搜索框，放开下面这一行
            $('#searchbox').show();
            // 完善下面执行搜索的代码
            var doSearch = function (txt) {
                var txt = $('#edtSearchText:visible').val();
                $("#jdp").omGrid('setData', getCommonDataUrl('help', { filter: txt }));
            }



            // 下面的代码一般不用修改
            $('#edtSearchText:visible').omSuggestion({
                // 给定及时提示数据源
                dataSource: '',
                minChars: 3,
                listMaxHeight: 40
            }).width(130).css('font-size', '13px')
            .keypress(function (event) {
                if (event.keyCode == 13) {
                    doSearch();
                }
            });
            $("#btnSearch:visible").attr("src", getImageUrl("sousuo.gif"))
            .click(function () {
                doSearch();
            });
        });
    </script>
</asp:Content>

