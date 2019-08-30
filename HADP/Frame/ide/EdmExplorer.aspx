<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="EdmExplorer.aspx.cs" Inherits="Hongbin.Web.Frame.ide.EdmExplorer" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title></title>
    <script src="../resources/js/bdp-base.js"></script>
    <script src="../resources/js/bdp-base-loader.js"></script>
    <script src="EdmExplorer.js"></script>
    <style type="text/css">
        .model-group{
            background: url("../resources/css/default/images/bdp/jr_icons_tool.png") no-repeat -354px -111px;
        }
        .model-name{
            background: url("../resources/css/default/images/bdp/jr_icons_tool.png") no-repeat -489px -3px;
        }
        .entity{
            background: url("../resources/css/default/images/bdp/jr_icons_tool.png") no-repeat -112px -31px;
        }
        .association{
            background: url("../resources/css/default/images/bdp/jr_icons_tool.png") no-repeat -139px -31px ;
        }
    </style>
</head>
<body>
    <%--<div id="ptools">
    </div>--%>
    <div id="ptree">
        <ul id="entTree"></ul>
    </div>
    <div id="ptab">
        <div id="make-tab">
            <ul>
                <li><a href="#tab1">实体类</a></li>
                <li><a href="#tab2">类关联</a></li>
            </ul>
            <div id="tab1">
                <div id="cls-tool"></div>
                <br />
                <table id="grid"></table>
                <table id="grid-fld"></table>
            </div>
            <div id="tab2">
                <div id="rel-tool"></div>
                <br />
                <table id="grid-rel"></table>
            </div>
        </div>
    </div>
</body>
</html>
