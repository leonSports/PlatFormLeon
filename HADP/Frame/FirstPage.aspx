<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="FirstPage.aspx.cs" Inherits="Hongbin.Web.Frame.FirstPage" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head id="Head1" runat="server">
    <title></title>
    <script src="resources/js/jquery.js"></script>
    <%--<link href="../styles/site.css" rel="stylesheet" rev="stylesheet" />--%>
</head>
<body style="background-color: White;">
    <form id="form1" runat="server">
         <div style="text-align: center; background:url(<%= HomeImage %>) center no-repeat ; height:100%;">
            <%--<img src="<%= HomeImage %>" />--%>
        </div>
        <%--<div style="position: absolute; top: 20px; left: 20px;">
            <% TestSystemIntegration(); %>
            <p>
                <asp:Button runat="server" ID="btnTest" Text="测试Coding" OnClick="btnTest_Click" />
            </p>
        </div>--%>
    </form>
</body>
</html>
