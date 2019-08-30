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

// 确保IE6,7,8可以使用vml
function addVectorStartUp() {
    if (typeof document.documentMode != 'undefined' && document.documentMode <= 8 && !document.namespaces['v']) {
        //ie6
        if (!document.documentMode || document.documentMode < 7) {
            document.writeln('<xml:namespace ns="urn:schemas-microsoft-com:vml" prefix="v"/>\n');
            document.writeln('<style type="text/css"> v\\:* { behavior: url(#default#VML);} </style>\n');
        }
        else if (document.documentMode == 7) {
            var vml;
            var vmlstyle;
            document.namespaces.add('v');
            vml = document.createElement('object');
            vml.id = 'VMLRender';
            vml.codebase = 'vgx.dll';
            vml.classid = 'CLSID:10072CEC-8CC1-11D1-986E-00A0C955B42E';
            document.body.appendChild(vml);
            vmlstyle = document.createStyleSheet();
            vmlstyle.addRule('v\\:*', "behavior: url(#default#VML);"); //该语句在ie8通不过
        }
        else if (document.documentMode && document.documentMode >= 8) {
            var o = document.getElementsByTagName("HTML") || document.getElementsByTagName["html"];
            o[0].setAttribute("xmlns:v", "urn:schemas-microsoft-com:vml");
            document.writeln('<?import namespace="v" implementation="#default#VML" ?>' + "\r\n" + '<style>v\:rect,v\:Line,v\:oval,v\:PolyLine{ display:inline-block } </style>');
            //or
            //document.writeln('<xml:namespace //ns="urn:schemas-microsoft-com:vml" prefix="v"/>\n');
            document.writeln('<?import namespace="v" //implementation="#default#VML" ?>' + '\r\n' + '<style //type="text/css"> v\\:* { behavior: url(#default#VML);} //</style>\n');
        }
    }
}

addVectorStartUp();

loadResources([
    ROOT_PATH + 'Frame/Wf/Common/gooflow/GooFlow.css',
    ROOT_PATH + 'Frame/Wf/Common/gooflow/GooFlow.js',
    ROOT_PATH + 'Frame/Wf/Common/BdpFlow.css',
    ROOT_PATH + 'Frame/Wf/Common/BdpFlow.js'
]);