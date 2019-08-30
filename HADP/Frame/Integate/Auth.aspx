<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Auth.aspx.cs" Inherits="Hongbin.Web.Frame.Integate.Auth" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server" id="head1">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <%--<meta http-equiv="X-UA-Compatible" content="IE=edge" />--%>
    <title></title>
    <script src="~/Frame/resources/js/jquery.js"></script>
    <link href="~/Frame/resources/bootstrap/css/bootstrap.css" rel="stylesheet" />
    <link href="~/Frame/resources/bootstrap/css/bootstrap-theme.css" rel="stylesheet" />
    <%--<link href="~/Frame/resources/bootstrap/css/ace.min.css" rel="stylesheet" />--%>
    <%--<link href="~/Frame/resources/bootstrap/css/ace-rtl.min.css" rel="stylesheet" />--%>
    <link href="~/Frame/resources/bootstrap/css/font-awesome.min.css" rel="stylesheet" />
    <script src="~/Frame/resources/bootstrap/js/bootstrap.min.js"></script>
    <%--<script src="~/Frame/resources/bootstrap/js/ace.min.js"></script>
    <script src="~/Frame/resources/bootstrap/js/ace-extra.min.js"></script>
    <script src="~/Frame/resources/bootstrap/js/ace-elements.min.js"></script>--%>
</head>
<body>
    <style type="text/css">
        body {
            padding-top: 70px;
            background-color: white;
        }
    </style>
    <form runat="server" id="form1">
        <nav class="navbar navbar-default navbar-fixed-top" role="navigation">
            <div class="navbar-header">
                <p class="navbar-brand">互联平台登录</p>
            </div>
        </nav>
        <div class="row">
            <div class="col-sm-2"></div>
            <div class="col-sm-6">
                <ul class="nav nav-tabs">
                    <%if (onlinUserCount > 0)
                      { %>
                    <li class="active"><a href="#tab-quick" data-toggle="tab">快速登录</a></li>
                    <%}%>
                    <li id="li-normal"><a href="#tab-normal" data-toggle="tab">帐号登录</a></li>
                </ul>
                <div class="tab-content">
                    <%if (onlinUserCount > 0)
                      { %>
                    <div id="tab-quick" class="tab-pane active">
                        <div class="row">
                            <span class="col-xs-1"></span>
                            <h5 class="col-xs-6"><i class="glyphicon glyphicon-list" style="color: red; font-size: larger; padding-right: 10px;"></i>检查到本机已经登录的帐户</h5>
                        </div>
                        <div class="row">
                            <span class="col-xs-1"></span>
                            <div class="col-xs-11">
                                <%CreateQuickLoginLink(); %>
                            </div>
                        </div>
                        <div class="row" style="padding-top: 20px;">
                            <span class="col-xs-1"></span>
                            <span class="col-xs-6">
                                <i class="glyphicon glyphicon-exclamation-sign"></i>
                                请点击帐户名进行授权并登录
                            </span>
                        </div>
                    </div>
                    <script type="text/javascript">
                        function quick_logon(id) {
                            $('#edtQuickId').val(id);
                            $('#form1').submit();
                        }
                        
                    </script>
                    <%} %>
                    <div id="tab-normal" class="tab-pane">
                        <div class="row">
                            <span class="col-xs-1"></span>
                            <h5 class="col-xs-6"><i class="glyphicon glyphicon-list" style="color: red; font-size: larger; padding-right: 10px;"></i>互联平台帐号登录</h5>
                        </div>
                        <div class="row">
                            <span class="col-xs-1"></span>
                            <div class="col-xs-6">
                                <div class="input-group row">
                                    <span class="input-group-addon"><i class="glyphicon glyphicon-user"></i></span>
                                    <input runat="server" type="text" class="form-control" placeholder="用户名" id="edtUser" />
                                </div>
                                <div class="divider" style="padding: 5px;"></div>
                                <div class="row input-group">
                                    <span class="input-group-addon"><i class="glyphicon glyphicon-lock"></i></span>
                                    <input runat="server" type="password" class="form-control" placeholder="密码" id="edtPwd" />
                                </div>
                            </div>
                        </div>
                        <div class="row" style="padding-top: 20px;">
                            <span class="col-xs-1"></span>
                            <div class="col-xs-6">
                                <span class="pull-right">
                                    <asp:Button runat="server" CssClass="btn btn-primary" ID="btnLogin" Text="授权并登录" />
                                    <%--<button type="button" class="btn btn-primary">授权并登录</button>--%>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <%if (onlinUserCount == 0)
                  { %>
                <script type="text/javascript">
                    $('#li-normal,#tab-normal').addClass("active");
                </script>
                <%} %>
            </div>
        </div>
        <asp:HiddenField runat="server" ID="edtQuickId" />
    </form>
</body>
</html>
