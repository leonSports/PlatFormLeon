<%@ Page Language="C#" EnableSessionState="True" AutoEventWireup="true" CodeBehind="LoginFront.aspx.cs" Inherits="Hongbin.Web.Frame.LoginFront" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head id="Head1" runat="server">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <%--<meta http-equiv="X-UA-Compatible" content="IE=edge" />--%>
    <title>请登录</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script src="~/Frame/resources/js/bdp-base.js"></script>
    <script src="~/Frame/resources/js/bdp-base-loader.js"></script>
    <link href="~/Frame/resources/bootstrap/css/bootstrap.css" rel="stylesheet" />
    <link href="~/Frame/resources/bootstrap/css/bootstrap-theme.css" rel="stylesheet" />
    <link href="~/Frame/resources/bootstrap/css/font-awesome.min.css" rel="stylesheet" />
    <script src="~/Frame/resources/bootstrap/js/bootstrap.min.js"></script>
    <script src="~/Frame/resources/js/jQuery.md5.js"></script>
</head>
<body>
    <link href="resources/css/default/bdp-login-front.css" rel="stylesheet" />
    <form id="form1" runat="server">
        <header class="navbar" role="navigation">
            <div id="navbar_container" class="container">
                <div class="row">
                    <div class="col-xs-1"></div>
                    <div id="fl_logo" class="col-xs-11 col-sm-3 col-md-2 logo"></div>
                    <div id="fl_title" class="col-sm-8 col-md-9 logo-title visible-sm visible-md visible-lg">长安大学就业管理系统</div>
                </div>
            </div>
        </header>

        <div class="container mid-area">
            <div class="mid-box login-banner">
                <div class="col-sm-12 col-md-12 col-lg-11">
                    <div id="login-box" class="login-box   pull-right">
                        <div>
                            <div class=" ">
                                <h4 class="header" align="center">
                                    <i class="glyphicon glyphicon-user green"></i>
                                    请登录
                                </h4>

                                <%-- <div class="space-6"></div>--%>


                                <div class="form-group" style="padding: 0 10px 0 10px">
                                    <div class="input-group">
                                        <input type="text" class="form-control" placeholder="用户名/学号/工号" id="txtusername" value="" />
                                        <div class="input-group-addon">
                                            <i class="icon-user"></i>
                                        </div>
                                    </div>
                                </div>

                                <div class="form-group" style="padding: 0 10px 0 10px">
                                    <div class="input-group">
                                        <input type="password" class="form-control" placeholder="密码" id="txtpassword" value="" />
                                        <div class="input-group-addon">
                                            <i class="icon-lock"></i>
                                        </div>
                                    </div>
                                </div>

                                <label class=" clearfix" style="padding: 0 10px 0 10px">
                                    <span class="col-md-8" style="padding-left: 0;">
                                        <input type="text" class="form-control" placeholder="验证码" id="txtvericode" value="" />
                                    </span>
                                    <span class="col-md-4 ">
                                        <img id="imgVerifyCode" style="margin-top: 5px;" alt="点击切换验证码" title="点击切换验证码" src="" />
                                    </span>
                                </label>

                                <div class="space"></div>

                                <label class=" clearfix" style="padding: 0 10px 0 10px">
                                    <input type="checkbox" id="edtRemember" value="" />
                                    <label for="edtRemember">&nbsp;记住我</label>
                                    <label id="lblError" style="color: #800000; display: table;"></label>
                                </label>
                                <div class="clearfix" style="padding: 0 10px 10px 10px">
                                    <button type="button" class=" pull-right btn btn-sm btn-primary" id="btnLogin" data-loading-text="正在登录...">
                                        <i class="icon-key"></i>
                                        登录
                                    </button>
                                </div>
                                <div>
                                    <a id="inet_login" href="#" title="通过平台登录">
                                        <div class="bdp-inet-login"></div>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <footer class="container">
            <div runat="server" id="footer" class="col-sm-12 col-md-12 col-lg-12" align="center">
                <br />
                <p>
                    CopyRight© 2014 Inc.All Rights Reserved 校园互联 版权所有 文网文[2010]271号　京公网安备110000000005号　ICP证号:京04148
 <br />
                    文化部监督电子邮箱:wlwh@vip.sina.com　文明办网文明上网举报电话:0771-5086886转5326（周一至周五：9:00-18:00） 举报邮箱:jubao@opi-corp.com
                </p>
            </div>
        </footer>
    </form>
</body>
</html>
