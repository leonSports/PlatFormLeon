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

// 获取数据提供地址
var getDataUrl = function (fn, args) {
    //var s = "IdeDataHandler.ashx?rnd=" + Math.random() + "&fn=" + fn;
    //if (args) s += "&" + args;
    //return s;
    return getCommonDataUrl(fn, args);
};

function updateDict(rowIndex, event, isUpdateRel) {
    if (!confirm("更新字典将修改数据字典中的数据，请仔细检查后再执行此功能。\n\n现在执行吗？"))
        return;
    event.cancelBubble = true;
    var $grid = $(isUpdateRel ? "#grid-rel" : "#grid"),
        data = $grid.omGrid("getData").rows[rowIndex],
        sUrl = getDataUrl("updateDict", "id=" + data.Id);
    if (isUpdateRel)
        sUrl += "&rel=1";
    $.ajax({
        type: "POST",
        url: sUrl,
        success: function (strResult) {
            var res = $.parseJSON(strResult) || {};
            if (res.Succeed) {
                $grid.omGrid('reload');
                $.omMessageBox.alert({
                    content: "成功更新数据字典！"
                });
            } else {
                $.omMessageBox.alert({
                    type: 'error', title: '错误',
                    content: '更新数据字典失败！' + (res ? res.Message : '')
                });
            }
        }
    });
}

