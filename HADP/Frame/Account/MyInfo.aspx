<%@ Page Title="" Language="C#" MasterPageFile="~/Frame/Master/SingleTable.Master" AutoEventWireup="true" CodeBehind="MyInfo.aspx.cs" Inherits="Hongbin.Web.Frame.Account.MyInfo" %>

<asp:Content ID="Content1" ContentPlaceHolderID="PlaceCss" runat="server">
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="head" runat="server">
    <script type="text/javascript">
        $(document).ready(function () {
            $('#btns').omButtonbar({
                btns: [{
                    id: 'edit', label: '修改', icons: { left: getImageUrl('modify') },
                    onClick: function (event) {
                        $('#info').bdpEditPanel('startEdit');
                        $("#save,#cancel").omButton('enable');
                        $("#edit,#modify,#pwd").omButton('disable');
                    }
                }, { separtor: true }, {
                    id: "save",
                    label: "保存",
                    icons: { left: getImageUrl('save') },
                    onClick: function (event) {
                        $('#info').bdpEditPanel('updateEdit', function (ret) {
                            if (ret.Succeed) {
                                $('#cancel').omButton('click');
                            } else {
                                $.omMessageTip.show({ type: 'error', content: ret.Message || '操作失败', timeout: 3000 });
                            }
                        });
                    }
                }, {
                    id: "cancel",
                    label: "取消",
                    icons: { left: getImageUrl('cancel') },
                    onClick: function (event) {
                        $('#info').bdpEditPanel('cancelEdit');
                        $("#save,#cancel").omButton('disable');
                        $("#edit,#modify,#pwd").omButton('enable');
                    }
                }, { separtor: true }, {
                    id: "pwd",
                    label: "设置密码",
                    icons: { left: getImageUrl('priv.png') },
                    onClick: function (event) {
                        $('#dlgpwd').bdpEditor('setData', {});
                        $('#dlgpwd').bdpEditor('open');
                    }
                }]
            });
            $("#save,#cancel").omButton('disable');

            $('#info').width(550).css('padding-left', 13)
                .bdpEditPanel({
                    isView: true,
                    gridLine: true,
                    columnCount: 1,
                    updateUrl: getCommonDataUrl('BdpUserSave', true),
                    colModel: [
                        {
                            header: '登录帐户', name: 'UserName',
                            editor: {
                                rules: [["required", true, "帐户名不能为空"], ['maxlength', 30, '帐户名超出长度限制']]
                            }
                        },
                        {
                            header: '登录密码', name: 'PwdMask', editor: { editable: false }
                        },
                        {
                            header: '真实姓名', name: 'RealName',
                            editor: {
                                rules: [['maxlength', 30, '真实姓名超出长度限制']]
                            }
                        },
                        {
                            header: '性别', name: 'Sex',
                            editor: {
                                type: 'omCombo',
                                options: {
                                    dataSource: [{ text: '男', value: '男' },
                                        { text: '女', value: '女' }]
                                }
                            }
                        },
                        {
                            header: '联系电话', name: 'Phone',
                            editor: {
                                rules: [['maxlength', 50, '联系电话超出长度限制']]
                            }
                        },
                        {
                            header: '电子邮箱', name: 'Email',
                            editor: {
                                rules: [['maxlength', 50, '电子邮箱超出长度限制']]
                            }
                        },
                        {
                            header: '所属单位', name: 'CompanyName', editor: { editable: false }
                        },
                        //{
                        //    header: '所属部门', name: 'DeptName', editor: { editable: false }
                        //},
                        //{
                        //    header: '员工', name: 'EmployeeName', editor: { editable: false }
                        //},
                        {
                            header: '头像', name: 'Descripition',
                            editor: {
                                type: 'image', uploadPath: 'user/photo'
                            }
                        },
                        {
                            header: '备注', name: 'Note',
                            editor: {
                                type: 'memo', rows: 3,
                                rules: [['maxlength', 500, '备注超出长度限制']]
                            }
                        },
                        {
                            header: '我的权限', name: 'Roles', editor: { editable: false }
                        }
                    ]
                });

            $('#dlgpwd').bdpEditor({
                title: '设置密码',
                width: 320,
                //updateUrl: getCommonDataUrl('changePwd'),
                editors: {
                    dataSource: { pwd0: '', pwd1: '', pwd2: '' },
                    colModel: [
                        { header: '原密码', name: 'pwd0', editor: { password: true } },
                        { header: '新密码', name: 'pwd1', editor: { password: true } },
                        { header: '再输一次', name: 'pwd2', editor: { password: true } }
                    ]
                },
                onBeforeSave: function (args) {
                    args.cancel = true; //自己处理保存了
                    var obj = args.values[0];
                    if (obj.newValues.pwd1 != obj.newValues.pwd2) {
                        //$.omMessageBox.alert({
                        //    content: "密码不一致！"
                        //});
                        $.omMessageTip.show({ type: 'error', content: "密码不一致！", timeout: 3000 });
                    } else {
                        $.ajax({
                            url: getCommonDataUrl('changePwd', 'valid=1', true),
                            type: 'POST',
                            data: JSON.stringify([obj.newValues.pwd0, obj.newValues.pwd1]),
                            dataType: 'json',
                            async: false,   // 等待结果
                            success: function (ajaxResult) {
                                if (ajaxResult.Succeed) {
                                    $('#dlgpwd').bdpEditor('close');
                                    //$.omMessageBox.alert({ type: 'success', content: ajaxResult.Message || '操作成功' });
                                    $.omMessageTip.show({ type: 'success', content: ajaxResult.Message || '操作成功', timeout: 3000 });
                                } else {
                                    //$.omMessageBox.alert({ type: 'error', content: ajaxResult.Message || '操作失败' });
                                    $.omMessageTip.show({ type: 'error', content: ajaxResult.Message || '操作失败', timeout: 3000 });
                                    args.done(ajaxResult);
                                }
                            }
                        });
                    }
                }
            });
        });
    </script>
</asp:Content>
<asp:Content ID="Content3" ContentPlaceHolderID="PlaceToolbar" runat="server">
    <div id="btns"></div>
</asp:Content>
<asp:Content ID="Content4" ContentPlaceHolderID="PlaceSearch" runat="server">
</asp:Content>
<asp:Content ID="Content5" ContentPlaceHolderID="PlaceContent" runat="server">
    <div id="info"></div>
    <div id="dlgpwd"></div>
</asp:Content>
