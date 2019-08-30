<%@ Page Language="C#" EnableSessionState="True" AutoEventWireup="true" CodeBehind="Login.aspx.cs" Inherits="Hongbin.Web.Frame.Login" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title></title>
    <script src="resources/js/bdp-base.js"></script>
    <script src="resources/js/bdp-base-loader.js"></script>
    <link href="resources/css/default/bdp-login.css" rel="stylesheet" />
</head>
<body class="back" style="width: 100%;">
    <form id="form1" runat="server">
        <div id="loginTable" class="login-table">
            <div class="login-element txtUsername">
                <div class="label">
                    <label for="txtUsername">用户名：</label>
                </div>
                <div class="label">
                    <input name="edtUsername" type="text" value="" id="edtUsername" title="请输入登录帐户名" style="width: 150px;" />
                </div>
            </div>
            <div class="login-element txtPassword">
                <div class="label">
                    <label for="txtPassword">密　码：</label>
                </div>
                <div class="label">
                    <input type="password" id="edtPassword" style="width: 150px;" />
                </div>
            </div>

            <div id="veriCode" class="login-element veri-code">
                <div class="label">
                    <label for="txtVeriCode">验证码：</label>
                </div>
                <div class="label">
                    <input type="text" id="edtVeriCode" style="width: 75px;" />
                </div>
                <div class="label">
                    <img id="imgVerifyCode" alt="点击切换验证码" title="点击切换验证码" src="" />
                </div>
            </div>

            <div class="login-element error-row">
                <label id="lblError" style="color: red;"></label>
            </div>
            <div class="login-element button-row">
                <input type="image" name="btnLogin" id="btnLogin" src="resources/css/default/images/bdp/emp-login.gif" style="height: 24px; width: 72px; margin-left: 10px;" />
                <input type="image" name="imgBtn" id="imgBtn" src="resources/css/default/images/bdp/emp-Reset.gif" style="height: 24px; width: 72px; margin-left: 10px;" />
            </div>
            <a id="inet_login" href="#" class="bdp-inet-login" title="通过平台登录"></a>
        </div>

        <asp:HiddenField runat="server" ID="txtUsername" />
        <asp:HiddenField runat="server" ID="txtVeriCode" />
        <asp:HiddenField runat="server" ID="hfvalue" />
    </form>

    <script src="resources/js/jQuery.md5.js"></script>
    <script type="text/javascript">
        $(document).ready(function () {
            var bkimg = '<%=LoginPageBackgroundImage %>';
            $('div.login-table').css("background", 'url(' + bkimg + ') top no-repeat');
            $('#imgBtn').click(function () {
                $('#form1').resetForm();
                $('#edtUsername').focus();
                return false;
            });
            if ($('#edtVeriCode').size() > 0) {
                $('#imgVerifyCode').attr('src', getVerifyCodeUrl())
                    .on('click', function () {
                        $('#imgVerifyCode').attr('src', getVerifyCodeUrl());
                        $('#edtVeriCode').val('').focus();
                    });
            }
            $('#btnLogin').on('click', function () {
                var u = ($('#edtUsername').val() || '').replace(/\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/ig, ''),
                    p = ($('#edtPassword').val() || '').replace(/\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/ig, ''),
                    v = ($('#edtVeriCode').val() || '111').replace(/\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/ig, '');
                if (u == '') {
                    //alert('请输入用户名！');
                    //$('#edtUsername').focus();
                    $.omMessageBox.alert({ content: '请输入用户名！', onClose: function () { $('#edtUsername').focus(); } });
                    return false;
                }
                if (p == '') {
                    //alert('请输入登录密码！');
                    //$('#edtPassword').focus();
                    $.omMessageBox.alert({ content: '请输入登录密码！', onClose: function () { $('#edtPassword').focus(); } });
                    return false;
                }
                if ($('#edtVeriCode').size() > 0 && v == '') {
                    //alert('请输入验证码！');
                    //$('#edtVeriCode').focus();
                    $.omMessageBox.alert({ content: '请输入验证码！', onClose: function () { $('#edtVeriCode').focus(); } });
                    return false;
                }
                $('#hfvalue').val($.md5(($.md5(p).toUpperCase() + $.md5(v.toUpperCase()).toUpperCase()).toUpperCase()).toUpperCase());
                $('#txtUsername').val(u);
                $('#txtVeriCode').val(v);
                // 清除这个cookie值
                if (localStorage) localStorage.setItem('_sys_login_url', document.location.href);
            });
            $('#edtUsername').focus();


            createMLangSelector();
        });
    </script>
</body>
</html>
