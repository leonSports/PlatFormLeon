<%@ Page Title="" Language="C#" MasterPageFile="~/Frame/Master/SingleTable.Master" AutoEventWireup="true" CodeBehind="WfDesign.aspx.cs" Inherits="Hongbin.Web.Frame.Wf.WfDesign" %>

<asp:Content ID="Content1" ContentPlaceHolderID="PlaceCss" runat="server">
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="head" runat="server">
    <script src="WfDesign.js"></script>
</asp:Content>
<asp:Content ID="Content3" ContentPlaceHolderID="PlaceToolbar" runat="server">
    <div id="wfmenu"></div>
</asp:Content>
<asp:Content ID="Content4" ContentPlaceHolderID="PlaceSearch" runat="server">
</asp:Content>
<asp:Content ID="Content5" ContentPlaceHolderID="PlaceContent" runat="server">
    <div id="pcntr">
        <div id="ptop">
            <div id="pwfcls">
                <div>
                    <label>流程分类：</label>
                    <input id="edt_wfcls" />
                    <a id="btn_wfcls_add"></a>
                    <a id="btn_wfcls_del"></a>
                </div>
            </div>
            <div id="pflows">
                <table id="grid_flows"></table>
            </div>
        </div>
        <div id="pclt">
            <div id="wftabs">
                <ul>
                    <li><a href="#wftab1">流程设置</a></li>
                    <%--<li><a href="#wftab2">流程图设计</a></li>--%>
                </ul>
                <div id="wftab1">
                    <div id="pnodes">
                        <table id="grid_nodes"></table>
                    </div>
                    <div id="pspr_tzr">
                        <div id="sprtabs">
                            <ul>
                                <li><a href="#pspr">审批人</a></li>
                                <li><a href="#ptzr">通知人</a></li>
                            </ul>
                            <div id="pspr">
                                <div style="width: 95%; height: 95%;">
                                    <table id="grid_spr"></table>
                                </div>
                            </div>
                            <div id="ptzr">
                                <div style="width: 95%; height: 95%;">
                                    <table id="grid_tzr"></table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="wftab2">
                </div>
            </div>
        </div>
    </div>
</asp:Content>
