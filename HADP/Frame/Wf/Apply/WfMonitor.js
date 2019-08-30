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
/// <reference path="../../resources/gooflow/GooFlow.js" />
/// <reference path="../Common/BdpFlow.js" />

$(document).ready(function () {
    $('#tools').omButtonbar({
        btns: [{
            id: 'btncx', label: '查询', icons: { leftCss: 'bdp-icons-search' },
            onClick: function () {
                if ($('#cx').omPanel('options').collapsed) {
                    $('#cx').omPanel('expand');
                } else {
                    $('#cx').omPanel('collapse');
                }
            }
        }, {
            id: 'refresh', label: '刷新', icons: { leftCss: 'bdp-icons-refresh' },
            onClick: function (event) {
                var args = $('#cxpnl').bdpEditPanel('getValues').newValues;
                var sUrl = getCommonDataUrl('WFMasterQuery', "QueryParam=" + JSON.stringify(args));
                $('#grid').omGrid('setData', sUrl);
            }
        }]
    });

    $('#cx').omPanel({
        title: '查询',
        header: false,
        collapsed: true,
        collapsible: true
    });

    $('#ct').omPanel({
        title: '审批',
        collapsible: true
    });
    $('#cb').omPanel({
        title: '审批记录',
        collapsible: false
    });

    $('#cxpnl').bdpEditPanel({
        isView: false,
        gridLine: true,
        columnCount: 3,
        colModel: [{
            header: '业务名称', name: 'ActionName', editor: {
                hint: "模糊匹配"
            }
        }, {
            header: '提交人', name: 'SubmitPerson', editor: {
                hint: "模糊匹配"
            }
        }, {
            header: '业务类别', name: 'BillKindId', editor: {
                type: 'combo', name: 'BillKindId',
                options: {
                    dataSource: getCommonDataUrl('getCodes', {
                        type: 'Hongbin.WorkFlow.Model.BdpWfBillKind',
                        key: 'BillKindId', text: 'BillKindName', order: 'BillKindName'
                    }),
                    valueField: "BillKindId",
                    optionField: "BillKindName"
                }
            }
        }, {
            header: '开始日期', name: 'StartDate', editor: {
                type: 'date'
            }
        }, {
            header: '结束日期', name: 'EndDate', editor: {
                type: 'date'
            }
        }, {
            header: '审批状态', name: 'StateId', editor: {
                type: 'combo',
                options: {
                    dataSource: getCommonDataUrl('getCodes', {
                        type: 'Hongbin.WorkFlow.Model.BdpWfAuditState',
                        key: 'StateId', text: 'StateName', order: 'StateName'
                    }),
                    valueField: "StateId",
                    optionField: "StateName"
                }
            }
        }, {
            header: '审批流程', name: 'FlowId', editor: {
                type: 'combo',
                options: {
                    dataSource: getCommonDataUrl('getCodes', {
                        type: 'Hongbin.WorkFlow.Model.BdpWfFlow',
                        key: 'FlowId', text: 'FlowName', order: 'FlowName'
                    }),
                    valueField: "FlowId",
                    optionField: "FlowName"
                },
                onValueChanged: function (target, newValue, oldValue, event) {
                    var sUrl = getCommonDataUrl('getCodes', {
                        type: 'Hongbin.WorkFlow.Model.BdpWfFlowNode',
                        key: 'NodeId', text: 'NodeName', order: 'NodeOrder',
                        filter: "it.FlowId='" + newValue + "'"
                    });
                    var ctrl = $('#cxpnl').bdpEditPanel('findEditor', 'NodeId');
                    $(ctrl).omCombo('setData', sUrl);
                }
            }
        }, {
            header: '当前结点', name: 'NodeId', editor: {
                type: 'combo',
                options: {
                    //dataSource: getCommonDataUrl('getCodes', { type: 'Hongbin.WorkFlow.Model.BdpWfFlowNode', key: 'NodeId', text: 'NodeName' }),
                    valueField: "NodeId",
                    optionField: "NodeName"
                }
            }
        }, {
            header: '', name: 'op', editor: {
                onCreateEditControl: function (ctrlId, cm, parent) {
                    var div = $('<div></div>').prop('id', ctrlId).appendTo(parent);
                    $('<a>').appendTo(div).omButton({
                        label: '清除',
                        //icons: { leftCss: 'bdp-icons-clear' },
                        width: 75,
                        onClick: function (event) {
                            $('#cxpnl').bdpEditPanel('setValues', {});
                        }
                    });
                    $('<a>').appendTo(div).omButton({
                        label: '查询',
                        icons: { leftCss: 'bdp-icons-search' },
                        width: 75,
                        onClick: function (event) {
                            var args = $('#cxpnl').bdpEditPanel('getValues').newValues;
                            var sUrl = getCommonDataUrl('WFMasterQuery', "QueryParam=" + escape(JSON.stringify(args)));
                            $('#grid').omGrid('setData', sUrl);
                        }
                    });
                    return div;
                }
            }
        }]
    });

    $('#grid').omGrid({
        dataSource: getCommonDataUrl('WFMasterQuery'),
        autoFit: true,
        limit: 10,
        height: 320,
        keyFieldName: 'ActionId',
        colModel: [{
            header: '审批名称', name: 'ActionName', width: 'autoExpand', sort: 'serverSide'
        }, {
            header: '应用流程', name: 'FlowName', width: 130, sort: 'serverSide'
        }, {
            header: '提交时间', name: 'SubmitDate', width: 150, sort: 'serverSide'
        }, {
            header: '提交人', name: 'SubmitPerson', width: 80, sort: 'serverSide'
        }, {
            header: '状态', name: 'AuditState', width: 70, sort: 'serverSide'
        }, {
            header: '是否结束', name: 'IsEnd', width: 40, sort: 'serverSide',
            renderer: function (value, rowData, rowIndex) {
                return value ? "是" : "否"
            }
        }],
        onRowSelect: function (rowIndex, rowData, event) {
            $('#cb').bdpWfViewer({ wfActionId: rowData.ActionId });
        }
    });

    $(window).resize(function () {
        $('#grid').omGrid('resize');
    });
});