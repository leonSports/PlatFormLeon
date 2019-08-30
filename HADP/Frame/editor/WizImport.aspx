<%@ Page Title="" Language="C#" MasterPageFile="~/Frame/Master/ImportWizard.Master" AutoEventWireup="true" CodeBehind="WizImport.aspx.cs" Inherits="Hongbin.Web.Frame.editor.WizImport" %>

<asp:Content ID="Content1" ContentPlaceHolderID="css" runat="server">
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="head" runat="server">
    <script type="text/javascript">
        $(document).ready(function () {
            //$.ImportWizard.onGetCustomParam = function (options, currsetp) {
            //    options.p1 = $('#p1').val();
            //}
        });
    </script>
</asp:Content>
<asp:Content ID="Content3" ContentPlaceHolderID="CustomOptions" runat="server">
    <%--<label>测试:</label>
    <input type="text" id="p1" value="1" />--%>
</asp:Content>
