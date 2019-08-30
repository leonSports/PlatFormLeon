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
var _images = [
    { name: 'add', url: 'add.png' },
    { name: 'del', url: 'delete.png' },
    { name: 'modify', url: 'modiy.png' },
    { name: 'save', url: 'save.png' },
    { name: 'cancel', url: 'cancel.gif' },
    { name: 'priv', url: 'priv.png' },
    { name: 'role', url: 'role.png' },
    { name: 'refresh', url: 'shuax.png' }
];
// 根据图片名称获取图片地址,如果name为图片文件名则返回图片绝对地址
var getImageUrl = function (name) {
    for (var i = 0; i < _images.length; i++)
        if (_images[i].name == name) {
            s = _images[i].url;
            cantAddPath = s.substring(0, 1) == '/' || s.substring(0, 1) == '.' || s.substring(0, ROOT_PATH.length) == ROOT_PATH;
            if (!cantAddPath) s = IMAGE_PATH + s;
            return s;
        }
    return IMAGE_PATH + name;
}

