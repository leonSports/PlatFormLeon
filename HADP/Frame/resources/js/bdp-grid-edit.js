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

//#region omGrid的编辑扩展, 行内、对话框、多行等多种编辑方式

//#region 说明
/*
    让grid支持不同的编辑模式，由editMode决定：
    dialog:     弹出窗口，缺省模式
    rowpanel:   行内面板
    fixpanel:   指定面板，须通过fixPanelId指定一个div的id     
    multirow:   多行编辑

为 omGrid 增加编辑插件
options:
    // 固定列数，大于0时生效，锁定表格左边的列
    fixedColumnCount: 0,
    // 可以将omButtomBar集成到Grid中，toolbar内容与omButtomBar的一致
    toolbar:{},
    必须指定主键字段名
    keyFieldName:''     //如果没指定，在编辑时会抛异常

    编辑方式，可设置为以下值：
        dialog:     在弹出窗口中编辑一条记录
        rowpanel:   在行下增加的一个面板中编辑
        fixpanel:   在指定的面板中编辑
        multirow:   多行编辑
    editMode: 'dialog'
    
    指定的编辑面板，仅editMode=fixpanel有效
    fixPanelId: ''
    
    是否双击一行时进行编辑，editMode=multirow时忽略.
    另：editMode=fixpanel，单击一行也会更新编辑面板
    editOnDblclick: true
    
    // 数据删除地址
    deleteUrl: ''
    //删除前事件
    // args:{
	//      cancel: false,  //是否自己处理了删除
    //      rowKeys:[] 
    // }
    onBeforeDelete: function(args):void
    // 删除后事件， 只有删除成功都会触发
    onAfterDelete: function(ajaxResult):void
    
    // 编辑设置对象
    editOptions:{       
	    title: '',   // 编辑器标题，editMode=multirow时忽略
        width:       // 编辑器宽度
        height:      // 编辑器高度
        align:       // 编辑器在屏幕上的水平位置

        //数据更新处理地址，可以指定地址，也可以是返回地址的函数
        // 需要保存数据到后台时，通过ajax访问该地址，同时数据通过post方式提交
        // 到该地址，当editMode=multirow时，数据为与列模型对应的对象数组，否则为
        // 与列模型对应的单个对象
        updateUrl:''|function(){ return url}

        editors: {    // 编辑面板参数
            //编辑面板中的布局列数
            columnCount: 2
            //列模型, 没有指定时使用表格的列模型
            //colModel: []
        },

        //新增记录事件. args:{cancel:false,record:null}
        onNewRecord:function(args):void

        //编辑器关闭前事件: args:{canClose:true,ajaxResult:{Succeed:true,Message:''}}
        onCloseQuery: function(args):void

        //保存前事件, 参数对象：
        //  cancel: false       // 是否取消缺省处理，如果自己处理了数据保存，将此值设置为true
        //  processUrl: ''       // 数据处理地址
        //  values: []   // 值对象数组，保存每个属性的新/旧值。多行编辑时有多条，否则只有一条。
        //  done:function(ajaxResult){}        // 如果自己处理了数据保存，请将cancel置为true,并调用args.done()函数通知保存结果
        onBeforeSave:function(args):{}
        // 保存后事件
        onAfterSave:function(ajaxResult){}
    }
    // 导出设置
    exportOptions:{
        // 导出方法，缺省是 GridToExcel
        exportMethod : exp.exportMethod || "GridToExcel";
        // 执行导出的地址，系统缺省提供导出Excel：ROOT_PATH + 'frame/data/down.aspx'
        exportUrl : exp.exportUrl || ROOT_PATH + 'frame/data/down.aspx';
        // 数据源地址，缺省使用表格的数据源地址
        dataSource : exp.dataSource || options.dataSource;
        // Excel表格的标题，缺省使用表格的
        title : exp.title || options.title;
        // 文件存放路径，缺省使用系统上传文件目录
        UploadFilePath: '',
        // 文件名，缺省由系统自动计算
        filename: '',
	    // 列模型，缺省使用表格的, 但会修正列宽度为以字节表示
        colModel:[],
        // 传递给数据提供服务的扩展参数
        extraData: null
    }

 扩展函数：
    进入编辑状态，如果选中了多条则只编辑第一条选中的记录，如果没有选中则
    编辑第一条，如果没有记录直接返回
    startEdit()

    更新数据，成功后退出编辑状态
    updateEdit()
    
    退出编辑状态
    cancelEdit()

    // 删除选择的记录, 触发事件 onBeforeDelete,onAfterDelete
    deleteSelections()

    检查是否处于编辑状态
    isEditing()

    // 根据字段名或列信息查找编辑控件，返回统一类型：bdpEditCtrl
    //参数：
    //  fnOrCm: 字段名或列信息对象
    //  ctrl:   当前编辑控件，一般采用onValueChanged事件中的this。 该参数仅多行编辑时有用
    findEditCtrl: function (fnOrCm, ctrl)
    
    // 根据字段名或列信息查找编辑控件实例，返回实际的输入控件
    findEditor: function (fnOrCm, ctrl) 
    
    //触发一次验证并返回是否验证通过
    isValid: function () 

扩展事件:
    // 渲染编辑界面前触发，返回false，中止编辑
    onBeforeEdit： function()
    // 进入编辑状态事件, 编辑界面已经渲染完，在显示前触发
    onStartEdit:function()
    // 退出编辑状态事件
    onCancelEdit:function()

*/

//#endregion

