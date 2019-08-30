<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="rdm.aspx.cs" Inherits="Hongbin.Web.Frame.ide.rdm" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head runat="server">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>远程数据维护</title>
    <script src="../resources/js/jquery.js"></script>
    <link href="../resources/bootstrap/css/bootstrap.css" rel="stylesheet" />
    <script src="../resources/bootstrap/js/bootstrap.js"></script>
    <style type="text/css">
        .table > thead > tr > th, .table > tbody > tr > th, .table > tfoot > tr > th, .table > thead > tr > td, .table > tbody > tr > td, .table > tfoot > tr > td {
            padding-top: 0;
            padding-bottom: 0;
            vertical-align: middle;
        }
    </style>
    <script type="text/javascript">
        $(document).ready(function () {
            $('#exec').click(function () {
                var jdsUrl = "../data/jdp.ashx?fn=DBExec";
                var args = {};
                args.sqlText = $('#sql').val();
                args.isSelect = $('#isDML').attr('checked') ? false : true;
                args = $.makeArray(args)
                $.ajax({
                    url: jdsUrl,
                    method: 'POST',
                    data: escape(JSON.stringify(args)),
                    dataType: 'json',
                    success: function (ajaxResult) {
                        if (ajaxResult.Succeed) {
                            $('#result').val(JSON.stringify(ajaxResult.Data));
                            createGridTable(ajaxResult.Data);
                            $('#mytab a[href="#grid"]').tab('show');
                        } else {
                            $('#result').val(ajaxResult.Message);
                            $('#mytab a[href="#data"]').tab('show');
                        }
                    }
                });
            });
        });
        var createGridTable = function (data) {
            var table = $('#gridTable').empty();
            if (!$.isArray(data) || data.length == 0 || data[0].rows.length == 0)
                return;
            var rows = data[0].rows,
                ht = [],
                thead = $('<thead></thead>').appendTo(table),
                tbody = $('<tbody></tbody>').appendTo(table);
            ht.push('<tr><th>*</th>');
            for (var fn in rows[0]) {
                ht.push('<th>' + fn + '</th>');
            }
            ht.push('</tr>');
            var trClasses = ['active', 'success', 'warning', 'danger'];
            thead.append(ht.join(''));
            for (var i = 0, len = rows.length; i < len; i++) {
                ht = [];
                ht.push('<tr class="' + trClasses[i % 4] + '"><td>' + (i + 1) + '</td>');
                for (var fn in rows[i]) {
                    ht.push('<td>' + (rows[i][fn] || '') + '</td>');
                }
                ht.push('</tr>');
                tbody.append(ht.join(''));
            }
            //table.data('rows', rows);
            $('tr', tbody).on('dblclick', function () {
                var allThs = $('#gridTable > thead > tr > th'),
                    allTds = $('td', $(this)),
                    paramDeclares = [],
                    paramValues = [];
                $.each(allThs, function (index, th) {
                    var fn = $(th).text(),
                        value = allTds.eq(index).text();
                    if (fn != '*') {
                        paramDeclares.push('declare ' + fn + ' varchar');
                        paramValues.push('set ' + fn + " = '" + value + "'");
                    }
                });
                //alert(paramDeclares.join("\n") + "\n" + paramValues.join("\n"));
                $('#lstParams').text(paramDeclares.join("\n") + "\n\n" + paramValues.join("\n") + "\n");
                $('#myModal').modal('show');
            });
        }
    </script>
</head>
<body>
    <header class="container">
        <div class="nav navbar-nav">
            <h3>数据服务</h3>
        </div>
    </header>
    <hr />
    <section class="container">
        <div class="row">
            <span class="pull-left">SQL:</span>
            <span class="checkbox pull-right">
                <label>
                    <input type="checkbox" id="isDML" />
                    数据维护
                </label>
            </span>
        </div>
        <div class="row">
            <textarea id="sql" class="col-md-12" rows="10"></textarea>
            <p>
                <button id="exec" class="btn btn-default">
                    <i class="glyphicon glyphicon-flash"></i>执行
                </button>
            </p>
        </div>
        <div class="row">
            <ul id="mytab" class="nav nav-tabs">
                <li><a href="#grid" data-toggle="tab">表格</a></li>
                <li><a href="#data" data-toggle="tab">数据</a></li>
            </ul>
            <div class="tab-content">
                <div class="tab-pane active" id="grid">
                    <div class="col-md-12 table-responsive pre-scrollable" style="min-height: 420px;">
                        <table id="gridTable" class="table table-hover table-condensed table-bordered"></table>
                    </div>
                </div>
                <div class="tab-pane" id="data">
                    <textarea id="result" class="col-md-12" rows="15"></textarea>
                </div>
            </div>
        </div>

        <!-- Modal -->
        <div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                        <h4 class="modal-title" id="myModalLabel">参数模板</h4>
                    </div>
                    <div class="modal-body">
                        <textarea id="lstParams" class="col-md-12" rows="15"></textarea>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>
                    </div>
                </div>
                <!-- /.modal-content -->
            </div>
            <!-- /.modal-dialog -->
        </div>
        <!-- /.modal -->

    </section>
</body>
</html>
