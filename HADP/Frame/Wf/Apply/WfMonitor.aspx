<%@ Page Title="" Language="C#" MasterPageFile="~/Frame/Master/SingleTable.Master" AutoEventWireup="true" CodeBehind="WfMonitor.aspx.cs" Inherits="Hongbin.Web.Frame.Wf.Apply.WfMonitor" %>

<asp:Content ID="Content1" ContentPlaceHolderID="PlaceCss" runat="server">
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="head" runat="server">
    <script src="../Common/BdpFlowLoader.js"></script>
    <script src="WfMonitor.js"></script>
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
