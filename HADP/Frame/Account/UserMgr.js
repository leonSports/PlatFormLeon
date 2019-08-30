/***************************************************************
 * 产品名称：红彬应用程序开发平台
 * 英文名称：Hongbin Application Develop Platform
 * 产品代号：HADP
 * 版 本 号：V3.0
 * 版权所有：西安红彬科技发展有限公司 Copyright@2016
 * 开发人员：彭正府
 * ------------------------------------------------------------
 * 模块功能：
 *   
 *   
 **************************************************************/

$(document).ready(function () {
    //#region 公共函数
    $('#master_content').css({ "overflow": "hidden" });
    //#endregion

    //#region 布局
    $("#cntr").omBorderLayout({
        panels: [{
            id: "menu",
            region: "north",
            height: 28,
            header: false
        }, {
            id: "cl",
            title: "分类",
            region: "west",
            resizable: true,
            width: 245
        }, {
            id: "cc",
            title: "帐户",
            region: "center"
        }],
        fit: true,
        onAfterDrag: function (s, e) {
            $("#user-grid").omGrid('resize');
        }
    });
    //#endregion

    //#region 菜单
    $("#menu").omButtonbar({
        btns: [{
            id: "add",
            label: "新增",
            icons: { leftCss: "bdp-icons-add" },
            onClick: function (event) {
                var node = $('#user-tree').omTree('getSelected');
                if (!node) {
                    $.omMessageTip.show({ content: "请先选择树节点！", timeout: 3000 });
                    return;
                }
                $('#user-grid').omGrid('createNew', false);
            }
        }, {
            id: "addCopy",
            label: "复制",
            icons: { leftCss: "bdp-icons-add" },
            onClick: function (event) {
                var node = $('#user-tree').omTree('getSelected');
                if (!node) {
                    $.omMessageTip.show({ content: "请先选择树节点！", timeout: 3000 });
                    return;
                }
                var rs = $('#user-grid').omGrid('getSelections', false);
                if (rs.length == 0) {
                    $.omMessageTip.show({ content: "请先选择用户！", timeout: 3000 });
                    return;
                }
                $('#user-grid').omGrid('createNew', true);
            }
        },
        { separtor: true }, {
            id: "edit",
            label: "修改",
            icons: { leftCss: "bdp-icons-edit" },
            onClick: function (event) {
                var node = $('#user-tree').omTree('getSelected');
                if (!node) {
                    $.omMessageTip.show({ content: "请先选择树节点！", timeout: 3000 });
                    return;
                }
                var rs = $('#user-grid').omGrid('getSelections', false);
                if (rs.length == 0) {
                    $.omMessageTip.show({ content: "请先选择用户！", timeout: 3000 });
                    return;
                }
                $('#user-grid').omGrid('startEdit');
            }
        }, {
            id: "del",
            label: "删除",
            icons: { leftCss: "bdp-icons-close" },
            onClick: function (event) {
                var node = $('#user-tree').omTree('getSelected');
                if (!node) {
                    $.omMessageTip.show({ content: "请先选择树节点！", timeout: 3000 });
                    return;
                }
                var rs = $('#user-grid').omGrid('getSelections', true);
                if (rs.length == 0) {
                    $.omMessageTip.show({ content: "请先选择用户！", timeout: 3000 });
                    return;
                }
                $.omMessageBox.confirm({
                    content: '确定要删除 ' + rs[0].UserName + ' 等共 ' + rs.length + ' 位用户吗？',
                    onClose: function (yes) {
                        if (yes) {
                            var uids = [];
                            $.each(rs, function (index, obj) {
                                uids.push(obj.UserId);
                            });
                            $.ajax({
                                type: 'POST',
                                url: getCommonDataUrl('deleteUser'),
                                data: JSON.stringify(uids),
                                success: function (strResult) {
                                    var res = $.parseJSON(strResult) || {};
                                    if (res.Succeed) {
                                        $('#editor').bdpEditor('close');
                                        $("#user-grid").omGrid('reload');
                                        $.omMessageTip.show({ type: 'success', title: '成功', content: '删除成功！', timeout: 3000 });
                                    } else {
                                        $.omMessageTip.show({ type: 'error', title: '错误', content: '删除失败！' + (res ? res.Message : ''), timeout: 3000 });
                                    }
                                }
                            });
                        }
                    }
                });
            }
        },
        { separtor: true }, {
            id: "refresh",
            label: "刷新",
            icons: { leftCss: "bdp-icons-refresh" },
            onClick: function (event) {
                $('#user-tree').omTree('refresh');
            }
        },
        { separtor: true }, {
            id: "pwd",
            label: "设置密码",
            icons: { leftCss: "bdp-icons-password" },
            onClick: function (event) {
                var rs = $('#user-grid').omGrid('getSelections', true);
                if (rs.length > 0) {
                    $('#pwd-editor').bdpEditor('setData', {});
                    $('#pwd-editor').bdpEditor('open');
                } else {
                    //$.omMessageBox.alert({
                    //    content: "请先选择用户！"
                    //});
                    $.omMessageTip.show({ content: "请先选择用户！", timeout: 3000 });
                }
            }
        }, {
            id: 'granter',
            label: '设置权限',
            icons: { left: getImageUrl('role') },
            onClick: function (event) {
                var rs = $('#user-grid').omGrid('getSelections', true);
                if (rs.length > 0) {
                    $('#lblUser').text(rs[0].UserName + '  ' + rs[0].RealName || '');
                    $('#gdsttree').omTree({ dataSource: [] });
                    $.ajax({
                        type: 'POST',
                        url: getCommonDataUrl('getUserRoleTreeData', 'uid=' + rs[0].UserId),    //getUserRoleIds
                        dataType: 'json',
                        success: function (ajaxResult) {
                            if (ajaxResult.Succeed) {
                                var roles = $.makeArray(ajaxResult.Data);
                                $.each(roles, function (index, role) {
                                    var companies = role.BelongCompany || [],
                                        node = $('#gdsttree').omTree('findNode', 'id', role.RoleId);
                                    if (!node) {
                                        var pnode = null;
                                        for (var i = companies.length - 1; i >= 0; i--) {
                                            var co = companies[i];
                                            if (co.Id) {
                                                node = $('#gdsttree').omTree('findNode', 'id', co.Id);
                                                if (node == null) {
                                                    node = { id: co.Id, pid: pnode == null ? "" : pnode.id, text: co.Name, classes: 'folder' }
                                                    $('#gdsttree').omTree('insert', node, pnode);
                                                }
                                                pnode = node;
                                            }
                                        }
                                        var pid = pnode == null ? "" : pnode.id;
                                        node = { id: role.RoleId, pid: pid, text: role.RoleName, classes: 'role', company: pid };
                                        $('#gdsttree').omTree('insert', node, pnode);
                                    }
                                });
                                $('#gdsttree').omTree('expandAll');
                            } else {
                                $.omMessageTip.show({ content: ajaxResult.Message || '获取个人角色失败！', timeout: 3000 });
                            }
                        }
                    });
                    $("#role-granter").omDialog('open');
                } else {
                    $.omMessageTip.show({
                        content: "请先选择用户！", timeout: 3000
                    });
                }
            }
        }, { separtor: true }, {
            id: "export",
            label: "导出",
            icons: { left: getImageUrl('excel.jpg') },
            onClick: function (event) {
                $("#user-grid").omGrid('toExcel');
            }
        }, { separtor: true }, {
            id: 'tools', label: '工具', icons: { leftCss: 'bdp-icons-restoration' },
            onClick: function () {
                $('#divTools').omMenu("show", this);
            }
        }]

    });

    if ($('#divTools').length == 0) {
        $('body').append($('<div id="divTools" style="z-index: 2000;"></div>'));
    }
    $('#divTools').omMenu({
        minWidth: 150,
        maxWidth: 200,
        dataSource: [
            { id: '001', label: '设置显示列', icon: '', seperator: true },
            { id: '002', label: '批量修改', icon: '', seperator: false }
        ],
        onSelect: function (item, event) {
            switch (item.id) {
                case '001':
                    $("#user-grid").omGrid('setupViewOptions');
                    break;
                case '002':
                    $("#user-grid").omGrid('batchUpdate');
                    break;
            }
        }
    });

    //#endregion

    //#region 搜索用户
    // todo: 考虑将搜索做一个控件，支持快速搜索，也支持高级搜索
    $("#sub").change(function () { refreshGrid(); });
    $("#btnSearch").click(function () { refreshGrid(); });
    $('#edtSearchText').keypress(function (event) {
        if (event.keyCode == 13) {
            refreshGrid();
        }
    });

    $('#btnAdvSearch').omButton({
        label: '高级',
        onClick: function () {
            $("#user-grid").omGrid('fbToggle');
        }
    });

    //#endregion

    //#region 树及表格刷新函数
    // 获取数据查询参数
    var getQueryParam = function () {
        var ret = {}
        var node = $('#user-tree').omTree('getSelected');
        if (node != null) {
            ret.sub = $('#sub').prop("checked") ? 'yes' : 'no';
            ret.filter = escape($('#edtSearchText').val());
            ret.dwid = node.id;
            ret.bmid = '';
            if (node.classes == 'dept') {
                ret.dwid = node.tag;
                ret.bmid = node.id;
            }
        }
        return ret;
    }
    var refreshGrid = function () {
        var s = getCommonDataUrl('getUsers', getQueryParam());
        $("#user-grid").omGrid("setData", s);
    }
    $("#user-tree").omTree({
        dataSource: getCommonDataUrl("getUserClassifyData"),
        showCheckbox: false,
        cascadeCheck: false,
        simpleDataModel: true,
        showIcon: true,
        onBeforeExpand: function (node) {
            var nodeDom = $("#" + node.nid);
            if (nodeDom.hasClass("hasChildren")) {
                nodeDom.removeClass("hasChildren");
                $.ajax({
                    url: getCommonDataUrl("getUserClassifyData", {
                        dwid: node.classes == 'company' ? node.id : node.tag,
                        bmid: node.classes == 'company' ? '' : node.id,
                        dept: 'yes'
                    }),
                    method: 'POST',
                    dataType: 'json',
                    success: function (data) {
                        $("#user-tree").omTree("insert", data, node);
                    }
                });
            }
            return true;
        },
        onSelect: refreshGrid
    });
    //#endregion

    //#region 用户信息列模型
    var userInfoModel = [
        {
            header: '帐户名', name: 'UserName', width: 110, align: 'center', sort: 'serverSide',
            editor: {
                index: 1, colspan: 1, captionStyle: { 'font-weight': 'bold' },
                rules: [
                    ["required", true, "帐户名不能为空"],
                    ['maxlength', 30, '帐户名超出长度限制'],
                    ['Uniqued', function (value) {
                        var kv = this.getValues().newValues.UserId || '';
                        var sFilter = 'a.PrivUsersId<>"' + kv + '" and a.UserName="' + value + '"';
                        var url = getCommonDataUrl('DEQuery', { type: 'Hongbin.Data.BdpBaseData.BdpPrivUser', filter: sFilter, limit: 2 });
                        var count = 0;
                        jdpExec(url, function (result) {
                            count = parseInt(result.total) || 0;
                        });
                        return count === 0;
                    }, '用户名已经存在']
                ],
                onValueChanged: function (target, newValue, oldValue) {
                    // $.omMessageBox.alert({ content: newValue });
                }
            }
        },
        {
            header: '真实姓名', name: 'RealName', width: 110, align: 'center', sort: 'serverSide',
            editor: {
                index: 2, colspan: 1,
                rules: [['maxlength', 30, '真实姓名超出长度限制']]
            }
        },
        {
            header: '性别', name: 'Sex', width: 70, align: 'center',
            editor: {
                index: 3, type: 'omCombo',
                options: {
                    dataSource: [{ text: '男', value: '男' },
                    { text: '女', value: '女' }],
                    onValueChanged: function (target, newValue, oldValue) {
                        //$.omMessageBox.alert({ content: newValue });
                    }
                }
            }
        },
        {
            header: '单位', name: 'CompanyName', width: 150, align: 'center',
            editor: {
                index: 5, name: 'CompanyId', colspan: 2, type: 'combotree',
                options: {
                    dropHeight: 230,
                    valueField: 'id',
                    textField: 'text',
                    tree: {
                        dataSource: getCommonDataUrl('getCompanyInfos'),
                        simpleDataModel: true
                    },
                    onValueChanged: function (target, newValue, oldValue) {
                        var surl = getCommonDataUrl('getDeptInfos', "cid=" + newValue);
                        var ctrl = $("#user-grid").omGrid('findEditor', 'DeptId', this);
                        if (ctrl) {
                            $(ctrl).bdpComboTree({ tree: { dataSource: surl } });
                        }
                        surl = getCommonDataUrl('getEmployees', "cid=" + newValue);
                        ctrl = $("#user-grid").omGrid('findEditor', 'EmployeeId', this);
                        ctrl.omCombo('setData', surl);
                    }
                }
            }
        },
        //{
        //    header: '部门', name: 'DeptName', width: 120, align: 'center',
        //    editor: {
        //        index: 6, name: 'DeptId', colspan: 2, type: 'combotree',
        //        options: {
        //            dropHeight: 230,
        //            valueField: 'id',
        //            textField: 'text',
        //            tree: {
        //                dataSource: getCommonDataUrl('getDeptInfos', "cid="),
        //                simpleDataModel: true,
        //                onSuccess: function (data) {
        //                    //alert(data.length);
        //                }
        //            },
        //            onValueChanged: function (target, newValue, oldValue) {
        //                var coCtrl = $("#user-grid").omGrid('findEditCtrl', 'CompanyId', this);
        //                if (coCtrl) {
        //                    var cid = coCtrl.bdpEditCtrl('getValue'),
        //                        bmid = newValue,
        //                        surl = getCommonDataUrl('getEmployees', "cid=" + cid + "&bmid=" + bmid),
        //                        ctrl = $("#user-grid").omGrid('findEditor', 'EmployeeId', this);
        //                    ctrl.omCombo('setData', surl);
        //                }
        //            }
        //        }
        //    }
        //},
        //{
        //    header: '员工姓名', name: 'EmployeeName', width: 70, align: 'center',
        //    editor: {
        //        index: 7, name: 'EmployeeId', colspan: 1, type: 'omCombo',
        //        options: {
        //            valueField: 'EmployeeId',
        //            optionField: 'EmpName',
        //            inputField: 'EmpName',
        //            forceSelection: true,
        //            onValueChanged: function (target, newValue, oldValue) {
        //                //$.omMessageBox.alert({ content: newValue });
        //            }
        //        }
        //    }
        //},
        //{
        //    header: '类别', name: 'UserType', index: 7,
        //    editor: {
        //        index: 8, type: 'combo', options: {
        //            dataSource: getCommonDataUrl('getCodes', 'type=Hongbin.Data.BdpBaseData.BdpCodeUserType&key=Name&text=Name'),
        //            valueField: "Name",
        //            inputField: "Name",
        //            optionField: "Name",
        //            allowClearValue: true
        //        }
        //    }
        //},
        //{ header: '代码', name: 'UserCode', editor: { index: 9 } },
        {
            header: '拥有角色', name: 'RoleNames', width: 110,
            editor: {
                editable: false, index: 9, colspan: 2,
                renderer: function (cm, value, data) {
                    return $.makeArray(value).join(',');
                }
            }
        },
        {
            header: '是否禁用', name: 'LockFlag', width: 70, align: 'center',
            renderer: function (v, rowData, rowIndex) {
                return v ? "已禁用" : "";
            },
            editor: {
                index: 4, type: 'checkbox',
                onValueChanged: function (target, newValue, oldValue) {
                    //$.omMessageBox.alert({ content: newValue });
                }
            }
        },
        {
            header: '备注', name: 'Descripition', width: 'autoExpand', align: 'left',
            editor: {
                index: 10, colspan: 2
            }
        }
    ];
    //#endregion

    //#region 用户表格
    $("#user-grid").omGrid({
        autoFit: true,
        width: 'fit',
        height: 'fit',
        singleSelect: false,
        showIndex: false,
        colModel: userInfoModel,
        //onRowDblClick: function (rowIndex, rowData, event) {
        //    $('#editor').bdpEditor('setData', rowData);
        //    $('#editor').bdpEditor('open');
        //}//,
        //// 不要进入行编辑模式
        ////onBeforeEdit: function (rowIndex, rowData) { return false; }

        // 自定义查询插件
        filterBox: {
            autoOpen: false
        },
        /* 必须设置有batchUpdater选项才能调用批量更新命令：omGrid('batchUpdate')
        */
        // 批量修改
        batchUpdater: {
            // 仅有部分字段适合批量更新
            colModel: $.grep(userInfoModel, function (e) {
                return ['Sex', 'LockFlag', 'UserType', 'Descripition'].indexOf(e.name) >= 0;
            }),
            beforeExecute: function (s) {
                if (s.scope == 0) {
                    /*  更新选中的记录时，只需要设置好类名和主键字段即可，其它条件都没有必要了。
                        此时s.keyValues中已经填好了当前选中行的主键值
                    */
                    s.type = 'Hongbin.Data.BdpBaseData.BdpPrivUser';
                    s.keyField = 'PrivUsersId';
                    s.filterSql = '';
                    s.customFilter = null;
                    return true;
                }
                // 全部更新时要考虑当前数据记录的筛选条件，所以要自己处理
                var dlg = this;
                dlg.start();
                var ops = getQueryParam();
                ops.values = JSON.stringify(s.values);
                var sUrl = getCommonDataUrl('UserBatchUpdate', ops);
                jdpExec(sUrl, ops, function (ajaxResult) {
                    dlg.stop(ajaxResult);
                });
                // 自己处理批量更新后一定要返回false，以中止缺省的处理过程
                return false;
            }
        },
        /* bdp-grid-edit插件 */
        keyFieldName: 'UserId',
        editMode: 'fixpanel', //'multirow',   //'fixpanel',   //'rowpanel',   //'dialog',
        fixPanelId: 'pnl_userinfo',
        editOnDblclick: true,
        editOptions: {                  //dialog    rowpanel    fixpanel    multirow
            title: '用户信息',
            width: 550,
            //height: 310,
            align: 'center',
            editors: {                  // bdpEditPanel
                isView: false,
                gridLine: true,
                columnCount: 2
                //colModel: userInfoModel
            },
            updateUrl: function () {
                return getCommonDataUrl('BdpUserSave');
            },
            onNewRecord: function (args) {
                args.record.CompanyId = '';
                args.record.DeptId = '';
                var node = $('#user-tree').omTree('getSelected');
                switch (node.classes) {
                    case "company":
                        args.record.CompanyId = node.id;
                        args.record.CompanyName = node.text;
                        break
                    case "dept":
                        args.record.CompanyId = node.tag;
                        args.record.DeptId = node.id;
                        break;
                }
            },
            onBeforeSave: function (args) {

                args.cancel = false;
            },
            // 窗口关闭前事件，参数格式: args:{canClose:true, ajaxResult:null}
            onCloseQuery: function (args) {
                if (args.ajaxResult) {
                    if (args.ajaxResult.Succeed) {
                        $('#user-grid').omGrid('setFocuskey', args.ajaxResult.Data || '');
                        $('#user-grid').omGrid('cancelEdit');
                        $("#user-grid").omGrid('reload');
                        //$.omMessageBox.alert({
                        //    type: 'success', title: '成功',
                        //    content: '保存成功!'
                        //});
                    } else {
                        //$.omMessageBox.alert({
                        //    type: 'error', title: '失败',
                        //    content: '保存失败！' + args.ajaxResult.Message
                        //});
                        $.omMessageTip.show({
                            type: 'error', title: '失败', timeout: 3000,
                            content: '保存失败！' + args.ajaxResult.Message
                        });
                        args.canClose = false;
                    }
                }
            }
        }
    });
    //#endregion

    //#region 设置密码
    $('#pwd-editor').bdpEditor({
        title: '请为选中的用户设置密码',
        width: 320,
        editors: {
            dataSource: { pwd1: '', pwd2: '' },
            colModel: [
                { header: '新密码', name: 'pwd1', editor: { password: true } },
                { header: '再输一次', name: 'pwd2', editor: { password: true } }
            ]
        },
        onBeforeSave: function (args) {
            var obj = args.values[0];
            if (obj.newValues.pwd1 != obj.newValues.pwd2) {
                //$.omMessageBox.alert({
                //    content: "密码不一致！"
                //});
                $.omMessageTip.show({
                    content: "密码不一致！", timeout: 3000
                });
                args.cancel = true;
            } else {
                // 自己接管数据保存
                args.cancel = true;

                var rs = $('#user-grid').omGrid('getSelections', true);
                var uids = [];
                $.each(rs, function (index, r) { uids.push(r.UserId); });
                // 最后是新密码
                uids.push(obj.newValues.pwd2);
                $.ajax({
                    type: 'POST',
                    url: getCommonDataUrl('changePwd'),
                    data: JSON.stringify(uids),
                    success: function (strResult) {
                        var res = $.parseJSON(strResult) || {};
                        if (res.Succeed) {
                            $('#pwd-editor').bdpEditor('close');
                            $("#user-grid").omGrid('reload');
                            //$.omMessageBox.alert({
                            //    content: "保存成功！"
                            //});
                            $.omMessageTip.show({ content: "保存成功！", timeout: 3000 });
                        } else {
                            $.omMessageTip.show({
                                type: 'error', title: '错误', timeout: 3000,
                                content: '保存失败！' + (res ? res.Message : '')
                            });
                        }
                    }
                });
            }
        },
        done: true
    });
    //#endregion

    //#region 授权框
    $("#role-granter").omDialog({
        title: "用户授权",
        width: 790,
        height: 450,
        autoOpen: false,
        modal: true,
        buttons: [
            {
                text: '保存',
                width: 70,
                click: function () {
                    var rs = $('#user-grid').omGrid('getSelections', true);
                    var data = [];
                    //数组的第一个元素为用户ID,其它为角色ID
                    data.push(rs[0].UserId);
                    $('#gdsttree').omTree('checkAll', true);
                    var nodes = $('#gdsttree').omTree('getChecked', true);
                    $.each(nodes, function (index, node) {
                        if (node.classes == 'role')
                            data.push(node.id);
                    });
                    $.ajax({
                        type: 'POST',
                        url: getCommonDataUrl('saveUserRoles'),
                        data: JSON.stringify(data),
                        success: function (strResult) {
                            var res = $.parseJSON(strResult) || {};
                            if (res.Succeed) {
                                $("#role-granter").omDialog('close');
                                //$.omMessageBox.alert({
                                //    content: "保存成功！"
                                //});
                                $.omMessageTip.show({
                                    content: "保存成功！", timeout: 3000
                                });
                            } else {
                                $.omMessageTip.show({
                                    type: 'error', title: '错误', timeout: 3000,
                                    content: '保存失败！' + (res ? res.Message : '')
                                });
                            }
                        }
                    });
                }
            }, {
                text: '取消',
                width: 70,
                click: function () {

                    $("#role-granter").omDialog('close');
                }
            }
        ],
        onOpen: function (event) {
            $(window).resize();
        },
        onResize: function (event, ui) {
            $(window).resize();
        }
    });
    $("#gcc").omBorderLayout({
        fit: true,
        panels: [{
            id: "gsrc",
            title: "所有角色",
            region: "west",
            resizable: false,
            width: "45%"
        }, {
            id: "gopt",
            header: false,
            region: "center"
        }, {
            id: "ght",
            region: 'north',
            header: false,
            height: 30
        }, {
            id: "gpdst",
            region: "east",
            title: "已授权的角色",
            width: "45%"
        }],
        spacing: 1
    });

    $("#gsrctree").omTree({
        dataSource: getCommonDataUrl('getRoleTreeData', { pid: '' }),
        simpleDataModel: true,
        showCheckbox: true,
        onSelect: function (node) {

        },
        onSuccess: function (data) {
            //if (data.length > 0)
            //    $("#gsrctree").omTree('select', data[0]);
        },
        onBeforeExpand: function (node) {
            var nodeDom = $('#' + node.nid), theTree = this;
            if (nodeDom.hasClass('hasChildren')) {
                nodeDom.removeClass('hasChildren');
                $.ajax({
                    url: getCommonDataUrl("getRoleTreeData", { pid: node.id }),
                    method: 'POST',
                    dataType: 'json',
                    success: function (nodedata) {
                        $(theTree).omTree('insert', nodedata, node);
                    }
                });
            }
        }
    });
    $("#gadd").omButton({
        label: '授予',
        onClick: function (event) {
            var nodes = $('#gsrctree').omTree('getChecked', true);
            $.each(nodes, function (index, node) {
                if (node.classes == 'role')
                    addRole(node)
            });

        }
    });
    $('#gdel').omButton({
        label: '撤销',
        onClick: function (event) {
            var nodes = $('#gdsttree').omTree('getChecked', true);
            $.each(nodes, function (index, node) {
                $('#gdsttree').omTree('remove', node);
            });
        }
    });
    // 只适于从左树拷到右树
    var addRole = function (role) {
        var pid = role.pid;
        var nodes = [role];
        while (pid != '') {
            var node = $('#gsrctree').omTree('findNode', 'id', pid);
            if (node != null) {
                nodes.push(node);
                pid = node.pid || '';
            } else {
                pid = '';
            }
        }
        var pnode = null;
        for (var i = nodes.length - 1; i >= 0; i--) {
            var src = nodes[i], id = src.id;
            var node = $('#gdsttree').omTree('findNode', 'id', id);
            if (node == null) {
                node = { id: src.id, pid: src.pid, text: src.text, classes: src.classes }
                $('#gdsttree').omTree('insert', node, pnode);
            }
            pnode = node;
        }
    };

    $("#gdsttree").omTree({
        simpleDataModel: true,
        showCheckbox: true,
        onSelect: function (node) {

        },
        onSuccess: function (data) {
            if (data.length > 0)
                $("#gdsttree").omTree('select', data[0]);
        }
    });

    //#endregion

    $(window).resize(function () {
        $("#user-grid").omGrid('resize');
    }).trigger('resize');
});

