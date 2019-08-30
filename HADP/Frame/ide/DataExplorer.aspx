<%@ Page Title="" Language="C#" MasterPageFile="~/Frame/Master/TreeGrid.Master" AutoEventWireup="true" CodeBehind="DataExplorer.aspx.cs" Inherits="Hongbin.Web.Frame.ide.DataExplorer" %>

<asp:Content ID="Content1" ContentPlaceHolderID="PlaceCss" runat="server">
    <style type="text/css">
        .esql-editor {
            resize: none;
            overflow: auto;
            font-family: 'Arial Narrow', 'Nimbus Sans L', sans-serif;
            font-size: larger;
        }
    </style>
    <style type="text/css">
        .model-group {
            background: url("../resources/css/default/images/bdp/jr_icons_tool.png") no-repeat -354px -111px;
        }

        .model-name {
            background: url("../resources/css/default/images/bdp/jr_icons_tool.png") no-repeat -489px -3px;
        }

        .entity {
            background: url("../resources/css/default/images/bdp/jr_icons_tool.png") no-repeat -112px -31px;
        }

        .association {
            background: url("../resources/css/default/images/bdp/jr_icons_tool.png") no-repeat -139px -31px;
        }

        .property {
            background: url("../resources/css/default/images/bdp/jr_icons_tool.png") no-repeat -327px -57px;
        }
    </style>
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="head" runat="server">
    <%--<script src="../resources/js/synedit/edit_area_full.js"></script>--%>
    <link href="../resources/codemirror/lib/codemirror.css" rel="stylesheet" />
    <script src="../resources/codemirror/lib/codemirror.js"></script>
    <script src="../resources/codemirror/mode/sql.js"></script>
    <%--<script src="../resources/js/jquery.resize.js"></script>--%>
    <script type="text/javascript">
        $(document).ready(function () {
            var tabIndex = 1;
            $("#menu").omButtonbar({
                btns: [
                    {
                        id: "addTab",
                        label: "新建",
                        icons: { left: getImageUrl('add') },
                        onClick: function (event) {
                            tabIndex++;
                            $('#tabs').omTabs('add', {
                                index: tabIndex,
                                title: '查询' + tabIndex,
                                content: "<div id='c" + tabIndex + "'><div id='ct" + tabIndex + "'></div><div id='cc" + tabIndex + "'></div></div>",
                                closable: true
                            });
                            var tabId = $("#tabs").omTabs("getActivated"),
                                gridId = tabId + "_grid",
                                editorId = tabId + "_esql";

                            var c = "#c" + tabIndex,
                                h = $(c).closest(".om-tabs-panels").height() - 24;
                            $(c).height(h).addClass("esql-tabsheet");

                            //$(c).resize(function (e) {
                            //    $(c).omBorderLayout('resize');
                            //    $("#" + gridId).omGrid('resize');
                            //});

                            $(c).omBorderLayout({
                                fit: false,
                                panels: [
                                    {
                                        id: "cc" + tabIndex,
                                        region: "center",
                                        header: false,
                                        title: "Entity SQL"
                                    }, {
                                        id: "ct" + tabIndex,
                                        region: "south",
                                        header: true,
                                        title: "查询结果",
                                        resizable: true,
                                        height: "40%"
                                    }
                                ],
                                onAfterDrag: function (s, e) {
                                    $("#" + gridId).omGrid('resize');
                                }
                            });


                            //$("<textarea></textarea>")
                            //    .prop("id", editorId)
                            //    .attr("name", "esql" + tabIndex)
                            //    .addClass("esql-editor")
                            //    .css({ width: "100%", height: "100%" })
                            //    .appendTo($("#cc" + tabIndex));
                            //editAreaLoader.init({
                            //    id: editorId,	// id of the textarea to transform		
                            //    start_highlight: true,	// if start with highlight
                            //    allow_resize: "both",
                            //    allow_toggle: false,
                            //    word_wrap: true,
                            //    language: "zh",
                            //    syntax: "tsql"
                            //});

                            var editor = CodeMirror($("#cc" + tabIndex)[0], {
                                mode: 'text/x-mssql',
                                indentWithTabs: true,
                                smartIndent: true,
                                lineNumbers: true,
                                matchBrackets: true,
                                autofocus: true,
                                extraKeys: { "Ctrl-Space": "autocomplete" },
                                hintOptions: {
                                    tables: {
                                        users: { name: null, score: null, birthDate: null },
                                        countries: { name: null, population: null, size: null }
                                    }
                                }
                            });


                            $("<table></table>")
                                .prop("id", gridId)
                                .addClass("esql-datagrid")
                                .appendTo($("#ct" + tabIndex));

                            $("#" + gridId).data('editor', editor).omGrid({
                                autoFit: false,
                                width: 'fit',
                                height: 'fit',
                                singleSelect: true,
                                showIndex: true,
                                editMode: "dialog",
                                editOnDblclick: true,
                                editOptions: {
                                    title: '详细',
                                    width: 550,
                                    height: 410,
                                    editors: {
                                        isView: true,
                                        gridLine: true,
                                        columnCount: 1
                                    }
                                },
                                colModel: [],
                                onSuccess: function (data, testStatus, XMLHttpRequest, event) {
                                    this.omGrid("options").extraData.recc = data.total;
                                },
                                onError: function (XMLHttpRequest, textStatus, errorThrown, event) {
                                    //alert('fetch data error');
                                }
                            });

                        }
                    },
                    {
                        id: "exec",
                        label: "执行",
                        icons: { left: getImageUrl('refresh') },
                        onClick: function (event) {
                            var tabId = $("#tabs").omTabs("getActivated");
                            if ($("#tabs").omTabs("getAlter", tabId) == 0)
                                return;

                            var gridId = tabId + "_grid",
                                //editorId = tabId + "_esql",
                                editor = $("#" + gridId).data('editor'),
                                data = {
                                    //esql: editAreaLoader.getValue(editorId), // $("#" + editorId).val(),
                                    esql: escape(editor.doc.getValue()),
                                    recc: 0
                                };

                            $.ajax({
                                url: getCommonDataUrl("DEQueryMeta"),
                                type: "POST",
                                data: JSON.stringify(data),
                                dataType: "json",
                                success: function (result) {
                                    if (result.Succeed) {
                                        data.recc = result.Data.RecordCount;
                                        $("#" + gridId).omGrid({
                                            extraData: data,
                                            method: "POST",
                                            colModel: result.Data.ColModel
                                        });
                                        $("#" + gridId).omGrid("setData", getCommonDataUrl("DEQuery"));
                                    } else {
                                        $.omMessageBox.alert({
                                            content: result.Message
                                        });
                                    }
                                }
                            });

                        }
                    },
        {
            id: "refresh",
            label: "刷新",
            icons: { left: getImageUrl('refresh') },
            onClick: function (event) {

            }
        }, { separtor: true }, {
            id: "export",
            label: "导出",
            icons: { left: getImageUrl('excel.jpg') },
            onClick: function (event) {
                var tabId = $("#tabs").omTabs("getActivated");
                if ($("#tabs").omTabs("getAlter", tabId) == 0)
                    return;
                var gridId = tabId + "_grid";

                $("#" + gridId).omGrid('toExcel');
            }
        }
                ]
            });

            $("#tree").omTree({
                dataSource: getCommonDataUrl("DEGetEntityTypes"),
                onBeforeExpand: function (node) {
                    var nodeDom = $("#" + node.nid);
                    if (nodeDom.hasClass("hasChildren")) {
                        nodeDom.removeClass("hasChildren");
                        $.ajax({
                            url: getCommonDataUrl("DEGetEntityTypes", "pid=" + node.id + "&cls=" + node.classes),
                            method: 'POST',
                            dataType: 'json',
                            success: function (data) {
                                $("#tree").omTree("insert", data, node);
                            }
                        });
                    }
                },
                onSelect: function (node) {

                }
            });

            $("#tabs").omTabs({
                height: "fit",
                onAdd: function (cfg, event) {


                }
            });

            //$("#tabs").parent().resize(function (e) {
            //    $("#tabs").height($("#tabs").parent().height() - 2);
            //});
            ////$("#tabs").resize(function (e) {
            ////    $("div.esql-tabsheet").omBorderLayout('resize');
            ////    $("table.esql-datagrid").omGrid('resize');
            ////});


            $("#master_container").omBorderLayout({
                onAfterDrag: function (s, e) {
                    //$("div.esql-tabsheet").omBorderLayout('resize');
                    //$('#tabs').omTabs('resize');
                    //$("table.esql-datagrid").omGrid('resize');
                    $(window).resize();
                }
            });

            $(window).keydown(function (event) {
                switch (event.keyCode) {
                    case 113:   //F2
                        $("#exec").omButton("click");
                        break;
                }
            });

            $(window).resize(function () {
                $("div.esql-tabsheet").omBorderLayout('resize');
                $('#tabs').omTabs('resize');
                $("table.esql-datagrid").omGrid('resize');
            }).resize();

        });

    </script>
</asp:Content>

<asp:Content ID="Content3" runat="server" ContentPlaceHolderID="PlaceToolbar">
    <div id="menu"></div>
</asp:Content>
<asp:Content ID="Content4" runat="server" ContentPlaceHolderID="PlaceLeft">
    <ul id="tree"></ul>
</asp:Content>
<asp:Content ID="Content5" runat="server" ContentPlaceHolderID="PlaceContent">
    <div id="tabs">
        <ul>
            <li><a href="#tab1">属性</a></li>
        </ul>
        <div id="tab1">
        </div>
    </div>
</asp:Content>


