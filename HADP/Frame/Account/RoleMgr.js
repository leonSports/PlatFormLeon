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

// 设置编辑标志
var setEditting = function (editting) {
    $("#hidediting").val(editting);
};
// 返回是否正在编辑
var isEditting = function () {
    return $("#hidediting").val() == "true";
};
// 获取当前roleid
var getRoleId = function () {
    var node = $("#roletree").omTree("getSelected");
    if (node && node.classes == "role") return node.id;
    else return "";
};
// 获取当前参数值
var hidvalue = function (value) {
    if (value) {
        $("#hidvalue").val(value);
    }
    return $("#hidvalue").val();
};

$(document).ready(function () {
    //#region 公共函数
    $('#tabs').show().find('#tab2,#tab3,#tab4,#tab5,#tab6').css({ padding: 2, "overflow": 'hidden' });
    //#endregion

    //#region 菜单
    $("#menu").omButtonbar({
        btns: [
            {
                id: "add", label: "新增",
                icons: { left: getImageUrl('add') },
                onClick: function (event) {
                    var node = $("#roletree").omTree("getSelected");
                    if (node) {
                        hidvalue("add");
                        var node = $("#roletree").omTree("getSelected");
                        var role = {
                            RoleId: '',
                            RoleCode: '',
                            IsPublic: false,
                            RoleOrder: 1,
                            RoleName: '',
                            Description: '',
                            BelongSystemId: node.sysid || '',
                            BelongSystemText: node.sysname || '',
                            BelongCompany: node.classes == "role" ? node.pid : node.id,
                            CompanyName: node.classes == "role" ? node.company : node.text
                        };
                        $('#role-editor').bdpEditor('setData', role);
                        $('#role-editor').bdpEditor('open');
                    } else {
                        $.omMessageBox.alert({ content: "请先选中角色分类(单位、部门或公共角色)！" });
                    }
                }
            },
            {
                id: "edit", label: "修改",
                icons: { left: getImageUrl('modify') },
                onClick: function (event) {
                    var node = $("#roletree").omTree("getSelected");
                    if (node && node.classes == "role") {
                        hidvalue("edit");
                        var node = $("#roletree").omTree("getSelected");
                        var role = {
                            RoleId: node.id,
                            RoleCode: node.code,
                            IsPublic: node.isPublic,
                            RoleOrder: node.order,
                            RoleName: node.text,
                            Description: node.desc,
                            BelongSystemId: node.sysid || '',
                            BelongSystemText: node.sysname || '',
                            BelongCompany: node.pid,
                            CompanyName: node.company
                        };
                        $('#role-editor').bdpEditor('setData', role);
                        $('#role-editor').bdpEditor('open');
                    } else {
                        $.omMessageBox.alert({ content: "请先选中一个角色！" });
                    }
                }
            },
            {
                id: "del", label: "删除",
                icons: { left: getImageUrl('del') },
                onClick: function (event) {
                    var node = $("#roletree").omTree("getSelected");
                    if (node && node.classes == "role") {
                        $.omMessageBox.confirm({
                            title: '确认删除',
                            content: '<p>删除角色会撤消用户对该角色的权限，同时取消该角色分配的模块权限、操作权限、业务组织权限以及消息权限等。请谨慎使用！</p><p>您确定要删除吗？</p>',
                            onClose: function (v) {
                                if (v) {
                                    $.ajax({
                                        url: getCommonDataUrl('deleteRole', { roleid: node.id }),
                                        dataType: 'json',
                                        success: function (ajaxResult) {
                                            if (ajaxResult.Succeed) {
                                                $("#roletree").omTree('refresh');
                                                $.omMessageTip.show({ type: 'success', content: ajaxResult.Message || '删除成功！', timeout: 3000 });
                                            } else {
                                                $.omMessageTip.show({ type: 'error', content: ajaxResult.Message || '删除失败！', timeout: 3000 });
                                            }
                                        }
                                    });
                                }
                            }
                        });
                    } else {
                        $.omMessageBox.alert({ content: "请先选中一个角色！" });
                    }
                }
            },
            { separtor: true },
            {
                id: "refresh", label: "刷新",
                icons: { left: getImageUrl('refresh') },
                onClick: function (event) {
                    $("#roletree").omTree('refresh');
                }
            }
        ]
    });
    //#endregion

    //#region 左右联动
    var tabsOnActivate = function (n, event) {
        var node = $("#roletree").omTree("getSelected"),
            id = $('#tabs').omTabs('getAlter', n);
        var customPrivs = GlbVar.CustomPrivs || [];
        if (id.substring(0, 2) == 'cp' && customPrivs.length > 0) {
            var idx = parseInt(id.substring(2));
            if (idx < customPrivs.length) {
                var url = customPrivs[idx].url || '';
                if (url != '') {
                    url += (url.indexOf('?') >= 0 ? '&' : '?') + 'roleid=' + getRoleId();
                    url += '&ts=' + new Date().valueOf();
                    $('#iframe_' + idx).attr('src', url);
                }
            }
            return;
        }
        n = $('a[tabid="' + id + '"]').data('index');
        switch (n) {
            case 0:
                $("#role-info-panel").omPanel({ title: node.text });
                $("#rname").text(node.text || '');
                $("#rcode").text(node.code || '');
                $('#rIsPublic').text(node.isPublic ? '已公开' : '未公开');
                $("#rsys").text(node.sysname || '');
                $("#rcomp").text(node.company || '');
                $("#rdesc").text(node.desc || '');
                break;
            case 1:
                var roleid = getRoleId();
                if ($('#fngrid').attr('roleid') != roleid) {
                    var sUrl = getCommonDataUrl("getFuncTreeData", "roleid=" + getRoleId());
                    $('#fngrid').omGrid('setData', sUrl);
                    $('#fngrid').omGrid('resize');
                    $('#fngrid').attr('roleid', roleid);
                }
                break;
            case 2:
                //$('#bocc-treebox').hide();
                if (node.pid == "-1") $('#bo0,label[for=bo0]').show();
                else $('#bo0,label[for=bo0]').hide();
                var opt = $("#botree").omTree("options");
                if (opt && !opt.dataSource) {
                    $("#botree").omTree({ dataSource: getCommonDataUrl("getBOTreeData", { dept: 'yes' }) });
                }
                $.ajax({
                    url: getCommonDataUrl("loadBOPrivs", "roleid=" + getRoleId()),
                    dataType: 'json',
                    error: function (XMLHttpRequest, textStatus, errorThrown) {
                        //alert(textStatus)
                    },
                    success: function (bo) {
                        //$(':radio[name=bomode]').removeAttr('checked');
                        $(':radio[name=bomode]').propAttr('checked', false);
                        if (bo) {
                            $("#botree").find("div.tree-checkbox").unmask(); //$('#bo' + bo.BOKind).attr('checked', 'checked');
                            $('#bo' + bo.BOKind).propAttr('checked', true);
                            if (bo.BOKind == 3) {
                                $("#botree").omTree("checkAll", false);
                                if (bo.CDCollection) {
                                    $(bo.CDCollection).each(function (i) {
                                        var kv = this.DepartmentId;
                                        if (kv == "") kv = this.CompanyId;
                                        var node = $("#botree").omTree("findNode", "id", kv);
                                        $("#botree").omTree("check", node);
                                    });
                                }
                            }
                            $("#botree").find("div.tree-checkbox").mask();
                            $("#bosub").prop("checked", bo.IncludeSubNode);
                        } else {
                            $("#bosub").prop("checked", false);
                            //$('#bo0').attr('checked', 'checked');
                            $('#bo0').propAttr('checked', true);
                        }
                        $(":radio[name=bomode]").click();
                    }
                });
                setBotoolStatus();
                break;
            case 3:
                $("#msggrid").omGrid("setData", getCommonDataUrl("loadMsgPrivs", "roleid=" + getRoleId()));
                $("#msggrid").omGrid("resize");
                break;
            case 4:
                $("#usergrid").omGrid("setData", getCommonDataUrl("loadUsers", "roleid=" + getRoleId()));
                $("#usergrid").omGrid("resize");
                break;
            case 5:
                var opt = $("#orgtree").omTree("options");
                if (opt && !opt.dataSource) {
                    $("#orgtree").omTree({ dataSource: getCommonDataUrl("getBOTreeData", { dept: 'yes' }) });
                }
                break;
        }
    };
    var roleTreeNodeSelect = function (node) {
        if (node.classes != "role") {
            $('#tabs').omTabs("activate", 0);
            $("#tabs").find("li").hide();
            $("#tabs").find("li:first").show();
        } else {
            $("#tabs").find("li").show();
        }
        var activatedTabId = $('#tabs').omTabs('getActivated');
        var tabIndex = $("#tabs").omTabs("getAlter", activatedTabId);
        tabsOnActivate(tabIndex);
    };
    $("#roletree").omTree({
        dataSource: getCommonDataUrl("getRoleTreeData", { pid: '' }),
        simpleDataModel: true,
        onBeforeSelect: function (nodeData) {
            var node = $("#roletree").omTree("getSelected");
            if (node != null && node.id != nodeData.id && isEditting()) {
                $.omMessageBox.alert({ content: "正在编辑，不能切换！" });
                return false;
            }
            return true;
        },
        onSelect: roleTreeNodeSelect,
        onSuccess: function (data) {
            //if (data.length > 0)
            //    $('#roletree').omTree("select", data[0]);
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
    $("#tabs").omTabs({
        height: "fit",
        onActivate: tabsOnActivate,
        onBeforeActivate: function (n, event) {
            if (isEditting()) {
                $.omMessageBox.alert({ content: "正在编辑，不能切换！" });
                return false;
            }
            return true;
        }
    });

    $("#role-info-panel").omPanel({
        title: "信息",
        width: 450
    });
    //#endregion

    //#region 角色编辑框
    $('#role-editor').bdpEditor({
        title: "角色",
        width: 550,
        editors: {
            gridLine: true,
            columnCount: 2,
            colModel: [
                {
                    header: '所属单位', name: 'CompanyName',
                    editor: {
                        name: 'BelongCompany', editable: true, colspan: 2,
                        type: 'combotree',
                        options: {
                            dropHeight: 230,
                            valueField: 'id',
                            textField: 'text',
                            tree: {
                                dataSource: getCommonDataUrl('getCompanyInfos'),
                                simpleDataModel: true
                            }
                        }
                    }
                },
                {
                    header: '角色名称', name: 'RoleName',
                    editor: {
                        colspan: 2,
                        rules: [
                            ["required", true, "角色名称不能为空！"],
                            ["maxlength", 100, "角色名称超长！"]
                        ]
                    }
                },
                {
                    header: '角色代码', name: 'RoleCode',
                    editor: {
                        rules: [["maxlength", 20, "角色代码超长！"]]
                    }
                },
                {
                    header: '序号', name: 'RoleOrder',
                    editor: {
                        type: 'number',
                        rules: [['min', 0, "序号不能小于0"]]
                    }
                },
                {
                    header: '是否公开', name: 'IsPublic',
                    editor: {
                        type: 'checkbox', colspan: 2,
                        hint: '<b>未公开的</b>，公共角色仅超级用户可用，单位角色仅本级可用；<br><b>已公开的</b>，公共角色任何单位可以用，单位角色本级和下级单位均可用'
                    }
                },
                {
                    header: '所属系统', name: 'BelongSystemText',
                    editor: {
                        type: 'combo',
                        name: 'BelongSystemId',
                        colspan: 2,
                        options: {
                            dataSource: getCommonDataUrl('bdpCodes', {
                                type: 'Hongbin.Data.BdpBaseData.BdpSystem',
                                key: 'SystemId',
                                text: 'SystemName',
                                order: 'SystemCode'
                            }),
                            optionField: 'SystemName',
                            valueField: 'SystemId',
                            allowClearValue: true
                        }
                    }
                },
                {
                    header: '说明', name: 'Description',
                    editor: {
                        type: 'memo',
                        colspan: 2,
                        rows: 5,
                        rules: [["maxlength", 100, "角色说明超长！"]]
                    }
                }
            ]
        },
        onClose: function (event) {
            var ok = $('#role-editor').bdpEditor('isSureClosed');
            if (ok) {
                var values = $('#role-editor').bdpEditor('getData'),
                    newdata = values.newValues;
                $.ajax({
                    url: getCommonDataUrl("saveRole"),
                    data: newdata,
                    dataType: 'json',
                    success: function (ajaxResult) {
                        if (ajaxResult && ajaxResult.Succeed) {
                            var node = $("#roletree").omTree("getSelected");
                            var isedit = hidvalue() == "edit";
                            if (isedit) {
                                $("#roletree").omTree("modify", node, ajaxResult.Data);
                            } else {
                                if (node.classes == "role")
                                    node = $("#roletree").omTree("getParent", node);
                                $("#roletree").omTree("insert", ajaxResult.Data, node);
                            }
                            $("#roletree").omTree("select", ajaxResult.Data);
                            $.omMessageTip.show({ type: 'success', content: ajaxResult.Message || '保存成功！', timeout: 3000 });
                        } else {
                            $.omMessageTip.show({ type: 'error', content: ajaxResult.Message || '保存失败！', timeout: 3000 });
                        }
                    }
                });
            }
        },
        done: true
    });
    //#endregion

    //#region 功能操作权限
    var fntoolUpdate = function () {
        var editing = isEditting();
        $("#fnedit").omButton(editing ? "disable" : "enable");
        $("#fnsave").omButton(editing ? "enable" : "disable");
        $("#fncancel").omButton(editing ? "enable" : "disable");
        if (editing) {
            $(":checkbox[name='fnh']").removeAttr("disabled");
            $(":checkbox[id^='kj_']").removeAttr("disabled");
            $(":checkbox[id^='ky_']").removeAttr("disabled");
        } else {
            $(":checkbox[name='fnh']").attr("disabled", 'disabled');
            $(":checkbox[id^='kj_']").attr("disabled", "disabled");
            $(":checkbox[id^='ky_']").attr("disabled", "disabled");
        }
    };
    var fntoolCancel = function () {
        setEditting(false);
        $(":checkbox[id^='kj_']").each(function (i) {
            $(this).prop('checked', $(this).attr('defvalue') == 'true');
        });
        $(":checkbox[id^='ky_']").each(function (i) {
            $(this).prop('checked', $(this).attr('defvalue') == 'true');
        });
        fntoolUpdate();
    };
    var fnckindex = 0;
    var privColumnRenderer = function (value, node, prefix) {
        if (node.classes == 'mod' && $.trim(node.url) == '')
            return '&nbsp;';
        var ht = [];
        ht.push("<input type='checkbox' ");
        ht.push("id='", prefix, "_", fnckindex++, "' ");
        if (value) {
            ht.push("checked='checked' ");
        }
        if (!isEditting()) {
            ht.push("disabled='disabled' ");
        }
        ht.push("mid='", node.id, "' ");
        ht.push("defvalue='", value, "' ");
        ht.push("/>");
        return ht.join("");
    };

    $('#fngrid').omGrid({
        //dataSource: getCommonDataUrl("getFuncTreeData", "roleid=" + getRoleId()),
        height: 'fit',
        limit: -1,
        toolbar: {
            btns: [{
                id: "fnedit", label: "编辑",
                icons: { left: getImageUrl('modify') },
                onClick: function (event) {
                    setEditting(true);
                    fntoolUpdate();
                }
            }, {
                id: "fnsave", label: "保存", disabled: true,
                icons: { left: getImageUrl('save') },
                onClick: function (event) {
                    var rows = $('#fngrid').omGrid('getData').rows;
                    var vdata = [];
                    $(":checkbox[id^='kj_']").each(function (i) {
                        var mid = $(this).attr("mid"),
                            rd = $.grep(rows, function (r) { return r.id == mid; })[0],
                            kj = $(this).prop("checked"),
                            $tr = $(this).closest('tr.om-grid-row'),
                            ky = $(":checkbox[id^='ky_']", $tr).prop("checked");
                        var pageId = rd.id, resId = '';
                        if (rd.classes == 'res') {
                            resId = rd.id;
                            pageId = rd.pid;
                        }
                        var m = {
                            Name: rd.text,
                            PageId: pageId,
                            ResId: resId,
                            FuncVisible: kj,
                            FuncEnable: ky
                        };
                        vdata.push(m);
                    });

                    if (vdata.length > 0) {
                        $.post(getCommonDataUrl("saveFuncPrivData", "roleid=" + getRoleId()),
                            JSON.stringify(vdata),
                            function (jsonResult) {
                                var result = $.parseJSON(jsonResult);
                                if (result && result.Succeed) {
                                    $('#fngrid').find(":checkbox[id^='kj_'],:checkbox[id^='ky_']")
                                        .each(function (i, chk) {
                                            $(chk).attr("defvalue", $(chk).prop('checked'));
                                        });
                                    $.omMessageTip.show({ type: 'success', content: '保存成功！', timeout: 3000 });
                                } else {
                                    $.omMessageTip.show({ type: 'error', content: "保存失败！" + (result ? result.Message : ''), timeout: 3000 });
                                }
                                fntoolCancel();
                            }
                        );
                    } else {
                        fntoolCancel();
                    }
                }
            }, {
                id: "fncancel", label: "取消", disabled: true,
                icons: { left: getImageUrl('cancel') },
                onClick: fntoolCancel
            }, { separtor: true }, {
                id: 'fnreview', label: '查看', icons: { leftCss: 'bdp-icons-search' },
                onClick: function () {
                    var dlgReview = $('#dlgReviewFunc');
                    if (dlgReview.size() == 0) {
                        dlgReview = $('<div id="dlgReviewFunc" style="overflow:hidden;"><table id="dlgReviewGrid"></table></div>').appendTo('body');
                        dlgReview.omDialog({
                            title: '已有权限',
                            autoOpen: false,
                            width: 550,
                            height: 450,
                            buttons: [{
                                text: "刷新", id: 'dlgReviewFunc_refresh', width: 65,
                                click: function () {
                                    $('#dlgReviewGrid').omGrid('setData', getCommonDataUrl('getFuncTreeDataAll', { roleid: getRoleId() }));
                                }
                            }, {
                                text: "关闭", width: 65,
                                click: function () {
                                    $('#dlgReviewFunc').omDialog('close');
                                }
                            }],
                            onResize: function () {
                                $('#dlgReviewGrid').omGrid('resize');
                            },
                            onOpen: function () {
                                $('#dlgReviewGrid').omGrid('resize');
                            }
                        });
                        $('#dlgReviewGrid', dlgReview).omGrid({
                            autoFit: true,
                            //width: 490,
                            height: 'fit', //370,
                            limit: -1,
                            treeColumn: {
                                keyFieldName: 'id',
                                parentFieldName: 'pid',
                                textFieldName: 'text',
                                imageFieldName: 'classes',
                                hasChildrenFieldName: 'hasChildren'
                            },
                            colModel: [{
                                header: "权限项", name: "text", align: "center", width: 300
                            }, {
                                header: "可见", name: "visible", width: 40, renderer: function (value, node) {
                                    if (node.classes == 'mod' && $.trim(node.url) == '')
                                        return '&nbsp;';
                                    var ht = [];
                                    ht.push("<input type='checkbox' ");
                                    if (value) {
                                        ht.push("checked='checked' ");
                                    }
                                    ht.push("disabled='disabled' ");
                                    ht.push("/>");
                                    return ht.join("");
                                }
                            }, {
                                header: "可用", name: "enabled", width: 40, renderer: function (value, node) {
                                    if (node.classes == 'mod' && $.trim(node.url) == '')
                                        return '&nbsp;';
                                    var ht = [];
                                    ht.push("<input type='checkbox' ");
                                    if (value) {
                                        ht.push("checked='checked' ");
                                    }
                                    ht.push("disabled='disabled' ");
                                    ht.push("/>");
                                    return ht.join("");
                                }
                            }]
                        });
                    };

                    $('#dlgReviewGrid', dlgReview).omGrid('setData', getCommonDataUrl('getFuncTreeDataAll', { roleid: getRoleId() }));
                    dlgReview.omDialog('open');
                }
            }]
        },
        treeColumn: {
            keyFieldName: 'id',
            parentFieldName: 'pid',
            textFieldName: 'text',
            imageFieldName: 'classes',
            hasChildrenFieldName: 'hasChildren'
        },
        colModel: [{
            header: "权限项",
            name: "text",
            align: "center",
            width: "autoExpand"
        }, {
            header: "<input type='checkbox' id='hkj' disabled='true' name='fnh'/> 可见",
            name: "visible",
            align: "left",
            width: 110,
            renderer: function (colValue, rowData) {
                return privColumnRenderer(colValue, rowData, 'kj');
            }
        }, {
            header: "<input type='checkbox' id='hky'  disabled='true' name='fnh'/> 可用",
            name: "enabled",
            align: "left",
            width: 110,
            renderer: function (colValue, rowData) {
                return privColumnRenderer(colValue, rowData, 'ky');
            }
        }],
        onSuccess: function (data, testStatus, XMLHttpRequest, event) {
            if ($.isArray(data) && data.length > 0 && data[0].pid == '-1') {
                setTimeout(function () {
                    //$('#fngrid').omGrid('showChildRows', data[0]);
                    $('#fngrid .treebtn').trigger('click');
                }, 300);
            }
        }
    });
    $(":checkbox[name='fnh']").bind("click", function () {
        var id = $(this).prop("id");
        var checked = $(this).prop("checked");
        $(":checkbox[id^='" + (id == "hkj" ? "kj" : "ky") + "_']").prop("checked", checked);
    });

    //#endregion

    //#region 业务组织权限
    var setBotoolStatus = function () {
        var editting = isEditting();
        $("#boedit").omButton(editting ? "disable" : "enable");
        $("#bosave").omButton(editting ? "enable" : "disable");
        $("#bocancel").omButton(editting ? "enable" : "disable");
        if (!editting) {
            $(":radio[name=bomode]").attr("disabled", "disabled");
            $("#bosub").attr("disabled", "disabled");
            $("#botree").find("div.tree-checkbox").mask();
        } else {
            $(":radio[name=bomode]").removeAttr("disabled");
            $("#bosub").removeAttr("disabled");
            $("#botree").find("div.tree-checkbox").unmask();
        }
    };
    $("#botool").omButtonbar({
        btns: [{
            id: "boedit", label: "编辑",
            icons: { left: getImageUrl('modify') },
            onClick: function (event) {
                setEditting(true);
                setBotoolStatus();
                if (parseInt($(":radio[name=bomode]:checked").val()) == 3) {
                    var nodes = $("#botree").omTree("getChecked", true);
                    var oldbonodes = [];
                    $(nodes).each(function (i) { oldbonodes.push(this.nid); });
                    hidvalue(oldbonodes.join(','));
                } else {
                    hidvalue('');
                }
            }
        }, {
            id: "bosave", label: "保存", disabled: true,
            icons: { left: getImageUrl('save') },
            onClick: function (event) {
                var bo = {
                    bok: parseInt($(":radio[name=bomode]:checked").val()),
                    bosub: $("#bosub").prop("checked"),
                    cds: []
                };
                if (bo.bok == 3) {
                    var nodes = $("#botree").omTree("getChecked", true);
                    $(nodes).each(function (i) {
                        if (this.classes == "dept") {
                            var cd = { CompanyId: this.tag, DepartmentId: this.id };
                            bo.cds.push(cd);
                        } else {
                            var cd = { CompanyId: this.id, DepartmentId: '' };
                            bo.cds.push(cd);
                        }
                    });
                }

                $.post(getCommonDataUrl("saveBOPrivs", "roleid=" + getRoleId()),
                    JSON.stringify(bo),
                    function (jsonResult) {
                        var result = $.parseJSON(jsonResult);
                        if (result && result.Succeed) {
                            $.omMessageTip.show({ type: 'success', content: '保存成功！', timeout: 3000 });
                        } else {
                            $.omMessageTip.show({ type: 'error', content: "保存失败！" + (result ? result.Message : ''), timeout: 3000 });
                        }
                        setEditting(false);
                        setBotoolStatus();
                    }
                );

            }
        }, {
            id: "bocancel", label: "取消", disabled: true,
            icons: { left: getImageUrl('cancel') },
            onClick: function (event) {
                var oldbonodes = hidvalue().split(',');
                if (oldbonodes) {
                    $("#botree").omTree("checkAll", false);
                    $(oldbonodes).each(function (i) {
                        if (this != '') {
                            var node = $("#botree").omTree("findByNId", this);
                            if (node) $("#botree").omTree("check", node);
                        }
                    });
                }
                setEditting(false);
                setBotoolStatus();
            }
        }]
    });
    $("#bocc-box").omPanel({
        title: '设置',
        width: 270,
        height: 450
    });
    $(":radio[name=bomode]").click(function () {
        var bomode = $(":radio[name=bomode]:checked").val();
        if (bomode != "3")
            $("#bocc-treebox").parent().hide();
        else {
            $("#bocc-treebox").parent().show();
        }
    });

    $("#bocc-treebox").omPanel({
        title: '组织机构',
        width: 370,
        height: 450
    });
    $("#botree").omTree({
        showCheckbox: true,
        simpleDataModel: true,
        onBeforeExpand: function (node) {
            var nodeDom = $("#" + node.nid);
            if (nodeDom.hasClass("hasChildren")) {
                nodeDom.removeClass("hasChildren");
                $.ajax({
                    url: getCommonDataUrl("getBOTreeData", {
                        dwid: node.classes == 'company' ? node.id : node.tag,
                        bmid: node.classes == 'company' ? '' : node.id,
                        dept: 'yes'
                    }),
                    method: 'POST',
                    dataType: 'json',
                    success: function (data) {
                        $("#botree").omTree("insert", data, node);
                        $("#botree div.tree-checkbox").mask();
                    }
                });
            }
            return true;
        },
        onSuccess: function (data) {
            if (data.length > 0)
                $('#botree').omTree("expand", data[0]);
        }
    }); //#endregion

    //#region 消息处理权限
    var setMsgtoolStatus = function () {
        var editing = isEditting();
        $("#msgedit").omButton(editing ? "disable" : "enable");
        $("#msgsave").omButton(editing ? "enable" : "disable");
        $("#msgcancel").omButton(editing ? "enable" : "disable");
        if (editing) {
            $(":checkbox[id^='msg_']").removeAttr("disabled");
            $(":checkbox[id^='CanView_']").removeAttr("disabled");
            $(":checkbox[id^='CanProcess_']").removeAttr("disabled");
        } else {
            $(":checkbox[id^='msg_']").attr("disabled", 'disabled');
            $(":checkbox[id^='CanView_']").attr("disabled", "disabled");
            $(":checkbox[id^='CanProcess_']").attr("disabled", "disabled");
        }
    };
    var msgPrivRenderer = function (colName, colValue, rowData, rowIndex) {
        var ht = [];
        ht.push("<input type='checkbox' ");
        ht.push("id='", colName, "_", rowIndex, "' ");
        if (colValue) {
            ht.push("checked='checked' ");
        }
        if (!isEditting()) {
            ht.push("disabled='disabled' ");
        }
        ht.push("MsgNo='", rowData.MsgNo, "' ");
        ht.push("colName='", colName, "' ");
        ht.push("colValue='", colValue, "' ");
        ht.push("/>");
        return ht.join("");
    };
    $("#msggrid").omGrid({
        dataSource: getCommonDataUrl("loadMsgPrivs", "roleid=-1"),
        autoFit: true,
        height: 'fit',
        width: 'fit',
        singleSelect: true,
        showIndex: false,
        toolbar: {
            btns: [{
                id: "msgedit", label: "编辑",
                icons: { left: getImageUrl('modify') },
                onClick: function (event) {
                    setEditting(true);
                    setMsgtoolStatus();
                }
            }, {
                id: "msgsave", label: "保存", disabled: true,
                icons: { left: getImageUrl('save') },
                onClick: function (event) {
                    var values = [];
                    $(":checkbox[id^='CanView_']").each(function (i) {
                        var chk = $(this);
                        var rec = {
                            MsgNo: chk.attr('MsgNo'),
                            CanView: chk.prop('checked'),
                            CanProcess: false
                        };
                        values.push(rec);
                    });
                    $(":checkbox[id^='CanProcess_']").each(function (i) {
                        var msgno = $(this).attr('MsgNo');
                        var checked = $(this).prop('checked');
                        for (var i = 0; i < values.length; i++) {
                            if (values[i].MsgNo == msgno) {
                                values[i].CanProcess = checked;
                                break;
                            }
                        }
                    });
                    $.post(getCommonDataUrl("saveMsgPrivs", "roleid=" + getRoleId()),
                        JSON.stringify(values),
                        function (jsonResult) {
                            var result = $.parseJSON(jsonResult);
                            if (result && result.Succeed) {
                                $(":checkbox[id^='msg_']").prop('checked', false);
                                $(":checkbox[id^='CanView_']").each(function (i) {
                                    $(this).attr("colValue", $(this).prop('checked'));
                                });
                                $(":checkbox[id^='CanProcess_']").each(function (i) {
                                    $(this).attr("colValue", $(this).prop('checked'));
                                });
                                setEditting(false);
                                setMsgtoolStatus();
                                $.omMessageTip.show({ type: 'success', content: '保存成功！', timeout: 3000 });
                            } else {
                                $.omMessageTip.show({ type: 'error', content: "保存失败！" + (result ? result.Message : ''), timeout: 3000 });
                            }
                        }
                    );

                }
            }, {
                id: "msgcancel", label: "取消", disabled: true,
                icons: { left: getImageUrl('cancel') },
                onClick: function (event) {
                    setEditting(false);
                    $(":checkbox[id^='msg_']").prop('checked', false);
                    $(":checkbox[id^='CanView_']").each(function (i) {
                        $(this).prop('checked', $(this).attr('colValue') == 'true');
                    });
                    $(":checkbox[id^='CanProcess_']").each(function (i) {
                        $(this).prop('checked', $(this).attr('colValue') == 'true');
                    });
                    setMsgtoolStatus();
                }
            }]
        },
        colModel: [
            { header: '消息号', name: 'MsgNo', width: 50, align: 'center' },
            { header: '消息类别', name: 'MsgClsName', width: 100, align: 'center' },
            { header: '处理器名称', name: 'MsgName', width: 'autoExpand', align: 'center' },
            {
                header: '<input type="checkbox" id="msg_CanView" disabled="disabled" />查看', name: 'CanView', width: 50, align: 'center',
                renderer: function (v, rowData, rowIndex) {
                    return msgPrivRenderer('CanView', v, rowData, rowIndex);
                }
            },
            {
                header: '<input type="checkbox" id="msg_CanProcess" disabled="disabled" />处理', name: 'CanProcess', width: 50, align: 'center',
                renderer: function (v, rowData, rowIndex) {
                    return msgPrivRenderer('CanProcess', v, rowData, rowIndex);
                }
            }
        ],
        onRefresh: function (nowPage, pageRecords, event) {

        }
    });
    $(":checkbox[id^='msg_']").click(function () {
        var id = $(this).prop('id');
        var s = id == "msg_CanView" ? "CanView" : "CanProcess";
        var checked = $(this).prop("checked");
        $(":checkbox[id^='" + s + "_']").prop("checked", checked);
    });
    //#endregion

    //#region 授权用户
    $("#usergrid").omGrid({
        dataSource: getCommonDataUrl("loadUsers", "roleid=-1"),
        autoFit: true,
        width: 'fit',
        height: 'fit',
        singleSelect: false,
        showIndex: false,
        toolbar: {
            btns: [{
                id: "useradd", label: "新增",
                icons: { left: getImageUrl('add') },
                onClick: function (event) {
                    //$(omUserSelector).omDialog("open");
                    $('#UserSelector').bdpSelector('open');
                }
            }, {
                id: "userdel", label: "删除", disabled: true,
                icons: { left: getImageUrl('del') },
                onClick: function (event) {
                    var rows = $("#usergrid").omGrid("getSelections", true);
                    if (rows.length > 0 && confirm('确定要回收选定用户的该角色权限吗？')) {
                        var ids = [];
                        $.each(rows, function (i) { ids.push(this.UserId); });
                        // 通过JSON.stringify将选中的对象转换为字符串
                        var values = JSON.stringify(ids);
                        $.post(getCommonDataUrl("removeUsers", "roleid=" + getRoleId()),
                            values,
                            function (jsonResult) {
                                var result = $.parseJSON(jsonResult);
                                if (result && result.Succeed) {
                                    $("#usergrid").omGrid("reload");
                                    $.omMessageTip.show({ type: 'success', content: '操作成功！', timeout: 3000 });
                                } else {
                                    $.omMessageTip.show({ type: 'error', content: "操作失败！" + (result ? result.Message : ''), timeout: 3000 });
                                }
                            }
                        );
                    }
                }
            }, {
                id: "userrefresh", label: "刷新",
                icons: { left: getImageUrl('refresh') },
                onClick: function (event) {
                    $("#usergrid").omGrid("reload");
                }
            }]
        },
        colModel: [
            { header: '帐户', name: 'UserName', width: 100, align: 'center' },
            { header: '姓名', name: 'RealName', width: 100, align: 'center' },
            { header: '单位', name: 'CompanyName', width: 200, align: 'center' },
            { header: '部门', name: 'DeptName', width: 'autoExpand', align: 'center' }
        ],
        onRowSelect: function (rowIndex, rowData, event) {
            var rows = $("#usergrid").omGrid("getSelections");
            $("#userdel").omButton(rows.length == 0 ? "disable" : "enable");
        },
        onRowDeselect: function (rowIndex, rowData, event) {
            var rows = $("#usergrid").omGrid("getSelections");
            $("#userdel").omButton(rows.length == 0 ? "disable" : "enable");
        }
    });
    // 用户选择对话框
    $('#UserSelector').bdpSelector({
        // 不要自动弹出来
        autoOpen: false,
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
        onClose: function (event) {
            if ($('#UserSelector').bdpSelector('isSureClosed')) {
                var selections = $('#UserSelector').bdpSelector('getSelections'),
                    userIds = [];
                for (var i = 0; i < selections.length; i++) {
                    userIds.push(selections[i].UserId);
                }
                var values = JSON.stringify(userIds);
                $.post(getCommonDataUrl("addUsers", "roleid=" + getRoleId()),
                    values,
                    function (jsonResult) {
                        var result = $.parseJSON(jsonResult);
                        if (result && result.Succeed) {
                            $("#usergrid").omGrid("reload");
                            $.omMessageTip.show({ type: 'success', content: result.Message || "授权成功！", timeout: 3000 });
                        } else {
                            $.omMessageTip.show({ type: 'error', content: result.Message || "授权失败！", timeout: 3000 });
                        }
                    }
                );
            }
        },
        done: true
    });

    //#endregion

    //#region 授权机构
    var setOrgToolStatus = function () {
        var editting = isEditting();
        $("#orgedit").omButton(editting ? "disable" : "enable");
        $("#orgsave,#orgcancel").omButton(editting ? "enable" : "disable");
        if (!editting) {
            $("#orgtree").find("div.tree-checkbox").mask();
        } else {
            $("#orgtree").find("div.tree-checkbox").unmask();
        }
    };
    $("#orgtool").omButtonbar({
        btns: [{
            id: "orgedit", label: "编辑",
            icons: { leftCss: 'bdp-icons-edit' },
            onClick: function (event) {
                setEditting(true);
                setOrgToolStatus();

            }
        }, {
            id: "orgsave", label: "保存", disabled: true,
            icons: { leftCss: 'bdp-icons-save' },
            onClick: function (event) {
                setEditting(false);
                setOrgToolStatus();
            }
        }, {
            id: "orgcancel", label: "取消", disabled: true,
            icons: { leftCss: 'bdp-icons-cancel' },
            onClick: function (event) {

                setEditting(false);
                setOrgToolStatus();
            }
        }]
    });
    $("#orgtree").omTree({
        showCheckbox: true,
        simpleDataModel: true,
        onBeforeExpand: function (node) {
            var nodeDom = $("#" + node.nid);
            if (nodeDom.hasClass("hasChildren")) {
                nodeDom.removeClass("hasChildren");
                $.ajax({
                    url: getCommonDataUrl("getBOTreeData", {
                        dwid: node.classes == 'company' ? node.id : node.tag,
                        bmid: node.classes == 'company' ? '' : node.id,
                        dept: 'yes'
                    }),
                    method: 'POST',
                    dataType: 'json',
                    success: function (data) {
                        $("#orgtree").omTree("insert", data, node);
                    }
                });
            }
            return true;
        },
        onSuccess: function (data) {
            if (data.length > 0)
                $('#orgtree').omTree("expand", data[0]);
            $("#orgtree").find("div.tree-checkbox").mask();
        }
    });
    $('#orgdiv').height(450).css('overflow', 'auto');
    //#endregion

    //#region 初始化
    (function ($) {
        var tabs = GlbVar.AllowTabs || ["tab2", "tab3", "tab5"];
        $.each(["tab2", "tab3", "tab4", "tab5", "tab6"], function () {
            var id = this;
            if ($.inArray(id.valueOf(), tabs) < 0) {
                $('#' + id).remove();
                $('a[href="#' + id + '"]').parent().remove();
            }
        });

        var customPrivs = GlbVar.CustomPrivs || [];
        $.each(customPrivs, function (idx, priv) {
            $('#tabs').omTabs("add", {
                title: priv.title || '',
                tabId: 'cp' + idx,
                activateNew: false,
                content: '<iframe id="iframe_' + idx + '" src="" width="100%" height="97.8%" border="0" frameBorder="no"></iframe>'
            });
        });
    })(jQuery);

    $(window).resize(function () {
        $("#tabs").omTabs('resize');
        $('#fngrid').omGrid('resize');
        $("#usergrid").omGrid('resize');
        $("#msggrid").omGrid('resize');
    }).trigger('resize');
    //#endregion

});