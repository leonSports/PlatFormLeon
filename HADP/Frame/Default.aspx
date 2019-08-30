<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="Hongbin.Web.Frame.Default" %>

<%--<%@ Register Src="~/Frame/fragments/uc0523swf.ascx" TagPrefix="uc1" TagName="uc0523swf" %>--%>


<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head id="Head1" runat="server">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title></title>
    <script src="resources/js/bdp-base.js"></script>
    <script src="resources/js/bdp-base-loader.js"></script>
    <script src="Default.js"></script>
    <style>
        .t{
            color:#154663;
        }
    </style>
</head>
<body>
    <div id="ptop" style="display: none;">
        <div class="topdiv">
            <div class="headTitle">
                <!--默认top页面logn-->
               <%-- <div class="headText">
                    <img src="<%= LogoImage %>" border="0" style="border-bottom-style: none; padding-top: 5px; padding-left: 5px; height: 60px;" />--%>
                 <div class="headText" style="padding-top: 8px; padding-left: 5px; ">
                    <img src="<%= LogoImage %>" border="0" style="border-bottom-style: none;   min-height:50px;" />
                </div>
            </div>
            <div class="rightTitle">
                <%--<uc1:uc0523swf runat="server" ID="uc0523swf" />--%>
                <div id="mlang"></div>
            </div>
        </div>
        <div id="tools">
            <div id="nav_left">
                <%--<img id="img_user" src="../Images/user.png" />--%>
                <span class="img_user">&nbsp;&nbsp;&nbsp;&nbsp;</span>
                <span style="color: #154663; letter-spacing: 0px; padding-left: 3px;">当前用户：</span>
                <span id="lblUserName"><%= Username %></span>
                <span id="lblToday"></span>
            </div>
            <div id="nav_right"></div>
        </div>
    </div>
    <div id="pleft" style="display: none;">
        <div id="mtree">
        </div>
    </div>
    <div id="pclient" style="display: none;">
        <div id="tabs">
            <ul>
                <li><a href="#home">首页</a></li>
            </ul>
            <div id="home">
                <iframe src="" border="0" frameborder="no"></iframe>
            </div>
        </div>
    </div>
    <form id="form1" runat="server">
    </form>
    <div id="sysselector">
        <%--<ul>
            <li>
                <a class="sys">
                    <div class="r1">
                        <img src="" />
                    </div>
                    <div class="r2">
                    </div>
                </a>
            </li>
        </ul>--%>
    </div>

    <style>
        #tabs .om-tabs-panels {
            overflow: hidden;
        }

        .om-widget-overlay {
            opacity: 0.75;
        }
    </style>

    <script type="text/javascript">
        $(function () {
            $('#home iframe').attr('src', "<%=HomeUrl %>");
        });

        // 获取当前活动页序号
        function getActivated() {
            var id = $('#tabs').omTabs('getActivated');
            return $('#tabs').omTabs('getAlter', id);
        }
    </script>
</body>
</html>
