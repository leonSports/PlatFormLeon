/// <reference path="../../resources/js/jQuery.md5.js" />
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
/*
    流程相关处理
    依赖于：
    operamasks-ui.js
    bdp-base.js
    GooFlow.css
    GooFlow.js
    BdpFlow.css
*/
; (function ($) {
    // 创建流程监控图
    $.createFlowView = function (divId, data) {
        var $div = $('#' + divId), gr = $div.data("_flowgraph");
        if (!gr) {
            gr = $.createGooFlow($div, {
                width: 450,
                haveHead: true,
                headBtns: ['reload'],
                haveTool: false,
                haveGroup: false,
                useOperStack: false
            });
        }
        // 清除原来的数据
        gr.clearData();

        //#region 绘制正常的流程图
        gr.setTitle(data.FlowName);
        var dataNodes = data.Nodes || [];
        var x = 30, y = 30, prevNode = null;
        var nodeId = "node_start";
        gr.addNode(nodeId, { name: "开始", left: x, top: y, width: 24, height: 24, type: 'start' });

        prevNode = nodeId;
        x += 24 + 70;
        if (dataNodes.length > 0) {
            $.each(dataNodes, function (i, n) {
                nodeId = "node_" + n.NodeId;
                gr.addNode(nodeId, { name: n.NodeName, left: x, top: y, width: 150, height: 24, type: 'task' });
                $('#' + nodeId, $div).addClass('wf-node');
                if (prevNode) {
                    var lineId = "line_" + n.NodeId;
                    gr.addLine(lineId, { name: "", from: prevNode, to: nodeId, mark: false, type: 'sl' });
                }
                prevNode = nodeId;
                y += 24 + 50;
            });
            x += 150 + 70;
        }
        nodeId = "node_end";
        gr.addNode(nodeId, { name: "结束", left: x, top: y - 24 - 50, width: 24, height: 24, type: 'end' });
        if (prevNode) {
            gr.addLine("line_end", { name: "", from: prevNode, to: nodeId, mark: false, type: 'sl' });
        }
        //#region 调整图形尺寸、挂接结点单击事件
        var width = x + 24 + 30, height = y + 24;
        $div.width(width).height(height);
        gr.$workArea.parent().css({ height: height - 24, width: width - 2, float: 'left', overflow: 'hidden' });
        // 去掉工作区的背景
        gr.$workArea.css({
            height: '100%', width: '100%',
            'background-image': 'none',
            'background-color': '#ffffff'
        })
        $('.GooFlow_head label', $div).width(width - 50);
        //#endregion
        //#endregion

        //#region 绘制流程执行情况
        var dataLogs = data.Logs || [],
            lastNodeId = null;
        $.each(dataLogs, function (index, log) {
            if (log.NodeOrder < 0) {
                gr.setName("node_start", "<span class='wf-node-auditor'>" + log.AuditPerson + "</span>", "node");
                return true;
            }
            // 如果同样的流程结点已经处理过，则进入下一循环
            if (log.NodeId == lastNodeId) return true;
            var nodeid = "node_" + log.NodeId, lineid = "line_" + log.NodeId,
                nodeDom = gr.$nodeDom[nodeid];
            // 计算审批人员
            var sameNodes = $.grep(dataLogs, function (a, j) { return a.NodeId == log.NodeId });
            var sArr = [];
            $.each(sameNodes, function (k, a) {
                if (a.State == "已审批") {
                    if (a.IsCountersign || a.AuditOpinion != "(被抢先)") {
                        sArr.push(a.AuditPerson + (a.IsPassed ? "√" : "×"));
                    }
                } else {
                    sArr.push(a.AuditPerson + "?");
                }
            });
            var s = sArr.join(" ");
            if (s.length > 18) s = s.substr(0, 18) + "...";
            gr.setName(nodeid, log.NodeName + "<br/><span class='wf-node-auditor'>(" + s + ")</span>", "node");
            // 不同的样式显示已审批过的结点
            var classname = log.State == "已审批" || data.IsEnd ? "wf-node-past" : "wf-node-current";
            $(nodeDom).removeClass('wf-node').addClass(classname);
            // 突出线条
            var ld = gr.$lineData[lineid];
            if (ld && (ld.from == "node_start" || ld.from == "node_" + lastNodeId)) {
                gr.markItem(lineid, "line", true);
            } else {
                fromid = lastNodeId == null ? "node_start" : ("node_" + lastNodeId);
                var mpos = gr.$nodeData["node_start"].left + gr.$nodeData["node_start"].width / 2;
                if (lastNodeId) mpos += 47;
                gr.addLine(lineid + "_lr", { name: "", from: fromid, to: nodeid, mark: true, type: "lr", M: mpos });
            }
            lastNodeId = log.NodeId;
        });
        if (data.IsEnd) {
            var termNodeId = "node_" + data.CurrentNodeId,
                lastNodeId = "node_" + dataNodes[dataNodes.length - 1].NodeId,
                auditStatus = data.AuditState == "审批通过" ? "通过" : "未通过";
            if (termNodeId == lastNodeId) {
                gr.markItem("line_end", "line", true);
                gr.setName("line_end", auditStatus, "line");
            } else {
                var nd = gr.$nodeData[termNodeId];
                if (nd) {
                    var mpos = nd.top + nd.height / 2;
                    gr.addLine("line_term", {
                        name: auditStatus,
                        from: termNodeId, to: "node_end",
                        mark: true,
                        type: "tb",
                        M: mpos            //type不是sl时必须指定M
                    });
                }
            }
        }
        //#endregion

        // 缓存图形及数据
        $div.data("_flowgraph", gr);
        $div.data("_flowdata", data);
    };

    //#region 工作流工具条组件：bdpWfToolbox

    //#region 实用说明
    /**
        options: {
            // 审批单据的实体类名，必须指定
            billType: '',
            // 流程适用标志，可选。当同一种单据配置了多个审批流程时，此标志辅助确定采用的审批流程。
            applianceSign: '',
            // 查看面板ID, 如果未指定或不存在则自动创建. 仅审批过程中有效
            viewPanelId: '',
            // 审批前事件，必须提供该事件，并且必须在该事件中指定要审批的对象的ID
                详细的事件参数对象如下：
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
                    // 审批明细记录ID，即审批时存在
                    auditLogId: self.auditLogId || ''
                };
            onBeforeAudit: function (args){},
            // 审批后事件, 点击确定按钮并成功审批后触发该事件，事件参数args如下：
                args = {
                    // 审批对象实体类名
                    billtype: self.options.billType,
                    // 审批对象ID
                    billid: self.options._billid || '',
                    // 审批明细记录ID，仅审批时存在
                    wflogid: self.auditLogId || '',
                    // 下一审批节点ID
                    nodeid: self.EdtNode.omCombo('value') || '',
                    // 意见文本
                    optionText: self.isAuditing ? self.EdtOpinion.val() : self.EdtObjName.val(),
                    // 是否通过
                    ispassed: !self.isAuditing ? false : self.EdtYes.prop('checked'),
                    // 流程是否结束
                    isend: !self.isAuditing ? false : self.IsEnd.prop('checked'),
                    // 下一节点审批人ID
                    auditorIds: []
                };
            onAfterAudit: function (args){},
            
            btnSubmit: { label: '提交审批' },
            btnAudit: { label: '审批' },
            btnView: { label: '查看' }
        }
        /// API:
        // 启用流程按钮。若是审批过程，btn取值为audit或view，
        // 如果未指定btn,则同时启用审批和查看按钮；如果不是审批模块，则启用提交审批按钮。
        enable(btn)
        // 停用流程按钮。若是审批过程，btn取值为audit或view，
        // 如果未指定btn,则同时停用审批和查看按钮；如果不是审批模块，则停用提交审批按钮。
        disable(btn)
        // 提交审批, 如何指定了审批对象billId则直接发起一个新的审批，返回是否成功。否则显示提交审批对话框
        submit(billId,billDesc)
        // 执行审批，审批界面中按“审批”按钮
        audit()
        // 查看审批记录，审批界面中按“查看”按钮
        view()

    */
    //#endregion

    $.omWidget('bdp.bdpWfToolbox', {
        options: {
            // 审批单据的实体类名，必须指定
            billType: '',
            // 流程适用标志，可选。当同一种单据配置了多个审批流程时，此标志辅助确定采用的审批流程。
            applianceSign: '',
            // 审批记录查看选项, 可以不指定
            //logViewer: {
            //    // 查看面板ID, 如果未指定或不存在则自动创建. 仅审批过程中有效
            //    viewPanelId: '',
            //    wfActionId: '',
            //    wfLogId: '',
            //    showFlowGraph: true,
            //    showFlowLogs: true
            //},
            btnSubmit: { label: '提交审批' },
            btnAudit: { label: '审批' },
            btnView: { label: '查看' }
        },
        _create: function () {
            var self = this, $elem = $(this.element),
                ops = this.options,
                idprefix = $elem.prop('id') + '_',
                btns = [];
            // 审批明细记录id
            self.auditLogId = $.getUrlParam('wflogid');
            self.isAuditing = self.auditLogId ? true : false;

            //#region 创建菜单项
            if (!self.isAuditing) {
                btns.push({
                    id: idprefix + "submit", label: ops.btnSubmit.label,
                    onClick: function (event) {
                        self._doSubmit();
                    }
                });
            } else {
                btns.push({
                    id: idprefix + "audit", label: ops.btnAudit.label,
                    onClick: function (event) {
                        self._doAudit();
                    }
                });
                btns.push({
                    id: idprefix + "view", label: ops.btnView.label,
                    onClick: function (event) {
                        self._doView();
                    }
                });
            }
            var opButtonbar = {
                btns: btns
            }
            var bar = $elem;
            if (bar.is('button') && bar.hasClass('om-btn-txt')) {
                bar = $('<span></span>');
                var id = $elem.prop('id');
                $elem.closest('span.om-btn').after(bar).remove();
                bar.prop('id', id);
                this.element = bar;
                $elem.remove();
            }
            bar.omButtonbar(opButtonbar);
            bar.find('span.om-buttonbar-null').remove();
            //#endregion
        },
        _init: function () {
        },
        _doSubmit: function () {
            this._showAuditDialog();
        },
        _doAudit: function () {
            this._showAuditDialog();
        },
        _doView: function () {
            var self = this, ops = this.options;
            if (!self.viewer) {
                var view = ops.logViewer || {};
                view.viewPanelId = view.viewPanelId || ops.viewPanelId || '';
                view.wfLogId = self.auditLogId;
                var panelId = view.viewPanelId || this.element.prop('id') + '_viewer';
                if ($('#' + panelId).length == 0) {
                    $('<div></div>').prop('id', panelId).appendTo($('body'));
                }
                self.viewer = $('#' + panelId).show().bdpWfViewer(view);
            } else {
                if (self.viewer.css('display') == 'none') {
                    self.viewer.show();
                } else {
                    self.viewer.hide();
                }
            }
        },

        _showAuditDialog: function () {
            var self = this, ops = this.options;

            //#region 创建对话框内容
            if (!self.dlgAudit) {
                var idprefix = self.element.prop('id') + '_';
                self.dlgAudit = $('<div></div>').prop('id', idprefix + 'dlgAudit').appendTo($('body')).omDialog({
                    autoOpen: false,
                    title: '审批',
                    width: 500,
                    modal: true,
                    buttons: [{
                        text: '确定', id: idprefix + 'btnOk',
                        click: function () {
                            var dlgData = self.dlgData,
                                args = {
                                    billtype: self.options.billType,
                                    billid: self.options._billid || '',
                                    wflogid: self.auditLogId || '',
                                    nodeid: self.EdtNode.omCombo('value') || '',
                                    optionText: self.isAuditing ? self.EdtOpinion.val() : self.EdtObjName.val(),
                                    ispassed: !self.isAuditing ? false : self.EdtYes.prop('checked'),
                                    isend: !self.isAuditing ? false : self.IsEnd.prop('checked'),
                                    auditorIds: []
                                };
                            if (dlgData.IsLast) args.isend = true;
                            if (dlgData.FlowPanelVisible) {
                                var rows = self.GridSpr.omGrid('getSelections', true);
                                $.each(rows, function (i, r) { args.auditorIds.push(r.UserId); });
                            }
                            if (args.auditorIds.length < 1 && !(args.isend || !dlgData.FlowPanelVisible || !args.ispassed)) {
                                $.omMessageBox.alert({
                                    type: 'error', title: '流程错误',
                                    content: '至少需要选定一位审批人！'
                                });
                                return;
                            }
                            $.ajax({
                                url: getCommonDataUrl('WFDialogSumbit'),
                                type: 'POST',
                                data: JSON.stringify(args),
                                dataType: 'json',
                                success: function (ajaxResult) {
                                    if (ajaxResult.Succeed) {
                                        self.dlgAudit.omDialog('close');
                                        // 触发审批后事件}
                                        var onAfterAudit = ops.onAfterAudit;
                                        onAfterAudit && onAfterAudit.call(self, args);
                                    } else {
                                        $.omMessageBox.alert({
                                            type: 'error', title: '流程错误',
                                            content: ajaxResult.Message || ''
                                        });
                                    }
                                }
                            });
                        }
                    }, {
                        text: '取消', id: idprefix + 'btnCancel',
                        click: function () {
                            self.dlgAudit.omDialog('close');
                        }
                    }]
                });
                $('#' + idprefix + 'btnOk' + ',#' + idprefix + 'btnCancel').width(65);
                if (!self.isAuditing) {
                    self.dlgAudit.append($('<p><label>名称(待审对象的简短说明)： </label><br />' +
                        '<input type="text" id="' + idprefix + 'EdtObjName" name="' + idprefix + 'EdtObjName" /></p>'));
                    self.EdtObjName = self.dlgAudit.find('#' + idprefix + 'EdtObjName');
                    self.EdtObjName.css({ width: '100%' }).addClass('om-widget om-state-default om-state-nobg');
                } else {
                    self.dlgAudit.append('<p><label>审批意见(450字节以内)：</label><br />' +
                        '<textarea id="' + idprefix + 'EdtOpinion" name="' + idprefix + 'EdtOpinion" ' +
                        'class="om-widget om-state-default om-state-nobg" ' +
                        'rows="5" style="width: 100%; overflow-y: scroll;"></textarea>' +
                        '<div style="width:100%; position:relative; display:inline-block;">' +
                            '<div style="float:left;display: inline-block;"><label>结论：</label>' +
                            '<input type="radio" id="' + idprefix + 'EdtYes" name="' + idprefix + 'Conclusion" style="margin-left:12px;margin-right:5px;" checked="checked" /><label for="' + idprefix + 'EdtYes">同意</label>' +
                            '<input type="radio" id="' + idprefix + 'EdtNo" name="' + idprefix + 'Conclusion" style="margin-left:12px;margin-right:5px;" /><label for="' + idprefix + 'EdtNo">不同意</label>' +
                            '</div>' +
                            '<div style="float:right;display: inline-block; padding-right:12px;">' +
                            '<input type="checkbox" id="' + idprefix + 'IsEnd" name="' + idprefix + 'IsEnd" style="margin-right:12px;" /><label for="' + idprefix + 'IsEnd">终止流程</label>' +
                            '</div>' +
                        '</div></p>');
                    self.EdtOpinion = self.dlgAudit.find('#' + idprefix + 'EdtOpinion');
                    self.EdtYes = self.dlgAudit.find('#' + idprefix + 'EdtYes').click(function () {
                        var dlgData = self.dlgData || {};
                        if (dlgData.FlowPanelVisible) {
                            self.HintMsg.show();
                            self.FlowPanel.show();
                        }
                    });
                    self.EdtNo = self.dlgAudit.find('#' + idprefix + 'EdtNo').click(function () {
                        var dlgData = self.dlgData || {};
                        if (dlgData.FlowPanelVisible) {
                            self.HintMsg.hide();
                            self.FlowPanel.hide();
                        }
                    });
                    self.IsEnd = self.dlgAudit.find('#' + idprefix + 'IsEnd');
                }
                self.dlgAudit.append('<div id="' + idprefix + 'hintMsg" style="padding:5px;"></div>');
                self.HintMsg = self.dlgAudit.find('#' + idprefix + 'hintMsg');
                self.dlgAudit.append('<div id="' + idprefix + 'flowpanel" class="om-widget om-state-default om-state-nobg" style="line-height:1.5em;padding:3px;">' +
                    '<div style="width:100%; position:relative; display:inline-block; padding-top:12px;">' +
                        '<span style="display: inline-block; float:left;">' +
                        '<label for="' + idprefix + 'EdtFlow">流程：</label><input id="' + idprefix + 'EdtFlow" /></span>' +
                        '<span style="display: inline-block; float:right;">' +
                        '<label for="' + idprefix + 'EdtNode">节点：</label><input id="' + idprefix + 'EdtNode" /></span>' +
                    '</div>' +
                    '<div style="width:100%; position:relative; display:inline-block; padding-top:12px;">' +
                        '<label>审批人：</label>' +
                        '<table id="' + idprefix + 'GridSpr"></table>' +
                    '</div>' +
                    '</div>');
                self.FlowPanel = self.dlgAudit.find('#' + idprefix + 'flowpanel');
                self.EdtFlow = self.dlgAudit.find('#' + idprefix + 'EdtFlow');
                self.EdtNode = self.dlgAudit.find('#' + idprefix + 'EdtNode');
                self.GridSpr = self.dlgAudit.find('#' + idprefix + 'GridSpr');

                self.EdtFlow.css({ padding: 1 }).omCombo({
                    valueField: 'FlowId',
                    inputField: 'FlowName',
                    optionField: 'FlowName',
                    forceSelction: true,
                    editable: false,
                    onValueChange: function (target, newValue, oldValue, event) {
                        var dlgData = self.dlgData || {},
                            flows = $.grep(dlgData.Flows || [], function (f, i) {
                                return f.FlowId == newValue;
                            });
                        if (flows.length > 0) {
                            var nodes = flows[0].Nodes || [];
                            self.EdtNode.omCombo({
                                disabled: !flows[0].AllowSelectNode,
                                readOnly: !flows[0].AllowSelectNode,
                                dataSource: nodes,
                                value: nodes.length == 0 ? '' : nodes[0].NodeId
                            });
                        }
                    }
                });
                self.EdtNode.css({ padding: 1 }).omCombo({
                    valueField: 'NodeId',
                    inputField: 'NodeName',
                    optionField: 'NodeName',
                    forceSelction: true,
                    editable: false,
                    onValueChange: function (target, newValue, oldValue, event) {
                        var grid = self.GridSpr.closest('.om-grid'),
                            loadMask = $('.gBlock', grid);
                        loadMask.show();
                        $.ajax({
                            url: getCommonDataUrl('WFGetDialogAuditors', {
                                nodeid: newValue || '',
                                billtype: self.options.billType,
                                billid: self.options._billid || ''
                            }),
                            type: 'POST',
                            dataType: 'json',
                            success: function (ajaxResult) {
                                if (ajaxResult.Succeed) {
                                    var data = ajaxResult.Data || {};
                                    self.GridSpr.omGrid('setData', data.Auditors);
                                    if (data.AutoSelectAll) {
                                        var indexes = [];
                                        $.each(data.Auditors.rows, function (i) { indexes.push(i); });
                                        self.GridSpr.omGrid('setSelections', indexes);
                                    }
                                    self.GridSpr.omGrid('resize');
                                    self.readOnly = data.ReadOnly;
                                    self.GridSpr.omGrid('allowSelect', !self.readOnly);
                                } else {
                                    $.omMessageBox.alert({
                                        type: 'error', title: '流程错误',
                                        content: ajaxResult.Message
                                    });
                                }
                                loadMask.hide();
                            }
                        });
                    }
                });
                self.GridSpr.omGrid({
                    autoFit: true,
                    height: 170,
                    width: 'fit',
                    limit: -1,
                    singleSelect: false,
                    showIndex: false,
                    colModel: [{
                        header: '姓名', name: 'UserName', width: 'autoExpand'
                    }]
                });
            }
            //#endregion

            var args = self._beforeAudit();

            //#region 通过ajax获取对话框数据内容，然后更新控件值，最后显示对话框
            if (args && !args.cancel) {
                $.ajax({
                    url: getCommonDataUrl('WFGetDialogInfo', {
                        billtype: args.billType,
                        sign: args.applianceSign || '',
                        billid: args.billId || '',
                        wflogid: args.auditLogId || ''
                    }),
                    type: 'POST',
                    dataType: 'json',
                    success: function (ajaxResult) {
                        if (ajaxResult.Succeed) {
                            var dlgData = ajaxResult.Data || {};
                            //#region 更新对话框控件内容
                            if (!self.isAuditing) {
                                self.EdtObjName.val(args.billName || dlgData.DefaultObjectName || '');
                                self.HintMsg.text("请选择审批流程及审批人");
                            } else {
                                self.EdtOpinion.val('');
                                self.EdtYes.prop('checked', true);
                                if (dlgData.IsLast) {
                                    self.IsEnd.attr('disabled', 'disabled');
                                    self.IsEnd.prop('checked', true);
                                    self.IsEnd.parent().hide();
                                } else if (dlgData.AllowTerminate) {
                                    self.IsEnd.removeAttr('disabled');
                                } else {
                                    self.IsEnd.attr('disabled', 'disabled');
                                }
                                self.HintMsg.text("填写意见后，请选择下一环节的审批人员");
                            }
                            if (!dlgData.FlowPanelVisible) {
                                self.dlgData = dlgData;
                                self.FlowPanel.hide();
                                self.HintMsg.text(dlgData.HintMsg || '');
                            } else {
                                self.dlgData = dlgData;
                                //审批过程中不允许改变流程
                                //self.EdtFlow.omCombo('setData', dlgData.Flows);
                                //self.EdtFlow.omCombo('value', dlgData.Flows.length == 0 ? '' : dlgData.Flows[0].FlowId);
                                //self.EdtFlow.omCombo(self.isAuditing ? 'disable' : 'enable');
                                self.EdtFlow.omCombo({
                                    disabled: self.isAuditing,
                                    readOnly: self.isAuditing,
                                    dataSource: dlgData.Flows,
                                    value: dlgData.Flows.length == 0 ? '' : dlgData.Flows[0].FlowId
                                });

                                self.FlowPanel.show();
                            }
                            //#endregion
                            self.dlgAudit.omDialog('open');
                        } else {
                            $.omMessageBox.alert({
                                type: 'error', title: '流程错误',
                                content: ajaxResult.Message
                            });
                        }
                    }
                });
            }
            //#endregion

        },
        // 触发审批前事件，在事件中必须提供审批对象（即业务单据）的ID)
        _beforeAudit: function () {
            var self = this, ops = this.options,
                onBeforeAudit = ops.onBeforeAudit,
                args = {
                    // 是否取消，如果为true将不会出现审批对话框
                    cancel: false,
                    // 流程适用标志
                    applianceSign: ops.applianceSign,
                    // 单据类名
                    billType: ops.billType,
                    // 单据ID，即审批对象ID，必须提供
                    billId: self.isAuditing ? ($.getUrlParam("oid") || '') : '',
                    // 单据名称，可选
                    billName: '',
                    // 是否正在审批
                    isAuditing: self.isAuditing,
                    // 审批明细记录ID，即审批时存在
                    auditLogId: self.auditLogId || ''
                };
            if (!onBeforeAudit || typeof onBeforeAudit != 'function') {
                $.omMessageBox.alert({
                    type: 'error', title: '流程错误',
                    content: '流程控件中必须提供onBeforeAudit事件！'
                });
                return null;
            }
            onBeforeAudit.call(self, args);
            if (!args.billId) {
                $.omMessageBox.alert({
                    type: 'error', title: '流程错误',
                    content: '在流程控件的onBeforeAudit事件中必须设置审批对象ID，即billId'
                });
                return null;
            }
            if (args.applianceSign != self.options.applianceSign) self.options.applianceSign = args.applianceSign;
            if (args.billType != self.options.billType) self.options.billType = args.billType;
            self.options._billid = args.billId;
            return args;
        },
        //#region 接口函数
        // 启用流程按钮。若是审批过程，btn取值为audit或view，
        // 如果未指定btn,则同时启用审批和查看按钮；如果不是审批模块，则启用提交审批按钮。
        enable: function (btn) {
            var self = this, idprefix = this.element.prop('id') + '_';
            if (!self.isAuditing) {
                $('#' + idprefix + 'submit').omButton('enable');
            } else {
                if (btn == 'audit') {
                    $('#' + idprefix + 'audit').omButton('enable');
                } else if (btn == 'view') {
                    $('#' + idprefix + 'view').omButton('enable');
                } else {
                    $('#' + idprefix + 'audit').omButton('enable');
                    $('#' + idprefix + 'view').omButton('enable');
                }
            }
        },
        // 停用流程按钮。若是审批过程，btn取值为audit或view，
        // 如果未指定btn,则同时停用审批和查看按钮；如果不是审批模块，则停用提交审批按钮。
        disable: function (btn) {
            var self = this, idprefix = this.element.prop('id') + '_';
            if (!self.isAuditing) {
                $('#' + idprefix + 'submit').omButton('disable');
            } else {
                if (btn == 'audit') {
                    $('#' + idprefix + 'audit').omButton('disable');
                } else if (btn == 'view') {
                    $('#' + idprefix + 'view').omButton('disable');
                } else {
                    $('#' + idprefix + 'audit').omButton('disable');
                    $('#' + idprefix + 'view').omButton('disable');
                }
            }
        },
        // 提交审批 
        //   如果billId为空，显示提交审批对话框。
        // 否则表示直接发起一个新的审批，调用成功后将执行回调函数callback，其参数为服务端返回的结果对象AjaxResult
        submit: function (billId, billDesc, callback) {
            var self = this, ops = this.options;
            if (!billId) {
                self._doSubmit.call(self);
            } else {
                var sUrl = getCommonDataUrl('WFSubmitToAuditing', {
                    billtype: ops.billType,
                    sign: ops.applianceSign || '',
                    billid: billId,
                    billdesc: billDesc || ''
                });
                var result = false;
                jdpExec(sUrl, function (ajaxResult) {
                    if (callback) callback(ajaxResult);
                    result = ajaxResult.Succeed;
                });
                return result;
            }
        },
        // 执行审批
        audit: function () {
            var self = this;
            self._doAudit.call(self);
        },
        // 查看审批记录
        view: function () {
            var self = this;
            self._doView.call(self);
        },
        //#endregion

        done: true
    });
    //#endregion

    //#region 工作流审批面板组件：bdpWfAuditPanel
    $.omWidget('bdp.bdpWfAuditPanel', {
        options: {
            // 审批单据的实体类名，必须. 可以是值，也可以是返回值的函数
            billType: '',
            // 当前审批对象的ID，必须. 可以是值，也可以是返回值的函数
            billId: '',
            // 流程适用标志，可选。当同一种单据配置了多个审批流程时，此标志辅助确定采用的审批流程。
            // 可以是值，也可以是返回值的函数
            applianceSign: '',
            // 当前审批记录ID，可以是值，也可以是返回值的函数
            auditLogId: '',
            // 是否显示流程面板
            showFlowPanel: true,
            // 流程面板渲染成功后事件
            //onSuccess: function (wfinfo) { }
        },
        _create: function () {
            // 当前审批对象ID
            this.billId = $.getUrlParam("oid") || '';
            // 审批明细记录id
            this.auditLogId = $.getUrlParam('wflogid') || '';
            // 是否为审批界面
            this.isAuditing = this.auditLogId ? true : false;
            this._layout();
            this._loadData();
        },
        _layout: function () {
            var ht = [], self = this;
            ht.push('<div class="wf_form">');
            if (!self.isAuditing) {
                ht.push('<div class="wf_objname">');
                ht.push('<span class="label">审批名称(待审对象的简短说明)：</span><br/>');
                ht.push('<input class="objname" type="text" name="', this._getId('objname'), '" />');
                ht.push('</div>');
            } else {
                ht.push('<div class="wf_opinion">');
                ht.push('<span class="label">审批意见(450字节以内)：</span><br/>');
                ht.push('<textarea class="opinion" name="', this._getId('opinion'), '"></textarea>');
                ht.push('<div class="row">',
                    '<div class="left">',
                        '<span class="label">结论：</span>',
                        '<label class="jielun"><input type="radio" class="pass" name="', this._getId('jielun'), '" checked="checked" />同意</label>',
                        '<label class="jielun"><input type="radio" class="nopass" name="', this._getId('jielun'), '" />不同意</label>',
                    '</div>',
                    '<div class="right">',
                        '<label class="jielun"><input type="checkbox" class="isend" name="', this._getId('isend'), '" />终止流程</label>',
                    '</div>');
                ht.push('</div>');
                ht.push('</div>');
            }
            // 显示提示信息
            //ht.push('<div class="hintmsg"></div>');
            // 流转信息
            ht.push('<div class="flowpanel">',
                    '<div class="row">',
                        '<div class="left"><span class="label">流程：</span><input id="', this._getId('flow'), '" /></div>',
                        '<div class="left"><span class="label">节点：</span><input id="', this._getId('node'), '" /></div>',
                    '</div>',
                    '<div class="row spr"><table id="', this._getId('spr'), '"></table></div>',
                '</div>');

            ht.push('</div>');

            this.element.empty().append(ht.join(''));
            $('#' + this._getId('flow'), this.element).omCombo({
                valueField: 'FlowId',
                inputField: 'FlowName',
                optionField: 'FlowName',
                forceSelction: true,
                editable: false,
                onValueChange: function (target, newValue, oldValue, event) {
                    var dlgData = self.dlgData || {},
                        flows = $.grep(dlgData.Flows || [], function (f, i) {
                            return f.FlowId == newValue;
                        });
                    if (flows.length > 0) {
                        var nodes = flows[0].Nodes || [];
                        $('#' + self._getId('node'), self.element).omCombo({
                            disabled: !flows[0].AllowSelectNode,
                            readOnly: !flows[0].AllowSelectNode,
                            dataSource: nodes,
                            value: nodes.length == 0 ? '' : nodes[0].NodeId
                        });
                    }
                }
            });
            $('#' + this._getId('node'), this.element).omCombo({
                valueField: 'NodeId',
                inputField: 'NodeName',
                optionField: 'NodeName',
                forceSelction: true,
                editable: false,
                onValueChange: function (target, newValue, oldValue, event) {
                    var tblSpr = $('#' + self._getId('spr'), self.element),
                        grid = tblSpr.closest('.om-grid'),
                        loadMask = $('.gBlock', grid);
                    loadMask.show();
                    var args = {
                        nodeid: newValue || '',
                        billtype: self._getOptionValue('billType'),
                        billid: self._getOptionValue('billId') || self.billId || ''
                    };
                    $.getJSON(getCommonDataUrl('WFGetDialogAuditors', args),
                        function (ajaxResult) {
                            if (ajaxResult.Succeed) {
                                var data = ajaxResult.Data || {};
                                tblSpr.omGrid('setData', data.Auditors);
                                if (data.AutoSelectAll) {
                                    var indexes = [];
                                    $.each(data.Auditors.rows, function (i) { indexes.push(i); });
                                    tblSpr.omGrid('setSelections', indexes);
                                }
                                tblSpr.omGrid('resize');
                                self.readOnly = data.ReadOnly;
                                tblSpr.omGrid('allowSelect', !self.readOnly);
                            } else {
                                $.omMessageBox.alert({
                                    type: 'error', title: '流程错误',
                                    content: ajaxResult.Message
                                });
                            }
                            loadMask.hide();
                        });
                }
            });
            $('#' + this._getId('spr'), this.element).omGrid({
                autoFit: true,
                height: 170,
                width: 'fit',
                limit: -1,
                singleSelect: false,
                showIndex: false,
                colModel: [{
                    header: '审批人', name: 'UserName', width: 'autoExpand'
                }]
            });
            $(window).resize(function () {
                $('#' + self._getId('spr'), self.element).omGrid('resize');
            });
        },
        _loadData: function () {
            var self = this;
            var args = {
                billtype: self._getOptionValue('billType'),
                sign: self._getOptionValue('applianceSign'),
                billid: self._getOptionValue('billId'),
                wflogid: self._getOptionValue('auditLogId')
            }
            if (!args.billtype) {
                $.omMessageBox.alert({
                    type: 'error', title: '流程错误',
                    content: '必须设置审批对象的实体类名！billType'
                });
                return;
            }
            args.billid = args.billid || self.billId;
            if (!args.billid) {
                $.omMessageBox.alert({
                    type: 'error', title: '流程错误',
                    content: '必须设置审批对象ID！billId'
                });
                return;
            }
            $('div.flowpanel', self.element).hide();
            args.wflogid = args.wflogid || self.auditLogId;
            $.getJSON(getCommonDataUrl('WFGetDialogInfo', args), function (ajaxResult) {
                if (ajaxResult.Succeed) {
                    var dlgData = ajaxResult.Data || {};
                    //#region 更新对话框控件内容
                    if (!self.isAuditing) {
                        $('input.objname', self.element).val(args.billName || dlgData.DefaultObjectName || '');
                        //$('div.hintmsg', self.element).text("请选择审批流程及审批人");
                    } else {
                        $('.opinion', self.element).val('');
                        $('input.pass', self.element).prop('checked', true);
                        if (dlgData.IsLast) {
                            $('input.isend', self.element)
                                .attr('disabled', 'disabled')
                                .prop('checked', true)
                                .parent().hide();
                        } else if (dlgData.AllowTerminate) {
                            $('input.isend', self.element).removeAttr('disabled');
                        } else {
                            $('input.isend', self.element).attr('disabled', 'disabled');
                        }
                        //$('div.hintmsg', self.element).text("填写意见后，请选择下一环节的审批人员");
                    }
                    self.dlgData = dlgData;
                    if (!dlgData.FlowPanelVisible) {
                        //$('div.flowpanel', self.element).hide();
                        //$('div.hintmsg', self.element).text(dlgData.HintMsg || '');
                    } else {
                        $('#' + self._getId('flow'), self.element).omCombo({
                            disabled: self.isAuditing,
                            readOnly: self.isAuditing,
                            dataSource: dlgData.Flows,
                            value: dlgData.Flows.length == 0 ? '' : dlgData.Flows[0].FlowId
                        });

                        //$('div.flowpanel', self.element).show();
                    }
                    if (self.options.showFlowPanel && dlgData.FlowPanelVisible) {
                        $('div.flowpanel', self.element).show();
                    }
                    //#endregion
                    var onSuccess = self.options.onSuccess;
                    onSuccess && onSuccess.call(self, dlgData);
                } else {
                    $.omMessageBox.alert({
                        type: 'error', title: '流程错误',
                        content: ajaxResult.Message
                    });
                }
            });
        },
        // 获取流程提交信息对象
        _getSubmitInfo: function () {
            var self = this;
            var dlgData = self.dlgData;
            var args = {
                billtype: self._getOptionValue('billType'),
                billid: self._getOptionValue('billId') || self.billId,
                wflogid: self._getOptionValue('auditLogId') || self.auditLogId,
                nodeid: $('#' + self._getId('node'), self.element).omCombo('value') || '',
                optionText: self.isAuditing ? $('textarea.opinion', self.element).val() : $('input.objname', self.element).val(),
                ispassed: !self.isAuditing ? false : $('input.pass', self.element).prop('checked') ? true : false,
                isend: !self.isAuditing ? false : $('input.isend', self.element).prop('checked') ? true : false,
                auditorIds: []
            };
            if (dlgData.IsLast) args.isend = true;
            if (dlgData.FlowPanelVisible) {
                var rows = $('#' + self._getId('spr'), self.element).omGrid('getSelections', true);
                $.each(rows, function (i, r) { args.auditorIds.push(r.UserId); });
            }
            if (args.auditorIds.length < 1 && !(args.isend || !dlgData.FlowPanelVisible || !args.ispassed)) {
                $.omMessageBox.alert({
                    type: 'error', title: '流程错误',
                    content: '至少需要选定一位审批人！'
                });
                return;
            }
            return args;
        },
        _getId: function (id) {
            return this.element.prop('id') + '_' + id;
        },
        _getOptionValue: function (key) {
            var f = this.options[key];
            return typeof (f) == 'function' ? f.call(this) : f;
        },
        //#region 接口
        // 获取流程信息对象
        getFlowInfo: function () {
            return this.dlgData;
        },
        // 获取流程提交数据.
        // 如果业务模块需要自己处理流程流转时可使用此函数提交信息对象
        getFlowSubmitData: function () {
            return this._getSubmitInfo();
        },
        // 提交流程
        // billId 指定单据ID，可选
        // billDesc 审批名称或审批意见文本，可选
        // callback 提交成功后的回调函数，回传参数为提交的信息对象，可选
        submit: function (billId, billDesc, callback) {
            var self = this, args = this._getSubmitInfo();
            if (!args) return;

            var fcallback = undefined;
            if (typeof billId == 'function') {
                fcallback = billId;
            } if (typeof billDesc == 'function') {
                if (billId) args.billid = billId;
                fcallback = billDesc;
            } if (typeof callback == 'function') {
                if (billId) args.billid = billId;
                if (billDesc) args.optionText = billDesc;
                fcallback = callback;
            }
            $.post(getCommonDataUrl('WFDialogSumbit'), JSON.stringify(args),
                function (ret) {
                    if (ret.Succeed) {
                        fcallback && fcallback.call(self, args);
                    } else {
                        $.omMessageBox.alert({
                            type: 'error', title: '流程错误',
                            content: ret.Message || ''
                        });
                    }
                }, 'json');
        },
        //#endregion
        done: true
    });
    //#endregion

    //#region 流程实例查看面板
    $.omWidget('bdp.bdpWfViewer', {
        options: {
            wfActionId: '',
            wfLogId: '',
            showFlowGraph: true,
            showFlowLogs: true
        },
        _create: function () {
            var self = this, $elem = this.element, idprefix = $elem.prop('id') + "_";
            $elem.empty()
                //.css({ position: 'relative', "display": "block" })
                .append('<div id="' + idprefix + 'flowgraph"></div>' +
                '<div id="' + idprefix + 'flowlogs">' +
                    '<div id="' + idprefix + 'minfo"></div>' +
                    '<div id="' + idprefix + 'divlogs">' +
                        '<table id="' + idprefix + 'gridlog"></table>' +
                    '</div>' +
                '</div>');

            self.flowgraph = $('#' + idprefix + 'flowgraph')
                .css({
                    position: 'relative',
                    float: 'left',
                    "min-width": "397px",
                    'margin-top': '0px',
                    'margin-left': '0px',
                    'margin-right': '7px',
                    'margin-bottom': '3px',
                    "padding": "0px",
                    "display": "block"
                })
            ;
            self.flowlogs = $('#' + idprefix + 'flowlogs')
                .css({
                    position: 'relative',
                    float: 'left',
                    "min-width": "403px",
                    'margin-top': '0px',
                    'margin-left': '0px',
                    "padding": "3px",
                    "border": "1px solid rgb(134, 163, 196)",
                    "display": "block"
                })
            ;
            self.divlogs = $('#' + idprefix + 'divlogs');
            self.minfo = $('#' + idprefix + 'minfo').css({ width: '99%' }).bdpEditPanel({
                isView: true,
                gridLine: true,
                columnCount: 2,
                colModel: [{
                    header: '<b>业务名称</b>', name: 'ActionName', editor: {
                        colspan: 2,
                        renderer: function (cm, value) {
                            return '<b>' + value + '</b>';
                        }
                    }
                }, {
                    header: '业务类别', name: 'BillKindName'
                }, {
                    header: '发起人', name: 'SubmitPerson'
                }, {
                    header: '发起日期', name: 'SubmitDate'
                }, {
                    header: '审批流程', name: 'FlowName'
                }, {
                    header: '当前结点', name: 'NodeName'
                }, {
                    header: '审批状态', name: 'AuditState'
                }]
            });
            self.gridlog = $('#' + idprefix + 'gridlog').omGrid({
                limit: -1,
                height: 260,
                colModel: [{
                    header: '流程结点', name: 'FlowNode', width: 130,
                    renderer: function (value, rowData, rowIndex) {
                        return rowData.NodeOrder <= 0 ? "发起" : rowData.NodeOrder + " - " + rowData.NodeName;
                    }
                }, {
                    header: '审批人', name: 'AuditPerson', align: 'center', width: 70
                }, {
                    header: '时间', name: 'AuditDate', width: 140
                }, {
                    header: '通过', name: 'IsPassed', align: "center", width: 30,
                    renderer: function (value, rowData, rowIndex) {
                        return rowData.State != '已审批' || rowData.AuditOpinion == "(被抢先)" ? "" : value ? "√" : "×";
                    }
                }, {
                    header: '会签', name: 'IsCountersign', align: "center", width: 30,
                    renderer: function (value, rowData, rowIndex) {
                        return value ? "√" : "×";
                    }
                }, {
                    header: '终止', name: 'IsEnd', align: "center", width: 30,
                    renderer: function (value, rowData, rowIndex) {
                        return rowData.AuditOpinion == "(被抢先)" ? "" : value ? "√" : "×";
                    }
                }, {
                    header: '状态', name: 'State', align: 'center', width: 50
                }, {
                    header: '意见', name: 'AuditOpinion', width: 'autoExpand'
                }, {
                    header: '备注', name: 'Remark', width: 150
                }]
            });
            $(window).resize(function () {
                self.resize();
            });
        },
        _init: function () {
            var self = this, ops = this.options,
                id = ops.wfActionId || '',
                wflogid = ops.wfLogId || '';
            if (ops.showFlowGraph) self.flowgraph.show(); else self.flowgraph.hide();
            if (ops.showFlowLogs) self.flowlogs.show(); else self.flowlogs.hide();
            self.setData(id, wflogid);
            //self.resize();
            $(window).trigger('resize');
        },
        //#region 接口函数
        setData: function (wfActionId, wfLogId) {
            var self = this,
                sUrl = getCommonDataUrl('WFGetFlowExecuteInfo', { id: wfActionId, wflogid: wfLogId });
            $.getJSON(sUrl, function (ajaxResult) {
                if (ajaxResult.Succeed) {
                    // 主表信息
                    self.minfo.bdpEditPanel('setValues', ajaxResult.Data);
                    if (ajaxResult.Data.AuditObjectViewUrl) {
                        $('#' + self.minfo.prop('id') + '_edit_ActionName')
                            .wrapInner('<a href="' + ajaxResult.Data.AuditObjectViewUrl +
                                '" target="_blank" title="查看审批内容..."></a>');
                    }
                    var logsData = { rows: ajaxResult.Data.Logs || [] };
                    logsData.total = logsData.rows.length;
                    self.gridlog.omGrid('setData', logsData);
                    $.createFlowView(self.flowgraph.prop('id'), ajaxResult.Data)
                    $('.GooFlow_item', self.flowgraph).on('mouseenter', function () {
                        var nodeid = $(this).prop("id").split("_")[1] || "",
                            logIndexs = [];
                        $.each(logsData.rows, function (index, log) {
                            if ((nodeid == "start" && log.NodeOrder == -1) || log.NodeId == nodeid) {
                                logIndexs.push(index);
                            }
                        });
                        self.gridlog.omGrid('setSelections', logIndexs);
                    });
                    $(window).trigger('resize');
                } else {
                    $.omMessageBox.alert({
                        type: 'error', title: '流程错误',
                        content: "获取流程数据错误！" + ajaxResult.Message
                    });
                }
            });
        },

        resize: function () {
            var self = this;
            var w = self.element.width() - $(self.flowgraph).outerWidth() - 32;
            self.flowlogs.width(w);
            self.gridlog.omGrid('resize');
        },
        //#endregion

        done: true
    });
    //#endregion

})(jQuery);

