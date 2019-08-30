<%@ Page Title="" Language="C#" MasterPageFile="~/Frame/Master/SingleTable.Master" AutoEventWireup="true" CodeBehind="Index.aspx.cs" Inherits="Hongbin.WebFrame.Frame.Msg.Notice.Index" %>

<asp:Content ID="Content1" ContentPlaceHolderID="PlaceCss" runat="server">
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="head" runat="server">
    <script src="../../resources/ueditor/ueditor.config.js"></script>
    <script src="../../resources/ueditor/ueditor.all.js"></script>
    <script src="../../resources/ueditor/lang/zh-cn/zh-cn.js"></script>
    <script src="Notice.js"></script>
</asp:Content>
<asp:Content ID="Content3" ContentPlaceHolderID="PlaceToolbar" runat="server">
    <div id="menu"></div>
</asp:Content>
<asp:Content ID="Content4" ContentPlaceHolderID="PlaceSearch" runat="server">
</asp:Content>
<asp:Content ID="Content5" ContentPlaceHolderID="PlaceContent" runat="server">
    <div id="secGrid">
        <div id="pfilter">
        </div>
        <div id="pgrid">
            <table id="grid"></table>
        </div>
    </div>
    <div id="secEditor">
        <div id="pedbox"></div>
        <div id="peditor">
            <textarea id="editor" name="editor"></textarea>
        </div>
    </div>
</asp:Content>