; (function ($) {
    //#region 取消原来的行编辑插件
    function _disableOmGridRowEditor() {
        var initListeners = $['om']['omGrid'].prototype.initListeners;
        for (var i = initListeners.length - 1; i >= 0; i--) {
            var f = initListeners[i];
            var p = f.toString().indexOf('_globalEditable');
            if (p >= 0) {
                initListeners.splice(i, 1);
            }
        }
    }
    _disableOmGridRowEditor();
    //#endregion

    //#region 增加一个创建插件，修订colModel，去掉不需要在表格中显示的列
    //  addCreateListener   addBeforeInitListener
    $.omWidget.addCreateListener("om.omGrid", function () {
        var cm = this._getColModel();
        if (!$.isArray(cm) || cm.length <= 0)
            return;
        _fixColModel(this);
    });
    // 修正列模型，去除不需要在表格中显示的列。原始的列模型保存到 _orgColModel中
    function _fixColModel(self) {
        var cms = self._getColModel();
        self._orgColModel = $.extend(true, [], cms);
        var proc = function (arrModel) {
            for (var i = arrModel.length - 1; i >= 0; i--) {
                if ($.isArray(arrModel[i])) {
                    proc(arrModel[i]);
                } else {
                    var col = arrModel[i];
                    if (typeof (col.visible) == "undefined")
                        col.visible = true;
                    if (!col.visible) {
                        arrModel.splice(i, 1);
                    }
                }
            }
        };
        proc(cms);  //修改 options.colModel
    }
    //#endregion

    //#region 表格编辑插件
    $.omWidget.addInitListener('om.omGrid', function () {
        var self = this,
            $elem = self.element,
            ops = self.options,
            cms = this._orgColModel || this._getColModel();

        // 修正列模型. 日期类型列如果没有指定renderer,自动创建一个，返回字符串格式的日期
        _patchColModels(cms);
        _patchColModels(self.options.colModel);

        //#region 检查参数，绑定事件，增加行光带效果
        ops.editMode = ops.editMode || "dialog";
        ops.editOptions = ops.editOptions || {};
        if (ops.editMode == 'fixpanel') {
            if (!ops.fixPanelId || $('#' + ops.fixPanelId).length == 0)
                ops.editMode = "dialog";
        }
        //是否已经触发过一次编辑了
        self._triggered = false;

        //光条
        this.tbody.delegate('tr.om-grid-row', 'mouseenter', function (event) {
            $(this).addClass('bdpGridDataRowHover');
        });
        this.tbody.delegate('tr.om-grid-row', 'mouseleave', function (event) {
            $(this).removeClass('bdpGridDataRowHover');
        });
        // 调整列宽时，同时调整汇总行
        ops._onResizableStopCallbacks.push(_resizeSummary);
        //多行编辑时，动态改变宽高时要重新计算编辑条的大小
        if (ops.editMode == 'multirow') {
            ops._onResizableStopCallbacks.push(_resizeMutilRowEditTable);
        }
        // 可指定editOnDblclick确定是否双击编辑
        if (ops.editOnDblclick && ops.editMode != 'multirow') {
            this.tbody.delegate('tr.om-grid-row', 'dblclick', function (event) {
                //self.startEdit();
                // 直接编辑双击的行
                self._NewRecord = false;
                editRenderer.call(this, self);
            });
        }
        this.tbody.delegate('tr.om-grid-row', 'click', function (event) {
            if (ops.editMode == 'fixpanel') {
                if (!self.isEditing()) {
                    self._NewRecord = false;
                    editRenderer.call(this, self);
                }
            }
        });
        // 增加每页行数
        _buildItemsPerPage(this);
        //#endregion

        //#region 仿Excel
        if (ops.editMode == 'excel') {
            self._editView = { editing: false };
            self.tbody.on('click', 'td[abbr]', function (event) {
                if (self._editView.editing) {
                    if (($(this).prop('abbr') || '') == '') return;
                    exCheckCell(self, this, true);
                    event.stopPropagation();
                }
            }).on('dblclick', 'td[abbr]', function (event) {
                if (self._editView.editing) {
                    if (($(this).prop('abbr') || '') == '') return;
                    exCheckCell(self, this, true);
                    event.stopPropagation();
                }
            });
        }
        //#endregion

        //#region 所谓继承
        if (!self._gridEditExtended) {
            // 重载，获取的表格数据不正确时提示
            //var base = this;
            var base__addData = self._addData;      //$.om.omGrid.prototype
            self._addData = function (data) {
                if (typeof (data.total) == 'undefined' || typeof (data.rows) == 'undefined') {
                    if ($.isArray(data)) {
                        data = { total: data.length, rows: data };
                    } else {
                        var msg = typeof (data.Message) != 'undefined' ? data.Message : JSON.stringify(data);
                        $.omMessageTip.show({ type: 'error', content: msg, timeout: 3000 });
                        data = { total: 0, rows: [] };
                    }
                }
                // 如果服务端返回的数据中明确指定了页码，那么更新组件的当前页码
                if (typeof data.pageIndex == 'number' && data.pageIndex != this.pageData.nowPage) {
                    this.pageData.nowPage = data.pageIndex;
                    data.pageIndex = null;
                }
                base__addData.call(self, data);
            };
            // 重载，将总记录数值为-1，让后台重新计算
            var base_reload = self.reload;
            self.reload = function (page) {
                //var self = this;
                if (self.options.extraData)
                    self.options.extraData.recc = -1;
                base_reload.call(self, page);
            };
            // 重载，刷新数据，支持dataSource是json对象
            var base__populate = self._populate;
            self._populate = function () {
                //var self = this;
                if (self._editView) {
                    self._editView.editing = false;
                    self._editView.rowIndex = -1;
                }
                if (self.options.dataSource && typeof self.options.dataSource == 'object') {
                    self._addData(self.options.dataSource);
                    return true;
                }
                if (self.options.keyFieldName && !self.options.extraData.keyField)
                    self.options.extraData.keyField = self.options.keyFieldName;
                return base__populate.call(self);
            };
            // 重载，让单元格的renderer多传递一个参数: colInfo
            var base__buildRowCellValues = self._buildRowCellValues;    // $.om.omGrid.prototype._buildRowCellValues;
            self._buildRowCellValues = function (colModel, rowData, rowIndex) {
                var len = colModel.length, values = [];
                for (var i = 0; i < len; i++) {
                    var c = colModel[i],
                        v,
                        r = c.renderer;
                    if (c.name.indexOf(".") > 0) {
                        var properties = c.name.split("."),
                            j = 1,
                            length = properties.length,
                            v = rowData[properties[0]];
                        while (j < length && v && (v = v[properties[j++]]) != undefined) { }
                    }
                    if (v == undefined) {
                        v = rowData[c.name] == undefined ? "" : rowData[c.name];
                    }
                    if (typeof r === 'function') {
                        v = r(v, rowData, rowIndex, c);
                    }
                    values[i] = v;
                    v = null;
                }
                return values;
            };
            // 重载，渲染数据后再渲染汇总行
            var base__renderDatas = self._renderDatas;  // $.om.omGrid.prototype._renderDatas;
            self._renderDatas = function () {
                base__renderDatas.call(self);
                _renderSummary(self);

                // 尝试聚焦到指定行
                var data = self.pageData.data;
                var focuskey = !data ? '' : (ops.extraData.focuskey || data.focuskey);
                if (ops.keyFieldName && focuskey) {
                    var keyField = ops.keyFieldName;
                    // var focuskey = data.focuskey;
                    var rows = [];
                    $(data.rows).each(function (i) {
                        if (this[keyField] == focuskey) {
                            rows.push(i);
                        }
                    });
                    self.setSelections(rows);
                    data.focuskey = null;
                    ops.extraData.focuskey = null;
                }
            };

            var base__rowSelect = self._rowSelect;
            self._rowSelect = function (index) {
                var canSelect = typeof (self.options.canSelect) == 'undefined' ? true : self.options.canSelect;
                if (canSelect) {
                    base__rowSelect.call(self, index);
                }
            };
            var base__rowDeSelect = self._rowDeSelect;
            self._rowDeSelect = function (index) {
                var canSelect = typeof (self.options.canSelect) == 'undefined' ? true : self.options.canSelect;
                if (canSelect) {
                    base__rowDeSelect.call(self, index);
                }
            };
            self._gridEditExtended = true;
        }
        //#endregion

        // 为grid扩展编辑接口
        $.extend(this, {
            // 设置是否允许选择
            allowSelect: function (value) {
                self.options.canSelect = value;
            },
            resetHeight: function () {
                this._resetHeight();
            },
            // 新增，可指定是否拷贝当前选定行
            createNew: function (copyRow) {
                if (self.isEditing()) return;
                var allTrs = self._getTrs(),
                    $tr = self.tbody.find('tr.bdpGridDataRowFocus').eq(0),
                    trIndex = allTrs.index($tr);
                if (trIndex < 0) {
                    var trIndexes = self.getSelections();
                    if (trIndexes.length > 0) trIndex = trIndexes[0];
                    else if (allTrs.length > 0)
                        trIndex = 0;
                }
                self._NewRecord = {};
                _checkKeyFieldName(self);
                if (trIndex < 0) {
                    for (var i = 0, len = cms.length; i < len; i++) {
                        var cm = cms[i];
                        self._NewRecord[cm.name] = null;
                        if (cm.editor && cm.name != cm.editor.name)
                            self._NewRecord[cm.editor.name] = null;
                    }
                } else {
                    var rowData = self._getRowData(trIndex);
                    for (var key in rowData) {
                        self._NewRecord[key] = null;
                        if (copyRow) {
                            var v = rowData[key];
                            if (typeof (v) == 'string' && v.indexOf("/Date") >= 0) {
                                v = eval("new " + v.replace(/(\/)/g, ""));
                            }
                            self._NewRecord[key] = v;
                        }
                    }
                }
                // 新增时主键为空
                self._NewRecord[ops.keyFieldName] = null;

                var onNewRecord = ops.editOptions.onNewRecord;
                var args = { cancel: false, record: self._NewRecord };
                if (onNewRecord) onNewRecord.call(self, args);
                if (!args.cancel) {
                    if (self.options.editMode == 'multirow') {
                        self._need_reset_to_multirow = true;
                        self.options.editMode = 'rowpanel';
                    }
                    editRenderer.call($tr, self);
                }
            },
            // 追加新行，仅多行编辑适用。可以指定追加行数或行对象数组
            appendRows: function (rows) {
                if (self.options.editMode != 'multirow') return;
                if (!self.isEditing()) {
                    self.startEdit();
                }
                var rowData = [];
                if (typeof (rows) == 'object') {
                    rowData = rows;
                } else {
                    for (var r = 0; r < rows; r++) {
                        var rd = {};
                        for (var i = 0, len = cms.length; i < len; i++) {
                            var cm = cms[i];
                            rd[cm.name] = null;
                            if (cm.editor && cm.name != cm.editor.name)
                                rd[cm.editor.name] = null;
                        }
                        rowData.push(rd);
                    }
                }
                _appendRows(self, rowData);
            },
            /* 进入编辑状态，如果选中了编辑第一条选中的记录，如果没有选中则
                编辑第一条，如果没有记录直接返回
            */
            startEdit: function () {
                if (this.isEditing()) return;
                // 多行编辑时记录正在编辑的数据，首先拷贝一份当前页的数据来编辑, 新增行数据追加到数据后面.
                if (self.options.editMode == 'multirow' || self.options.editMode == 'excel') {
                    // 正在编辑的行数据数组
                    self._EditingRowData = [];
                    // 确保pageData对象
                    self.pageData.data = self.pageData.data || { total: 0, rows: [] };
                    if (self.pageData.data.length < 1 && self.options.editMode != 'excel') {
                        $('#' + $elem.prop('id') + '_edit_table').children('tbody').empty();
                        self.appendRows(5);
                        return;
                    }
                    $.each(self.pageData.data.rows, function (i, obj) {
                        var rd = $.extend({}, obj);
                        rd._rid_ = 'r' + i;
                        rd._isnew_ = false;
                        self._EditingRowData.push(rd);
                    });
                }
                if (self.options.editMode == 'excel') {
                    self.options.onStartEdit && self.options.onStartEdit.call(self);
                    // 为页码面板增加遮罩层，编辑时不能操作
                    self.pDiv.mask();
                    self._triggered = true;
                    self._editView.editing = true;
                    self._NewRecord = false;
                    self.tbody.find('td[abbr!=""]').eq(0).trigger('click');
                    return;
                }
                var allTrs = self._getTrs(), ops = self.options;
                var trIndexes = self.getSelections(),
                    $tr = trIndexes.length > 0 ? allTrs.eq(trIndexes[0])[0] : allTrs.first();
                self._NewRecord = false;
                editRenderer.call($tr, self);
            },
            // 获取当前编辑器是否是新增记录
            isNewRecord: function () {
                return self._NewRecord ? true : false;
            },
            //保存数据
            updateEdit: function (onSuccess) {
                if (ops.editMode != "fixpanel" && !self.isEditing()) return;
                var $editView = self._editView.view;
                switch (ops.editMode) {
                    case "dialog":
                        $editView.bdpEditor('doClose', true);
                        break;
                    case "rowpanel":
                    case "fixpanel":
                        var editPanel = $editView;
                        if (ops.editMode == 'rowpanel')
                            editPanel = $editView.find('div.bdpGridRowEditPanel');
                        editPanel.bdpEditPanel('updateEdit', function (ajaxResult) {
                            if (ajaxResult.Succeed) {
                                self.cancelEdit();
                                var rowIndex = self._editView.rowIndex,
                                    nr = editPanel.bdpEditPanel('getValues').newValues;
                                if (!self._NewRecord) {
                                    var rowData = self._getRowData(rowIndex);
                                    for (var key in nr) {
                                        rowData[key] = nr[key];
                                    }
                                    self.refresh();
                                } else {
                                    self.reload();
                                }
                                //$.omMessageBox.alert({ type: 'success', title: '成功', content: '保存成功!' });
                                $.omMessageTip.show({ type: 'success', title: '成功', content: '保存成功!', timeout: 3000 });
                            } else {
                                //$.omMessageBox.alert({ type: 'error', title: '失败', content: '操作失败！' + ajaxResult.Message });
                                $.omMessageTip.show({ type: 'error', title: '失败', content: '操作失败！' + ajaxResult.Message, timeout: 3000 });
                            }
                        });
                        break;
                    case "excel":
                        exUpdateEdit(self, onSuccess);
                        break;
                    case "multirow":
                        if (!this.isValid()) {
                            //$.omMessageBox.alert({ type: 'error', title: '提示', content: '数据不正确，请修改！' });
                            $.omMessageTip.show({ type: 'error', title: '提示', content: '数据不正确，请修改！', timeout: 3000 });
                            return;
                        }
                        var onBeforeSave = ops.editOptions.onBeforeSave,
                            args = _getDataSaveArgs(self);
                        if (onBeforeSave) {
                            onBeforeSave.call(self, args);
                        }
                        if (!args.cancel && args.processUrl != '') {
                            $.ajax({
                                type: 'POST',
                                url: args.processUrl,
                                async: false,
                                data: JSON.stringify(args.values),
                                success: function (strResult) {
                                    var res = $.parseJSON(strResult) || {};
                                    if (res.Succeed) {
                                        self.cancelEdit();
                                        self.reload();
                                        if (onSuccess) onSuccess(res);
                                        //$.omMessageBox.alert({
                                        //    type: 'success', title: '成功',
                                        //    content: '保存成功!'
                                        //});
                                        $.omMessageTip.show({
                                            type: 'success', title: '成功',
                                            content: '保存成功!',
                                            timeout: 3000
                                        });
                                    } else {
                                        //$.omMessageBox.alert({
                                        //    type: 'error', title: '失败',
                                        //    content: '操作失败!' + (res ? res.Message : '')
                                        //});
                                        $.omMessageTip.show({
                                            type: 'error', title: '失败', timeout: 3000,
                                            content: '操作失败!' + (res ? res.Message : '')
                                        });
                                    }
                                }
                            });
                        } else {
                            self.cancelEdit();
                        }
                        break;
                }
            },
            // 退出编辑状态
            cancelEdit: function () {
                if (!this.isEditing()) return;
                var grid = self,
                    ops = self.options;
                switch (ops.editMode) {
                    case "dialog":
                        var dlgId = $elem.prop('id') + '_editform',
                            $editView = $('#' + dlgId);
                        if ($editView.length > 0)
                            $editView.bdpEditor('close');
                        break;
                    case "rowpanel":
                        var trid = $elem.prop('id') + '_editrow',
                            $editView = $('#' + trid);
                        if ($editView.length > 0) {
                            $editView.hide();
                            grid._editView.editing = false;
                        }
                        if (self._need_reset_to_multirow) {
                            ops.editMode = 'multirow';
                            self._need_reset_to_multirow = false;
                        }
                        break;
                    case "multirow":
                        var id = $elem.prop('id') + '_form',
                            $editView = $('#' + id);
                        if ($editView.length > 0) {
                            $editView.hide();
                            $elem.show();
                            grid.pDiv.unmask();
                            grid.hDiv.find('th.checkboxCol>div.checkboxheader').show();
                            grid.hDiv.find('th.checkboxCol>div.checkboxheader_edit').hide();
                            // 清除新增的行
                            var editTable = $editView.find('#' + $elem.prop('id') + '_edit_table');
                            editTable.find('tr.newRow').remove();
                            //self._EditingRowData = null;
                            grid._editView.editing = false;
                        }
                        break;
                    case "excel":
                        exCancelEdit(self, false);
                        //exLeaveCell(self);
                        // 为页码面板增加遮罩层，编辑时不能操作
                        self.pDiv.unmask();
                        self._editView.editing = false;
                        break;
                }
                ops.onCancelEdit && ops.onCancelEdit.call(this);
            },
            // 切换查看/编辑模式
            setIsView: function (isView) {
                var grid = self,
                    ops = self.options,
                    editOptions = ops.editOptions || {};
                switch (ops.editMode) {
                    case "dialog":
                        var dlgId = $elem.prop('id') + '_editform',
                            $editView = $('#' + dlgId);
                        if ($editView.length > 0) {
                            $editView.bdpEditor('setIsView', isView);
                            var s = (isView ? '查看' : (grid._NewRecord ? '新增' : '修改')) + ' - ' + (editOptions.title || '');
                            $editView.bdpEditor('setOptions', { title: s });
                        }
                        break;
                    case "rowpanel":
                        var trid = $elem.prop('id') + '_editrow_EP',
                            editPanel = $('#' + trid);
                        if (editPanel.length > 0) {
                            editPanel.bdpEditPanel('setIsView', isView);
                        }
                        break;
                    case "fixpanel":
                        var $editView = $('#' + ops.fixPanelId);
                        if ($editView.length > 0)
                            $editView.bdpEditPanel('setIsView', isView);
                        break;
                }
            },
            // 删除选中的行
            deleteSelections: function () {
                _checkKeyFieldName(self);
                var ops = self.options,
                    args = {
                        cancel: false,
                        deleteUrl: ops.editOptions.deleteUrl || ops.deleteUrl,
                        rowKeys: []
                    },
                    selectedRows = self.getSelections(true),
                    onBeforeDelete = ops.onBeforeDelete,
                    onAfterDelete = ops.onAfterDelete;
                $.each(selectedRows, function (index, r) {
                    args.rowKeys.push(r[ops.keyFieldName]);
                });
                onBeforeDelete && onBeforeDelete.call(self, args);
                if (!args.cancel && args.deleteUrl && args.rowKeys.length > 0) {
                    $.post(args.deleteUrl,
                        JSON.stringify(args.rowKeys),
                        function (result) {
                            if (result.Succeed) {
                                onAfterDelete && onAfterDelete.call(self, result);
                                self.reload();
                                //$.omMessageBox.alert({ type: 'success', title: '成功', content: result.Message || '操作成功' });
                                $.omMessageTip.show({ type: 'success', title: '成功', content: '操作成功', timeout: 3000 });
                            } else {
                                //$.omMessageBox.alert({ type: 'error', title: '失败', content: result.Message || '操作失败' });
                                $.omMessageTip.show({ type: 'error', title: '失败', content: '操作失败.' + (result.Message || ''), timeout: 3000 });
                            }
                        },
                        'json');
                }
            },

            //#region 仅多行编辑时
            //// 获取正在编辑的数据, 返回行对象数组. 仅多行编辑时
            //getEditValues: function () {
            //    var args = _getDataSaveArgs(self);
            //    return args.values;
            //},
            // 获取多行编辑的行数
            getEditRowCount: function () {
                if (ops.editMode == 'multirow' && self.isEditing()) {
                    return self._EditingRowData.length;
                }
                return 0;
            },
            // 删除正在编辑的某一行, rid可以在编辑控件的options中得到
            removeEditRow: function (rid) {
                if (ops.editMode == 'multirow' && self.isEditing()) {
                    var editTable = $('#' + $elem.prop('id') + '_form').find('#' + $elem.prop('id') + '_edit_table');
                    editTable.find('tr.om-grid-row[rid="' + rid + '"]').remove();
                    for (var i = 0, len = self._EditingRowData.length; i < len; i++) {
                        if (self._EditingRowData[i]._rid_ == rid) {
                            self._EditingRowData.splice(i, 1);
                            break;
                        }
                    }
                }
            },
            // 获取多行编辑时选中行的行ID，返回字符串数组
            getSelectedRids: function () {
                var result = [];
                if (ops.editMode == 'multirow' && self.isEditing()) {
                    var editTable = $('#' + $elem.prop('id') + '_form').find('#' + $elem.prop('id') + '_edit_table'),
                        rows = $('tr.om-state-highlight', editTable);
                    rows.each(function (i, tr) {
                        result.push($(tr).attr('rid'));
                    });
                }
                return result;
            },
            //#endregion

            //返回是否验证通过
            isValid: function () {
                if (!this._validator) return true;
                return this._validator.form(); //.valid();
            },
            // 是否在编辑状态。 固定面板时总是返回false
            isEditing: function () {
                return self._triggered && self._editView.editing;
            },
            // 根据字段名或列信息查找编辑控件，返回统一类型：bdpEditCtrl
            //参数：
            //  fnOrCm: 字段名或列信息对象
            //  ctrl:   当前编辑控件，一般采用onValueChanged事件中的target参数。 该参数仅多行编辑时有用
            findEditCtrl: function (fnOrCm, ctrl) {
                var ec = null;
                if (self._editView) {
                    var $editView = self._editView.view;
                    switch (ops.editMode) {
                        case "dialog":
                            ec = $editView.bdpEditor('findEditCtrl', fnOrCm);
                            break;
                        case "fixpanel":
                        case "rowpanel":
                            var editPanel = $editView;
                            if (ops.editMode == 'rowpanel')
                                editPanel = $editView.find('div.bdpGridRowEditPanel');
                            ec = editPanel.bdpEditPanel('findEditCtrl', fnOrCm);
                            break;
                        case "multirow":
                            var fn = fnOrCm;
                            if (typeof fnOrCm == 'object') {
                                fn = fnOrCm.name;
                            } else {
                                for (var i = 0; i < ops.colModel.length; i++) {
                                    var c = ops.colModel[i],
                                        s = c.editor ? (c.editor.name || c.name) : c.name;
                                    if (s == fn) {
                                        fn = c.name;
                                        break;
                                    }
                                }
                            }
                            var tr = $(ctrl).closest('tr.om-grid-row'),
                                td = $(tr).find("td[abbr='" + fn + "']");
                            ec = $(td).find('div.innerCol');
                            break;
                    }
                }
                return ec;
            },
            // 获取编辑器中的值,结果为对象, 多行编辑时返回对象数组
            getEditValues: function () {
                var values = null;
                if (self._editView) {
                    var $editView = self._editView.view;
                    switch (ops.editMode) {
                        case "dialog":
                            values = $editView.bdpEditor('getData').newValues;
                            break;
                        case "fixpanel":
                        case "rowpanel":
                            var editPanel = $editView;
                            if (ops.editMode == 'rowpanel')
                                editPanel = $editView.find('div.bdpGridRowEditPanel');
                            values = editPanel.bdpEditPanel('getValues').newValues;
                            break;
                        case "multirow":
                            var args = _getDataSaveArgs(self);
                            values = args.values;
                            break;
                    }
                }
                return values;
            },
            // 根据字段名或列信息查找编辑控件实例，返回实际的输入控件
            findEditor: function (fnOrCm, ctrl) {
                var ec = this.findEditCtrl(fnOrCm, ctrl);
                if (ec != null) {
                    return ec.bdpEditCtrl('getCtrl');
                }
                return null;
            },
            // 导出到Excel
            toExcel: function (setting) {
                var self = this,
                    options = self.options,
                    exp = setting || options.exportOptions || {};
                //exp.exportMethod = exp.exportMethod || "GridToExcel";
                //exp.exportUrl = exp.exportUrl || ROOT_PATH + 'frame/data/down.aspx';
                exp.dataSource = exp.dataSource || options.dataSource;
                exp.title = exp.title || options.title;
                if (!exp.title && options.editOptions) {
                    exp.title = options.editOptions.title || "表格数据";
                }
                if (typeof exp.allowSelectColumn == 'undefined') {
                    exp.allowSelectColumn = true;
                }
                if (!exp.colModel) {
                    exp.colModel = $.extend(true, [], self._orgColModel || options.colModel);
                    var proc = function (arrModel) {
                        for (var i = arrModel.length - 1; i >= 0; i--) {
                            if ($.isArray(arrModel[i])) {
                                proc(arrModel[i]);
                            } else {
                                var col = arrModel[i], w = col.width;
                                if (typeof (w) == 'number') {
                                    col.width = parseInt(w / 7.2);
                                } else {
                                    col.width = null;
                                }
                                col.header = $('<i>' + col.header + '</i>').text().trim();
                            }
                        }
                    };
                    proc(exp.colModel);
                }
                if (options.extraData) {
                    exp.extraData = $.extend(exp.extraData || {}, options.extraData);
                }
                $.toExcel(exp);
            },
            // 设置查看列和列顺序
            setupViewOptions: function () {
                var self = this,
                    dlg = self.dlgViewOptions;
                if (!dlg) {
                    dlg = $('<div></div>').appendTo('body');
                    self.dlgViewOptions = dlg;
                }
                var listbox = $('<div></div>').appendTo(dlg.empty()).width('100%').height('100%')
                    .bdpListBox({
                        dataSource: self.listColumns || $.bdp.colModelHelper.toList(cms, '>'),//self.options.colModel
                        textField: 'label',
                        valueField: 'label',
                        width: 'auto',
                        height: 'auto',
                        onBuildItems: function () {
                            // this是bdpListBox对象
                            this.setSelections(function (obj) {
                                return typeof obj.colInfo.visible === 'boolean' ? obj.colInfo.visible : true;
                            });
                        }
                    });
                dlg.omDialog({
                    title: '设置查看列',
                    autoOpen: false,
                    width: 540,
                    height: 395,
                    modal: true,
                    buttons: [{
                        text: '确定', width: 55,
                        click: function () {
                            self.listColumns = listbox.bdpListBox('getItems');
                            var columns = listbox.bdpListBox('getSelections');
                            $.each(self.listColumns, function () {
                                this.colInfo.visible = $.inArray(this, columns) > -1;
                            });
                            self.options.colModel = $.bdp.colModelHelper.toColModel(columns, '>');
                            //self._init();
                            self.element.omGrid(self.options);
                            dlg.omDialog('close');
                        }
                    }, {
                        text: '取消', width: 55,
                        click: function () {
                            dlg.omDialog('close');
                        }
                    }],
                    onOpen: function () {
                        listbox.bdpListBox('resize');
                    },
                    onClose: function () {
                    }
                })
                    .omDialog('open');

            },
            // 获取当前页数据，包括页码信息
            getPageData: function () {
                return this.pageData;
            },
            // 设置聚焦行
            setFocuskey: function (keyValue) {
                var ops = this.options;
                ops.extraData.focuskey = keyValue;
            },

            done: true
        });

    });
    //#endregion

    //#region 每页行数
    function _buildItemsPerPage(grid) {
        if (grid.pDiv.find('input.om-grid-itemsperpage').length > 0) {
            return;
        }
        var pDiv2 = grid.pDiv.find("div.pDiv2"),
            cDiv = $("<div></div>").addClass("pGroup");
        pDiv2.prepend('<div class="btnseparator"></div>');
        pDiv2.prepend(cDiv);

        //var cInput = $("<input class='om-grid-itemsperpage' title='设置每页显示行数' />").css({ height: 24 }).appendTo(cDiv);
        var cInput = $("<input class='om-grid-itemsperpage' title='设置每页显示行数' />").css({ height: 20 }).appendTo(cDiv);
        grid.options.ItemsPerPage = grid.options.ItemsPerPage || [5, 10, 15, 20, 50, 100];
        var values = [];
        $.each(grid.options.ItemsPerPage, function (i, c) {
            values.push({ text: c, value: c });
        });
        cInput.omCombo({
            autoFilter: false,
            value: grid.options.limit,
            dataSource: values,
            onValueChange: function (target, newValue, oldValue, event) {
                grid.options.limit = newValue;
                grid.reload();
            }
        });
        cInput.next("input").keydown(function (e) {
            if (e.keyCode == $.om.keyCode.ENTER) {
                grid.options.limit = $(this).val();
                grid.reload();
            }
        });
    }
    //#endregion

    //#region 渲染编辑器, 此函数中的this一定是某一行(tr)
    function editRenderer(grid) {
        var $tr = $(this),
            ops = grid.options;
        //正在编辑则直接返回
        if (grid._triggered && grid._editView.editing) {
            return;
        }
        if (!grid._NewRecord && ops.onBeforeEdit && ops.onBeforeEdit.call(grid) === false)
            return;

        switch (ops.editMode) {
            case "dialog":
                _showDialog(grid, $tr);
                break;
            case "rowpanel":
                _showRowPanel(grid, $tr);
                break;
            case "fixpanel":
                _showFixpanel(grid, $tr);
                break;
            case "multirow":
                _showMultiRow(grid, $tr);
                break;
        }
        grid._triggered = true;

        ops.onStartEdit && ops.onStartEdit.call(this);
    }
    //#endregion

    //#region 多行编辑

    //// 为原来table的tr加一个事件处理函数，目的是阻止原来的事件，如单击选择等
    //function _disableTrEvent(event) {
    //    event.stopPropagation();
    //}
    // 追加新行, data一定是数据对象，可以是omGrid数据格式：{total:10,rows:{}}，也可以是行数据数组
    function _appendRows(grid, data) {
        var ops = grid.options,
            $elem = grid.element,
            allThs = grid.hDiv.find('th:visible'),
            rowData = $.isArray(data) ? data : data.rows,
            $editView = $('#' + $elem.prop('id') + '_form'),
            editTable = $editView.find('#' + $elem.prop('id') + '_edit_table'),
            existsRowCount = grid._EditingRowData.length,
            tbody = editTable.children('tbody');

        for (var i = 0, len = rowData.length; i < len; i++) {
            var rd = rowData[i],
                $tr = $('<tr></tr>').addClass('om-grid-row oddRow newRow').appendTo(tbody);
            rd._rid_ = 'r' + (existsRowCount + i + 1);
            rd._isnew_ = true;
            $tr.attr('rid', rd._rid_);
            grid._EditingRowData.push(rd);

            $.each(allThs, function (index, th) {
                var $th = $(th), tdClass = $th.attr('class'),
                    fn = $th.attr('abbr'),
                    trIndex = existsRowCount + i + 1,
                    $td = $('<td></td>').appendTo($tr);
                $td.addClass(tdClass);
                $td.attr('abbr', $th.attr('abbr') || '');
                $td.attr('align', $th.attr('align'));
                $td.css('border-bottom', '1px solid #86A3C4');
                var $div = $('<div></div>').appendTo($td);
                $div.addClass('innerCol').width($th.find('div').first().width()).css({ 'padding-top': '2px', 'padding-bottom': '2px' });
                if (fn && fn != '') {
                    var cmArr = $.grep(ops.colModel, function (c, index) { return c.name == fn; });
                    if (cmArr.length > 0) {
                        var cm = cmArr[0];
                        cm.rid = rd._rid_;  // 记住行id
                        _createCellCtrl($div, cmArr[0], $elem.prop('id') + '_EV_' + trIndex);
                        $div.bdpEditCtrl('setValue', rd);
                    }
                }

                if (tdClass == 'indexCol') {
                    $div.attr('align', 'center').text(trIndex);
                    $td.attr('align', 'center');
                }
                if (tdClass == 'checkboxCol') {
                    $div.attr('align', 'center').append('<span class="checkbox"></span>');
                    $td.attr('align', 'center');
                    _bindSelectEvent(grid, $tr);
                }
            });
        }
        // 定位到新加的第1行
        var scrollTo = tbody.children('tr:eq(' + (existsRowCount + 1) + ')');
        if (scrollTo.length > 0) {
            $editView.animate({
                scrollTop: scrollTo.offset().top - $editView.offset().top + $editView.scrollTop()
            });
        }

    }
    // 绑定行选择事件
    function _bindSelectEvent(grid, $tr) {
        $('span.checkbox', $tr).click(function (event) {
            var span = $(this),
                headerCheckbox = $('th.checkboxCol>div.checkboxheader_edit>span.checkbox', grid.thead),
                editTable = $('#' + grid.element.prop('id') + '_edit_table'),
                allTrs = $('tr.om-grid-row:not([_delete=true])', editTable);
            if (span.hasClass('selected')) {
                span.removeClass('selected');
                $tr.removeClass('om-state-highlight');
            } else {
                span.addClass('selected');
                $tr.addClass('om-state-highlight');
            }
            var selTrs = allTrs.filter('.om-state-highlight');
            headerCheckbox.toggleClass('selected', allTrs.length > 0 && allTrs.length == selTrs.length);
        });
    }
    function _createCellCtrl(eDiv, cm, ctrlId) {
        cm.editor = cm.editor || {};
        if (typeof (cm.editor.editable) == 'undefined')
            cm.editor.editable = true;
        cm.editor.type = cm.editor.type || 'text';
        cm.editor.name = cm.editor.name || cm.name;
        cm.editor.caption = cm.editor.caption || cm.header;
        // 如果是多行文本编辑就换成参考框编辑
        if (['memo', 'image'].indexOf(cm.editor.type) >= 0) {
            cm.editor.type = 'refer';
            //cm.editor.options = cm.editor.options || {}
            //cm.editor.options.title = cm.header;
        }
        // 创建编辑控件
        cm.idPrefix = ctrlId;
        if (typeof (cm.editor.createErrorPlace) == 'undefined')
            cm.editor.createErrorPlace = true;
        cm.createErrorPlace = cm.editor.createErrorPlace;
        eDiv.bdpEditCtrl(cm);
    }
    function _showMultiRow(grid, tr) {
        var ops = grid.options, thCheckboxCol = grid.hDiv.find('th.checkboxCol'),
            editOptions = _getEditOptions(grid),
            $elem = grid.element,
            $editView = $('#' + $elem.prop('id') + '_form'),
            allTrs = grid._getTrs();
        if ($editView.length == 0 || grid.getEditRowCount() != allTrs.length) {
            //如果显示选择列，则在表头创建一个新的全部选择或全部取消的checkbox, 并挂接单击事件。
            if (thCheckboxCol.length > 0) {
                var editCheckboxHeader = $('div.checkboxheader_edit', thCheckboxCol);
                if (editCheckboxHeader.length == 0) {
                    thCheckboxCol.append('<div class="checkboxheader_edit" style="text-align: center; width: 17px;padding:4px 5px;"><span class="checkbox"></span></div>');
                    $('div.checkboxheader_edit > span.checkbox', thCheckboxCol).click(function (event) {
                        var span = $(this), editTable = $('#' + grid.element.prop('id') + '_edit_table');
                        if (span.hasClass('selected')) {
                            span.removeClass('selected');
                        } else {
                            span.addClass('selected');
                        }
                        var checked = span.hasClass('selected');
                        $('tr', editTable).each(function (index, tr) {
                            var tdspan = $('span.checkbox', $(tr));
                            if (checked) {
                                tdspan.addClass('selected');
                                $(tr).addClass('om-state-highlight');
                            } else {
                                tdspan.removeClass('selected');
                                $(tr).removeClass('om-state-highlight');
                            }
                        });
                    });
                }
            }

            $editView.remove();
            $editView = $("<form class='bdpEditForm'></form>").prop('id', $elem.prop('id') + '_form');
            var editTable = $elem.clone().prop('id', $elem.prop('id') + '_edit_table');
            $editView.insertAfter($elem);
            $editView.append(editTable);

            editTable.find('tr.om-grid-row').each(function (trIndex, tr) {
                var rd = grid._EditingRowData[trIndex];
                $(tr).attr('rid', rd._rid_);
                _bindSelectEvent(grid, $(tr));
                $(tr).find("td[abbr!='']").each(function (tdIndex, td) {
                    var fn = $(td).attr('abbr'),
                        cm = $.grep(ops.colModel, function (c, i) { return c.name == fn; })[0];
                    if (cm && (!cm.editor || cm.editor.editable != false)) {
                        cm.rid = rd._rid_;
                        // 创建编辑控件
                        var eDiv = $(td).find('div.innerCol').empty();
                        _createCellCtrl(eDiv, cm, $elem.prop('id') + '_EV_' + trIndex);
                    }
                });
            });


            // 绑定数据校验
            _bindValidation(grid, $editView, _getEditOptions(grid));
            grid._editView = { view: $editView, editing: false };
        }
        if (!grid._editView.editing) {
            $elem.hide();
            $editView.show();
            // 为页码面板增加遮罩层，编辑时不能操作
            grid.pDiv.mask();
            // 隐藏浏览时的表头全选/全取消，放开编辑时的
            $('div.checkboxheader', thCheckboxCol).hide();
            $('div.checkboxheader_edit', thCheckboxCol).show();

            var editTable = $editView.find('#' + $elem.prop('id') + '_edit_table');
            editTable.find('tr.om-grid-row').each(function (trIndex, tr) {
                var rowData = grid._EditingRowData[trIndex];
                $(tr).find("td[abbr!='']").each(function (tdIndex, td) {
                    var eDiv = $(td).find("div.innerCol");
                    eDiv.bdpEditCtrl('setValue', rowData);
                });
            });
            // 触发一次校验
            grid._validator && grid._validator.form();
            grid._editView.editing = true;
        }
    }
    // 获取多行编辑数据保存前参数对象，这个对象将传递给onBeforeSave事件。
    // 对象包括：
    //  cancel: false       // 是否取消缺省处理，如果自己处理了数据保存，将此值设置为true
    //  processUrl: ''       // 数据处理地址
    //  values: []   // 值对象数组，保存每个属性的新/旧值。多行编辑时有多条，否则只有一条。
    function _getDataSaveArgs(grid) {
        var args = {
            cancel: false,
            processUrl: '',
            values: []
        };
        var ops = grid.options,
            $editView = grid._editView.view,
            editOptions = _getEditOptions(grid),
            process = editOptions.updateUrl || '';
        if (process != '') {
            if (typeof process == 'function') {
                process = process.call(grid) || '';
            }
            args.processUrl = process;
        }

        var editTable = $editView.find('#' + grid.element.prop('id') + '_edit_table');
        editTable.find('tr.om-grid-row').each(function (trIndex, tr) {
            if (trIndex < grid._EditingRowData.length) {
                var trValue = { oldValues: {}, newValues: {} },
                    rowData = grid._EditingRowData[trIndex],
                    isNewRow = rowData._isnew_ || false;

                for (var key in rowData) {
                    if (key && key != '_rid_' && key != '_isnew_') {
                        trValue.oldValues[key] = rowData[key];
                        trValue.newValues[key] = rowData[key];
                    }
                }
                var isEmptyRow = true;
                $(tr).find("td[abbr!='']").each(function (tdIndex, td) {
                    var fn = $(td).attr('abbr'),
                        cm = $.grep(ops.colModel, function (c, i) { return c.name == fn; })[0];
                    if (cm && (!cm.editor || cm.editor.editable != false)) {
                        var eDiv = $(td).find("div.innerCol");
                        if (eDiv.length > 0) {
                            var colName = eDiv.bdpEditCtrl('options').editor.name,
                                value = eDiv.bdpEditCtrl('getValue');
                            if (!(typeof (value) == 'undefined' || value == null || value == '')) {
                                isEmptyRow = false;
                            }
                            trValue.newValues[colName] = value;
                        }
                    }
                });
                if (!isNewRow || !isEmptyRow)
                    args.values.push(trValue);
            }
        });

        return args;
    }
    //#region 数据校验
    // 将列模型中的验证设置绑定到表单，并触发一次验证.
    //self: 对象，成功后为该对象增加_validator属性
    //$form: 表单的jQuery对象
    //editOption: 编辑选项对象，其中editors为编辑器设置，editors.colModal为列模型
    function _bindValidation(self, $form, editOptions) {
        var validCfg = editOptions.validator || {},
            rules = validCfg.rules || {},
            messages = validCfg.messages || {},
            colModel = editOptions.editors.colModel || [];

        $.each(colModel, function (index, model) {
            var customRules = model.editor ? model.editor.rules : null;
            if (customRules) {
                var r = rules[model.editor.name || model.name] = {},
                    msg = messages[model.editor.name || model.name] = {};
                if (customRules.length > 0 && !$.isArray(customRules[0])) {
                    var temp = [];
                    temp.push(customRules);//包装成[[],[]]这种统一形式
                    customRules = temp;
                }
                for (var i = 0, len = customRules.length; i < len; i++) {
                    var name = customRules[i][0];   //校验类型
                    r[name] = customRules[i][1] == undefined ? true : customRules[i][1]; //没有定义值的统一传 true
                    if (customRules[i][2]) {
                        msg[name] = customRules[i][2];
                    }
                }
            }

        });
        validCfg.rules = rules;
        validCfg.messages = messages;
        if (typeof (validCfg.onkeyup) == 'undefined') validCfg.onkeyup = false;

        $.extend(validCfg, {
            //必须覆盖此方法，不然会默认生成错误信息容器，而错误信息的产生已经在showErrows处理了，所以此方法什么也不做
            errorPlacement: function (error, element) {
            },
            showErrors: function (errorMap, errorList) {
                var $form = $(this.currentForm);
                var $elements = $(this.currentElements);
                $elements.each(function (index, obj) {
                    $form.find(".bdpEditFormError[for='" + $(obj).prop('id') + "']")
                        .attr('title', '')
                        .hide();
                });

                $.each(errorList, function (index, obj) {
                    var $ele = $(obj.element),
                        message = obj.message;
                    $form.find(".bdpEditFormError[for='" + $ele.prop('id') + "']")
                        .attr({ 'title': message })
                        .show();
                });
            }
        });
        self._validator = $form.validate(validCfg);
        $.extend(self._validator, {
            // 重载验证器的elements方法，返回form中所有具有验证规则的域，即使name是重复的。
            // 在omui缺省的处理中name重复的域返回一个，这样多行编辑器下就只能验证第一行的值。
            elements: function () {
                var validator = this,
                    ret = $(this.currentForm)
                        .find('input, select, textarea')
                        .not(':submit, :reset, :image, [disabled]')
                        .not(this.settings.ignore)
                        .filter(function () {
                            if (!this.name || !validator.objectLength($(this).rules()))
                                return false;
                            return true;
                        });

                return ret;
            }
        });
    }
    //#endregion

    //#endregion

    //#region 在固定的面板上编辑
    function _showFixpanel(grid, tr) {
        var ops = grid.options,
            $elem = grid.element,
            $editView = $('#' + ops.fixPanelId),
            editOptions = _getEditOptions(grid);
        if (!grid._editView || !grid._editView.view) {
            editOptions.editors.onBeforeSave = editOptions.editors.onBeforeSave || editOptions.onBeforeSave;
            editOptions.editors.updateUrl = editOptions.editors.updateUrl || editOptions.updateUrl;
            $editView.bdpEditPanel(editOptions.editors);
            grid._editView = { view: $editView, rowIndex: -1, editing: false };
        }
        if (grid._NewRecord) {
            $editView.bdpEditPanel('setValues', grid._NewRecord);
        } else {
            var trIndex = grid._getTrs().index(tr),
                rowData = grid._getRowData(trIndex);
            if (trIndex != grid._editView.rowIndex) {
                $editView.bdpEditPanel('setValues', rowData);
                grid._editView.rowIndex = trIndex;
            }
        }
        $editView.show();
        grid._editView.editing = false;
        //grid._editView.editing = typeof editOptions.editors.isView == 'undefined' ? true : !editOptions.editors.isView;
    }
    //#endregion

    //#region 在行面板中编辑
    function _showRowPanel(grid, tr) {
        var ops = grid.options,
            $elem = grid.element,
            trid = $elem.prop('id') + '_editrow',
            $editView = $('#' + trid);
        var editOptions = _getEditOptions(grid);
        if ($editView.length == 0) {
            //#region 增加行，两个单元格，第二个是合并的，里面建一个div,然后调用bdpEditPanel编辑
            var align = editOptions.align || 'left';
            $editView = $('<tr><td></td></tr>').prop('id', trid);
            if (tr && tr.length > 0) $editView.insertAfter(tr);
            else grid.tbody.prepend($editView);
            var colspan = grid.hDiv.find('table > thead > tr > th').length - 1;
            var editTd = $('<td></td>').attr('colspan', colspan)
                .css({ 'text-align': align, position: 'relative' })
                .appendTo($editView);
            var editDiv = $('<div></div>')
                .css({
                    position: 'relative', 'background-color': '#D3E1F1',
                    margin: '1px', padding: '1px'
                })
                .appendTo(editTd);

            var height = editOptions.editors.height || editOptions.height || tr.height();
            if (height < 100) height = 100;
            var width = editOptions.editors.width || editOptions.width || editTd.innerWidth();
            if (typeof width != 'string') width = width + 'px';

            var editPanel = $('<div></div>').prop('id', trid + '_EP')
                .addClass('bdpGridRowEditPanel')
                .height(height)
                .width(width)
                .appendTo(editDiv);
            var editTool = $("<div><input type='button' class='ok' value='确定'/><input type='button' class='cancel' value='取消'/></div>")
                .addClass('bdpGridRowEditToolbar')
                .width(width)
                .height(26)
                .appendTo(editDiv);
            editDiv.width(editPanel.outerWidth());
            editTd.height(editDiv.outerHeight());

            var $okBtn = editTool.find("input.ok").omButton().width(70).height(24),
                $cancelBtn = editTool.find("input.cancel").omButton().width(70).height(24);
            $okBtn.click(function () {
                grid.updateEdit();
            });
            $cancelBtn.click(function () {
                grid.cancelEdit();
            });
            //生成编辑控件
            editOptions.editors.onBeforeSave = editOptions.editors.onBeforeSave || editOptions.onBeforeSave;
            editOptions.editors.updateUrl = editOptions.editors.updateUrl || editOptions.updateUrl;
            editPanel.bdpEditPanel(editOptions.editors);
            var trIndex = grid._getTrs().index(tr),
                rowData = grid._getRowData(trIndex);
            editPanel.bdpEditPanel('setValues', rowData);
            //#endregion
            // 缓存编辑器
            grid._editView = {
                view: $editView,
                rowIndex: trIndex,
                editing: false
            };
        }
        if (!grid._editView.editing) {
            var allTrs = grid._getTrs();
            if (grid._NewRecord) {
                if (grid._editView.rowIndex != 0) {
                    if (allTrs.length > 0) {
                        $editView.detach();
                        $editView.insertBefore(allTrs[0]);
                    }
                    var editPanel = $editView.find('div.bdpGridRowEditPanel');
                    editPanel.bdpEditPanel('setValues', grid._NewRecord);
                    grid._editView.rowIndex = 0;
                }
            } else {
                var trIndex = allTrs.index(tr);
                if (trIndex != grid._editView.rowIndex) {
                    $editView.detach();
                    $editView.insertAfter(tr);
                    grid._editView.rowIndex = trIndex;
                    var rowData = grid._getRowData(trIndex),
                        editPanel = $editView.find('div.bdpGridRowEditPanel');
                    editPanel.bdpEditPanel('setValues', rowData);
                }
            }
            $editView.show();
            grid._editView.editing = true;
        }
    }
    //#endregion

    //#region 在弹出框中编辑
    function _showDialog(grid, tr) {
        var ops = grid.options,
            $elem = grid.element,
            dlgId = $elem.prop('id') + '_editform',
            $editView = $('#' + dlgId);
        var editOptions = _getEditOptions(grid);

        if ($editView.length == 0) {
            $editView = $("<div></div>").prop('id', dlgId)
                .width($elem.outerWidth())
                .insertAfter($elem);
            // 缓存编辑器
            grid._editView = { view: $editView };
            editOptions.onClose = function () {
                grid._editView.editing = false;
                ops.onCancelEdit && ops.onCancelEdit.call(this);
            };
            grid._onCloseQuery = editOptions.onCloseQuery;
            editOptions.onCloseQuery = function (args) {
                grid._onCloseQuery && grid._onCloseQuery.call(this, args);
                if (args.canClose && args.ajaxResult) {
                    if (args.ajaxResult.Succeed) {
                        var keyValue = args.ajaxResult.Data || '';
                        if ($.isArray(keyValue)) keyValue = keyValue[0];
                        if (typeof keyValue == 'object') {
                            keyValue = ops.keyFieldName ? (keyValue[ops.keyFieldName] || '') : '';
                        }
                        if (keyValue != '') {
                            grid.setFocuskey(keyValue);
                        }
                        grid.reload();
                        //$.omMessageBox.alert({ type: 'success', title: '提示', content: args.ajaxResult.Message || '操作成功' });
                        $.omMessageTip.show({ type: 'success', title: '提示', content: args.ajaxResult.Message || '操作成功', timeout: 3000 });
                    } else {
                        args.canClose = false;
                        //$.omMessageBox.alert({ type: 'error', title: '提示', content: args.ajaxResult.Message || '操作失败xxx' });
                        $.omMessageTip.show({ type: 'error', title: '提示', content: args.ajaxResult.Message || '操作失败', timeout: 3000 });
                    }
                }
            };
            $editView.bdpEditor(editOptions);
        }
        if (!grid._editView.editing) {
            var rowIndex = grid._getTrs().index(tr),
                rowData = grid._NewRecord || grid._getRowData(rowIndex),
                s = (editOptions.editors.isView ? '查看' : (grid._NewRecord ? '新增' : '修改')) + ' - ' + (editOptions.title || '');
            $editView.bdpEditor('setOptions', { title: s });
            $editView.bdpEditor('setData', rowData);
            $editView.bdpEditor('open');
            grid._editView.rowIndex = rowIndex;
            grid._editView.editing = true;
        }
    }
    //#endregion

    //#region 渲染汇总行
    function _renderSummary(grid) {
        // 汇总数据
        var summaryData = grid.pageData.data.summary;
        if (typeof (summaryData) == 'object') {
            var ops = grid.options, $elem = grid.element, $bdiv = grid.tbody.closest('.bDiv'),
                rows = $.isArray(summaryData) ? summaryData : $.makeArray(summaryData),
                gridHeaderCols = grid._getHeaderCols(),
                colModel = grid._getColModel(),
                //rowClasses = ['oddRow', 'evenRow'],
                tdTmp = "<td align='$' abbr='$' class='$'><div align='$' class='innerCol $' style='width:$px'>$</div></td>",//td模板
                smTable = [],
                smdiv = grid.summary;
            if (smdiv) smdiv.empty();
            else {
                smdiv = $("<div></div>").insertAfter($elem);
                $elem.css('margin-bottom', 0);
                grid.summary = smdiv;
            }

            smTable.push('<table cellspacing="0" cellpadding="0" border="0"><body>');
            $(rows).each(function (i, rd) {
                if (rd != null) {
                    smTable.push('<tr class="om-grid-summary-row ">');
                    $(gridHeaderCols).each(function (index, th) {
                        var fn = $(th).attr('abbr') || '', wrap = false, html = '';
                        if (fn != '' && typeof (rd[fn]) != 'undefined') {
                            var v = rd[fn],
                                cmArr = $.grep(colModel, function (c, index) { return c.name == fn; });
                            if (typeof (v) == 'number' && cmArr.length > 0) {
                                var cm = cmArr[0];
                                cm.editor = cm.editor || {};
                                var f = cm.editor.displayFormat || cm.displayFormat || '';
                                v = v.fmt(f);
                            }
                            html = v;
                        }
                        var width = $('div', $(th)).width();
                        cols = [th.align, th.abbr, th.axis, th.align, wrap ? 'wrap' : '', width, html];
                        j = 0;
                        smTable.push(tdTmp.replace(/\$/g, function () {
                            return cols[j++];
                        }));
                    });
                    smTable.push('</tr>');
                }
            });
            smTable.push('</body></table>');

            smdiv.html(smTable.join(" "));
        }
    }
    function _resizeSummary($th, differWidth) {
        var grid = this;
        if (grid.summary) {
            var abbr = $th.attr('abbr'), width = $('div', $th).width(),
                dataCells = $('td[abbr="' + abbr + '"] > div', grid.summary);
            dataCells.width(width);
        }
    }
    //#endregion

    //#region 尝试聚焦行
    //function _tryHitFocusRow(grid) {
    //    var ops = grid.options,
    //        pageData = grid.pageData,
    //        data = pageData.data;
    //    console.log('pageData:', pageData);
    //    if (data && typeof data.pageIndex == 'number' && data.pageIndex != pageData.nowPage) {
    //        pageData.nowPage = data.pageIndex;
    //        grid._buildPager();
    //        data.pageIndex = null;
    //    }
    //    if (ops.keyFieldName && data && data.focuskey) {
    //        var keyField = ops.keyFieldName;
    //        var focuskey = data.focuskey;
    //        var rows = [];
    //        $(data.rows).each(function (i) {
    //            if (this[keyField] == focuskey) {
    //                rows.push(i);
    //            }
    //        });
    //        grid.setSelections(rows);
    //        data.focuskey = null;
    //        ops.extraData.focuskey = null;
    //    }
    //}
    //#endregion

    //#region 辅助函数
    function _checkKeyFieldName(grid) {
        grid.options.keyFieldName = grid.options.keyFieldName || '';
        if (grid.options.keyFieldName == '') {
            throw new Error('必须指定主键字段！');
        }
    }
    // 从表格配置中获取编辑配置
    function _getEditOptions(grid) {
        var ops = grid.options;
        var editOptions = ops.editOptions || {};
        editOptions.editors = editOptions.editors || {};
        editOptions.editors.colModel = editOptions.editors.colModel || grid._orgColModel || ops.colModel;
        editOptions.editors.onBeforeSave = editOptions.editors.onBeforeSave || editOptions.onBeforeSave || ops.onBeforeSave;
        editOptions.editors.onAfterSave = editOptions.editors.onAfterSave || editOptions.onAfterSave || ops.onAfterSave;
        editOptions.editors.updateUrl = editOptions.editors.updateUrl || editOptions.updateUrl;
        return editOptions;
    }
    function _resizeMutilRowEditTable($th, differWidth) {
        var self = this,
            $elem = self.element,
            abbr = $th.attr('abbr'),
            editTable = $('#' + $elem.prop('id') + '_edit_table'),
            w = $('td[abbr="' + abbr + '"]>div.innerCol', editTable).width();
        $('td[abbr="' + abbr + '"]>div.innerCol', editTable).width(w + differWidth);
    }
    // 修正列模型
    function _patchColModels(cms) {
        for (var i = 0, len = cms.length; i < len; i++) {
            var col = cms[i];
            if ($.isArray(cms[i])) {
                _patchColModels(cms[i]);
            } else {
                // 日期类型列如果没有指定renderer,自动创建一个，返回字符串格式的日期
                if (col.editor
                    && (col.editor.type == 'date' || col.editor.type == 'omCalendar')
                    && (typeof col.editor.name == 'undefined' || col.editor.name == col.name)) {
                    if (!col.renderer) {
                        var fmt = col.editor.dateFormat || col.dateFormat;
                        col.renderer = function (colValue, rowData, rowIndex) {
                            var dt = new Date(typeof colValue == 'string' ? (colValue || '').replace(/-/g, '/') : colValue);
                            return isNaN(dt) ? '' : $.omCalendar.formatDate(dt, fmt || 'yy-mm-dd H:i:s');
                        };
                    }
                }
            }
        }
    }
    //#endregion

    //#region omGrid插件：集成工具条、自定义查询面板
    $.omWidget.addInitListener('om.omGrid', function () {
        var self = this,
            grid = $(self.element).closest('.om-grid');
        //hDiv = self.thead.closest('.hDiv');
        // 在表格标题和表格列头之问题增加一个扩展区域
        if (!self.topDiv) {
            self.topDiv = $('<div class="topDiv"></div>');
            self.titleDiv.after(self.topDiv);
            self.base__resetHeight = self._resetHeight;
            self._resetHeight = function () {
                self.base__resetHeight();
                var h = grid.children('.bDiv').outerHeight(true);
                h -= self.topDiv.outerHeight(true);
                grid.children('.bDiv').outerHeight(h);
            }
        }
        //#region 工具条
        if (self.options.toolbar) {
            self.toolbarDiv = $('div.toolbarDiv', grid);
            if (self.toolbarDiv.length == 0) {
                //hDiv.addClass('toolbarwrap');
                //hDiv.prepend('<div class="toolbarDiv"></div>');
                self.topDiv.addClass("toolbarwrap");
                self.topDiv.prepend('<div class="toolbarDiv"></div>');
                self.toolbarDiv = $('div.toolbarDiv', grid);
            }
            self.toolbarDiv.empty();
            var $btns = $('<div class="toolbar"></div>').appendTo(self.toolbarDiv);
            $btns.omButtonbar(self.options.toolbar);
        }
        //#endregion

        //#region 自定义查询面板
        if (self.options.filterBox) {
            self.filterBox = $('div.filterBox', grid);
            if (self.filterBox.length == 0) {
                if (self.toolbarDiv) {
                    self.toolbarDiv.after('<div class="filterBox"></div>');
                } else {
                    //hDiv.prepend('<div class="filterBox"></div>');
                    self.topDiv.append('<div class="filterBox"></div>');
                }
                self.filterBox = $('div.filterBox', grid);
            }
            var fops = self.options.filterBox,
                fboxOps = {};
            fboxOps.autoFilter = typeof (fops.autoFilter) == 'undefined' ? false : fops.autoFilter;
            fboxOps.allowMultiFilterItem = typeof (fops.allowMultiFilterItem) == 'undefined' ? true : fops.allowMultiFilterItem;
            fboxOps.colModel = fops.colModel || self.options.colModel;
            fboxOps.onAddGroup = fboxOps.onDelGroup = function () { self.resize(); };
            fboxOps.onFilter = function (args) {
                var canFilter = true,
                    onFilter = self.options.onFilter,
                    onBeforeFilter = self.options.filterBox.onBeforeFilter;
                if (onBeforeFilter && onBeforeFilter.call(self, args) === false) {
                    canFilter = false;
                }
                if (canFilter) {
                    if (onFilter) {
                        onFilter.call(self, args);
                    } else {
                        var url = self.options.dataSource;
                        var temp = {};
                        temp[$.bdp.filterConfig.pnCustomFilter] = JSON.stringify(args);
                        self.options.extraData = $.extend(true, self.options.extraData || {}, temp);
                        self.setData(url);
                    }
                }
            };
            self.filterBox.bdpFilterBox(fboxOps);

            // 为自定义查询增加接口函数
            $.extend(this, {
                // 获取或设置条件面板的可见性
                fbShowing: function (visible) {
                    if (typeof visible == 'undefined') {
                        return $(this.filterBox).is(':visible');
                    }
                    if (visible) $(this.filterBox).show();
                    else $(this.filterBox).hide();
                    this.resize();
                    return visible;
                },
                // 切换自定义查询框显示或隐藏
                fbToggle: function () {
                    var self = this, b = self.fbShowing();
                    self.fbShowing(!b);
                }
            });
            // 是否自动显示出来
            this.fbShowing(fops.autoOpen || false);
        }
        //#endregion

        //#region 增加工具条和自定义查询面板后，解决控件尺寸调整问题
        // 重新设置一次尺寸
        if (self.options.toolbar || self.options.filterBox) {
            self.resize();
        }
        //#endregion
    });
    //#endregion

    //#region omGrid插件：实现批量更新，增加显示批量更新对话框
    $.omWidget.addInitListener('om.omGrid', function () {
        var self = this;
        // 注册一个刷新时事件处理函数，当前页重新调入后要恢复选中状态
        self.options._onRefreshCallbacks.push(function () {
            var ids = self.checkedRowIds;
            if (ids && $.isArray(ids) && ids.length > 0) {
                var rows = self.pageData.data.rows,
                    fn = self.options.keyFieldName,
                    indexes = [];
                $.each(rows, function (i, r) {
                    if (ids.indexOf(r[fn]) >= 0) indexes.push(i);
                });
                self.setSelections(indexes);
                self.checkedRowIds = undefined;
            }
        });

        $.extend(this, {
            //#region 批量更新数据
            batchUpdate: function () {
                var self = this, batOps = self.options.batchUpdater;
                if (!batOps) throw "没有提供批量更新参数(batchUpdater)";
                //if (!batOps.type) throw "批量更新参数中没有提供需要更新的实体类名（type）";

                if (!self.dlgBatchUpdater) {
                    batOps.colModel = batOps.colModel || self.options.colModel;
                    batOps.keyField = batOps.keyField || self.options.keyFieldName || '';
                    batOps._beforeExecute = batOps.beforeExecute;
                    batOps.beforeExecute = function (s) {
                        var dlg = this;
                        s.keyValues = [];
                        if (s.scope == 0 && batOps.keyField) {
                            var rows = self.getSelections(true);
                            $.each(rows, function (i, r) { s.keyValues.push(r[batOps.keyField] || '') });
                            self.checkedRowIds = s.keyValues;
                        }
                        s.customFilter = null;
                        if (self.options.filterBox && self.filterBox)
                            s.customFilter = self.filterBox.bdpFilterBox('getFilters');
                        if (batOps._beforeExecute)
                            return batOps._beforeExecute.call(dlg, s);
                    };
                    batOps._afterExecute = batOps.afterExecute;
                    batOps.afterExecute = function (ajaxResult) {
                        if (ajaxResult.Succeed) {
                            self.reload();
                        }
                        batOps._afterExecute && batOps._afterExecute(ajaxResult);
                    }
                    self.dlgBatchUpdater = $('<div></div>')
                        .prop('id', $(self.element).prop('id') + '_dlgbat')
                        .appendTo($('body'))
                        .bdpBatchUpdate(batOps);
                }
                var c = 0;
                if (!self.options.singleSelect)
                    c = self.getSelections().length;
                self.dlgBatchUpdater.bdpBatchUpdate('open', c);
            },
            //#endregion

            done: true
        });
    });
    //#endregion

    //#region 仿Excel
    function exCheckCell(grid, td, editing) {
        var fn = $(td).attr('abbr') || '';
        var cm = fn == '' ? null : $.grep(grid.options.colModel, function (c, i) { return c.name == fn; })[0];
        exLeaveCell(grid);
        if (!cm || (cm.editor && (cm.editor.editable == false))) {
            $(td).addClass('exCantEditCell');
            return;
        }
        $(td).addClass('exEditableCell');
        if (editing) {
            var edDiv = $(td).find('div.exInnerEditor');
            if (edDiv.size() == 0) {
                var $elem = grid.element,
                    allTrs = grid._getTrs(),
                    $tr = $(td).closest('tr.om-grid-row'),
                    trIndex = allTrs.index($tr),
                    rowData = grid._EditingRowData[trIndex] || {};
                var prefix = $elem.prop('id') + '_' + $tr.attr('_grid_row_id');
                edDiv = $('<div class="exInnerEditor"></div>').appendTo($(td));
                edDiv.on('click', function (event) { event.stopPropagation(); });
                cm.editor = cm.editor || {};
                cm.editor.createErrorPlace = false;
                _createCellCtrl(edDiv, cm, prefix);
                edDiv.bdpEditCtrl('setValue', rowData);
                edDiv.data('edinfo', { cInfo: cm, rowData: rowData, trIndex: trIndex, fn: fn });
            } else {
                var rd = edDiv.data('edinfo').rowData;
                edDiv.bdpEditCtrl('setValue', rd);
            }
            $(td).find('div.innerCol').hide();
            $(td).find('div.exLastValue').hide();
            edDiv.show();
            edDiv.find('input').focus();
        }
    }
    function exLeaveCell(grid) {
        grid.tbody.find('td.exEditableCell,td.exCantEditCell')
            .each(function () {
                var $td = $(this);
                $td.removeClass('grid-cell-dirty');
                var edDiv = $td.find('div.exInnerEditor');
                var edInfo = edDiv.data('edinfo');
                if (edInfo) {
                    edInfo.rowData[edInfo.fn] = edDiv.bdpEditCtrl('getValue');
                    var lvDiv = $td.find('div.exLastValue');
                    if (lvDiv.size() == 0) {
                        lvDiv = $td.find('div.innerCol').clone().removeClass('innerCol').addClass('exLastValue').empty().appendTo($td);
                    }
                    var doc = exGetCellValue(edInfo.cInfo, edInfo.rowData, edInfo.trIndex);
                    lvDiv.html(doc).show();
                    var oldValue = (grid._getRowData(edInfo.trIndex) || {})[edInfo.fn] || '';
                    var newValue = edInfo.rowData[edInfo.fn] || ''
                    if (oldValue != newValue) {
                        $td.addClass('grid-cell-dirty');
                    }
                } else {
                    $td.find('div.innerCol').show();
                }
                edDiv.hide();
                $td.removeClass('exEditableCell').removeClass('exCantEditCell');
            });
    }
    function exCancelEdit(grid) {
        exLeaveCell(grid);
        grid.tbody.find('div.exLastValue').each(function () {
            var $td = $(this).closest('td[abbr]');
            $td.find('div.innerCol').show();
            $td.find('div.exLastValue').remove();
            $td.find('div.exInnerEditor').remove();
            $td.removeClass('grid-cell-dirty');
        });
    }
    function exGetCellValue(cm, rowData, rowIndex) {
        var v = rowData[cm.name] == undefined ? "" : rowData[cm.name];
        var r = cm.renderer;
        if (typeof r === 'function') {
            v = r(v, rowData, rowIndex);
        }
        return v;
    }
    function exUpdateEdit(grid, onSuccess) {
        exLeaveCell(grid);
        var ops = _getEditOptions(grid);
        var onBeforeSave = ops.onBeforeSave;
        var args = {
            cancel: false,
            processUrl: '',
            values: []
        };
        var process = ops.updateUrl || '';
        if (process != '') {
            if (typeof process == 'function') {
                process = process.call(grid) || '';
            }
            args.processUrl = process;
        }

        grid._getTrs().each(function (trIndex) {
            var oldRow = grid._getRowData(trIndex) || {};
            var newRow = grid._EditingRowData[trIndex] || {};
            var trValue = {
                oldValues: $.extend({}, oldRow),
                newValues: $.extend({}, newRow)
            };
            args.values.push(trValue);
        });
        if (onBeforeSave) {
            onBeforeSave.call(grid, args);
        }
        if (!args.cancel && args.processUrl != '') {
            $.ajax({
                type: 'POST',
                url: args.processUrl,
                async: false,
                data: JSON.stringify(args.values),
                success: function (strResult) {
                    var res = $.parseJSON(strResult) || {};
                    if (res.Succeed) {
                        grid.cancelEdit();
                        grid.reload();
                        if (onSuccess) onSuccess(res);
                        $.omMessageTip.show({
                            type: 'success', title: '成功',
                            content: '保存成功!',
                            timeout: 3000
                        });
                    } else {
                        $.omMessageTip.show({
                            type: 'error', title: '失败', timeout: 3000,
                            content: '操作失败!' + (res ? res.Message : '')
                        });
                    }
                }
            });
        } else {
            grid.cancelEdit();
        }
    }
    //#endregion


})(jQuery);
//#endregion

