<%@ Page Title="" Language="C#" MasterPageFile="~/Frame/Master/TreeGrid.Master" AutoEventWireup="true" CodeBehind="UserMgr.aspx.cs" Inherits="Hongbin.Web.Frame.Account.UserMgr" %>

<asp:Content ID="Content1" ContentPlaceHolderID="PlaceCss" runat="server">
    <style type="text/css">
        .om-tree li.om-tree-node span.common-users {
            background: url("../resources/images/treeroot.gif") no-repeat;
        }

        .om-tree li.om-tree-node span.company {
            background: url("../resources/images/treeunit.gif") no-repeat;
        }

        .om-tree li.om-tree-node span.dept {
            background: url("../resources/images/treedept.gif") no-repeat;
        }

        .om-tree ul li span.role {
            background: url(../resources/images/role.png) no-repeat;
        }
    </style>
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="head" runat="server">
    <script src="UserMgr.js"></script>
</asp:Content>
<asp:Content ID="Content3" ContentPlaceHolderID="PlaceToolbar" runat="server">
    <div id="menu"></div>
</asp:Content>
<asp:Content ID="Content4" ContentPlaceHolderID="PlaceSearch" runat="server">
    <div id="searchbox" style="display: none;">
        <label style="display: block; top: 7px; position: relative; float: left; padding-right: 12px;"
            title="是否递归显示下级单位的用户">
            <input type="checkbox" id="sub" checked="checked" style="position: relative; top: 3px;" />
            包括下级
        </label>
        <span style="display: block; top: 5px; position: relative; float: left;">
            <input id="edtSearchText" />
            <img id="btnSearch" alt="搜索" src="" style="vertical-align: middle; margin-top: -3px;" />
        </span>
        <a id="btnAdvSearch" style="padding-top:2px;"></a>
    </div>
    <script type="text/javascript">
        $(document).ready(function () {
            //如果要显示搜索框，放开下面这一行
            $('#searchbox').show();

            // 下面的代码一般不用修改
            $('#edtSearchText:visible').omSuggestion({
                // 给定及时提示数据源
                dataSource: '',
                minChars: 3,
                listMaxHeight: 40
            }).width(130).css('font-size', '13px');
            $("#btnSearch:visible").attr("src", getImageUrl("sousuo.gif"));
        });
    </script>
</asp:Content>
<asp:Content ID="Content5" ContentPlaceHolderID="PlaceLeft" runat="server">
    <ul id="user-tree"></ul>
</asp:Content>
<asp:Content ID="Content6" ContentPlaceHolderID="PlaceContent" runat="server">
    <table id="user-grid"></table>
    <div id="editor" title="编辑用户信息">
    </div>
    <div id="pwd-editor">
    </div>
    <div id="role-granter">
        <div id="gcc">
            <div id="ght">
                <div style="padding-top: 3px; padding-left: 12px;">用户名：<label id="lblUser"></label></div>
            </div>
            <div id="gsrc">
                <ul id="gsrctree"></ul>
            </div>
            <div id="gopt" style="text-align: center;">
                <br />
                <br />
                <a id="gadd"></a>
                <br />
                <br />
                <a id="gdel"></a>
            </div>
            <div id="gpdst">
                <ul id="gdsttree"></ul>
            </div>
        </div>
    </div>
</asp:Content>

