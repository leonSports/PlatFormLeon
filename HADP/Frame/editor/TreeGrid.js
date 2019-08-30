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
    var getTreeDataSource = function (id) {
        return GlbVar.MP.Tree.dataSource + '&pid=' + id;
    };
    var getGridDataSource = function (fkValue) {
        var args = {};
        args.type = GlbVar.MP.Grid.type || '';
        args.filter = GlbVar.MP.Grid.filter;
        if (GlbVar.MP.Grid.fkFieldName) {
            if (args.filter) args.filter += ' and ';
            args.filter += "a." + GlbVar.MP.Grid.fkFieldName + " = '" + fkValue + "'";
        }
        if (GlbVar.MP.Grid.sortFieldName)
            args.orderby = GlbVar.MP.Grid.sortFieldName;
        return getCommonDataUrl('DEQuery', args);
    }
    var setBtnStatus = function () {
        var editing = $('#grid').omGrid("isEditing"),
            editmode = $('#grid').omGrid('options').editMode,   // rowpanel,multirow,dialog,fixpanel
            isMultiRowEditing = editmode == 'multirow',
            rows = $('#grid').omGrid('getSelections');
        var node = $('#tree').omTree('getSelected');

        if (GlbVar.MP.Tree.allowEdit) {
            $('#treeAdd').omButton(editing ? 'disable' : 'enable');
            $('#treeEdit').omButton(!editing && node ? 'enable' : 'disable');
            $('#treeDel').omButton(!editing && node && !node.hasChildren > 0 ? 'enable' : 'disable');
        }

        $('#add').omButton((node == null) || (!isMultiRowEditing && editing) ? 'disable' : 'enable');
        $("#opt,#refresh").omButton(editing ? 'disable' : 'enable');
        $("#addCopy,#edit,#del").omButton(editing || rows.length == 0 ? 'disable' : 'enable');
        if (editmode == "fixpanel") {
            $('#edit').closest('.om-btn').hide();
        } else {
            $('#edit').closest('.om-btn').show();
        }
        $('#edit').omButton(editing || (editmode != 'multirow' && rows.length == 0) ? 'disable' : 'enable');

        $("#save,#cancel").closest('.om-btn').hide();
        $("#cancel").closest('.om-btn').next('.om-buttonbar-sep').hide();
        if (editmode == "multirow" || editmode == "fixpanel") {
            $("#save").closest('.om-btn').show();
            $("#cancel").closest('.om-btn').next('.om-buttonbar-sep').show();
            if (editmode == "multirow") {
                $("#cancel").closest('.om-btn').show();
            }
            if (editmode == "fixpanel") {
                $("#save").omButton('enable');
            } else {
                $("#save,#cancel").omButton(!editing ? 'disable' : 'enable');
            }
        }
    };
    //#region 菜单

    // 树维护菜单
    var treeBtns = [];
    if (GlbVar.MP.Tree.editOptions) {
        treeBtns = treeBtns.concat([{
            id: 'treeAdd', hint: '新增', icons: { leftCss: 'bdp-icons-glyph-add' },
            onClick: function () {
                var node = $('#tree').omTree('getSelected');
                var pnode = node ? $('#tree').omTree('getParent', node) : null;
                var nodeData = { id: '', pid: pnode ? pnode.id : null };
                if (pnode) {
                    nodeData.pidText = pnode.text;
                    if (GlbVar.MP.Tree.pkey)
                        nodeData[GlbVar.MP.Tree.pkey] = nodeData.pid;
                }
                var args = { record: nodeData };
                var onNewRecord = GlbVar.MP.Tree.editOptions.onNewRecord;
                onNewRecord && onNewRecord.call(this, args);

                $('#treeEditor').bdpEditor('setOptions', { title: '新增 - ' + (GlbVar.MP.Tree.editOptions.title || '') });
                $('#treeEditor').bdpEditor('setData', args.record);
                $('#treeEditor').bdpEditor('open');
            }
        }, {
            id: 'treeEdit', hint: '修改', icons: { leftCss: 'bdp-icons-flow_edit' },
            onClick: function () {
                var node = $('#tree').omTree('getSelected');
                if (!node) return;
                var pnode = $('#tree').omTree('getParent', node);
                if (pnode) node.pidText = pnode.text;
                $('#treeEditor').bdpEditor('setOptions', { title: '修改 - ' + (GlbVar.MP.Tree.editOptions.title || '') });
                $('#treeEditor').bdpEditor('setData', node);
                $('#treeEditor').bdpEditor('open');
            }
        }, {
            id: 'treeDel', hint: '删除', icons: { leftCss: 'bdp-icons-glyph-close' },
            onClick: function () {
                var node = $('#tree').omTree('getSelected');
                if (!node) return;
                var pnode = $('#tree').omTree('getParent', node);
                var data = $('#grid').omGrid('getData');
                if (node.hasChildren || data.rows.length > 0) {
                    $.omMessageBox.alert({ content: '节点不为空，不允许删除！' });
                    return
                }
                $.omMessageBox.confirm({
                    content: "确定要删除吗？", onClose: function (yes) {
                        if (yes) {
                            $.post(getCommonDataUrl('DEDelete', { type: GlbVar.MP.Tree.type }),
                                JSON.stringify([node.id]),
                                function (result) {
                                    if (result.Succeed) {
                                        $('#tree').omTree("remove", node);
                                        if (pnode) {
                                            pnode.hasChildren = pnode.children.length > 0;
                                        }
                                        setBtnStatus();
                                        $.omMessageTip.show({ content: '成功删除节点！', timeout: 3000 });
                                    } else {
                                        $.omMessageTip.show({ content: '删除节点失败！' + (result.Message || ''), timeout: 5000 });
                                    }
                                }, 'json');
                        }
                    }
                });
            }
        }, { separtor: true }]);
    }
    treeBtns.push({
        id: "treeRefresh", hint: "刷新",
        icons: { leftCss: 'bdp-icons-refresh' },
        onClick: function (event) {
            $('#tree').omTree('refresh');
        }
    });

    var gridBtns = [{
        id: "add", label: "新增", hint: "新增记录",
        icons: { leftCss: 'bdp-icons-add' },
        onClick: function (event) {
            var isMultiRowEditing = $('#grid').omGrid('options').editMode == 'multirow';
            if (!isMultiRowEditing) {
                $('#grid').omGrid('createNew', false);
            } else {
                $('#grid').omGrid('appendRows', 5);
            }
        }
    }, {
        id: "addCopy", label: "复制", hint: "新增记录并复制当前选定行的数据",
        icons: { leftCss: 'bdp-icons-addcopy' },
        onClick: function (event) {
            $('#grid').omGrid('createNew', true);
        }
    }, {
        id: "edit", label: "修改",
        icons: { leftCss: 'bdp-icons-edit' },
        onClick: function (event) {
            $('#grid').omGrid('startEdit');
        }
    }, {
        id: "del", label: "删除", icons: { leftCss: 'bdp-icons-delete' },
        onClick: function (event) {
            var rs = $('#grid').omGrid('getSelections', true);
            if (rs.length > 0) {
                $.omMessageBox.confirm({
                    title: '确认删除',
                    content: '确定要删除选中的 ' + rs.length + ' 条数据吗？',
                    onClose: function (v) {
                        if (v) {
                            $('#grid').omGrid('deleteSelections');
                        }
                    }
                });
            }
        }
    }];

    var menuBtns = [];
    //if (GlbVar.MP.Tree.editOptions) {
    //    menuBtns = menuBtns.concat(treeBtns);
    //    menuBtns.push({ separtor: true });
    //}
    menuBtns = menuBtns.concat(gridBtns);
    menuBtns.push({ separtor: true });
    menuBtns = menuBtns.concat([{
        id: "save", label: "保存",
        icons: { leftCss: 'bdp-icons-save' },
        onClick: function (event) {
            $('#grid').omGrid('updateEdit');
        }
    }, {
        id: "cancel", label: "取消",
        icons: { leftCss: 'bdp-icons-cancel' },
        onClick: function (event) {
            $('#grid').omGrid('cancelEdit');
        }
    }, { separtor: true }, {
        id: "opt", label: "选项",
        icons: { right: getImageUrl('down.png') },
        onClick: function (event) {
            $('#opt-menu').omMenu("show", this);
        }
    }, { separtor: true }, {
        id: "refresh", label: "刷新",
        icons: { leftCss: 'bdp-icons-refresh' },
        onClick: function (event) {
            $('#grid').omGrid('reload');
        }
    }, { separtor: true }, {
        id: "export", label: "导出",
        icons: { leftCss: 'bdp-icons-excel_07' },
        onClick: function (event) {
            $("#grid").omGrid('toExcel');
        }
    }]);

    // 允许自定义查询才出现“查询”按钮
    if (GlbVar.MP.Grid.filterBox) {
        menuBtns.push({
            id: "filter", label: '查询',
            icons: { leftCss: 'bdp-icons-search' },
            onClick: function (event) {
                $('#grid').omGrid('fbToggle');
            }
        });
    }

    // $("#menu").omButtonbar({ btns: menuBtns });
    if ($('#opt-menu').length == 0) {
        $('body').append($('<div id="opt-menu" style="z-index: 2000;"></div>'));
    }
    $('#opt-menu').omMenu({
        minWidth: 150,
        maxWidth: 200,
        dataSource: [
            { id: '001', label: '显示行号', icon: ' ', seperator: true, checked: true },
            { id: '002', label: '单选', icon: ' ', checked: false, group: 'selmode' },
            { id: '003', label: '多选', icon: ' ', checked: true, group: 'selmode', seperator: true },
            {
                id: '004', label: '编辑模式', seperator: true,
                children: [
                    { id: '005', label: '行内编辑', icon: ' ', checked: false, group: 'editmode' },
                    { id: '006', label: '弹出对话框', icon: ' ', checked: false, group: 'editmode' },
                    { id: '007', label: '多行编辑', icon: ' ', checked: false, group: 'editmode' },
                    { id: '008', label: '固定面板', icon: ' ', checked: false, group: 'editmode' }
                ]
            },
            { id: '101', label: '设置显示列' }
        ],
        onSelect: function (item, event) {
            var gridOptions = {};   // $('#grid').omGrid('options');
            $('#editpanel').hide();
            switch (item.id) {
                case '001':
                    gridOptions.showIndex = item.checked;
                    break;
                case '002':
                    gridOptions.singleSelect = true;
                    break;
                case '003':
                    gridOptions.singleSelect = false;
                    break;
                case '005':
                    gridOptions.height = 'fit';
                    gridOptions.editMode = 'rowpanel';
                    break;
                case '006':
                    gridOptions.height = 'fit';
                    gridOptions.editMode = 'dialog';
                    break;
                case '007':
                    gridOptions.height = 'fit';
                    gridOptions.editMode = 'multirow';
                    break;
                case '008':
                    //gridOptions.singleSelect = true;
                    gridOptions.height = 261;
                    gridOptions.editMode = 'fixpanel';
                    gridOptions.fixPanelId = 'editpanel';
                    //gridOptions.editOptions = { editors: { isView: true, gridLine: true } };
                    $('#editpanel').show();
                    break;
                case '101':
                    $('#grid').omGrid('setupViewOptions');
                    return;
                default:
                    return;
            }
            $('#grid').omGrid(gridOptions);
            setBtnStatus();
        }

    });

    $('#master_toolbar').omPanel('close');
    $('#master_content').css({ "overflow": "hidden" });
    //#endregion

    //#region 右表
    GlbVar.MP.Grid.toolbar = { btns: menuBtns };
    GlbVar.MP.Grid.onRowClick = function (rowIndex, rowData, event) {
        setBtnStatus();
    };
    GlbVar.MP.Grid.onStartEdit = function () {
        setBtnStatus();
    };
    GlbVar.MP.Grid.onCancelEdit = function () {
        setBtnStatus();
    };
    GlbVar.MP.Grid.editOptions.onNewRecordDef = GlbVar.MP.Grid.editOptions.onNewRecord;
    GlbVar.MP.Grid.editOptions.onNewRecord = function (args) {
        var node = $('#tree').omTree('getSelected');
        if (node != null && GlbVar.MP.Grid.fkFieldName) {
            args.record[GlbVar.MP.Grid.fkFieldName] = node.id;
        }
        if (GlbVar.MP.Grid.editOptions.onNewRecordDef) {
            if (!args.node) args.node = node;
            GlbVar.MP.Grid.editOptions.onNewRecordDef.call(this, args);
        }
    }
    $('#grid').omGrid(GlbVar.MP.Grid);

    //#endregion

    //#region 左树
    $('#master_left').omPanel({
        header: true
    }).prev('.om-panel-header').css({ "padding": 0, "margin": 0 }).empty()
        .omButtonbar({ btns: treeBtns });

    $('#tree').omTree({
        dataSource: getTreeDataSource(''),
        showCheckbox: false,
        simpleDataModel: true,
        onBeforeExpand: function (node) {
            var nodeDom = $("#" + node.nid);
            if (nodeDom.hasClass("hasChildren")) {
                nodeDom.removeClass("hasChildren");
                var url = getTreeDataSource(node.id);
                if (GlbVar.MP.Tree.isBOTree) {
                    url += '&dwid=' + (node.classes == 'company' ? node.id : node.tag);
                    url += '&bmid=' + (node.classes == 'company' ? '' : node.id);
                }
                $.getJSON(url, function (data) {
                    $("#tree").omTree("insert", data, node);
                });
            }
            return true;
        },
        onSuccess: function (data) {
            if (data.length > 0) {
                $('#tree').omTree("expand", data[0]);
                $('#tree').omTree("select", data[0]);
            }
        },
        onBeforeSelect: function (nodeData) {
            var editing = $('#grid').omGrid("isEditing");
            if (editing) {
                $.omMessageBox.alert({ content: "正在编辑，不能切换！" });
                return false;
            }
        },
        onSelect: function (nodeData) {
            var node = $('#tree').omTree('getSelected');
            if (node != null) {
                $('#grid').omGrid('setData', getGridDataSource(node.id));
            }
            setBtnStatus();
        }
    });

    //#endregion

    //#region 树编辑
    if (GlbVar.MP.Tree.editOptions) {
        var options = GlbVar.MP.Tree.editOptions;
        options.editors.colModel.splice(0, 0, {
            header: '上级', name: 'pidText',
            editor: {
                type: 'refer', name: 'pid', colspan: options.editors.columnCount || 1,
                options: {
                    mode: 'pick',
                    editOptions: {
                        width: 350,
                        allowQuickSearch: false,
                        treeDataSource: getTreeDataSource(''),
                        tree: {}
                    }
                }
            }
        });
        options.editors.onBeforeSave = function (args) {
            var values = args.values[0].newValues;
            if (GlbVar.MP.Tree.pkey)
                values[GlbVar.MP.Tree.pkey] = values.pid;
        };
        options.onCloseQuery = function (args) {
            if (args.ajaxResult) {
                if (args.ajaxResult.Succeed) {
                    var ndata = $('#treeEditor').bdpEditor('getData').newValues;
                    if (typeof ndata[GlbVar.MP.Tree.text] != 'undefined')
                        ndata.text = ndata[GlbVar.MP.Tree.text];
                    //alert(JSON.stringify(ndata));
                    if (ndata.nid) {
                        var cnode = $('#tree').omTree('findNode', 'id', ndata.id);
                        var pnode = $('#tree').omTree('getParent', cnode);
                        $('#tree').omTree('modify', cnode, ndata, pnode);
                    } else {
                        var node = $('#tree').omTree('getSelected');
                        var pnode = node ? $('#tree').omTree('getParent', node) : null;
                        if (pnode && pnode.hasChildren) {
                            pnode.children = undefined;
                        }
                        $('#tree').omTree('refresh', pnode);
                        if (pnode) {
                            $('#tree').omTree("expand", pnode);
                            $('#tree').omTree("expand", node);
                        }
                    }
                    $.omMessageTip.show({ content: '保存成功！', timeout: 3000 });
                    setBtnStatus();
                } else {
                    $.omMessageTip.show({ content: '保存失败！' + (args.ajaxResult.Message || ''), timeout: 5000 });
                }
            }
        };
        $('#treeEditor').bdpEditor(options);
    } else {
        $('#treeEditor').remove();
    }
    //#endregion

    var item = $('#opt-menu').omMenu('findItem', '<%=EditModeMenuId%>');
    $('#opt-menu').omMenu('check', item, true);
    var onSelect = $('#opt-menu').omMenu('options').onSelect;
    if (onSelect) onSelect(item);

    $('#editpanel').css({ 'padding': '7px' });
    setBtnStatus();
    $(window).resize(function () {
        $('#grid').omGrid('resize');
    }).trigger('resize');

});

