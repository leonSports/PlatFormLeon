<%@ Page Title="" Language="C#" MasterPageFile="~/Frame/Master/TreeGrid.Master" AutoEventWireup="true" CodeBehind="Modules.aspx.cs" Inherits="Hongbin.Web.Frame.Sys.Modules" %>

<asp:Content ID="Content1" ContentPlaceHolderID="PlaceCss" runat="server">
    <style type="text/css">
        #cseditor {
            width: 96%;
            margin: 5px;
            padding: 7px;
            line-height: 1.75;
            resize: both;
            overflow: scroll;
            text-wrap: none;
            word-wrap: normal;
            word-break: keep-all;
        }
    </style>
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="head" runat="server">
    <link href="../resources/codemirror/lib/codemirror.css" rel="stylesheet" />
    <script src="../resources/codemirror/lib/codemirror.js"></script>
    <script src="../resources/codemirror/mode/javascript.js"></script>
    <script src="Modules.js"></script>
</asp:Content>
<asp:Content ID="Content3" ContentPlaceHolderID="PlaceToolbar" runat="server">
    <div id="tools"></div>
</asp:Content>
<asp:Content ID="Content4" ContentPlaceHolderID="PlaceSearch" runat="server">
</asp:Content>
<asp:Content ID="Content5" ContentPlaceHolderID="PlaceLeft" runat="server">
    <div id="mtree"></div>
</asp:Content>
<asp:Content ID="Content6" ContentPlaceHolderID="PlaceContent" runat="server">
    <div id="cc" style="display: none;">
        <div id="ct">
            <div id="pginfo"></div>
        </div>
        <div id="tabs" style="display: none;">
            <ul>
                <li>
                    <a href="#tab1">页面参数</a>
                </li>
                <li>
                    <a href="#tab2">页面资源</a>
                </li>
            </ul>
            <div id="tab1">
                <%--<table id="csgrid"></table>--%>
                <textarea id="cseditor" name="cseditor"></textarea>
            </div>
            <div id="tab2">
                <table id="resgrid"></table>
            </div>
        </div>
    </div>

    <div id="dlgModInitor">
        <textarea id="modInitCode" name="modInitCode"></textarea>
    </div>
</asp:Content>
