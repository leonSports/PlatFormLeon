<%@ Page Title="" Language="C#" MasterPageFile="~/Frame/Master/TreeGrid.Master" AutoEventWireup="true" CodeBehind="TreeGrid.aspx.cs" Inherits="Hongbin.Web.Frame.editor.TreeGrid" %>

<asp:Content ID="Content1" ContentPlaceHolderID="PlaceCss" runat="server">
</asp:Content>
<asp:Content ID="Content3" ContentPlaceHolderID="PlaceToolbar" runat="server">
    <div id="menu"></div>
</asp:Content>
<asp:Content ID="Content4" ContentPlaceHolderID="PlaceSearch" runat="server">
</asp:Content>
<asp:Content ID="Content5" ContentPlaceHolderID="PlaceLeft" runat="server">
    <ul id="tree"></ul>
    <div id="treeEditor"></div>
</asp:Content>
<asp:Content ID="Content6" ContentPlaceHolderID="PlaceContent" runat="server">
    <div style="height: 100%; width: 99.9%;">
        <table id="grid"></table>
        <div id="editpanel"></div>
    </div>
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="head" runat="server">
    <script src="TreeGrid.js"></script>
</asp:Content>
