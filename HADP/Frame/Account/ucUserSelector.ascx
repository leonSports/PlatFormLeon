<%@ Control Language="C#" AutoEventWireup="true" CodeBehind="ucUserSelector.ascx.cs" Inherits="Hongbin.Web.Frame.Account.ucUserSelector" %>

<div id="<% =this.ClientID %>_dlg">
</div>
<script type="text/javascript">
    // 定义一个公共变量，规则是在用户控件名称加前缀om
    var om<%= this.ID %> = $('#<% =this.ClientID %>_dlg');
    om<%= this.ID %>.bdpSelector({
        title: "选择用户",
        width: 650,
        height: 450,
        // 是否快速搜索
        allowQuickSearch: true,
        // 是否单选
        singleSelect: false,
        // 过滤串参数名
        qnSearch: "filter",
        // 树节点id的参数名
        qnTreeId: 'id',
        // 树节点上级id的参数名
        qnTreePid: 'pid',
        // 表格主键字段名
        qnGridKey: 'UserId',
        // 是否包括下级标志的参数名,1为包括下级。
        qnSub: 'sub',
        treeDataSource: getCommonDataUrl("getUserClassifyData"),
        gridDataSource: getCommonDataUrl("getUsers"),
        // 请求数据前增加一些参数
        onBeforeRequestData: function (args, node, forGrid) {
            if (forGrid) {
                args.dwid = node.id;
                args.bmid = '';
                if (node.classes == 'dept') {
                    args.dwid = node.tag;
                    args.bmid = node.id;
                }
            } else {
                args.dwid = node.classes == 'company' ? node.id : node.tag;
                args.bmid = node.classes == 'company' ? '' : node.id;
            }
        },
        tree: {
            // 有tree表示要显示左边的树，其它参数不用设置，如果设了将原来传给omTree控件
            simpleDataModel: true
        },
        grid: {
            // 有grid表示要显示右边的表格，其它参数不用设置，如果设了将原来传给omGrid控件
            autoFit: true,
            height: 'fit',
            width: 'fit',
            // 一般应该要有列模型
            colModel: [
                { header: '帐户', name: 'UserName', width: 100, align: 'center' },
                { header: '姓名', name: 'RealName', width: 100, align: 'center' },
                { header: '单位', name: 'CompanyName', width: 200, align: 'center' },
                { header: '部门', name: 'DeptName', width: 'autoExpand', align: 'center' }
            ],
            // 小技巧，避免调整前面的参数多了逗号
            done: true
        },

        done: true
    });
</script>
