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
/* www.51uns.com
功能：
    用户编辑相关的功能，主要提供了3个编辑类控件：
    1. bdpEditCtrl  基础编辑元素：一个标签，一个录入框
    2. bdpEditPanel 编辑面板，面板上放了n多个bdpEditCtrl
    3. bdpEditor    编辑对话框：弹出框里放了一个bdpEditPanel面板

依赖：
    bdp-base.js
    jQuery
    operamasks-ui

www.51uns.com
*/
; (function ($) {

    //#region 编辑控件 bdpEditCtrl
    /* 在一个元素内创建编辑控件    */
    $.omWidget('bdp.bdpEditCtrl', {
        options: {
            // 列（字段、属性）信息，与表格列模型中的一列对应. 必须
            //columnInfo: false,
            // ID前缀，需要给某控件命名时的前缀
            idPrefix: '',
            // 是否创建错误提示列
            createErrorPlace: true,

            //支持统一的值改变事件
            //function(target, newValue, oldValue, event)
            //参数：
            //  target - 当前输入框对象
            //  newValue - 选择的新值
            //  oldValue - 原来的值
            //  event - jQuery.Event对象。
            onValueChanged: false
            // 编辑控件创建事件，适用于自定义控件
            //onCreateEditControl: function (ctrlId, cm, parent) { }
            //值设置事件，通过 this.editControl访问编辑控件
            //onSetValue: function(cm, value){}
            //值获取事件，通过 this.editControl访问编辑控件
            //onGetValue: function(cm){}
        },
        // editCell
        // errorCell
        // editControl
        // oldValue
        _create: function () {
            //if (!this.options.columnInfo) return;
            var //editor = this.options.columnInfo,
                //ctrlId = this.options.idPrefix + '_' + editor.name,
                $elem = this.element;
            var html = "<table cellpadding='0' cellspacing='0' border='0' "
                + "style='width:100%;border:0;margin:0;'><tr>"
                + "<td style='padding: 1px 5px 1px 2px; vertical-align: middle;border: 0'></td>"
                + "</tr></table>";
            $elem.append(html);
            this.editCell = $elem.find('td').first();
            if (this.options.createErrorPlace) {
                this.errorCell = $("<td style='padding-right:3px; width: 24px; "
                    + "vertical-align:middle;border:0;text-align:center'>"
                    + "<div class='bdpEditFormError'></div></td>")
                    .insertAfter(this.editCell);
                this.errorCell.find('div.bdpEditFormError').hide();
            }
            this._loaded = true;
        },
        _init: function () {
            var self = this,
                cm = this.options,
                td = this.editCell,
                ctrl = null;
            cm.editor = cm.editor || {};
            cm.editor.options = cm.editor.options || {};
            cm.editor.name = cm.editor.name || cm.name;
            var editor = cm.editor,
                ctrlId = cm.idPrefix + '_' + editor.name;
            this.ctrlId = ctrlId;
            if (this.errorCell)
                this.errorCell.find('div.bdpEditFormError').attr('for', ctrlId);
            td.attr('title', editor.hint || '');
            if (cm.align) td.css('text-align', cm.editor.align || cm.align);
            if (!cm.wrap) td.attr('nowrap', true);
            td.empty();

            // 检查数据权限
            if (editor.editable && typeof $.ACP_CanEnable === 'function') {
                editor.editable = $.ACP_CanEnable('@' + editor.name);
            }

            // 先检查是否用户自己接管了创建
            var creator = editor.onCreateEditControl || cm.onCreateEditControl;
            if (creator) {
                // 传递给自定义创建过程的参数：控件id,列模型,上级对象
                ctrl = creator(ctrlId, cm, td);
                self._isCustomCtrl = ctrl != null;
            }
            if (ctrl == null) {
                if (!editor.editable) {
                    switch (editor.type) {
                        case "image":
                            ctrl = this._createImageEditor(ctrlId, editor, td);
                            break;
                        default:
                            // 不允许编辑则生成一个span
                            ctrl = $('<span class="noinput"></span>').prop('id', ctrlId)
                                .attr({ name: cm.name || ctrlId }).width('100%')
                                .appendTo(td);
                            if (!cm.wrap) ctrl.css('white-space', 'nowrap');
                            break;
                    }
                } else {
                    switch (editor.type) {
                        case 'omCombo':
                        case 'combo':
                            ctrl = this._createComboBox(ctrlId, editor, td);
                            break;
                        case "omCalendar":
                        case "date":
                            ctrl = this._createDatePicker(ctrlId, editor, td);
                            break;
                        case "omNumberField":
                        case "number":
                            ctrl = this._createNumberEditor(ctrlId, editor, td);
                            break;
                        case "omSuggestion":
                        case "sug":
                            ctrl = this._createSuggestionEditor(ctrlId, editor, td);
                            break;
                        case "checkbox":
                            ctrl = this._createCheckboxEditor(ctrlId, editor, td);
                            break;
                        case "radio":
                            ctrl = this._createRadioEditor(ctrlId, editor, td);
                            break;
                        case "combotree":
                            ctrl = this._createComboTreeEditor(ctrlId, editor, td);
                            break;
                        case "stepwise":
                            ctrl = this._createStepwiseSelector(ctrlId, editor, td);
                            break;
                        case "memo":
                        case "multirow":
                            ctrl = this._createMultiRowEditor(ctrlId, editor, td);
                            break;
                        case "refer":
                            ctrl = this._createReferEditor(ctrlId, editor, td);
                            break;
                        case "image":
                            ctrl = this._createImageEditor(ctrlId, editor, td);
                            break;
                    }
                }
            }
            if (ctrl == null) {
                ctrl = $('<input type="' + (editor.password ? 'password' : 'text') + '" />').prop('id', ctrlId).appendTo(td)

                    .addClass('om-state-light')
                    .css({ width: '100%', 'text-indent': '2px', 'box-sizing': 'border-box' })
                    //.addClass('om-widget-content om-state-default om-state-nobg')
                    //.attr('type', editor.password ? 'password' : 'text')    //IE不支持修改type
                    .attr({ name: editor.name });
                //ctrl.wrap('<span class="om-widget om-state-default"></span>');
                ctrl.change(function () { self._valueChanged.call(self, this); });
            }
            //ctrl.click(function (event) {
            //    //阻止事件冒泡
            //    event.stopPropagation();
            //});
            this.editControl = ctrl;

            // 触发编辑控件初始化事件
            var initor = editor.onInitEditControl || cm.onInitEditControl;
            if (initor) {
                initor(ctrl, cm);
            }
        },

        //#region 生成编辑控件

        //#region 生成图片编辑器
        /* editor中支持的参数:
            height:100, //图片高度
            width:120,  //图片宽度
            buttonText:'上传',    //上传按钮文本
            action:getCommonDataUrl('FileUploader'),    //服务端接受地址, 必须返回AjaxResult对象，其中Data属性为上传成功的文件地址数组。
            uploadPath:'temp/images',   // 图片上传地址
            // 如果指定此参数，表明要在客户端压缩后再上传
            resizeImage:{
                quality: 0.7    // 图片质量
                width:      // 压缩后的宽度
                height:     // 压缩后的高度，一般不指定，根据width自动等比例缩放
            }
            // 原样传到后台的参数
            extraData:{ 
                path: 'temp/images',    // 文件保存地址, 同uploadPath
                thum    创建缩略图，指定缩略大小，逗号创建的数值，若为空或0，表示不创建缩略图
            }, //附加数据，json对象
            timeout: 0,     //超时时间
        */
        _createImageEditor: function (ctrlId, editor, $cell) {
            var self = this, $ins = $('<input type="hidden" />').prop('id', ctrlId);
            var ht = [];
            ht.push('<div class="bdpImageEditor">');
            ht.push('<div><img id="', ctrlId + '_img', '" style="width:', editor.width || 120, 'px;height:', editor.height || 100, 'px" /></div>');
            ht.push('<div style="position:relative;">');
            // class中有ignore才不会被验证
            ht.push('<input type="file" class="ignore" unselectable="on" id="', ctrlId + '_file', '" name="', editor.name, '" accept="', editor.fileType || 'image/*', '" />');
            //ht.push('<button type="button" id="', ctrlId + '_uploader', '" style="width:120px;height:22px; display:', editor.editable ? 'block' : 'none', '">', editor.buttonText || '上传', '</button>');
            ht.push('</div>');
            ht.push('</div>');
            $cell.append(ht.join('')).append($ins);
            $cell.find('#' + ctrlId + '_file')
                .css({
                    "display": editor.editable ? 'block' : 'none'
                })
                .click(function () { $(this).val(''); })
                .change(function (event) {
                    try {
                        if (($(this).val() || '') == '') return;
                        $fileElement = $(this);
                        // 如果设置了图片大小限制则检查
                        if (editor.imageMaxSize && event.target) {
                            var limitSize = parseInt(editor.imageMaxSize) || 2048000;
                            var fileSize = 0;
                            try {
                                if ($.browser.msie && !event.target.files) {
                                    var filePath = event.target.value;
                                    var fileSystem = new ActiveXObject("Scripting.FileSystemObject");
                                    var file = fileSystem.GetFile(filePath);
                                    fileSize = file.Size;
                                } else {
                                    fileSize = event.target.files[0].size;
                                }
                            } catch (e) { }
                            if (fileSize > limitSize) {
                                $.omMessageBox.alert({ content: '上传文件尺寸不允许超过 ' + parseInt(limitSize / 1024 / 1024) + 'm.' });
                                $(this).val('');
                                return false;
                            }
                        }

                        $.omMessageBox.waiting({
                            title: '等待',
                            content: '<label class="msglabel">正在上传，请稍候...</label><br/><br/><div class="progress" style="min-width:300px;"></div><br/>'
                        });
                        var progress = $('.om-messageBox-content div.progress');
                        var postData = editor.extraData || { thum: '64' };
                        if (window.applicationCache) {
                            if (editor.resizeImage && window.lrz) {
                                // 客户端压缩后再上传
                                lrz($fileElement.get(0).files[0], editor.resizeImage, function (fileData) {
                                    postData.base64 = fileData.base64;
                                    postData.filename = fileData.name || $fileElement.get(0).files[0].name;
                                    postData.filetype = fileData.type || '';
                                    postData.filesize = fileData.size || 0;
                                    $.post(editor.action || getCommonDataUrl('FileUploader', { path: editor.uploadPath || 'temp/images' }),
                                        postData,
                                        function (data) {
                                            $.omMessageBox.waiting('close');
                                            if (data.Succeed && data.Data && data.Data.length > 0) {
                                                var src = data.Data[0];
                                                $ins.val(src);  // 保存相对地址
                                                if (src.startsWith('~/')) src = ROOT_PATH + src.substring(2);
                                                //$('#' + ctrlId + '_img').attr('src', self._getThumbnailFile(src, postData.thum));
                                                $('#' + ctrlId + '_img').attr('src', src);
                                                self._valueChanged.call(self, self);
                                            }
                                            $.omMessageTip.show({ content: '上传完成！' + (data.Message || ''), timeout: 3000 });
                                        }, 'json');
                                });
                            } else {
                                // h5上传原文件
                                $.fileUpload({
                                    url: editor.action || getCommonDataUrl('FileUploader', { path: editor.uploadPath || 'temp/images' }),
                                    file: $fileElement.get(0).files[0],
                                    data: postData,
                                    onProgress: function (event) {
                                        if (event.lengthComputable) {
                                            var percentComplete = Math.round(event.loaded * 100 / event.total);
                                            progress.omProgressbar({ value: percentComplete });
                                        }
                                    },
                                    onComplete: function (event) {
                                        $.omMessageBox.waiting('close');
                                        var data = JSON.parse(event.target.responseText);
                                        if (data.Succeed && data.Data && data.Data.length > 0) {
                                            var src = data.Data[0];
                                            $ins.val(src);  // 保存相对地址
                                            if (src.startsWith('~/')) src = ROOT_PATH + src.substring(2);
                                            //$('#' + ctrlId + '_img').attr('src', self._getThumbnailFile(src, postData.thum));
                                            $('#' + ctrlId + '_img').attr('src', src);
                                            self._valueChanged.call(self, self);
                                        }
                                        $.omMessageTip.show({ content: '上传完成！' + (data.Message || ''), timeout: 3000 });
                                    },
                                    onFailed: function (event) {
                                        $.omMessageBox.waiting('close');
                                    }
                                });
                            }
                        } else {
                            // 不支持h5的浏览器上传
                            $.ajaxFileUpload({
                                url: editor.action || getCommonDataUrl('FileUploader', { path: editor.uploadPath || 'temp/images' }),
                                secureuri: false,   //是否加密地址
                                fileElementId: $fileElement.prop('id'),
                                // 传一些附加值回去
                                data: postData,
                                dataType: 'json',
                                timeout: editor.timeout || 0,
                                global: false,  // ajax全局事件?
                                success: function (data, status) {
                                    $.omMessageBox.waiting('close');
                                    if (data.Succeed && data.Data && data.Data.length > 0) {
                                        var src = data.Data[0];
                                        $ins.val(src);  // 保存相对地址
                                        if (src.startsWith('~/')) src = ROOT_PATH + src.substring(2);
                                        //$('#' + ctrlId + '_img').attr('src', self._getThumbnailFile(src, postData.thum));
                                        $('#' + ctrlId + '_img').attr('src', src);
                                        self._valueChanged.call(self, self);
                                    }
                                    $.omMessageTip.show({ content: '上传完成！' + (data.Message || ''), timeout: 3000 });
                                },
                                complete: function (data, status) {
                                    $.omMessageBox.waiting('close');
                                },
                                error: function (data, status, e) {
                                    $.omMessageBox.waiting('close');
                                    $.omMessageTip.show({ content: '上传异常！' + (status || ''), timeout: 3000 });
                                }
                            });
                        }
                    } catch (e) {
                        $.omMessageBox.waiting('close');
                    }
                });
            /*  在IE10以上或非IE浏览器，触发file的单击事件即可以选择文件。
                但是，在IE10以下版本，浏览器安全要求file必须是手工单击，
                js触发选择的文件将不允许上传。
                解决的技巧是：file透明且定位在按钮之上，用户看起来像点击
                按钮，实际上是点击file.
                但是，这种方式在IE8下面也有问题，因为IE8下的file只能点击
                “浏览”选择文件。

                所以算了，还是原样用file吧
            */
            ////$cell.find('#' + ctrlId + '_uploader').click(function () {
            ////    $('#' + ctrlId + '_file').val('').trigger('click');
            ////});
            //$cell.find('#' + ctrlId + '_uploader')
            //    .on('mouseenter', function () {
            //        $('#' + ctrlId + '_file')
            //            .show()
            //            .width(130)
            //            .height(20);
            //    })
            //    .on('mouseleave', function () {
            //        //$('#' + ctrlId + '_file').hide();
            //    });
            return $ins;
        },
        //#endregion

        // 生成参考框编辑器
        _createReferEditor: function (ctrlId, editor, $cell) {
            var self = this,
                $ins = $('<input />').prop('id', ctrlId)
                    .attr('name', editor.name).width('100%')
                    .css({ 'margin-right': '-20px' })
                    .appendTo($cell);
            var ops = editor.options || {};
            ops.width = ops.width || '100%';
            ops.dialog = ops.dialog || {};
            ops.dialog.title = ops.dialog.title || editor.caption || self.options.header || '编辑';
            ops.dialogId = 'referDialog_' + ctrlId;  // editor.name;

            //$ins.change(function () { self._valueChanged.call(self, this); });
            self._onValueChanged = ops.onValueChanged || editor.onValueChanged;
            ops.onValueChanged = function (target, newValue, oldValue) {
                self._valueChanged.call(self, target);
            };
            var c = $ins.bdpReferEdit(ops);

            $ins.closest('span').width('100%');
            return c;
        },
        // 生成多行编辑框 
        _createMultiRowEditor: function (ctrlId, editor, $cell) {
            var self = this,
                $ins = $("<textarea  style='box-sizing: border-box;'></textarea>").prop('id', ctrlId)
                    .addClass('om-widget om-state-default om-state-nobg om-state-light')
                    .attr("name", editor.name)
                    .width('100%')
                    .appendTo($cell);

            //$ins.attr("cols", editor.cols || 0);
            $ins.attr("rows", editor.rows || 5);

            if (typeof (editor.scrollY) == "undefined" || editor.scrollY)
                $ins.css("overflow-y", "scroll");
            if (editor.scrollX)
                $ins.css("overflow-x", "scroll");
            $ins.css("resize", editor.resize || "both");

            $ins.change(function () { self._valueChanged.call(self, this); });
            return $ins;
        },
        // 生成下拉树
        _createComboTreeEditor: function (ctrlId, editor, $cell) {
            var self = this,
                $ins = $('<input />').prop('id', ctrlId)
                    .attr({ name: editor.name })
                    .css({ 'margin-right': '-20px', width: '100%' })
                    .appendTo($cell);
            var ops = editor.options || {};
            ops.width = ops.width || '100%';
            ops.droplistId = "CTDL_" + editor.name;
            self._onValueChanged = ops.onValueChanged || editor.onValueChanged;
            ops.onValueChanged = function (target, newValue, oldValue) {
                self._valueChanged.call(self, target);
            };
            var c = $ins.bdpComboTree(ops);
            $ins.closest('span').css({ width: '100%', 'box-sizing': 'border-box' });
            return c;
        },
        // 生成树形表逐步选择器
        _createStepwiseSelector: function (ctrlId, editor, $cell) {
            var self = this,
                $ins = $('<input />').prop('id', ctrlId)
                    .attr({ name: editor.name }).width('100%')
                    .appendTo($cell);
            var ops = editor.options || {};
            self._onValueChanged = ops.onValueChanged || editor.onValueChanged;
            ops.onValueChange = ops.onValueChanged = function (target, newValue, oldValue) {
                self._valueChanged.call(self, target);
            };
            var c = $ins.bdpStepwiseSelector(ops);
            return c;
        },
        //生成复选框 checkbox 
        _createCheckboxEditor: function (ctrlId, editor, $cell) {
            var self = this,
                ops = editor.options || {};
            var title = ops.title || '';
            var span = $('<span></span>').width('100%')
                .addClass('bdpCheckbox')
                .appendTo($cell);
            var label = $('<label></lable>')
                .attr('for', ctrlId)
                .html(title)
                .appendTo(span);
            var $ins = $('<input type="checkbox" />').prop('id', ctrlId)
                //.attr({ type: 'checkbox', name: editor.name })    //IE不支持修改type
                .attr({ name: editor.name })
                .appendTo(span);
            $ins.change(function () { self._valueChanged.call(self, this); });
            return $ins;
        },
        //生成单选框
        _createRadioEditor: function (ctrlId, editor, $cell) {
            var self = this,
                ops = editor.options || {};
            var pdiv = $('<div></div>').width('100%')
                .addClass('bdpRadioList')
                .appendTo($cell);
            var data = ops.dataSource || editor.dataSource;
            var ft = ops.textField || 'text';
            var fv = ops.valueField || 'value';
            if (typeof data == 'string') {
                jdpExec(data, function (res) {
                    if ($.isArray(res)) {
                        data = res;
                    } else if (res.Succeed && res.Data) {
                        data = $.makeArray(res.Data);
                    }
                });
            }
            if ($.isArray(data)) {
                $.each(data, function (i, item) {
                    pdiv.append('<label><input type="radio" value="' + item[fv] + '" name="' + editor.name + '" />' + (item[ft] || '') + '</label>');
                });
                pdiv.find('input[value="' + self.oldValue + '"]').prop('checked', true);
                pdiv.on('click', 'label', function () {
                    self._valueChanged.call(self, this);
                });
            }
            return pdiv;
        },
        //生成自动提示的输入框 
        _createSuggestionEditor: function (ctrlId, editor, $cell) {
            var self = this,
                $ins = $('<input />').prop('id', ctrlId)
                    .attr({ name: editor.name }).width('100%')
                    .appendTo($cell);

            var ops = editor.options || {};
            ops.width = ops.width || '100%';

            self._onValueChanged = ops.onValueChanged || editor.onValueChanged;
            $ins.change(function () { self._valueChanged.call(self, this); });
            ops.onSelect = function (text, rowData, index, event) {
                self._valueChanged.call(self, this);
            };
            var c = $ins.omSuggestion(ops);

            return c;
        },
        //生成数值输入框 
        _createNumberEditor: function (ctrlId, editor, $cell) {
            var self = this,
                $ins = $('<input />').prop('id', ctrlId)
                    .attr({ name: editor.name }).addClass('om-state-light').width('100%').css({ 'padding-left': '2px', 'box-sizing': 'border-box' })
                    .appendTo($cell);

            var ops = editor.options || {};
            ops.width = ops.width || '100%';

            self._onValueChanged = ops.onValueChanged || editor.onValueChanged;
            ops.onBlur = function (data, event) {
                self._valueChanged.call(self, this);
            };
            var c = $ins.omNumberField(ops);

            return c;
        },
        //生成日期控件
        _createDatePicker: function (ctrlId, editor, $cell) {
            var self = this,
                $ins = $('<input />').prop('id', ctrlId)
                    .attr({ name: editor.name })
                    .css({ 'margin-right': '-22px', width: '100%', 'padding-left': '2px', 'background': 'transparent' })
                    .appendTo($cell);
            var ops = editor.options || {};
            ops.width = ops.width || '100%';

            self._onValueChanged = ops.onValueChanged || editor.onValueChanged;
            self._onSelect = ops.onSelect;
            ops.onSelect = function (date, event) {
                self._onSelect && self._onSelect.call(this, date, event);
                $ins.omCalendar('setDate', date);
                self._valueChanged.call(self, this);
            };
            var c = $ins.omCalendar(ops);
            $ins.closest('span').css({ width: '100%', 'background': '#fff', 'box-sizing': 'border-box' });
            $ins.closest('span').addClass('om-state-light');
            return c;
        },
        // 生成下拉框控件
        _createComboBox: function (ctrlId, editor, $cell) {
            var self = this,
                $ins = $('<input />').prop('id', ctrlId)
                    .attr({ name: editor.name })
                    .css({ 'margin-right': '-20px', width: '100%', 'padding-left': '2px', 'background': 'transparent' })
                    .appendTo($cell);
            var ops = editor.options || {};
            ops.width = ops.width || '100%';
            self._onValueChanged = ops.onValueChanged || editor.onValueChanged;
            ops.onValueChange = function (target, newValue, oldValue) {
                self._valueChanged.call(self, target);
            };
            self._onSuccess = ops.onSuccess;
            ops.onSuccess = function (data, textStatus, event) {
                $ins.omCombo('value', typeof self.oldValue == 'undefined' ? '' : self.oldValue + '');
                if (self._onSuccess) {
                    return self._onSuccess.call($ins.element, data, textStatus, event)
                }
            };
            ops.listAutoWidth = typeof ops.listAutoWidth == 'undefined' ? true : ops.listAutoWidth;
            ops.editable = typeof ops.editable == 'undefined' ? false : ops.editable;
            var c = $ins.omCombo(ops);
            c.closest('span.om-combo').css({ width: ops.width, 'box-sizing': 'border-box' });
            //omCombo由于原来的input被隐藏了，为了可以校验，要把id和name移到显示的那个代理input
            $ins.next("input").attr({ id: $ins.prop("id"), name: $ins.prop("name") });
            $ins.attr({ id: "", name: "" });
            $ins.next("input").css({ width: '100%' });
            $ins.closest('span').css({ 'background': '#fff' });
            $ins.closest('span').addClass('om-state-light');
            return c;
        },
        //#endregion

        //#region 值改变事件
        _valueChanged: function (target) {
            if (!this.loaded()) return;
            this.modified = true;
            var self = this,
                ops = self.options,
                oldValue = self.oldValue,
                newValue = self.getValue();
            if (self._onValueChanged) {
                self._onValueChanged(target, newValue, oldValue);
            } else {
                ops.editor = ops.editor || { name: ops.name };
                var f = ops.editor.onValueChanged || ops.onValueChanged;
                if (f) f(target, newValue, oldValue);
            }
        },

        //#endregion

        //#region 内部函数

        _getDisplayText: function (cm, value) {
            var displayText = "";
            if (value != null) {
                switch (cm.editor.type) {
                    case "omCalendar":
                    case "date":
                        //if (typeof (value) === "object") {
                        //    if ($.isEmptyDate(value)) displayText = "";
                        //    else {
                        //        cm.editor.options = cm.editor.options || {};
                        //        var fmt = cm.editor.options.dateFormat || cm.editor.dateFormat || cm.dateFormat || "yy-mm-dd H:i:s";
                        //        displayText = $.formatDate(value, fmt);
                        //    }
                        //} else {
                        //    displayText = value;
                        //}
                        var fmt = cm.editor.options.dateFormat
                            || cm.editor.dateFormat
                            || cm.dateFormat
                            || "yy-mm-dd H:i:s";
                        displayText = $.formatDate(value, fmt);
                        break;
                    case "checkbox":
                        displayText = value ? "是" : "否";
                        break;
                    case "memo":
                    case "multirow":
                    case "refer":
                        displayText = "<pre>" + value + "</pre>";
                        break;
                    case "number":
                        var v = parseFloat(value);
                        if (isNaN(v)) v = 0;
                        var f = cm.editor.displayFormat || cm.displayFormat || '';
                        displayText = v.fmt(f);
                        break;
                    default:
                        displayText = value;    //.toString();
                        break;
                }
            }
            return displayText;
        },

        //#endregion

        //#region 接口函数
        // 给编辑控件设置值，data可以是一个具体值，也可以是一个对象
        setValue: function (data) {
            var $ctrl = this.editControl,
                //cm = this.options.columnInfo,
                cm = this.options,
                name = cm.editor.editable ? cm.editor.name : cm.name,
                value = (data != null && typeof data == 'object') ? data[name] : data;
            if (typeof value == 'undefined' || value == null) {
                value = '';
            }

            if ($ctrl && $ctrl.length > 0) {
                var r = cm.editor.renderer;
                if (r && typeof (r) == "function") { value = r(cm, value, data); }

                if (cm.editor.onSetValue) {
                    cm.editor.onSetValue.call(this, cm, value);
                } else if (!cm.editor.editable && !(cm.editor.type == 'image')) {
                    var displayText = this._getDisplayText(cm, value);
                    try {
                        $ctrl.html(displayText);    //IE8会报错
                    } catch (err) {
                        $ctrl[0].innerHTML = displayText;
                    }
                } else {
                    switch (cm.editor.type) {
                        case 'omCombo':
                        case 'combo':
                            $ctrl.omCombo('value', value);
                            break;
                        case "omCalendar":
                        case "date":
                            cm.editor.options = cm.editor.options || {};
                            var fmt = cm.editor.options.dateFormat || cm.editor.dateFormat || cm.dateFormat || "yy-mm-dd H:i:s";
                            value = $.parseDate(value, fmt);
                            if ($.isEmptyDate(value)) {
                                $ctrl.omCalendar('setDate', new Date());
                            } else {
                                $ctrl.omCalendar('setDate', value);
                            }
                            var displayText = $.isEmptyDate(value) ? "" : $.formatDate(value, fmt);
                            $ctrl.val(displayText);
                            break;
                        case "checkbox":
                            $ctrl.prop('checked', value);
                            break;
                        case "radio":
                            $ctrl.find('input[value="' + value + '"]').prop('checked', true);
                            break;
                        case "combotree":
                            $ctrl.bdpComboTree('value', value);
                            var s = value;
                            if (typeof (data) == 'object' && cm.name != name) {
                                s = data[cm.name] || value;
                            }
                            $ctrl.bdpComboTree('text', s);
                            break;
                        case "stepwise":
                            $ctrl.bdpStepwiseSelector('value', value);
                            break;
                        case "omNumberField":
                        case "number":
                        case "omSuggestion":
                        case "sug":
                        case "text":
                            $ctrl.val(value);
                            break;
                        case "refer":
                            $ctrl.bdpReferEdit('value', value);
                            txt = typeof (data) == 'object' ? (data[cm.name] || '') : data;
                            $ctrl.bdpReferEdit('text', txt);
                            break;
                        case "image":
                            $ctrl.val(value);
                            var src = value;
                            if (src && src.startsWith('~/')) src = ROOT_PATH + src.substring(2);
                            $('#' + $ctrl.prop('id') + '_img').attr('src', src);
                            break;
                        case "memo":
                        case "multirow":
                        default:
                            $ctrl.val(value);
                            break;
                    }
                }
            }
            this.oldValue = value;
            this.modified = false;
        },
        // 获取当前编辑控件中的最新值
        getValue: function () {
            var self = $(this),
                $ctrl = this.editControl,
                //cm = this.options.columnInfo,
                cm = this.options,
                value = this.oldValue;
            var isSpecType = ['checkbox', 'omCombo', 'combo'].indexOf(cm.editor.type) >= 0;
            if ($ctrl && (this.modified || (cm.editor.editable && isSpecType) || this._isCustomCtrl)) {
                if (this._isCustomCtrl) {
                    if (cm.editor.onGetValue)
                        value = cm.editor.onGetValue.call(this, cm);
                } else if (!cm.editor.editable) {
                    value = $ctrl.text();
                } else {
                    switch (cm.editor.type) {
                        case 'omCombo':
                        case 'combo':
                            value = $ctrl.omCombo('value');
                            break;
                        case "omCalendar":
                        case "date":
                            value = $ctrl.omCalendar('getDate');
                            if ($.isEmptyDate(value)) value = null;
                            break;
                        case "omNumberField":
                        case "number":
                            value = $ctrl.val();
                            break;
                        case "omSuggestion":
                        case "sug":
                            value = $ctrl.val();
                            break;
                        case "checkbox":
                            value = $ctrl.prop('checked');
                            break;
                        case "radio":
                            value = $ctrl.find('input:checked').val();
                            break;
                        case "combotree":
                            value = $ctrl.bdpComboTree('value');
                            break;
                        case "stepwise":
                            value = $ctrl.bdpStepwiseSelector('value');
                            break;
                        case "refer":
                            value = $ctrl.bdpReferEdit('value');
                            break;
                        case "memo":
                        case "multirow":
                        //value = $ctrl.text();
                        //break;
                        default:
                            value = $ctrl.val();
                            break;
                    }
                }
            }
            return typeof value == 'undefined' ? null : value;
        },
        //获取新值和原来的值, 结果为对象，包括oldValue和newValue
        getValueRec: function () {
            return { oldValue: this.oldValue || '', newValue: this.getValue() };
        },
        getCtrl: function () {
            return this.editControl;
        },
        loaded: function (v) {
            if (typeof v == 'undefined')
                return this._loaded;
            this._loaded = v;
        },
        // 获取或设置编辑器中的值
        value: function (v) {
            if (typeof (v) == "undefined")
                return this.getValue();
            this.setValue(v);
        },
        // 获取或设置是否允许编辑
        enabled: function (b) {
            var oldB = this.options.editor ? this.options.editor.editable : false;
            if (typeof (b) == 'undefined')
                return oldB;
            if (oldB != b) {
                if (this.options.editor) this.options.editor.editable = b;
                else this.options.editor = { editable: b };
                this._init();
            }
        },
        //#endregion

        done: true
    });
    //#endregion

    //#region 对象编辑面板 bdpEditPanel
    $.validator.addMethod('Uniqued', function (value, element, params) {
        var editPanel = params.editPanel || null;
        if (editPanel && params.validFunc) {
            return params.validFunc.call(editPanel, value) === true;
        }
        var keyField = params.keyField || '';
        var entType = params.type || '';
        var codeField = params.codeField || '';
        if (editPanel == null || keyField == '' || entType == '' || codeField == '') {
            throw "唯一性验证器的参数不正确！";
        }
        var sTj = params.filter || '';
        var kv = editPanel.getValues().newValues[keyField] || '';
        var sFilter = 'a.' + keyField + '<>"' + kv + '" and a.' + codeField + '="' + value + '"';
        if (sTj != '') sFilter += ' and (' + sTj + ')';
        var url = getCommonDataUrl('DEQuery', { type: entType, filter: sFilter, limit: 2 });
        var count = 0;
        jdpExec(url, function (result) {
            count = parseInt(result.total) || 0;
        });
        return count === 0;
    });
    $.validator.addMethod('CustomValid', function (value, element, params) {
        var fn = params.validFunc;
        return fn.call(params.editPanel, value) === true;
    });

    $.omWidget('bdp.bdpEditPanel', {
        options: {
            //width: 550,
            // 列数
            columnCount: 1,
            // 列模型，兼容表格的列模型
            colModel: false,
            // 是否为查看模式
            isView: false,
            // 是否显示表格线
            gridLine: false,
            // 是否创建校验错误显示元素
            createErrorPlace: true,
            // 数据更新地址，字符串或函数
            updateUrl: '',
            // 数据更新前事件. onBeforeSave(args:{cancel:false,processUrl,values:[{},...],done:function(ajaxResult){}})
            // 如果自己处理了数据保存，请将cancel置为true,并调用args.done()函数通知保存结果 
            onBeforeSave: null,
            // 数据更新后事件，onAfterSave(ajaxResult){} 
            onAfterSave: null,
            // 验证设置
            validator: { ignore: ".ignore" }    //,
            //// 创建编辑控件事件，返回null则使用系统缺省的创建规则
            //onCreateEditControl: function (ctrlId, $model, $cell) { },
            //// 初始化编辑控件事件，在创建完成后触发
            //onInitEditControl: function ($ctrl, $model) { }
        },

        //#region 重载
        _create: function () {
            // 如果colModel没设置或值不对，什么也不做
            if (!$.isArray(this._getColModel())) return;
            // 表单
            this.form = $('<form class="bdpEditForm"></form>')
                .prop('id', this._getId('form'));
            //.css({
            //    'overflow-x': 'hidden', 'overflow-y': 'auto',
            //    'background-color': '#ffffff',
            //    'line-height': '128%',
            //    'white-space': 'normal',
            //    'margin': 0,
            //    'padding': 0
            //});
            this.element.append(this.form);
            this.grid = $('<table></table>')
                .prop('id', this._getId('form_table'))
                .attr({ cellPadding: 0, cellSpacing: 0, border: 0 })
                .appendTo(this.form)
                .addClass('bdpEditFormTable');
            //.css({
            //    'width': '100%',
            //    'border': 0,
            //    'color': '#000000',
            //    'margin': '10px 0',
            //    'padding': 0
            //});
            this.tbody = $('<tbody></tbody>').appendTo(this.grid);
        },
        _init: function () {
            var self = this,
                ops = this.options;
            this._measure(this.form, ops);
            if (!$.isArray(this._getColModel())) return;
            this._bindValidation();
            this._buildTable();
            this.setValues(self.options.dataSource || {}); // 触发一次校验
            this._validator && this._validator.form();
        },
        //#endregion

        //#region 生成布局
        _buildTable: function () {
            var ops = this.options,
                tbody = this.tbody,
                cms = this._getEditColModel();

            var columnCount = (ops.columnCount || 1);
            var cc = 100 / columnCount;
            tbody.empty();
            // 计算并添加行
            var tr = $('<tr></tr>').appendTo(tbody);
            var colIndex = 0, firstTr = true;
            for (var i = 0, len = cms.length; i < len; i++) {
                var cm = cms[i],
                    editor = cm.editor || {};   //cm.editor应该不会为空了

                var tdLabel = $('<td></td>').appendTo(tr).addClass('bdpEditFormCaption');
                cm.captionSuffix = cm.captionSuffix || ops.captionSuffix;
                this._buildLabelCell(cm, tdLabel);
                //tdLabel.append(cell);

                if (colIndex == 0) {
                    tdLabel.css({ 'border-left-width': '1px' });
                }

                var rspan = editor.rowspan || 1;
                var cspan = editor.colspan || 1;
                var bl = cc;
                if ((cspan > 1 || i == len - 1) && colIndex < columnCount - 1) {
                    if (colIndex + cspan > columnCount - 1) {
                        cspan = 1 + 2 * (columnCount - colIndex - 1);
                        bl += cc * (columnCount - colIndex - 1);
                        colIndex += columnCount - colIndex - 1;
                    } else {
                        bl = cc * cspan;
                        colIndex += cspan - 1;
                        cspan = cspan * 2 - 1;
                    }
                } else { cspan = 1; }

                var tdEdit = $('<td class="bdpEditFormCell" style="width:' + bl + '%;" rowspan="' + rspan + '" colspan="' + cspan + '" abbr="' + cm.editor.name + '"></td>')
                    .appendTo(tr);
                //.addClass('bdpEditFormCell')
                //.attr({ rowspan: rspan, colspan: cspan, 'abbr': cm.editor.name })
                //.width(bl + '%');
                // 处理表格线
                if (firstTr) {
                    tdLabel.css('border-top-width', '1px');
                    tdEdit.css('border-top-width', '1px');
                }
                tdLabel.css('border-style', ops.gridLine ? 'solid' : 'none');
                tdEdit.css('border-style', ops.gridLine ? 'solid' : 'none');

                // 统一用 bdpEditCtrl
                cm.idPrefix = this._getId('edit');
                cm.createErrorPlace = typeof (ops.createErrorPlace) == 'undefined' ? true : ops.createErrorPlace;

                var _oldEditable = editor.editable;
                if (ops.isView) editor.editable = false;
                tdEdit.bdpEditCtrl(cm);
                editor.editable = _oldEditable;

                colIndex += 1;
                if (colIndex > columnCount - 1 && i < len - 1) {
                    tr = $('<tr></tr>').appendTo(tbody);
                    firstTr = false;
                    colIndex = 0;
                }
                // 最后一列补齐
                if (i == len - 1 && colIndex < columnCount) {
                    $('<td></td>').appendTo(tr).addClass('bdpEditFormCell')
                        .attr({ rowspan: rspan, colspan: 2 * (columnCount - colIndex) })
                        .css('border-style', ops.gridLine ? 'solid' : 'none');
                }
            }
        },
        // 生成标签列
        _buildLabelCell: function (cm, parent) {
            var editor = cm.editor;
            var label = $('<label></label>').appendTo(parent)
                .prop('id', this._getId('label_' + cm.name))
                .attr('for', this._getId('edit_' + cm.name));
            var caption = editor.caption || cm.header;
            if (cm.captionSuffix) caption += cm.captionSuffix;
            // 必填字段标签加粗
            var required = false,
                rules = editor.rules;
            if (rules && $.isArray(rules) && rules.length > 0) {
                if ($.isArray(rules[0])) {
                    for (var i = 0, len = rules.length; i < len; i++) {
                        rule = rules[i];
                        if (rule.length > 1 && rule[0] == "required" && rule[1])
                            required = true;
                    }
                } else {
                    rule = rules;
                    if (rule.length > 1 && rule[0] == "required" && rule[1])
                        required = true;
                }
            }
            if (required) label.css('font-weight', 'bold'); // 每个列信息中可以指定列标题或列标题的生成函数
            var r = editor.captionRenderer;
            if (typeof (r) === 'function') {
                caption = r(caption, cm);
            };
            try {
                label.html(caption);    //IE8会报错
            } catch (err) {
                label[0].innerHTML = caption;
            }
            if (editor.captionStyle) label.css(editor.captionStyle);
            return label;
        },
        //#endregion

        //#region 接口函数
        // 返回是否已经通过验证
        valid: function () {
            if (!this._validator) return true;
            return this._validator.form();
        },
        // 根据字段名或列信息查找编辑控件对象, 返回 bdpEditCtrl
        findEditCtrl: function (fnOrCm) {
            var fn = fnOrCm;
            if (typeof fnOrCm == 'object') {
                fnOrCm.editor = fnOrCm.editor || {};
                fn = fnOrCm.editor.name;
            }
            var sel = 'td.bdpEditFormCell[abbr="' + fn + '"]';
            return this.tbody.find(sel);
        },
        // 根据字段名或列信息查找编辑控件实例， 返回实际的控件，如omCombo
        findEditor: function (fnOrCm) {
            var ec = this.findEditCtrl(fnOrCm);
            //return ec.bdpEditCtrl('editControl');
            return ec.bdpEditCtrl("getCtrl");
        },

        // 设置编辑器中的值, data可以是一个json对象，也可以是一个返回json对象的地址 
        setValues: function (data) {
            if (data) {
                if (typeof data == 'object') {
                    this._setValues(data);
                } else if (typeof data == 'string' && data != '') {
                    this._ajaxLoad(data);
                }
            } else {
                this._setValues({});
            }
        },
        //设置一个字段的值，fn指定字段名，字段名可以是编辑面板中出现的，也可以是没有出现的
        setValue: function (fn, value) {
            var ec = this.findEditCtrl(fn);
            if (ec.length > 0) {
                ec.bdpEditCtrl('setValue', value);
            } else {
                var newValues = $(this).data("newValues") || {};
                newValues[fn] = value;
            }
        },
        // 获取编辑器中的值,结果为对象，格式如：{oldValues:{},newValues:{}}
        getValues: function () {
            return this._getValues();
        },

        // 保存数据.
        //      通过ajax方式post数据到指定的地址，成功返回后执行onSuccess回调函数。
        //      传递到后台的数据是对象数据，对象结构与正在编辑的对象一致。
        updateEdit: function (onSuccess) {
            if (!this.isEditing()) {
                if (onSuccess) onSuccess({ Succeed: false });
                return;
            }
            if (!this.valid()) {
                if (onSuccess) onSuccess({ Succeed: false, Message: '数据有误，请修改！' });
                return;
            }
            var self = this,
                ops = self.options,
                //oldValues = $(this).data("oldValues"),
                editValues = this._getValues(),
                onBeforeSave = self.options.onBeforeSave,
                onAfterSave = self.options.onAfterSave;

            var args = {
                cancel: false,
                processUrl: typeof (ops.updateUrl) == 'function' ? ops.updateUrl.call(self) : ops.updateUrl,
                //包括原来值和新值的数组
                values: $.makeArray(editValues),
                // 如果接管了数据保存，最后必须调用该函数通知保存结果
                done: function (ajaxResult) {
                    args.cancel = true;
                    onAfterSave && self._trigger("onAfterSave", null, ajaxResult);
                    if (onSuccess) onSuccess(ajaxResult);
                }
            };
            args.processUrl = args.processUrl || '';
            onBeforeSave && self._trigger("onBeforeSave", null, args);

            if (!args.cancel) {
                if (args.processUrl == '') {
                    //if (onSuccess) onSuccess({ Succeed: false, Message: '没有指定数据处理地址！' });
                    // 没有指定处理地址可能是不需要处理，所以还是认为成功了
                    //if (onSuccess) onSuccess({ Succeed: true });
                    args.done({ Succeed: true });
                } else {
                    $.ajax({
                        type: 'POST',
                        url: args.processUrl,
                        data: JSON.stringify(args.values),  //[{"oldValues":{},"newValues":{}},...]
                        success: function (strResult) {
                            //if (onSuccess) onSuccess($.parseJSON(strResult) || { Succeed: false });
                            args.done($.parseJSON(strResult) || { Succeed: false });
                        }
                    });
                }
            }
            // 用编辑器中的新值更新原来的值
            for (var key in editValues.oldValues) {
                var oldValue = editValues.oldValues[key],
                    newValue = editValues.newValues[key];
                if (typeof (oldValue) != "undefined" && typeof (newValue) != "undefined" && oldValue != newValue) {
                    editValues.oldValues[key] = newValue;
                }
            }
            //$(this).data("oldValues", $.extend(true, {}, data));
        },
        // 进入编辑
        startEdit: function () {
            if (this.isEditing()) return;
            var oldValues = $(this).data("oldValues");
            this.options.isView = false;
            this._init();
            this._setValues(oldValues);
        },
        // 退出编辑
        cancelEdit: function () {
            if (this.isEditing()) {
                var oldValues = $(this).data("oldValues");
                this.options.isView = true;
                this._init();
                this._setValues(oldValues);
            }
        },
        //是否正在编辑
        isEditing: function () {
            return !this.options.isView;
        },
        //获取真正在面板中编辑的列
        getEditColModel: function () {
            return this._getEditColModel();
        },
        // 设置查看或编辑模式
        setIsView: function (isView) {
            if (this.options.isView != isView) {
                var oldValues = $(this).data("oldValues");
                this.options.isView = isView;
                this._init();
                this._setValues(oldValues);
            }
        },
        getErrors: function () {
            var ht = [];
            $('div.bdpEditFormError:visible', this.tbody).each(function (i) {
                ht.push(' <div class="error-item">', i + 1, '. ', $(this).attr('title'), '</div>');
            });
            return ht.join('');
        },
        //#endregion

        //#region 数据处理

        _setValues: function (data) {
            var self = this,
                columns = this._getEditColModel();
            $.each(columns, function (i, cm) {
                var editCtrl = self.findEditCtrl(cm);
                if (editCtrl) {
                    //var value = data[cm.editor.name] || '';
                    editCtrl.bdpEditCtrl('setValue', data);
                }
            });
            //保存编辑前对象
            $(this).data("oldValues", $.extend(true, {}, data));
            //创建一个新对象供编辑
            $(this).data("newValues", $.extend(true, {}, data));
        },
        //返回：{oldValues:{},newValues:{}}
        _getValues: function () {
            var self = this,
                columns = this._getEditColModel();
            var ret_values = {
                oldValues: $(this).data("oldValues") || {},
                newValues: $(this).data("newValues") || {}
            };
            if (!self.options.isView) {
                $.each(columns, function (i, cm) {
                    if (cm.editor.editable) {
                        try {
                            var editCtrl = self.findEditCtrl(cm);
                            if (editCtrl.length > 0) {
                                ret_values.newValues[cm.editor.name] = editCtrl.bdpEditCtrl('getValue');
                            }
                        }
                        catch (e) {
                            console.log('ERROR:', e);
                        }
                    }
                });
            }
            return ret_values;
        },
        _ajaxLoad: function (ajaxUrl) {
            var self = this,
                ops = this.options;
            $.ajax({
                url: ajaxUrl,
                method: 'post',
                dataType: 'json',
                success: function (data) {
                    self._setValues(data);
                }
            });
        },
        // 将列模型中的验证设置绑定到表单，并触发一次验证
        _bindValidation: function () {
            var ops = this.options,
                validCfg = ops.validator || {},
                rules = validCfg.rules || {},
                messages = validCfg.messages || {},
                $form = this.form,
                colModel = this._getEditColModel(),
                self = this;
            $.each(colModel, function (index, model) {
                var customRules = model.editor.rules;
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
                        if (name == 'Uniqued') {
                            var paramObj = customRules[i][1];
                            if (typeof paramObj == 'function') {
                                r[name] = {
                                    validFunc: paramObj,
                                    editPanel: self
                                };
                            } else {
                                paramObj.editPanel = self;    //.element.selector;
                                paramObj.codeField = model.editor.name || model.name;
                                //paramObj.cm = model;
                                if (!paramObj.type || !paramObj.keyField) {
                                    throw '唯一性验证器(Uniqued)必须指定实体类名(type)和主键名(keyField)！';
                                }
                                r[name] = paramObj;
                            }
                        } else if (name == 'CustomValid') {
                            var fn = customRules[i][1];
                            if (typeof fn != 'function')
                                throw '自定义验证器(CustomValid)必须设定验证函数！';
                            r[name] = {
                                validFunc: fn,
                                editPanel: self
                                //cm: model
                            };
                        } else {
                            r[name] = customRules[i][1] == undefined ? true : customRules[i][1]; //没有定义值的统一传 true
                        }
                        // 错误信息文本
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
                        var name = $(obj).attr('id');
                        $form.find("div.bdpEditFormError[for='" + name + "']")
                            .attr('title', '')
                            .hide();
                    });

                    $.each(errorList, function (index, obj) {
                        var $ele = $(obj.element),
                            message = obj.message,
                            name = $ele.attr('id');
                        $form.find("div.bdpEditFormError[for='" + name + "']")
                            .attr({ 'title': message })
                            .show();
                    });
                }
            });
            self._validator = $form.validate(validCfg);
        },
        //#endregion

        //#region 内部函数
        //获取列模型
        _getColModel: function () {
            return this.options.colModel;
        },
        // 过滤掉在编辑面板中不出现的，然后按editor.index排序
        _getEditColModel: function () {
            var cms = this._getColModel();
            var cmArr = [];
            var proc = function (arrModel, arrResult) {
                for (var i = 0; i < arrModel.length; i++) {
                    var cm = arrModel[i];
                    if ($.isArray(cm)) {
                        proc(cm, arrResult);
                    } else if (!(cm.editor && cm.editor.index < 0)) {
                        cm.editor = cm.editor || { index: cmArr.length, name: cm.name };
                        cm.editor.index = cm.editor.index || cmArr.length;
                        cm.editor.editable = typeof (cm.editor.editable) == 'undefined' ? true : cm.editor.editable;
                        cm.editor.type = cm.editor.type || 'text';
                        cm.editor.name = cm.editor.name || cm.name;
                        cm.editor.caption = cm.editor.caption || cm.header;
                        arrResult.push(cm);
                    }
                }
            };
            proc(cms, cmArr);
            var cmArrSorted = cmArr.sort(function (a, b) {
                index1 = a.editor.index;
                index2 = b.editor.index;
                if (index1 < index2) return -1;
                if (index1 > index2) return 1;
                return 0;
            });
            return cmArrSorted;
        },
        _measure: function ($div, ops) {
            if ((ops.width || 'fit') != 'fit')
                $div.outerWidth(ops.width);
            if ((ops.height || 'fit') != 'fit')
                $div.outerHeight(ops.height);
        },
        // 获取子控件id
        _getId: function (id) {
            return this.element.prop('id') + '_' + id;
        },
        //#endregion

        done: true
    });
    //#endregion

    //#region 对象编辑器对话框 bdpEditor
    $.omWidget("bdp.bdpEditor", $.om.omDialog, {
        // 基类
        base: $.om.omDialog.prototype,

        options: {
            autoOpen: false,
            modal: true,
            // 点确定关闭窗口时将验证数据，如果验证不通过要显示的提示串，可以设为false不显示
            errorTipsOnClose: '数据错误，请修改！',
            //窗口关闭事件，onCloseQuery(args)
            // args结构：
            //   canClose: true, //是否允许关闭窗口
            //   ajaxResult: null   //按了确定后通过后台数据保存，处理程序返回的结果
            onCloseQuery: false,
            // 编辑器配置对象, 与 bdpEditPanel.options相同
            editors: false
        },
        _create: function () {
            var self = this;
            if (!self.options.editors.isView)
                this.options.buttons = [
                    {
                        text: '确定', id: this._getId('btnOk'),
                        click: function () {
                            self.doClose(true);
                        }
                    },
                    {
                        text: '取消', id: this._getId('btnCancel'),
                        click: function () {
                            self.doClose(false);
                        }
                    }
                ];
            else
                this.options.buttons = [
                    {
                        text: '关闭', id: this._getId('btnClose'),
                        click: function () {
                            self.doClose(false);
                        }
                    }
                ];
            this.base._create.apply(this, []);
            $('#' + this._getId('btnOk') + ',#' + this._getId('btnCancel') + ',#' + this._getId('btnClose')).width(65);
        },
        // 重载
        _init: function () {
            this.base._init.apply(this, []);
            var $ele = this.element,
                ops = this.options;
            $ele.empty();
            this.editpanel = $('<div></div>').prop('id', $ele.prop('id') + "_ep")
                .appendTo($ele);
            var editors = ops.editors || {};
            editors.onBeforeSave = editors.onBeforeSave || ops.onBeforeSave;
            editors.onAfterSave = editors.onAfterSave || ops.onAfterSave;
            editors.updateUrl = editors.updateUrl || ops.updateUrl;
            this.editpanel.bdpEditPanel(ops.editors || {});
        },
        // 重装open, 恢复保存按钮
        open: function () {
            this.base.open.apply(this, []);
            $('#' + this._getId('btnOk')).omButton('enable');
        },

        _getId: function (id) {
            return this.element.prop('id') + '_' + id;
        },

        _closeQuery: function (ajaxResult) {
            var self = this,
                args = { 'canClose': true, 'ajaxResult': ajaxResult },
                onCloseQuery = self.options.onCloseQuery;
            //if (ajaxResult && ajaxResult.Succeed === false) args.canClose = false;
            //onCloseQuery && self._trigger('onCloseQuery', null, args);
            if (onCloseQuery) {
                onCloseQuery.call(this, args);
            } else {
                if (ajaxResult && ajaxResult.Succeed === false) args.canClose = false;
            }
            return args.canClose;
        },
        //#region 接口
        setData: function (data) {
            this.editpanel.bdpEditPanel('setValues', data);
        },
        getData: function () {
            return this.editpanel.bdpEditPanel('getValues');
        },
        isSureClosed: function () {
            return this._isSureClosed;
        },
        // 查找编辑控件
        findEditCtrl: function (fn) {
            return this.editpanel.bdpEditPanel('findEditCtrl', fn);
        },
        // 查找编辑控件实例
        findEditor: function (fn) {
            return this.editpanel.bdpEditPanel('findEditor', fn);
        },
        doClose: function (needCheck) {
            var self = this,
                ops = self.options;
            $('#' + self._getId('btnOk')).omButton('disable');
            self._isSureClosed = needCheck;
            if (needCheck && !ops.editors.isView) {
                if (!this.editpanel.bdpEditPanel('valid')) {
                    $('#' + self._getId('btnOk')).omButton('enable');
                    var err = '<div class="error-summary"><div class="error-item">' + ops.errorTipsOnClose + '</div>';
                    err += this.editpanel.bdpEditPanel('getErrors');
                    err += '</div>';
                    if (ops.errorTipsOnClose) {
                        $.omMessageBox.alert({
                            type: 'error', title: '错误',
                            content: err
                        });
                    }
                    return;
                }
                self.editpanel.bdpEditPanel('updateEdit', function (ajaxResult) {
                    $('#' + self._getId('btnOk')).omButton('enable');
                    if (self._closeQuery(ajaxResult)) {
                        self.base.close.call(self);
                    }
                });
            } else if (self._closeQuery(null)) {
                $('#' + self._getId('btnOk')).omButton('enable');
                this.base.close.call(self);
            }
        },
        setOptions: function (opts) {
            this._setOptions(opts);
        },
        setIsView: function (isView) {
            this.editpanel.bdpEditPanel('setIsView', isView);
            this.options.editors.isView = isView;
        },
        //#endregion
        done: true
    });
    //#endregion

    done: true;
})(jQuery);


/*  获取与src对应的缩略文件地址.
    通过平台提供的通用图片上传的jdp函数FileUploader上传的图片，一般会创建
    缩略文件，该函数根据原文件地址计算对应的缩略文件地址，参数thumSize指定
    缩略图宽度
*/
function getThumbnailFile(src, thumSize) {
    if (thumSize) {
        return src.replace(/\.\w+$/, "") + '_' + thumSize + '.' + src.replace(/.+\./, "");
    }
    return src;
}