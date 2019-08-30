<%@ Page Title="" Language="C#" MasterPageFile="~/Frame/Master/SingleTable.Master" AutoEventWireup="true" CodeBehind="WfApplyDemo.aspx.cs" Inherits="Hongbin.Web.Frame.Wf.Apply.WfApplyDemo" %>

<asp:Content ID="Content1" ContentPlaceHolderID="PlaceCss" runat="server">
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="head" runat="server">
    <%--需要审批流的页面必须引用流程相关的js和css--%>
    <script src="../Common/BdpFlowLoader.js"></script>
    <script type="text/javascript">
        $(document).ready(function () {
            // 正常的按钮布局，其中wfmenu是流程菜单的占位符，不用挂事件
            $('#btns').omButtonbar({
                btns: [
                    { id: 'add', label: '新增' },
                    { id: 'del', label: '删除' },
                    { id: 'edit', label: '编辑' },
                    { separtor: true },
                    // 流程占位符给一个id就可以了
                    { id: 'wfmenu' },
                    { separtor: true },
                    { id: 'print', label: '打印' }]
            });
            // 在流程占位符处创建流程菜单，如果地址上有参数wflogid，表示为流程审批过程，当前页面应为流程审批界面，
            // 将创建“审批”和“查看”两个流程按钮。否则视为业务界面，将创建“提交审批”按钮。
            // 可调用bdpWfToolbox提供的enable或disable函数设置流程按钮的状态，如果是审批页面，这两个函数均支持参数
            // btn, 取值可以是audit或view,未指定则设置审批和查看两个按钮。如：
            // $('#wfmenu').bdpWfToolbox('disable','audit')
            $('#wfmenu').bdpWfToolbox({
                // 必须指定实体类名，即审批对象是什么类别
                billType: 'Hongbin.Data.BdpBaseData.BdpOrgCompany',
                // 指定一个显示流程过程的面板id，如果未指定或不存在将自动创建
                viewPanelId: 'viewPanel',
                // 必须提供该事件，并且必须在该事件中指定要审批的对象的ID
                /* 详细的事件参数对象如下：
                    var args = {
                        // 是否取消，如果为true将不会出现审批对话框
                        cancel: false,
                        // 流程适用标志
                        applianceSign: ops.applianceSign,
                        // 单据类名
                        billType: ops.billType,
                        // 单据ID，即审批对象ID，必须提供
                        billId: '',
                        // 单据名称，可选
                        billName: '',
                        // 是否正在审批
                        isAuditing: self.isAuditing,
                        // 审批明细记录ID，仅审批时存在
                        auditLogId: self.auditLogId || ''
                    };
                */
                onBeforeAudit: function (args) {
                    args.billId = '10708';
                }
            });
        });
    </script>
</asp:Content>
<asp:Content ID="Content3" ContentPlaceHolderID="PlaceToolbar" runat="server">
    <%--正常的菜单条--%>
    <div id="btns"></div>
</asp:Content>
<asp:Content ID="Content4" ContentPlaceHolderID="PlaceSearch" runat="server">
</asp:Content>
<asp:Content ID="Content5" ContentPlaceHolderID="PlaceContent" runat="server">
    <div style="height: 220px;">
        这里放正常的业务组件，如表格等
    </div>
    <%--最好放一个面板来显示流程内容, 不是必须的--%>
    <div id="viewPanel"></div>
</asp:Content>
