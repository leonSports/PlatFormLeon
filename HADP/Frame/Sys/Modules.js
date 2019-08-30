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
    // 当前待拷贝的节点ID
    var ID_FOR_PASTE = null;

    //#region 工具条
    $('#tools').omButtonbar({
        btns: [{
            id: 'add', label: '新增', icons: { leftCss: 'bdp-icons-add' },
            onClick: function (event) {
                var node = $('#mtree').omTree('getSelected'),
                    pid = node ? node.id : "",
                    newNode = {};
                newNode.NodeParent = pid;
                jdpExec(getCommonDataUrl("ModuleGetNodeOrderDef", "pid=" + pid), function (ajaxResult) {
                    newNode.NodeOrder = ajaxResult.Data;
                });
                $('#pginfo').bdpEditPanel('setValues', newNode);

                //$('#csgrid').omGrid('setData', { total: 0, rows: [] });
                $('#cseditor').val('');
                $('#resgrid').omGrid('setData', { total: 0, rows: [] });

                $('#pginfo').bdpEditPanel('startEdit');
                //$('#csgrid,#resgrid').omGrid('startEdit');
                $('#cseditor').enable(true);
                $('#resgrid').omGrid('startEdit');
                setBtnStatus(true);
            }
        }, {
            id: 'edit', label: '编辑', icons: { leftCss: 'bdp-icons-edit' },
            onClick: function (event) {
                $('#pginfo').bdpEditPanel('startEdit');
                //$('#csgrid,#resgrid').omGrid('startEdit');
                $('#resgrid').omGrid('startEdit');
                $('#cseditor').enable(true);
                setBtnStatus(true);
                $(window).resize();
            }
        }, {
            id: 'del', label: '删除', icons: { leftCss: 'bdp-icons-delete' },
            onClick: function (event) {
                var node = $('#mtree').omTree('getSelected');
                if (node) {
                    $.omMessageBox.confirm({
                        title: "确认删除",
                        content: "该操作将删除选定栏目及其子栏目，您确定要删除吗？",
                        onClose: function (sure) {
                            if (sure) {
                                jdpExec(getCommonDataUrl("ModuleDeleteNode", "nodeid=" + node.id), function (ajaxResult) {
                                    //$.omMessageBox.alert({ content: ajaxResult.Message });
                                    var pnode = $('#mtree').omTree('getParent', node);
                                    if (pnode) {
                                        $('#mtree').omTree('remove', node, pnode);
                                        $('#mtree').omTree('select', pnode);
                                    } else {
                                        $('#mtree').omTree('remove', node);
                                    }
                                    $.omMessageTip.show({ type: 'success', content: ajaxResult.Message, timeout: 3000 });
                                });
                            }
                        }
                    });
                }
            }
        }, { separtor: true }, {
            id: 'copy', label: '拷贝', icons: { leftCss: 'bdp-icons-addcopy' },
            onClick: function (event) {
                var node = $('#mtree').omTree('getSelected');
                ID_FOR_PASTE = node ? node.id : null;
                setBtnStatus(false);
            }
        }, {
            id: 'paste', label: '粘贴', icons: { leftCss: 'bdp-icons-task_seal' },
            onClick: function (event) {
                if (!ID_FOR_PASTE) return;
                var node = $('#mtree').omTree('getSelected');
                jdpExec(getCommonDataUrl('ModuleCopyNode', { src: ID_FOR_PASTE, dst: node ? node.id : "" }), function (ajaxResult) {
                    if (ajaxResult.Succeed) {
                        $('#mtree').omTree('insert', ajaxResult.Data, node);
                        $('#mtree').omTree('select', ajaxResult.Data);
                        $.omMessageTip.show({ content: ajaxResult.Message || '操作成功！', timeout: 3000 });
                        setBtnStatus(false);
                    } else {
                        //$.omMessageBox.alert({ content: "复制模块失败！" + ajaxResult.Message || '' });
                        $.omMessageTip.show({ type: 'error', content: "复制模块失败！" + ajaxResult.Message || '', timeout: 3000 });
                    }
                });
            }
        }, { separtor: true }, {
            id: 'move', label: '移动', icons: { leftCss: 'bdp-icons-addcopy' },
            onClick: function (event) {
                var node = $('#mtree').omTree('getSelected');
                if (!node) return;
                var dlg = $('#dlgMove');
                if (dlg.length == 0) {
                    $('body').append('<div id="dlgMove">移动到：<br/><div id="dlgMTree" ' +
                        'style="border-style:solid; border-color: #86A3C4;border-width:1px; margin-top:3px; margin-bottom:5px; height:300px;overflow:auto;"></div>' +
                        '移动方式：&nbsp;&nbsp;&nbsp;&nbsp;' +
                        '<input type="radio" value="0" name="mm" id="m0" checked="checked" /><label for="m0">之前</label>&nbsp;&nbsp;' +
                        '<input type="radio" value="1" name="mm" id="m1" /><label for="m1">之后</label>&nbsp;&nbsp;' +
                        '<input type="radio" value="2" name="mm" id="m2" /><label for="m2">下级</label>' +
                        '</div>');
                    dlg = $('#dlgMove').omDialog({
                        title: "移动模块",
                        autoOpen: false,
                        modal: true,
                        width: 550,
                        height: 450,
                        buttons: [{
                            text: "确定", width: 65,
                            click: function () {
                                var node = $('#mtree').omTree('getSelected');
                                var dstNode = $('#dlgMTree').omTree('getSelected');
                                if (!dstNode) {
                                    $.omMessageBox.alert({ content: "请选中目标模块节点！" });
                                    return false;
                                }
                                var src = node.id, dst = dstNode.id;
                                if (src != dst) {
                                    var m = $(':radio[name="mm"]:checked').val();
                                    jdpExec(getCommonDataUrl("ModuleMoveNode", "src=" + src + "&dst=" + dst + "&mode=" + m), function (ajaxResult) {
                                        var pnode = $('#mtree').omTree('getParent', node);
                                        if (pnode) $('#mtree').omTree('remove', node, pnode);
                                        else $('#mtree').omTree('remove', node);

                                        dstNode = $('#mtree').omTree('findNode', 'id', dst, '', true);
                                        if (dstNode) {
                                            pnode = $('#mtree').omTree('getParent', dstNode);
                                            switch (m) {
                                                case "0":
                                                    $('#mtree').omTree('insert', node, pnode, dstNode);
                                                    break;
                                                case "1":
                                                    $('#mtree').omTree('insert', node, pnode);
                                                    break;
                                                case "2":
                                                    $('#mtree').omTree('insert', node, dstNode);
                                                    break;
                                            }
                                            $('#mtree').omTree('select', node);
                                        }
                                        $('#dlgMove').omDialog('close');
                                        $.omMessageTip.show({ content: ajaxResult.Message || '操作成功！', timeout: 3000 });
                                    });
                                } else {
                                    $('#dlgMove').omDialog('close');
                                }
                            }
                        }, {
                            text: "取消", width: 65,
                            click: function () {
                                $('#dlgMove').omDialog('close');
                            }
                        }]
                    });
                }
                $('#dlgMTree').omTree({
                    dataSource: getCommonDataUrl('ModuleGetNodes'),
                    // 动态加载子节点
                    onBeforeExpand: function (nodeData) {
                        var nodeDom = $("#" + nodeData.nid);
                        if (nodeDom.hasClass("hasChildren")) {
                            nodeDom.removeClass("hasChildren");
                            $.ajax({
                                url: getCommonDataUrl("ModuleGetNodes", "pid=" + nodeData.id),
                                method: 'POST',
                                dataType: 'json',
                                success: function (subNodeData) {
                                    $("#dlgMTree").omTree("insert", subNodeData, nodeData);
                                }
                            });
                        }
                    }
                });
                dlg.omDialog('open');
            }
        }, { separtor: true }, {
            id: 'save', label: '保存', icons: { leftCss: 'bdp-icons-save' }, disabled: true,
            onClick: function (event) {
                if (!$('#pginfo').bdpEditPanel('valid')) {
                    $.omMessageBox.alert({ content: '数据不正确，请修改！' });
                    return;
                }
                var binfo = $('#pginfo').bdpEditPanel('getValues'),
                    //csdata = $('#csgrid').omGrid('getEditValues'),
                    csdata = $('#cseditor').val(),
                    resdata = $('#resgrid').omGrid('getEditValues');
                var data = binfo.newValues;
                //data.NodeParams = [];
                //for (var i = 0, len = csdata.length; i < len; i++) {
                //    data.NodeParams.push(csdata[i].newValues);
                //}
                data.NodeParams = csdata;
                data.NodeResources = [];
                for (var i = 0, len = resdata.length; i < len; i++) {
                    data.NodeResources.push(resdata[i].newValues);
                }
                jdpExec(getCommonDataUrl("ModuleSaveNodeInfo"), data, function (ajaxResult) {
                    // 退出编辑状态
                    $('#cancel').omButton('click');
                    var node = $('#mtree').omTree('getSelected');
                    if (data.NodeId) {
                        if (node) {
                            node.text = data.NodeText;
                            node.image = data.NodeImage;
                            $('#mtree').omTree('modify', node, node);
                            $('#mtree').omTree('select', node);
                        }
                    } else {
                        var newNode = { id: ajaxResult.Data, text: data.NodeText, image: data.NodeImage };
                        if (node) {
                            newNode.pid = node.id;
                            $('#mtree').omTree('insert', newNode, node);
                        } else {
                            $('#mtree').omTree('insert', newNode);
                        }
                        $('#mtree').omTree('select', newNode);
                    }
                    $.omMessageTip.show({ content: ajaxResult.Message || '操作成功！', timeout: 3000 });
                });
            }
        }, {
            id: 'cancel', label: '取消', icons: { leftCss: 'bdp-icons-cancel' }, disabled: true,
            onClick: function (event) {
                $('#pginfo').bdpEditPanel('cancelEdit');
                //$('#csgrid,#resgrid').omGrid('cancelEdit');
                $('#cseditor').enable(false);
                $('#resgrid').omGrid('cancelEdit');
                setBtnStatus(false);
                var node = $('#mtree').omTree('getSelected');
                if (node) $('#mtree').omTree('select', node);
            }
        }, { separtor: true }, {
            id: 'refresh', label: '刷新', icons: { leftCss: 'bdp-icons-refresh' },
            onClick: function (event) {
                $('#mtree').omTree('refresh');
            }
        }, { separtor: true }, {
            id: 'btnInit', label: '初始化', icons: { leftCss: 'bdp-icons-card_setting' },
            onClick: function (event) {
                var node = $('#mtree').omTree('getSelected');
                if (!node) return;
                //var dlg = $('#dlgInitor');
                //if (dlg.length == 0) {
                //    $('body').append('<div id="dlgInitor"><textarea id="dlgInitor_editor" name="dlgInitor_editor"></textarea></div>');
                //    dlg = $('#dlgInitor').omDialog({
                //        width: 650, height: 550, autoOpen: false, title: '编辑模块初始化脚本', modal: true,
                //        buttons: [{
                //            text: '确定', width: 65,
                //            click: function () {
                //                var mid = dlg.data('mid'), data = $('#dlgInitor_editor').val();
                //                $.ajax({
                //                    url: getCommonDataUrl('BdpLobWriteString', { f1: '模块初始化', f2: mid }),
                //                    method: 'POST',
                //                    data: data,
                //                    dataType: 'json',
                //                    success: function (ajaxResult) {
                //                        $.omMessageTip.show({ content: ajaxResult.Message || '操作成功！', timeout: 3000 });
                //                        $('#dlgInitor').omDialog('close');
                //                    }
                //                });
                //            }
                //        }, {
                //            text: "取消", width: 65,
                //            click: function () {
                //                $('#dlgInitor').omDialog('close');
                //            }
                //        }]
                //    });
                //    $('#dlgInitor_editor').addClass('om-widget om-state-default om-state-nobg').css({
                //        'width': '100%',
                //        'height': '100%',
                //        'line-height': '1.75',
                //        'overflow': 'scroll',
                //        'text-wrap': 'none',
                //        'word-wrap': 'normal',
                //        'word-break': 'keep-all'
                //    });
                //}
                //$.ajax({
                //    url: getCommonDataUrl('BdpLobReadString', { f1: '模块初始化', f2: node.id }),
                //    dataType: 'json',
                //    success: function (ajaxResult) {
                //        $('#dlgInitor_editor').val(ajaxResult.Data.Data);
                //        dlg.data('mid', node.id).omDialog('open');
                //    }
                //});

                $.ajax({
                    url: getCommonDataUrl('BdpLobReadString', { f1: '模块初始化', f2: node.id }),
                    dataType: 'json',
                    success: function (ajaxResult) {
                        modInitCodeEditor.doc.setValue(ajaxResult.Data.Data);
                        $('#dlgModInitor').data('mid', node.id).omDialog('open');
                        modInitCodeEditor.doc.setCursor(0, 0);
                        modInitCodeEditor.focus();
                    }
                });
            }
        }]
    });

    setBtnStatus = function (editing) {
        var selnode = $('#mtree').omTree('getSelected');
        $('#add,#refresh').omButton(editing ? 'disable' : 'enable');
        $('#edit,#del,#move,#btnInit').omButton(editing || !selnode ? 'disable' : 'enable');
        $('#save,#cancel,#csadd,#csdel,#resadd,#resdel').omButton(editing ? 'enable' : 'disable');
        $('#paste').omButton(!editing && selnode && ID_FOR_PASTE ? 'enable' : 'disable');
        $('#copy').omButton(!editing && selnode ? 'enable' : 'disable');
        $('#cseditor').enable(editing);
    };
    //#endregion
    // js代码编辑器
    var modInitCodeEditor = CodeMirror.fromTextArea($('#modInitCode')[0], {
        lineNumbers: true,
        matchBrackets: true,
        mode: "text/typescript",
        autofocus: true
    });
    $('#dlgModInitor').css({ "overflow": "hidden" }).omDialog({
        width: 650, height: 550, autoOpen: false, title: "编辑模块初始化脚本", modal: true,
        buttons: [{
            text: '确定', width: 65,
            click: function () {
                var mid = $('#dlgModInitor').data('mid'),
                    data = modInitCodeEditor.doc.getValue();
                data = base64_encode(encodeURIComponent(data));
                $.ajax({
                    url: getCommonDataUrl('BdpLobWriteString', { f1: '模块初始化', f2: mid }),
                    method: 'POST',
                    data: { lobData: data },
                    dataType: 'json',
                    success: function (ajaxResult) {
                        $.omMessageTip.show({ content: ajaxResult.Message || '操作成功！', timeout: 3000 });
                        $('#dlgModInitor').omDialog('close');
                    }
                });
            }
        }, {
            text: "取消", width: 65,
            click: function () {
                $('#dlgModInitor').omDialog('close');
            }
        }]
    });



    //#region 模块树
    $('#mtree').omTree({
        dataSource: getCommonDataUrl('ModuleGetNodes'),
        // 动态加载子节点
        onBeforeExpand: function (node) {
            var nodeDom = $("#" + node.nid);
            if (nodeDom.hasClass("hasChildren")) {
                nodeDom.removeClass("hasChildren");
                $.ajax({
                    url: getCommonDataUrl("ModuleGetNodes", "pid=" + node.id),
                    method: 'POST',
                    dataType: 'json',
                    success: function (nodedata) {
                        $("#mtree").omTree("insert", nodedata, node);
                    }
                });
            }
        },
        onBeforeSelect: function (nodeData) {
            if (!$('#save').omButton('isDisabled')) {
                $.omMessageBox.alert({ content: '正在编辑，不能切换！' });
                return false;
            }
        },
        onSelect: function (nodeData) {
            loadNodeInfo(nodeData.id, nodeData.pid);
            setBtnStatus(false);
        }
    });
    function loadNodeInfo(id, pid) {
        $.ajax({
            url: getCommonDataUrl('ModuleGetNodeInfo', { nodeid: id, pid: pid }),
            type: 'POST',
            async: false,
            dataType: 'json',
            success: function (data) {
                if (data && typeof (data.NodeId) != 'undefined') {
                    $('#pginfo').bdpEditPanel('setValues', data);
                    //$('#csgrid').omGrid('setData', { total: data.NodeParams.length, rows: data.NodeParams });
                    $('#cseditor').val(data.NodeParams);
                    $('#resgrid').omGrid('setData', { total: data.NodeResources.length, rows: data.NodeResources });
                }
            }
        });
    }
    //#endregion

    //#region 页面信息编辑面板
    function getCssNames() {
        var csses = [];
        for (var i = 0, len = document.styleSheets.length; i < len; i++) {
            var cssHref = document.styleSheets[i].href || '';
            if (cssHref.toLowerCase().indexOf('bdp-icons.css') >= 0) {
                var cssRules = document.styleSheets[i].cssRules || document.styleSheets[i].rules;
                for (var j = 0, lenRules = cssRules.length; j < lenRules; j++) {
                    var cssName = cssRules[j].selectorText || '';
                    if (cssName.toLowerCase().startsWith('.bdp-icons-')) {
                        csses.push({ text: cssName.substring(1), value: cssName.substring(1) });
                    }
                }
            }
        }
        return csses.sort(function (a, b) {
            if (a.text.toLowerCase() > b.text.toLowerCase()) return 1;
            if (a.text.toLowerCase() < b.text.toLowerCase()) return -1;
            return 0;
        });
    }
    $('#pginfo').width(650).css('padding-left', 10).bdpEditPanel({
        columnCount: 2,
        isView: true,
        gridLine: true,
        colModel: [{
            header: '页面名称', name: 'NodeText',
            editor: {
                rules: [['required', true, '页面名称不能为空']]
            }
        }, {
            header: '同级序号', name: 'NodeOrder',
            editor: {
                type: 'number'
            }
        }, {
            header: '页面地址', name: 'NodeUrl',
            editor: {
                colspan: 2
            }
        }, {
            header: "页面类型", name: 'NodeType',
            editor: {
                colspan: 2,
                onCreateEditControl: function (ctrlId, cm, $parent) {
                    var s = '<table id="' + ctrlId + '"><tr>';
                    s += '<td><input type="radio" value="0" name="ymlx" id="ymlx_0" /><label for="ymlx_0">模块首页(可装配)</label></td>';
                    s += '<td><input type="radio" value="1" name="ymlx" id="ymlx_1" /><label for="ymlx_1">二级页面</label></td>';
                    s += '<td><input type="radio" value="2" name="ymlx" id="ymlx_2" /><label for="ymlx_2">其它页面</label></td>';
                    s += '</tr></table>';
                    return $(s).appendTo($parent).width('100%');
                },
                onSetValue: function (cm, value) {
                    value = value || '0';
                    var item = $(':radio[name="ymlx"][value="' + value + '"]');
                    if (item.length > 0) item[0].checked = true;
                },
                onGetValue: function (cm) {
                    return $(':radio[name="ymlx"]:checked').val();
                }
            }
        }, {
            header: '页面图标<span id="imgPreview" style="margin-left:5px;width:20px;">&nbsp;&nbsp;&nbsp;&nbsp;</span>', name: 'NodeImage',
            wrap: false,
            editor: {
                type: 'combo',
                options: {
                    dropGrid: false,
                    dataSource: getCssNames(),
                    optionField: function (data, index) {
                        return '<span class="' + data.value + '" style="width:20px;">&nbsp;&nbsp;&nbsp;&nbsp;</span><span style="margin-left:20px;">' + data.text + '</span>';
                    },
                    inputField: 'value',
                    valueField: 'value'
                },
                renderer: function (cm, value) {
                    updateImgPreview(value || '');
                    return value;
                },
                onValueChanged: function (target, newValue, oldValue, event) {
                    updateImgPreview(newValue || '');
                }
            }
        }, {
            header: '是否启用', name: 'NodeActive',
            editor: {
                type: 'checkbox'
            }
        }, {
            header: '页面说明', name: 'NodeComment',
            editor: {
                colspan: 2
            }
        }]
    });
    function updateImgPreview(s) {
        if (s.indexOf('/') >= 0 || s.indexOf('.') >= 0) {
            $('#imgPreview').attr('class', '');
            $('#imgPreview').css('background-image', 'url("' + s + '")');
        } else {
            $('#imgPreview').attr('class', s);
            $('#imgPreview').css('background-image', '');
        }
    }
    //#endregion

    //#region 右边布局
    $('#cc').show().omBorderLayout({
        fit: true,
        panels: [{
            id: 'ct', region: 'north', title: '页面信息',
            collapsible: true
        }, {
            id: 'tabs', region: 'center', header: false
        }]
    });
    $('#tabs').omTabs({
        tabMenu: false,
        closable: false,
        onActivate: function (n, event) {
            ////$('#csgrid,#resgrid').omGrid('resize');
            //$('#cseditor').width($('#cseditor').parent().innerWidth() - 50)
            //    .height($('#cseditor').parent().innerHeight() - 20);
            //$('#resgrid').omGrid('resize');
            $(window).resize();
        }
    });

    //#endregion

    //#region 参数

    //$('#csgrid').omGrid({
    //    autoFit: true,
    //    limit: -1,
    //    toolbar: {
    //        btns: [{
    //            id: 'csadd', label: '加行', icons: { leftCss: 'bdp-icons-add' },
    //            onClick: function (event) {
    //                $('#csgrid').omGrid('appendRows', 5);
    //            }
    //        }, {
    //            id: 'csdel', label: '删行', icons: { leftCss: 'bdp-icons-revoke' },
    //            onClick: function (event) {
    //                var rids = $('#csgrid').omGrid('getSelectedRids');
    //                $.each(rids, function (i, rid) {
    //                    $('#csgrid').omGrid('removeEditRow', rid);
    //                });
    //            }
    //        }]
    //    },
    //    editMode: 'multirow',
    //    showIndex: true,
    //    singleSelect: false,
    //    colModel: [{
    //        header: '参数名', name: 'Key', width: 270, editor: { editable: true }
    //    }, {
    //        header: '参数值', name: 'Value', width: 'autoExpand'
    //    }]
    //});
    $('#cseditor').addClass('om-widget om-state-default om-state-nobg');


    //#endregion

    //#region 资源
    $('#resgrid').omGrid({
        autoFit: true,
        limit: -1,
        toolbar: {
            btns: [{
                id: 'resadd', label: '加行', icons: { leftCss: 'bdp-icons-add' },
                onClick: function (event) {
                    $('#resgrid').omGrid('appendRows', 5);
                }
            }, {
                id: 'resdel', label: '删行', icons: { leftCss: 'bdp-icons-revoke' },
                onClick: function (event) {
                    var rids = $('#resgrid').omGrid('getSelectedRids');
                    $.each(rids, function (i, rid) {
                        $('#resgrid').omGrid('removeEditRow', rid);
                    });
                }
            }]
        },
        editMode: 'multirow',
        showIndex: true,
        singleSelect: false,
        colModel: [{
            header: '资源名称', name: 'ResName', width: 270, sort: 'clientSide',
            editor: {
                hint: '支持3种：\n1.服务端控件的ID\n2.前端控件的jQuery搜索器\n3. @+字段名，表示编辑面板中的字段控件\n'
            }
        }, {
            header: '功能说明', name: 'Description', width: 'autoExpand', sort: 'clientSide'
        }]
    });
    //#endregion

    //#region 页初始化
    $('#tabs').show().find('#tab1,#tab2').css({ padding: 2 });
    setBtnStatus(false);
    $(window).resize(function () {
        $('#cc').omBorderLayout('resize');
        $('#tabs').omTabs('resize');
        $('#resgrid').omGrid('resize');
        var h = $('#tabs').height() - 28 * 3;
        $('#cseditor').height(h);
    }).resize();
    //#endregion

});