$(document).ready(function () {
    $("body").omBorderLayout({
        panels: [
        //    {
        //    id: "ptools",
        //    region: "north",
        //    resizable: false,
        //    header: false,
        //    height: 40
        //},
        {
            id: "ptree",
            region: "west",
            resizable: true,
            title: "EF模型",
            width: 220
        }, {
            id: "ptab",
            region: "center",
            header: false
        }],
        onAfterDrag: function () {
            $(window).resize();
        },
        fit: true
    });
    $("#entTree").omTree({
        dataSource: getDataUrl("getEdmTreeNodes"),
        onBeforeExpand: function (node) {
            var nodeDom = $("#" + node.nid);
            if (nodeDom.hasClass("hasChildren")) {
                nodeDom.removeClass("hasChildren");
                $.ajax({
                    url: getDataUrl("getEdmTreeNodes", "pid=" + node.id + "&cls=" + node.classes),
                    method: 'POST',
                    dataType: 'json',
                    success: function (data) {
                        $("#entTree").omTree("insert", data, node);
                    }
                });
            }
            return true;
        },
        onSelect: function (node) {
            switch (node.classes) {
                case "entity":
                    var b = $("#chkInvalid").prop("checked") ? "1" : "0";
                    var url = getDataUrl("getEdmEntityMapping", "id=" + node.id + "&chk=" + b);
                    $("#grid").omGrid("setData", url);
                    $("#grid").omGrid("resize");
                    break;
                case "association":
                    var b = $("#chkRelInvalid").prop("checked") ? "1" : "0";
                    var url = getDataUrl("getEdmAssociation", "id=" + node.id + "&chk=" + b);
                    $("#grid-rel").omGrid("setData", url);
                    $("#grid-rel").omGrid("resize");
                    break;
            }
        }
    });
    $("#make-tab").omTabs({
        height: "fit"
    });
    $("#cls-tool").append('<input type="checkbox" id="chkInvalid" />仅显示不匹配的实体类');
    $("#rel-tool").append('<input type="checkbox" id="chkRelInvalid" />仅显示不匹配的实体类');

    $("#cls-tool").append('<a id="export-test" ></a>');
    $('#export-test').css({ 'padding-left': 12 }).omButton({
        label: "导出",
        onClick: function (event) {
            var gridOps = $("#grid").omGrid("options");
            $('#grid').omGrid('toExcel', {
                //dataSource: ROOT_PATH + 'frame/ide/' + gridOps.dataSource,
                title: '实体模型与数据字典对照表',
                allowSelectColumn: true,
                colModel: [
                    [
                        { header: "序号", name: "_RowNo", width: 6, rowspan: 3 },
                        { header: "实体模型", colspan: 5 },
                        { header: "ID", name: "ID", rowspan: 3 },
                        { header: "数据字典", colspan: 3 },
                        { header: "备注", name: "DDSetNotes", width: 50, rowspan: 3 }
                    ],
                    [
                        { header: "类名", name: "ETName", width: 20, rowspan: 2 },
                        { header: "名称", name: "ETSumary", width: 30, rowspan: 2 },
                        { header: "说明", name: "ETDescription", width: 30, rowspan: 2 },
                        //{ header: "表名", name: "ETTableName", width: 24 },
                        //{ header: "架构", name: "ETTableSchema", width: 20 },
                        { header: "数据库对象", colspan: 2 },
                        { header: "标识", name: "DDSetId", rowspan: 2 },
                        { header: "名称", name: "DDSetName", width: 30, rowspan: 2 },
                        { header: "拥有者", name: "DDSetOwner", rowspan: 2 }
                    ],
                    [
                        { header: "表名", name: "ETTableName", width: 24 },
                        { header: "架构", name: "ETTableSchema", width: 20 }
                    ]
                ],
                headers: [{ x: 1, y: 1, x1: 2, value: "实体模型：" }],
                tails: [{ x: 9, x1: 10, y: 1, value: "打印日期：" + $.formatDate(new Date(), 'yy年mm月dd日') }]
            });

        }
    });

    var colRenderer = function (colValue, rowData, rowIndex) {
        if (rowData.IsValid) return colValue;
        return '<span style="color:red;"><b>' + colValue + '</b></span>';
    }
    var boolValueRenderer = function (colInfo, value) {
        return '<input type="checkbox" ' + (value ? 'checked="checked"' : "") + '" />';  // value ? "是" : "否";
    }
    $("#grid").omGrid({
        width: "100%",
        height: 365,
        autoFit: true,
        limit: 10,
        //dataSource: getDataUrl("getEdmEntityMapping"),
        editOnDblclick: true,
        editOptions: {                  //dialog    rowpanel    fixpanel    multirow
            title: '实体映射',
            width: 550,
            height: 410,
            align: 'center',
            editors: {                  // bdpEditPanel
                isView: true,
                gridLine: true,
                columnCount: 1
                //colModel: userInfoModel
            }
        },
        colModel: [
            [
                { header: "实体模型", colspan: 3, editor: { index: -1 } },
                { header: "数据字典", colspan: 2, editor: { index: -1 } },
                {
                    header: "操作", name: "options", rowspan: 2, width: 60, renderer: function (colValue, rowData, rowIndex) {
                        if (rowData.IsValid) return '';
                        return '<button onClick="updateDict(' + rowIndex + ',event,false)">更新字典</button>'
                    }
                }
            ],
            [
                { header: "ID", name: "Id", visible: false },
                { header: "类名", name: "ETName", width: 120, renderer: colRenderer, editor: { caption: "模型.类名" } },
                { header: "名称", name: "ETSumary", width: 220, renderer: colRenderer, editor: { caption: "模型.名称" } },
                { header: "模型.说明", name: "ETDescription", visible: false, editor: { name: "ETDescription" } },
                { header: "表名", name: "ETTableName", width: 120, renderer: colRenderer, editor: { caption: "模型.表名" } },
                { header: "模型.架构", name: "ETTableSchema", visible: false },
                { header: "标识", name: "DDSetId", width: 120, renderer: colRenderer, editor: { caption: "字典.标识" } },
                { header: "名称", name: "DDSetName", width: 220, renderer: colRenderer, editor: { caption: "字典.名称" } },
                { header: "字典.说明", name: "DDSetNotes", visible: false },
                { header: "字典.拥有者", name: "DDSetOwner", visible: false },
                { header: "操作", name: "IsValid", visible: false, editor: { renderer: boolValueRenderer } }
            ]
        ],
        onRowSelect: function (rowIndex, rowData, event) {
            var url = getDataUrl("getEdmPropertyMapping", "id=" + rowData.Id);
            $("#grid-fld").omGrid({ title: rowData.ETSumary, dataSource: url });
            //$("#grid-fld").omGrid("setData", url);
            $("#grid-fld").omGrid("resize");
        }
    });

    var gridFldColRenderer = function (colValue, rowData, rowIndex) {
        //if (rowData.DDFldId) return colValue;
        if (rowData.IsValid) return colValue;
        return '<span style="color:red;"><b>' + colValue + '</b></span>';
    }
    $("#grid-fld").omGrid({
        width: "100%",
        height: 365,
        autoFit: true,
        limit: 10,
        ItemsPerPage: [10, 50, 100],
        //dataSource: getDataUrl("getEdmEntityMapping"),
        editOnDblclick: true,
        editOptions: {                  //dialog    rowpanel    fixpanel    multirow
            title: '属性映射',
            width: 550,
            height: 410,
            align: 'center',
            editors: {                  // bdpEditPanel
                isView: true,
                gridLine: true,
                columnCount: 1
                //colModel: userInfoModel
            }
        },
        colModel: [
            [
                { header: "实体模型", colspan: 5, editor: { index: -1 } },
                { header: "数据字典", colspan: 3, editor: { index: -1 } }
            ],
            [
                { header: "ID", name: "Id", visible: false },
                { header: "属性", name: "PropName", width: 80, renderer: gridFldColRenderer, editor: { caption: "模型.属性名" } },
                { header: "类型", name: "PropType", width: 50, renderer: gridFldColRenderer, editor: { caption: "模型.类型" } },
                { header: "注释", name: "PropSummary", width: 120, renderer: gridFldColRenderer, editor: { caption: "模型.注释" } },
                { header: "模型.说明", name: "PropDescription", visible: false },
                { header: "字段", name: "FldName", width: 80, renderer: gridFldColRenderer, editor: { caption: "模型.实体字段" } },
                { header: "类型", name: "FldType", width: 80, renderer: gridFldColRenderer, editor: { caption: "模型.实体类型" } },
                { header: "模型.最大长度", name: "FldMaxLength", visible: false },
                { header: "模型.是否主键", name: "FldIsPrimary", visible: false, editor: { renderer: boolValueRenderer } },
                { header: "模型.允许为空", name: "FldNullable", visible: false, editor: { renderer: boolValueRenderer } },
                { header: "标识", name: "DDFldId", width: 80, editor: { caption: "字典.标识" } },
                { header: "名称", name: "DDFldName", width: 80, editor: { caption: "字典.名称" } },
                { header: "类型", name: "DDFldType", width: 80, editor: { caption: "字典.类型" } },
                { header: "字典.长度", name: "DDFldLen", visible: false },
                { header: "字典.是否主键", name: "DDFldIsPrimary", visible: false, editor: { renderer: boolValueRenderer } },
                { header: "字典.允许为空", name: "DDFldNullable", visible: false, editor: { renderer: boolValueRenderer } },
                { header: "字典.说明", name: "DDFldNote", visible: false }
            ]
        ]
    });

    $("#grid-rel").omGrid({
        //width: "100%",
        //height: 'fit',
        autoFit: true,
        editOnDblclick: true,
        editOptions: {                  //dialog    rowpanel    fixpanel    multirow
            title: '类关联',
            width: 550,
            height: 410,
            align: 'center',
            editors: {                  // bdpEditPanel
                isView: true,
                gridLine: true,
                columnCount: 2
                //colModel: userInfoModel
            }
        },
        colModel: [
            {
                header: "操作", name: "options", width: 60, renderer: function (colValue, rowData, rowIndex) {
                    if (rowData.IsValid) return '';
                    return '<button onClick="updateDict(' + rowIndex + ',event,true)">更新字典</button>'
                },
                editor: { index: -1 }
            },
            {
                header: "类关联", name: "crel", width: 220, renderer: function (colValue, r, rowIndex) {
                    //var s = r.PType + "." + r.PProperty + " [" + r.PMultiplicity + " <==> " + r.DMultiplicity + "] " + r.DType + "." + r.DProperty;
                    var s = r.SPSetId + " <==> " + r.SDSetId
                    if (r.IsValid) return s;
                    return '<span style="color:red;"><b>' + s + '</b></span>';
                },
                editor: { index: -1 }
            },
            {
                header: "字典关联", name: "drel", width: 220, renderer: function (colValue, r, rowIndex) {
                    if (!r.DDPSetId) return '';
                    //var s = r.DDPSetId + "." + r.DDPFldId + " [" + r.DDPMulti + " <==> " + r.DDDMulti + "] " + r.DDDSetId + "." + r.DDDFldId;
                    var s = r.DDPSetId + " <==> " + r.DDDSetId
                    if (r.IsValid) return s;
                    return '<span style="color:red;"><b>' + s + '</b></span>';
                },
                editor: { index: -1 }
            },
            { header: "代码", name: "Code", visible: false, editor: { index: 1, colspan: 2 } },
            { header: "名称", name: "Name", visible: false, editor: { index: 2, colspan: 2 } },

            { header: "主角色", name: "PRole", visible: false, editor: { index: 3 } },
            { header: "主类", name: "PType", visible: false, editor: { index: 5 } },
            { header: "主属性", name: "PProperty", visible: false, editor: { index: 7 } },
            { header: "主多重性", name: "PMultiplicity", visible: false, editor: { index: 9 } },

            { header: "从角色", name: "DRole", visible: false, editor: { index: 11 } },
            { header: "从类", name: "DType", visible: false, editor: { index: 13 } },
            { header: "从属性", name: "DProperty", visible: false, editor: { index: 15 } },
            { header: "从多重性", name: "DMultiplicity", visible: false, editor: { index: 17 } },

            { header: "字典.主角色", name: "DDPRole", visible: false, editor: { index: 4 } },
            { header: "字典.主表", name: "DDPSetId", visible: false, editor: { index: 6 } },
            { header: "字典.主字段", name: "DDPFldId", visible: false, editor: { index: 8 } },
            { header: "字典.主多重性", name: "DDPMulti", visible: false, editor: { index: 10 } },
            { header: "字典.从角色", name: "DDDRole", visible: false, editor: { index: 12 } },
            { header: "字典.从表", name: "DDDSetId", visible: false, editor: { index: 14 } },
            { header: "字典.从外键", name: "DDDFldId", visible: false, editor: { index: 16 } },
            { header: "字典.从多重性", name: "DDDMulti", visible: false, editor: { index: 18 } },

            { header: "主表", name: "SPSetId", visible: false, editor: { index: 19 } },
            { header: "主字段", name: "SPFldId", visible: false, editor: { index: 20 } },
            { header: "从表", name: "SDSetId", visible: false, editor: { index: 21 } },
            { header: "从外键", name: "SDFldId", visible: false, editor: { index: 22 } }
        ]
    });

    $(window).resize(function () {
        $("#make-tab").omTabs('resize');
        $('#grid,#grid-fld,#grid-rel').omGrid('resize');
    }).resize();

});