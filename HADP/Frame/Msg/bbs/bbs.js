
// 当前用户信息
var user = {
    userId: '',
    userName: '无名',
    photoUrl: 'css/images/txdefa.jpg',
    faceUrl: 'css/images/bg.jpg'
};

$(document).ready(function () {
    $('#sec-newtopic').hide();

    //#region 上传
    $('#bbsupload').hide();
    //#endregion

    //#region 发表新话题

    // 刷新
    $('#newsrefresh').click(function () {
        loadTopic(0);
    });

    // 发表新话题
    $('#newtopic').click(function () {
        //fs==0 发表新话题
        setEditInfo(0, '', '');
        $('#lblReferName').text('');
        $('#sec-newtopic').show();
        // 移动到话题区的前面
        $('#sec-topic').before($('#sec-newtopic'));
        // 回到顶部
        $('.bbs-gotop').trigger('click');
    });
    //#region 话题/回帖事件
    $('#sec-topic').on('click', 'a.bbs-topic-del', function (event) {
        var node = $(this).closest('.list-group-item');
        var topicId = node.data('id') || '';
        if (confirm('删除话题将同时删除该话题的所有评论，确定要删除吗？')) {
            $.getJSON(getCommonDataUrl('BbsDeleteTopic', { topic: topicId }),
                function (result) {
                    if (result.Succeed) {
                        node.remove();
                    }
                });
        }
    }).on('click', 'a.bbs-topic-edit', function (event) {
        var node = $(this).closest('.list-group-item');
        var topicId = node.data('id') || '';
        setEditInfo(1, topicId, '');
        $('#lblReferName').text('');

        $('#sec-newtopic').show();
        node.find('.tools').before($('#sec-newtopic'));
    }).on('click', 'a.bbs-topic-pinlun', function (event) {
        var node = $(this).closest('.list-group-item');
        var topicId = node.data('id') || '';
        setEditInfo(2, topicId, '');
        $('#lblReferName').text('');

        $('#sec-newtopic').show();
        var replybox = node.find('.replybox');
        if (replybox.size() == 0) replybox = node.find('.tools');
        replybox.after($('#sec-newtopic'));
    }).on('click', '.comment .header', function (event) {
        var node = $(this).closest('.list-group-item');
        var topicId = node.data('id') || '';
        var commId = $(this).closest('.comment').data('id') || '';
        setEditInfo(3, topicId, commId);
        $('#lblReferName').text('回复' + $(this).find('.observer').first().text());

        $('#sec-newtopic').show();
        var replybox = node.find('.replybox');
        replybox.after($('#sec-newtopic'));
    }).on('click', '.bbs-comment-del', function () {
        var commNode = $(this).closest('.comment');
        var commId = commNode.data('id') || '';
        $.getJSON(getCommonDataUrl('BbsSaveData'),
            { fs: 5, uid: user.userId, comment: commId },
            function (result) {
                if (result.Succeed) {
                    commNode.remove();
                }
            });
    }).on('click', 'a.bbs-comment-more', function () {
        var link = $(this);
        var node = link.closest('.list-group-item');
        var topicId = node.data('id') || '';
        var start = parseInt(link.data('start')) || 0;
        var replyBox = link.closest('.replybox');

        link.attr('disbaled', 'disbaled').text('加载中...');
        $.getJSON(getCommonDataUrl('BbsQueryComment'),
            { topic: topicId, start: start, limit: 10 },
            function (result) {
                link.remove();
                if (result.Succeed) {
                    var data = result.Data || {};
                    $.each(data.rows, function (idx, comm) {
                        var doc = getCommentHtml(comm);
                        replyBox.append(doc);
                    });
                    if (start + data.rows.length < data.total) {
                        replyBox.append('<a data-start="' + (start + data.rows.length) + '"' +
                            ' class="btn btn-link bbs-comment-more">加载更多</a>');
                    }
                }
            });
    }).on('click', '.bbs-comment-refresh', function () {
        var node = $(this).closest('.list-group-item');
        var topicId = node.data('id') || '';
        var replybox = node.find('.replybox');
        if (replybox.size() == 0) {
            node.find('.tools').after('<div class="replybox"></div>');
            replybox = node.find('.replybox');
        }
        replybox.empty().append('加载中...');
        $.getJSON(getCommonDataUrl('BbsQueryComment'),
            { topic: topicId, start: 0, limit: 10 },
            function (result) {
                if (result.Succeed) {
                    var data = result.Data || { total: 0, rows: [] };
                    if (data.total > 0) {
                        replybox.empty();
                        $.each(data.rows, function (idx, comm) {
                            var doc = getCommentHtml(comm);
                            replybox.append(doc);
                        });
                        if (data.rows.length < data.total) {
                            replybox.append('<a data-start="' + data.rows.length + '"' +
                                ' class="btn btn-link bbs-comment-more">加载更多</a>');
                        }
                    } else {
                        replybox.remove();
                    }
                }
            });
    });
    //#endregion
    // 保存
    $('#btnSaveNews').click(function () {
        if ((user.userId || '') == '') return;
        if (!getUE().hasContents()) {
            alert('请输入内容！');
            getUE().focus(true);
            return;
        }
        var postdata = {
            // 用户id
            uid: user.userId || '',
            // 内容，小于4当作灌水
            doc: getUE().getContent(),
            // 方式：0 新话题，1 修改话题，2 评论话题，3 回复评论，4 修改评论，5 撤消评论
            fs: parseInt($('#newseditor').data('fs')) || 0,
            // 话题ID
            topic: $('#newseditor').data('topic') || '',
            // 评论ID
            comment: $('#newseditor').data('comment') || '',
        };
        // 进度条？
        $.post(getCommonDataUrl('BbsSaveData'), postdata,
            function (result) {
                if (result.Succeed) {
                    //alert(JSON.stringify(postdata));
                    cancelEdit();
                    switch (postdata.fs) {
                        case 0:
                            loadTopic(0);
                            break;
                        case 1:
                            var node = $('#sec-topic li.list-group-item[data-id="' + postdata.topic + '"]');
                            node.find('.words').show().html(postdata.doc);
                            break;
                        case 2:
                        case 3:
                            var node = $('#sec-topic li.list-group-item[data-id="' + postdata.topic + '"]');
                            var comm = {
                                Id: result.Data, AnthorName: user.userName,
                                Content: postdata.doc
                            };
                            if (postdata.fs == 3) {
                                var commNode = $('#sec-topic .comment[data-id="' + postdata.comment + '"]');
                                var s = commNode.find('.observer').first().text();
                                comm.ReferName = s.replace(':', '');
                            }
                            var replybox = node.find('.replybox');
                            if (replybox.size() == 0) {
                                node.find('.tools').after('<div class="replybox"></div>');
                                replybox = node.find('.replybox');
                            }
                            replybox.append(getCommentHtml(comm));
                            break;
                    }
                } else {
                    alert('提交失败！' + (result.Message || ''));
                }
            }, 'json');
    });
    // 取消编辑
    $('#btnCancelNews').click(function () {
        cancelEdit();
    });

    function setEditInfo(fs, topic, comment) {
        $('#newseditor')
            .data('fs', fs)
            .data('topic', topic)
            .data('comment', comment);
    }
    function cancelEdit() {
        $('#sec-newtopic').hide();
        $('#sec-topic').before($('#sec-newtopic'));
    }
    //#endregion

    //#region 回到顶部

    // 加载状态条
    $('.bbs-nomore').hide();
    var $bbsLoading = $('div.bbs-loading').hide();
    // 回到顶部
    var $backTop = $('a.bbs-gotop').click(function () {
        $("html, body").animate({
            scrollTop: 0
        }, 120);
    }).css("bottom", "-90px");

    $(window).scroll(function () {
        var d = $(document).scrollTop();
        $backTop.css("bottom", d > 10 ? "20px" : "-90px");

        if (!$bbsLoading.is(':visible')) {
            var winH = $(window).height(); //页面可视区域高度
            var pageH = $(document.body).height();
            var scrollT = $(window).scrollTop(); //滚动条top
            var aa = (pageH - winH - scrollT) / winH;
            if (aa < 0.02) {
                var start = parseInt($('#sec-topic').data('lastIndex')) || 0;
                if (start >= 0)
                    loadTopic(start);
            }
        }
    });
    //#endregion

    //#region 初始化
    $.getJSON(getCommonDataUrl('BbsUserInfo'), function (result) {
        if (result.Succeed) {
            var obj = result.Data || {};
            user.userId = obj.userId || user.userId;
            user.userName = obj.userName || user.userName;
            user.photoUrl = obj.photoUrl || user.photoUrl;
            user.faceUrl = obj.faceUrl || user.faceUrl;

            $('#username').text(user.userName || '');
            $('#head-photo').css("background-image", "url(" + user.photoUrl + ")");
            $('.bbs-logo-bkimg').css("background-image", "url(" + user.faceUrl + ")");
        }
        loadTopic(0);
    });

    function loadTopic(start, limit) {
        if (start == 0) {
            $('#sec-topic>ul').empty();
            $('.bbs-nomore').hide();
        }
        $bbsLoading.show();
        $.getJSON(getCommonDataUrl('BbsQueryTopic'),
            { start: start || 0, limit: limit || 10 },
            function (result) {
                if (result.Succeed) {
                    var data = result.Data || {};
                    $.each(data.rows, function (index, td) {
                        $('#sec-topic>ul').append(getTopicHtml(td));
                    });
                    var lastIndex = start + data.rows.length;
                    if (lastIndex >= data.total - 1) lastIndex = -1;
                    $('#sec-topic').data('lastIndex', lastIndex);
                    if (lastIndex < 0) $('.bbs-nomore').show();
                    else $('.bbs-nomore').hide();
                }
                $bbsLoading.hide();
            });
    }
    function getTopicHtml(td) {
        var ht = [];
        ht.push('<li class="list-group-item" data-id="', td.Id, '"><div class="bbs-topic-card">');
        // 头像
        ht.push('<div class="head"><img src="', td.AnthorPhoto || 'css/images/txboy.jpg', '" /></div>');

        ht.push('<div class="mbody">');
        // 作者
        ht.push('<div class="anthor">', td.AnthorName || '', '</div>');
        // 正文
        ht.push('<div class="words">', td.Content || '', '</div>');
        // 工具
        ht.push('<div class="tools">',
                '<div class="ptime">', td.PostTime, '</div>',
                '<div class="reply">');
        if (td.AnthorId == user.userId) {
            ht.push('<a title="编辑" class="bbs-topic-edit"><i class="glyphicon glyphicon-pencil"></i> 修改</a>');
            ht.push('<a title="删除" class="bbs-topic-del"><i class="glyphicon glyphicon-remove-circle"></i> 删除</a>');
        }
        ht.push('<a class="bbs-topic-pinlun"><i class="glyphicon glyphicon-comment"></i> 评论</a>');
        ht.push('<a class="bbs-comment-refresh"><i class="glyphicon glyphicon-refresh"></i> 刷新</a>');
        ht.push('</div></div>');
        // 评论
        if (td.CommentCount > 0) {
            ht.push('<div class="replybox">');
            if (td.PraiseCount > 0) {
                // todo     PraiseRemak
                ht.push('<div class="zan"></div>');
            }
            $.each(td.Comments, function (cidx, comm) {
                ht.push(getCommentHtml(comm));
            });
            if (td.CommentCount > td.Comments.length) {
                ht.push('<a data-start="' + td.Comments.length + '" class="btn btn-link bbs-comment-more">加载更多</a>');
            }
            ht.push('</div>');// --end 评论
        }

        ht.push('</div>');// --end mbody

        ht.push('</div></li>');
        return ht.join("");
    }
    function getCommentHtml(comm) {
        var htComm = [];
        htComm.push('<div class="comment" data-id="' + comm.Id + '">');
        htComm.push('<div class="header">');
        htComm.push('<span class="observer">', comm.AnthorName || '');
        if ((comm.ReferName || '') != '') {
            htComm.push('</span> 回复 <span class="observer">', comm.ReferName, ': </span>');
        } else {
            htComm.push(': </span>');
        }
        htComm.push('</div>');
        htComm.push('<div class="opinion">', comm.Content || '', '</div>');
        if (comm.AnthorId == user.userId) {
            htComm.push('<a class="bbs-comment-del">[撤消]</a>');
        }
        htComm.push('</div>');
        return htComm.join('');
    }
    var _ue = null;
    function getUE() {
        if (_ue == null) {
            _ue = UE.getEditor('newseditor', {
                toolbars: [['emotion', 'insertimage', '|', 'save_topic']],
                initialFrameWidth: "99%",
                enableContextMenu: false,
                elementPathEnabled: false,
                wordCount: true,
                focus: false,
                maximumWords: 10000
            });
            _ue.addListener("ready", function () {
                if ($('#sec-newtopic').is(':visible')) {
                    $('#sec-newtopic .edui-separator').last().after($('#editor-tools'));
                    var fs = parseInt($('#newseditor').data('fs')) || 0;
                    //alert(fs);
                    switch (fs) {
                        case 1:
                            var topic = $('#newseditor').data('topic') || '';
                            var node = $('#sec-topic li.list-group-item[data-id="' + topic + '"]');
                            _ue.setContent(node.find('.words').html());
                            break;
                        case 4:
                            break;
                        default:
                            _ue.setContent('');
                            break;
                    }
                    _ue.focus();
                }
            });
        }
        return _ue;
    }
    getUE();
    //#endregion
});