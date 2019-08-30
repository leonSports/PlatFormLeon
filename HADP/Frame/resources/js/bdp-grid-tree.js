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
; (function ($) {
    /* 表格树插件 - 表格中的某一列以树状结构展示
       omGrid的options中增加树列设置，格式如下：
        treeColumn: {
            // 主键字段名，必须。行数据中的主键字段
	        keyFieldName: 'id',
            // 上级字段名，必须。存储上级值的字段名
            parentFieldName: 'pid',
            // 标签字段，必须。在树节点中显示值的字段名，必须在列模型中存在以示明在哪一列显示。
            textFieldName: 'dept',
            // 标志是否有下级的字段名，可选，缺省为 hasChildren
            hasChildrenFieldName: 'hasChildren'
        },
        // 请求数据前，允许调用者传递参数到后台
        onBeforeRequestData: function (rowData, param){}
    */
    $.omWidget.addInitListener('om.omGrid', function () {
        var self = this,
            ops = self.options;
        if (!ops.treeColumn || typeof ops.treeColumn != 'object' ||
            !ops.treeColumn.keyFieldName || !ops.treeColumn.parentFieldName ||
            !ops.treeColumn.textFieldName) {
            return;
        }
        if (self._gridTreeExtended) {
            return;
        }
        self.element.addClass('table_tree');
        ops.treeColumn.hasChildrenFieldName = ops.treeColumn.hasChildrenFieldName || 'hasChildren';
        //#region 扩展
        $.extend(this, {
            // 获取由主键值组成的路径串
            getIdPath: function (rowData, rows) {
                var tc = this.options.treeColumn,
                    fnKey = tc.keyFieldName, fnParent = tc.parentFieldName,
                    id = rowData[fnKey] || '',
                    pid = rowData[fnParent] || '';
                if (id != '' && pid != '') {
                    var par = $.grep(rows, function (r) { return r[fnKey] == pid });
                    if (par.length > 0) id = this.getIdPath(par[0], rows) + "/" + id;
                }
                return id;
            },
            //// 排序行数据,并为每行数据对象增加一个idPath属性
            //sortRows: function (rows) {
            //    var self = this,
            //        props = [],
            //        ret = [],
            //        i = 0,
            //        len = rows.length;
            //    for (; i < len; i++) {
            //        var r = rows[i],
            //            rPath = self.getIdPath(r, rows);
            //        r.idPath = rPath;
            //        (props[i] = new String(rPath))._rowData = r;
            //    }
            //    //props.sort();
            //    for (i = 0; i < len; i++) {
            //        ret[i] = props[i]._rowData;
            //    }
            //    return ret;
            //},
            // 隐藏下级行
            hideChildRows: function (rowData) {
                var self = this,
                    allTrs = self._getTrs(),
                    allRows = self.pageData.data.rows,
                    s1 = '/' + rowData.idPath + '/';
                $.each(allRows, function (index, r) {
                    var s2 = '/' + r.idPath + '/';
                    if (s1 != s2 && s2.substring(0, s1.length) == s1) {
                        var $tr = allTrs.eq(index).removeClass('om-state-highlight').hide();
                        $('span.treebtn-collapsable', $tr).removeClass('treebtn-collapsable').addClass('treebtn-expandable');
                        $('span.treebtn-lastCollapsable', $tr).removeClass('treebtn-lastCollapsable').addClass('treebtn-lastExpandable');
                    }
                });
            },
            // 显示下一级
            showChildRows: function (rowData) {
                var self = this,
                    fnHasChildren = self.options.treeColumn.hasChildrenFieldName,
                    allTrs = self._getTrs(),
                    allRows = self.pageData.data.rows,
                    s1 = '/' + rowData.idPath + '/',
                    childDataLoaded = false;
                $.each(allRows, function (index, r) {
                    var s2 = '/' + r.idPath + '/';
                    if (s1 != s2 && s2.substring(0, s1.length) == s1) {
                        // 只展开一层
                        if (s2.split('/').length - s1.split('/').length == 1) {
                            allTrs.eq(index).removeClass('om-state-highlight').show();
                            childDataLoaded = true;
                        }
                    }
                });
                if (!childDataLoaded && rowData[fnHasChildren]) {
                    self.loadChildData(rowData);
                    // 只调一次?
                    rowData[fnHasChildren] = false;
                }
            },
            // 返回指定行路径是否还有下级, 如果没有指定rows则使用当前页数据
            getHasChild: function (idPath, rows) {
                if (!rows) rows = self.pageData.data.rows;
                var s1 = '/' + idPath + '/';
                for (var i = 0, len = rows.length; i < len; i++) {
                    var s2 = '/' + rows[i].idPath + '/';
                    if (s1 != s2 && s2.substring(0, s1.length) == s1) return true;
                }
                return false;
            },
            // 返回指定行路径是否还有后续的兄弟节点, 如果没有指定rows则使用当前页数据
            getHasSibling: function (idPath, rows) {
                if (!rows) rows = self.pageData.data.rows;
                var s1 = '/' + idPath + '/';
                for (var i = 0, len = rows.length; i < len; i++) {
                    if (rows[i].idPath == idPath) {
                        i++;
                        for (; i < len; i++) {
                            var s2 = '/' + rows[i].idPath + '/';
                            if (s2.substring(0, s1.length) != s1) {
                                var a1 = idPath.split('/'), a2 = rows[i].idPath.split('/');
                                a1.pop(); a2.pop();
                                if (a2.length >= a1.length && a2.join('/') == a1.join('/'))
                                    return true;
                                return false;
                            }
                        }
                    }
                }
                return false;
            },
            // 加载某行的下级行数据, dataSoutce为地址，自动在地址上附加上级id值参数
            loadChildData: function (rowData, afterCallback) {
                var self = this,
                    op = this.options,
                    fnKey = op.treeColumn.keyFieldName,
                    fnParent = op.treeColumn.parentFieldName,
                    dataUrl = op.dataSource;
                if (typeof dataUrl == 'string' && !self.loading) {
                    dataUrl += dataUrl.indexOf('?') > 0 ? '&' : '?';
                    dataUrl += fnParent + '=' + rowData[fnKey];
                    var grid = self.element.closest('.om-grid'),
                        nowPage = self.pageData.nowPage || 1,
                        loadMask = $('.gBlock', grid),
                        pageStat = $('.pPageStat', grid);
                    self.loading = true;
                    pageStat.html($.om.lang._get(op, 'omGrid', 'loadingMsg'));
                    loadMask.show();
                    var limit = (op.limit <= 0) ? 100000000 : op.limit;
                    var param = $.extend(true, {}, this._extraData, op.extraData, {
                        start: limit * (nowPage - 1),
                        limit: limit,
                        _time_stamp_: new Date().getTime()
                    });
                    // 请求数据前，允许调用者传递参数到后台
                    op.onBeforeRequestData && op.onBeforeRequestData.call(this, rowData, param);
                    $.ajax({
                        type: op.method,
                        url: dataUrl,
                        data: param,
                        dataType: 'json',
                        success: function (data, textStatus, request) {
                            if ($.isArray(data)) {
                                data = { total: data.length, rows: data };
                            }
                            if (typeof (op.onSuccess) == 'function') {
                                self._trigger("onSuccess", null, data, textStatus, request);
                            }
                            self._addChildData.call(self, data, rowData);
                            //for (var i = 0, len = op._onRefreshCallbacks.length; i < len; i++) {
                            //    op._onRefreshCallbacks[i].call(self);
                            //}
                            //self._trigger("onRefresh", null, nowPage, data.rows);
                            afterCallback && afterCallback.call(self);
                            loadMask.hide();
                            self.loading = false;
                        },
                        error: function (XMLHttpRequest, textStatus, errorThrown) {
                            pageStat.html($.om.lang._get(op, "omGrid", "errorMsg")).css('color', 'red');
                            try {
                                var onError = op.onError;
                                if (typeof (onError) == 'function') {
                                    onError(XMLHttpRequest, textStatus, errorThrown);
                                }
                            } catch (e) {
                                // do nothing 
                            } finally {
                                loadMask.hide();
                                self.loading = false;
                                self.pageData.data = { rows: [], total: 0 };//出错时重新设置，不然self.pageData.data可能为undefined，其它地方就要做多余空处理
                                return false;
                            }
                        }
                    });
                }
            },
            // 加载某行的下级行数据，data可以是数组、对象或omGrid表格数据（{total:0,rows:[]}）
            addChildren: function (data, rowData) {
                if ($.isArray(data)) {
                    data = { total: data.length, rows: data }
                } else if (typeof data.rows == 'undefined') {
                    data = { total: 1, rows: $.makeArray(data) }
                }
                this._addChildData(data, rowData);
            },
            // 删除行及其子行
            removeRow: function (rowData) {
                var childArr = [];
                this._getAllChild(childArr, rowData);
                //console.log('childArr', childArr);
                var allRows = this.pageData.data.rows;
                var allTrs = this._getTrs();
                var deletingTrs = [];
                for (var i = childArr.length - 1; i >= 0; i--) {
                    var child = childArr[i];
                    var index = allRows.indexOf(child);
                    var tr = allTrs.eq(index);
                    if (tr) deletingTrs.push(tr);
                }
                for (var i = childArr.length - 1; i >= 0; i--) {
                    var child = childArr[i];
                    var index = allRows.indexOf(child);
                    if (index >= 0) {
                        allRows.splice(index, 1);
                    }
                }
                for (var i = deletingTrs.length - 1; i >= 0; i--) {
                    $(deletingTrs[i]).remove();
                }
            },
            // 重新加载currId行的下级行数据，加载完成后聚焦到focusId行
            reloadChild: function (currId, focusId) {
                var self = this;
                var allRows = self.pageData.data.rows,
                    fnHasChildren = self.options.treeColumn.hasChildrenFieldName,
                    fnKey = this.options.treeColumn.keyFieldName,
                    fnParent = self.options.treeColumn.parentFieldName;
                var theRow = $.grep(allRows, function (r) { return r[fnKey] == currId; })[0];
                if (!theRow) {
                    self.reload();
                    return;
                }
                var subRows = $.grep(allRows, function (r) { return r[fnParent] == currId; });
                $.each(subRows, function (i, r) { self.removeRow(r); });
                theRow[fnHasChildren] = true;
                self.loadChildData(theRow, function () {
                    if (focusId != '') {
                        for (var i = 0; i < allRows.length; i++) {
                            var r = allRows[i];
                            if (r[fnKey] == focusId) {
                                self.setSelections($.makeArray(i));
                                break;
                            }
                        }
                    }
                });
            },



            _getAllChild: function (childArr, rowData) {
                var allRows = this.pageData.data.rows,
                    fnKey = this.options.treeColumn.keyFieldName,
                    fnParent = this.options.treeColumn.parentFieldName;
                childArr.push(rowData);
                var mySub = $.grep(allRows, function (r) { return r[fnParent] == rowData[fnKey]; });
                for (var i = 0; i < mySub.length; i++) {
                    this._getAllChild(childArr, mySub[i]);
                }
            },

            _addChildData: function (data, rowData) {
                var self = this, op = this.options,
                    fnKey = op.treeColumn.keyFieldName,
                    fnParent = op.treeColumn.parentFieldName,
                    fnOrder = op.treeColumn.orderFieldName || op.treeColumn.textFieldName,
                    rowClasses = op.rowClasses,
                    isRowClassesFn = (typeof rowClasses === 'function'),
                    gridHeaderCols = this._getHeaderCols(),
                    colModel = this._getColModel(),
                    pageData = this.pageData,
                    newRows = data.rows || [],
                    headerWidth = [],
                    bodyContent = [],
                    tdTmp = "<td align='$' abbr='$' class='$'><div align='$' class='innerCol $' style='width:$px'>$</div></td>",//td模板
                    cols,
                    j;

                $(gridHeaderCols).each(function (index) {
                    headerWidth[index] = $('div', $(this)).width();
                });

                //newRows.sort(function (a, b) { return (a[fnOrder] || '0') < (b[fnOrder] || '0') });

                $.each(newRows, function (i, rd) {
                    rd.idPath = (rowData ? rowData.idPath + '/' : '') + rd[fnKey];
                    var rowCls = isRowClassesFn ? rowClasses(i, rd) : rowClasses[i % rowClasses.length];
                    var rowValues = self._buildRowCellValues(colModel, rd, i);
                    var rIndex = self._guid++;
                    bodyContent.push("<tr _grid_row_id=" + rIndex + " class='om-grid-row " + rowCls + "'>");
                    $(gridHeaderCols).each(function (index) {
                        var axis = $(this).attr('axis'), wrap = false, html;
                        if (axis == 'indexCol') {
                            html = rIndex;
                        } else if (axis == 'checkboxCol') {
                            html = '<span class="checkbox"/>';
                        } else if (axis.substring(0, 3) == 'col') {
                            var colIndex = axis.substring(3);
                            html = rowValues[colIndex];
                            if (colModel[colIndex].wrap) {
                                wrap = true;
                            }
                        } else {
                            html = '';
                        }
                        cols = [this.align, this.abbr, axis, this.align, wrap ? 'wrap' : '', headerWidth[index], html];
                        j = 0;
                        bodyContent.push(tdTmp.replace(/\$/g, function () {
                            return cols[j++];
                        }));
                    });
                    bodyContent.push("</tr>");
                });
                // 父行数据索引号
                var index = rowData ? pageData.data.rows.indexOf(rowData) : pageData.data.rows.length - 1;
                if (index >= 0) {
                    var subCount = self._calcChildCount(pageData.data.rows, rowData, fnKey, fnParent);
                    if (subCount > 0) {
                        index += subCount;
                    }
                    // 父行TR
                    var tr = self._getTrs().eq(index);
                    if (subCount > 0) {
                        tr.find('.treeline-last').removeClass('treeline-last').addClass('treeline-nolast');
                    }
                    // 插入在之后
                    $(tr).after(bodyContent.join(" "));
                } else {
                    self.tbody.append(bodyContent.join(" "));
                }
                // 将新数据加入到页面数据缓存区
                $.each(newRows, function (i, rd) {
                    pageData.data.rows.splice(index + 1 + i, 0, rd);
                });
                //pageData.data.total = pageData.data.rows.length;
                // 获取新的所有行
                var allTrs = self._getTrs();
                // 创建新行的树列
                $.each(newRows, function (i, rd) {
                    var $tr = allTrs.eq(index + 1 + i);
                    self._createTreeColumnInTR($tr, rd);
                });
                // 重置行号
                var start = (pageData.nowPage - 1) * op.limit;
                $.each(allTrs, function (i, tr) {
                    if (!isRowClassesFn) {
                        $.each(rowClasses, function (c, cls) { $(tr).removeClass(cls) });
                        $(tr).addClass(rowClasses[i % rowClasses.length]);
                    }
                    $(tr).attr('_grid_row_id', start + i + 1);
                    $('td.indexCol>div.innerCol', $(tr)).text(start + i + 1);
                });
            },
            _calcChildCount: function (allRows, rowData, fnKey, fnParent) {
                var mySub = $.grep(allRows, function (r) { return r[fnParent] == rowData[fnKey]; });
                var c = mySub.length;
                for (var i = 0; i < mySub.length; i++) {
                    c += this._calcChildCount(allRows, mySub[i], fnKey, fnParent);
                }
                return c;
            },
            // 创建一行中的树列
            _createTreeColumnInTR: function ($tr, rowData) {
                var self = this, tree = self.options.treeColumn,
                    fnText = tree.textFieldName,
                    fnImage = tree.imageFieldName,
                    fnHasChildren = tree.hasChildrenFieldName,
                    allRows = self.pageData.data.rows,
                    idArray = rowData.idPath.split('/'),
                    idCount = idArray.length,
                    colDiv = $('td[abbr="' + fnText + '"] div.innerCol', $tr).eq(0);

                colDiv.wrapInner('<div class="treenode-title"></div>');
                if (fnImage && rowData[fnImage]) {
                    var img = rowData[fnImage],
                        nodeImage = $('<div></div>').prependTo(colDiv).addClass('treenode-image');
                    if (img.match(/\.|\\|\//)) {
                        nodeImage.css({ 'background': 'url(' + img + ') no-repeat' });
                    } else {
                        nodeImage.addClass(img);
                    }
                }
                var nodeHeader = $('<div></div>').prependTo(colDiv)
                    .addClass('treenode-header');

                var sPath = '';
                $.each(idArray, function (i, id) {
                    if (sPath != '') sPath += '/';
                    sPath += id;

                    var hasChildInRows = self.getHasChild(sPath, allRows),
                        hasSibling = self.getHasSibling(sPath, allRows);

                    var ident = $('<div></div>').addClass('treenode-ident treeline');
                    if (hasChildInRows) {
                        ident.addClass(hasSibling ? 'treeline-line' : 'treeline-noline');
                    } else {
                        ident.addClass(hasSibling ? 'treeline-nolast' : 'treeline-last');
                    }
                    if (i == idCount - 1 && (hasChildInRows || rowData[fnHasChildren])) {
                        var btn = $('<span></span>').addClass('treenode-hitarea treebtn');
                        if (hasChildInRows) {
                            btn.addClass(hasSibling ? 'treebtn-collapsable' : 'treebtn-lastCollapsable');
                        } else {
                            btn.addClass(hasSibling ? 'treebtn-expandable' : 'treebtn-lastExpandable');
                        }
                        ident.append(btn);
                        btn.on('click', function () {
                            self._toggleChildRow.call(self, $tr);
                        });
                    }
                    nodeHeader.append(ident);
                });

            },

            // 创建树列
            _createTreeColumn: function () {
                var self = this, allTrs = self._getTrs();
                $.each(allTrs, function (index, $tr) {
                    self._createTreeColumnInTR($tr, self._getRowData(index));
                });
            },
            // 展开和收起按钮的点击事件
            _toggleChildRow: function ($tr) {
                var self = this,
                    index = self._getTrs().index($tr),
                    rowData = self._getRowData(index),
                    span = $('span.treebtn', $tr),
                    oldCss, newCss;
                if (span.hasClass('treebtn-collapsable') || span.hasClass('treebtn-lastCollapsable')) {
                    self.hideChildRows(rowData);
                    oldCss = span.hasClass('treebtn-collapsable') ? 'treebtn-collapsable' : 'treebtn-lastCollapsable';
                    newCss = span.hasClass('treebtn-collapsable') ? 'treebtn-expandable' : 'treebtn-lastExpandable';
                } else {
                    self.showChildRows(rowData);
                    oldCss = span.hasClass('treebtn-expandable') ? 'treebtn-expandable' : 'treebtn-lastExpandable';
                    newCss = span.hasClass('treebtn-expandable') ? 'treebtn-collapsable' : 'treebtn-lastCollapsable';
                }
                span.removeClass(oldCss).addClass(newCss);
            },

            done: true
        });
        //#endregion

        //#region 重载

        var tree_base__addData = self._addData;  // $.om.omGrid.prototype._addData;
        self._addData = function (data) {
            //var self = this;
            if ($.isArray(data)) {
                data = { total: data.length, rows: data };
            }
            if (data.rows) {
                //data.rows = self.sortRows(data.rows);
                $.each(data.rows, function (i, r) { r.idPath = self.getIdPath(r, data.rows); })
            }
            tree_base__addData.call(self, data);
            //self._createTreeColumn();
        }

        var tree_old_renderDatas = self._renderDatas;
        self._renderDatas = function () {
            tree_old_renderDatas.call(self);
            self._createTreeColumn();
        }
        //#endregion

        self._gridTreeExtended = true;
    });

    //#region omGrid插件：详细浏览模式
    $.omWidget.addInitListener('om.omGrid', function () {
        var self = this, grid = $(this.element).closest('.om-grid');
        // 必须设定了displayMode才扩展
        if (!self.options.displayMode) {
            return;
        }
        if (self._gridDetailModeExtended) {
            return;
        }
        this.dDiv = $('<div class="dDiv"></div>').hide();
        this.element.parent().after(this.dDiv);
        self.options._onRefreshCallbacks.push(function () {
            var initRowIndex = parseInt(self.initRowIndex);
            if (!isNaN(initRowIndex) && initRowIndex >= 0) {
                self.setSelections(initRowIndex);
                self._switchData(initRowIndex);
                self.initRowIndex = -1;
            }
        });
        // 重载_addData
        this._oldAddDataFunc = this._addData;
        this._addData = function (data) {
            self._oldAddDataFunc(data);
            if (self.options.displayMode === 'detail')
                self._switchData(self.getSelections(false)[0] || 0);
        };
        $.extend(this, {
            _getDetailData: function (colModel, rindex, rdata) {
                var result = [], _gid = 1,
                    tempColModel = $.extend(true, [], colModel);
                var fAdd = function (s, acm, id, pid, hasChildren) {
                    var elem = {
                        text: s,
                        value: (acm.name || '') == '' ? '' : rdata[acm.name] || '',
                        id: rindex + '_' + id,
                        pid: rindex + '_' + pid,
                        hasChildren: hasChildren
                    };
                    result.push(elem);
                };
                if ($.isArray(tempColModel[0])) {
                    var f = function (index, count, pid) {
                        var row = tempColModel[index];
                        for (var j = 0; j < count && row.length > 0; j++) {
                            var rd = row[0], myid1 = _gid++;
                            fAdd(rd.header, rd, myid1, pid, (rd.colspan || 0) > 1);
                            if (!rd.name) {
                                f(index + 1, rd.colspan, myid1);
                                j += rd.colspan - 1;
                            }
                            row.splice(0, 1);
                        }
                    };
                    for (var i = 0, len = tempColModel[0].length; i < len; i++) {
                        var cm = tempColModel[0][i], myid = _gid++;
                        fAdd(cm.header, cm, myid, 0, (cm.colspan || 0) > 1);
                        if (!cm.name) {
                            f(1, cm.colspan, myid);
                        }
                    }
                } else {
                    for (var k = 0, colCount = tempColModel.length; k < colCount; k++) {
                        fAdd(tempColModel[k].header, tempColModel[k], _gid++, 0, false);
                    }
                }
                tempColModel = undefined;
                return result;
            },
            _switchData: function (rIndex) {
                var self = this;
                if (!self.dDiv || !self.pageData.data) return;
                var colModel = self.options.colModel;
                var rData = self.pageData.data.rows[rIndex];
                var myrows = self._getDetailData(colModel, rIndex, rData);
                var tab = self.dDiv.find('table.dTable');
                tab.omGrid('setData', { total: myrows.length, rows: myrows });
                var dGrid = self.dDiv.find('.om-grid'),
                    dFooter = dGrid.find('.pDiv');
                var rowNo = (self.pageData.nowPage - 1) * (self.options.limit || 1) + rIndex + 1;
                var recC = self.pageData.data.total;
                $('.pControl_d input', dFooter).val(rowNo);
                $('.pControl_d span', dFooter).text(recC);
            },
            _drawDetailFooter: function () {
                var self = this,
                    dGrid = self.dDiv.find('.om-grid'),
                    dFooter = dGrid.find('.pDiv').empty();
                dFooter.show().html('<div class="pDiv2">' +
                    '<div class="pGroup">' +
                    '<div class="pFirst pButton om-icon"><span class="om-icon-seek-start"></span></div>' +
                    '<div class="pPrev pButton om-icon"><span class="om-icon-seek-prev"></span></div>' +
                    '</div>' +
                    '<div class="btnseparator"></div>' +
                    '<div class="pGroup"><span class="pControl_d">第<input type="text" size="10" value="1" style="width:75px" />行 / 共<span>0</span>行</span></div>' +
                    '<div class="btnseparator"></div>' +
                    '<div class="pGroup">' +
                    '<div class="pNext pButton om-icon"><span class="om-icon-seek-next"></span></div>' +
                    '<div class="pLast pButton om-icon"><span class="om-icon-seek-end"></span></div>' +
                    '</div>' +
                    '</div>');
                $('.pFirst', dFooter).click(function () {
                    self._changeRecord('first');
                });
                $('.pPrev', dFooter).click(function () {
                    self._changeRecord('prev');
                });
                $('.pNext', dFooter).click(function () {
                    self._changeRecord('next');
                });
                $('.pLast', dFooter).click(function () {
                    self._changeRecord('last');
                });
                $('.pControl_d input', dFooter).keydown(function (e) {
                    if (e.keyCode == $.om.keyCode.ENTER) {
                        self._changeRecord('input');
                    }
                });
                $('.pButton', dFooter).hover(function () {
                    $(this).addClass('om-state-hover');
                }, function () {
                    $(this).removeClass('om-state-hover');
                });
            },
            _changeRecord: function (ctype) {
                var self = this;
                if (!self.dDiv || !self.pageData.data) return;
                var dGrid = self.dDiv.find('.om-grid'),
                    dFooter = dGrid.find('.pDiv');
                var recNo = parseInt($('.pControl_d input', dFooter).val()) || 0;
                var total = self.pageData.data.total;
                switch (ctype) {
                    case "first":
                        recNo = 1;
                        break;
                    case "prev":
                        if (recNo > 1) {
                            recNo = recNo - 1;
                        }
                        break;
                    case "next":
                        if (recNo < total) {
                            recNo = recNo + 1;
                        }
                        break;
                    case "last":
                        recNo = total;
                        break;
                    case "input":
                        var nv = parseInt($('.pControl_d input', dFooter).val()) || 0;
                        if (nv < 1) nv = 1;
                        else if (nv > total) nv = total;
                        recNo = nv;
                        break;
                }
                $('.pControl_d input', dFooter).val(recNo);
                var limit = self.options.limit <= 0 ? 100000000 : self.options.limit;
                var newpage = parseInt(recNo / limit) + ((recNo % limit) == 0 ? 0 : 1);
                var rIndex = recNo % limit;
                if (rIndex == 0) rIndex = limit;
                if (newpage != self.pageData.nowPage) {
                    self.initRowIndex = rIndex - 1;
                    self.reload(newpage);
                } else {
                    self.setSelections(rIndex - 1);
                    self._switchData(rIndex - 1);
                }
            },
            // 切换到明细模式
            switchToDetail: function () {
                var tab = self.dDiv.find('table.dTable');
                if (tab.size() == 0) {
                    tab = self.dDiv.empty().append('<table class="dTable"></table>').find('table.dTable');
                    //self.dDiv.height(grid.outerHeight());
                    tab.omGrid({
                        //title: '详细',
                        autoFit: true,
                        height: grid.height(),
                        limit: 500,
                        showIndex: true,
                        treeColumn: {
                            keyFieldName: 'id',
                            parentFieldName: 'pid',
                            textFieldName: 'text',
                            hasChildrenFieldName: 'hasChildren'
                        },
                        colModel: [
                            { header: '字段', name: 'text' },
                            { header: '值', name: 'value' }
                        ]
                    });
                    self._drawDetailFooter();
                    //tab.omGrid('resize');
                }
                self._switchData(self.getSelections(false)[0] || 0);

                self.hDiv.hide();
                self.element.parent().hide();
                //grid.hide();
                self.dDiv.show();
                self.options.displayMode = 'detail';
                // 重算高度
                tab.omGrid('resetHeight');
            },
            // 切换到表格模式
            switchToTable: function () {
                self.hDiv.show();
                self.element.parent().show();
                //grid.show();
                self.dDiv.hide();
                self.options.displayMode = 'table';
            }
        });
        if (this.options.displayMode === 'detail') {
            this.switchToDetail();
        };
        self._gridDetailModeExtended = true;
    });
    //#endregion

    /*
     * 锁定列插件 - omGrid参数增加支持fixedColumnCount, 最左边的多少列需要固定，小于1则不固定。
     *   1、固定列数以列模型(colModel)为准，如果有序号列或多选列，将自动增加
     *   2、如果是复合表头，以第一行的列模型为准，即不会拆分合并的列
     */
    $.omWidget.addInitListener('om.omGrid', function () {
        if (this._gridFixedColumnExtended) return;
        var fixedColumnCount = parseInt(this.options.fixedColumnCount) || 0;
        if (fixedColumnCount < 1) return;
        var self = this, options = this.options;
        var grid = self.element.closest('.om-grid');
        (self.topDiv || self.titleDiv).after('<div class="bdp-grid-fixed"><div class="bdp-column-fixed"></div><div class="bdp-column-view"></div></div>');
        self.gridFixed = grid.find('div.bdp-column-fixed');
        self.gridView = grid.find('div.bdp-column-view');
        self.gridView.append(self.hDiv);
        self.gridView.append(self.element.parent());
        _buildFixHead();
        self.gridFixed.append('<div class="bDiv" style="overflow:hidden;"><table cellpadding="0" cellspacing="0" border="0"><tbody></tbody></table></div>');
        self.gridFixedTBody = self.gridFixed.find('.bDiv>table>tbody');
        _resizeFV();
        options._onResizeCallbacks.push(_resizeFV);
        options._onRefreshCallbacks.push(_buildFixBody);
        //光条
        self.tbody.delegate('tr.om-grid-row', 'mouseenter', function (event) {
            var id = $(this).attr('_grid_row_id');
            self.gridFixedTBody.find('tr.om-grid-row[_grid_row_id="' + id + '"]').addClass('bdpGridDataRowHover');
            //$(this).addClass('bdpGridDataRowHover');
        });
        self.tbody.delegate('tr.om-grid-row', 'mouseleave', function (event) {
            var id = $(this).attr('_grid_row_id');
            self.gridFixedTBody.find('tr.om-grid-row[_grid_row_id="' + id + '"]').removeClass('bdpGridDataRowHover');
            //$(this).removeClass('bdpGridDataRowHover');
        });
        // 同步滚动
        self.tbody.closest('.bDiv').scroll(function () {
            var fixDiv = self.gridFixedTBody.closest('.bDiv');
            fixDiv.scrollTop($(this).scrollTop());
        });
        //self.gridFixedTBody.closest('.bDiv').scroll(function () {
        //    var bDiv = self.tbody.closest('.bDiv');
        //    bDiv.scrollTop($(this).scrollTop());
        //});

        $('th.checkboxCol span.checkbox', self.gridFixed).click(function () {
            $('th.checkboxCol span.checkbox', self.thead).trigger('click');
            var thCheckbox = $(this);
            if (thCheckbox.hasClass('selected')) {
                thCheckbox.removeClass('selected');
            } else {
                thCheckbox.addClass('selected');
            }
        });
        self.gridFixedTBody.delegate('tr.om-grid-row', 'click', function () {
            var id = $(this).attr('_grid_row_id');
            var $tr = self.tbody.find('tr.om-grid-row[_grid_row_id="' + id + '"]');
            $tr.trigger('click');
        });
        self.gridFixedTBody.delegate('tr.om-grid-row', 'dblclick', function () {
            var id = $(this).attr('_grid_row_id');
            var $tr = self.tbody.find('tr.om-grid-row[_grid_row_id="' + id + '"]');
            $tr.trigger('dblclick');
        });


        self._fixed__rowSelect = self._rowSelect;
        self._rowSelect = function (index) {
            self._fixed__rowSelect.call(this, index);
            var id = this._getTrs().eq(index).attr('_grid_row_id');
            var $tr = self.gridFixedTBody.find('tr.om-grid-row[_grid_row_id="' + id + '"]');
            var $chk = $('td.checkboxCol span.checkbox', $tr);
            $tr.addClass('om-state-highlight');
            $chk.addClass('selected');
        }
        self._fixed__rowDeSelect = self._rowDeSelect;
        self._rowDeSelect = function (index) {
            self._fixed__rowDeSelect.call(this, index);
            var id = this._getTrs().eq(index).attr('_grid_row_id');
            var $tr = self.gridFixedTBody.find('tr.om-grid-row[_grid_row_id="' + id + '"]');
            var $chk = $('td.checkboxCol span.checkbox', $tr);
            $tr.removeClass('om-state-highlight');
            $chk.removeClass('selected');
        }
        self._fixed__refreshHeaderCheckBox = self._refreshHeaderCheckBox;
        self._refreshHeaderCheckBox = function () {
            self._fixed__refreshHeaderCheckBox.call(this);
            var headerCheckbox = $('th.checkboxCol span.checkbox', self.thead);
            var mck = $('th.checkboxCol span.checkbox', self.gridFixed);
            if (headerCheckbox.hasClass('selected'))
                mck.addClass('selected');
            else
                mck.removeClass('selected');
        }

        self._gridFixedColumnExtended = true;

        function _buildFixHead() {
            var ht = [];
            ht.push('<div class="hDiv om-state-default hDiv-group-header">');
            ht.push('<div class="hDivBox" style="padding-right: 0;">');
            ht.push('<table cellpadding="0" cellspacing="0"><thead>');
            var trs = self.hDiv.find('div.hDivBox>table>thead>tr');
            var colCount = fixedColumnCount;
            if (options.showIndex) colCount += 1;
            if (!options.singleSelect) colCount += 1;
            var lockedTds = [[]];
            var copyColumnCount = 0;
            var tds = trs.eq(0).children();
            ht.push('<tr>');
            for (var i = 0; i < colCount; i++) {
                // 凡是被锁定了的td都加上bdp-locked-column类，好隐藏?
                var td = tds.eq(i);
                var html = $(td[0].outerHTML).height(td.height())[0].outerHTML;
                ht.push(html);
                copyColumnCount += parseInt(td.attr('colspan')) || 1;
                lockedTds[0].push(td.addClass('bdp-column-locked'));
            }
            ht.push('</tr>');
            for (var r = 1; r < trs.length; r++) {
                lockedTds.push([]);
                // 先计算被跨过的列
                var colspan = 0;
                for (var i = 0; i < lockedTds.length; i++) {
                    for (var j = 0; j < lockedTds[i].length; j++) {
                        var td = lockedTds[i][j];
                        var rowspan = parseInt(td.attr('rowspan')) || 1;
                        if (i + rowspan > r) colspan += 1;
                    }
                }
                if (colspan < copyColumnCount) {
                    ht.push('<tr>');
                    var tds = trs.eq(r).children();
                    var c = colspan, index = 0;
                    while (c < copyColumnCount && c < tds.length) {
                        var td = tds.eq(index);
                        var html = $(td[0].outerHTML).height(td.height())[0].outerHTML;
                        ht.push(html);
                        lockedTds[r].push(td.addClass('bdp-column-locked'));
                        c += parseInt(td.attr('colspan')) || 1;
                        index++;
                    }
                    ht.push('</tr>');
                }
            }
            ht.push('</thead></table>');
            ht.push('</div>');
            ht.push('</div>');
            self.gridFixed.empty().append(ht.join(''));
            // 单击列头排序
            var cmArr = self._getColModel();
            self.gridFixed.find('.hDivBox th img.om-grid-sortIcon').each(function () {
                var th = $(this).closest('th'),
                    fn = th.attr('abbr'),
                    cm = $.grep(cmArr, function (r) { return r.name == fn; })[0];
                if (cm && cm.sort) {
                    var sortFn = cm.sort;
                    th.click(function () {
                        var sortCol = cm.name;
                        var sortDir = null;
                        if (th.hasClass('asc')) {
                            th.removeClass('asc').addClass('desc');
                            sortDir = 'desc';
                        } else if (th.hasClass('desc')) {
                            th.removeClass('desc');
                        } else {
                            th.addClass('asc');
                            sortDir = 'asc';
                        }
                        var extraData = self._extraData;
                        delete extraData.sortBy;
                        delete extraData.sortDir;
                        switch (sortFn) {
                            case 'serverSide':
                                extraData.sortBy = sortCol;
                                extraData.sortDir = sortDir;
                                self.reload();
                                return;
                            case 'clientSide':
                                sortFn = function (obj1, obj2) {
                                    var v1 = obj1[sortCol], v2 = obj2[sortCol];
                                    return v1 == v2 ? 0 : v1 > v2 ? 1 : -1;
                                };
                                break;
                            default:
                            // do nothing,keep sortFn==cm[index].sort
                        }
                        var datas = self.pageData.data;
                        if (sortDir == 'asc') {//从未排序变成升序排列
                            datas.rows = datas.rows.sort(sortFn);
                        } else if (sortDir == 'desc') {//升序变成降序，或降序变成升序，只需要反转数据即可
                            datas.rows = datas.rows.reverse();
                        }
                        self.refresh();
                    });
                }
            });
        }
        function _buildFixBody() {
            var ht = [];
            var colCount = fixedColumnCount;
            if (options.showIndex) colCount += 1;
            if (!options.singleSelect) colCount += 1;
            var copyColumnCount = 0;
            var trs = self.hDiv.find('div.hDivBox>table>thead>tr');
            var tds = trs.eq(0).children();
            for (var i = 0; i < colCount; i++) {
                var td = tds.eq(i);
                copyColumnCount += parseInt(td.attr('colspan')) || 1;
            }
            self.tbody.find('tr.om-grid-row').each(function () {
                var $tr = $(this);
                ht.push('<tr _grid_row_id="', $tr.attr('_grid_row_id'), '" class="', $tr.attr('class'), '">');
                var tds = $tr.children();
                for (var i = 0; i < copyColumnCount; i++) {
                    var $td = tds.eq(i);
                    ht.push($td[0].outerHTML);
                    $td.addClass('bdp-column-locked');
                }
                ht.push('</tr>');
            });
            self.gridFixedTBody.empty().append(ht.join(''));
        }
        function _resizeFV() {
            var pos = self.gridFixed.width();
            var w = self.gridFixed.parent().width() - pos;
            self.gridView.css({ left: pos, width: w });

            var grid = self.element.closest('.om-grid');
            var titleHeight = self.titleDiv.is(":hidden") ? 0 : self.titleDiv.outerHeight(true);
            var pagerHeight = self.pDiv.is(":hidden") ? 0 : self.pDiv.outerHeight(true);
            var fixedHeight = grid.height() - titleHeight - pagerHeight;
            if (self.topDiv && !self.topDiv.is(':hidden'))
                fixedHeight -= self.topDiv.outerHeight(true);
            grid.find('.bdp-grid-fixed').height(fixedHeight);

            var hDiv1 = self.gridFixed.find('.hDiv');
            self.gridFixed.find('.bDiv').height(fixedHeight - (hDiv1.is(':hidden') ? 0 : hDiv1.outerHeight(true)) - 17);

            var hDiv2 = self.gridView.find('.hDiv');
            self.gridView.find('.bDiv').height(fixedHeight - (hDiv2.is(':hidden') ? 0 : hDiv2.outerHeight(true)));

        }

    });

})(jQuery);
