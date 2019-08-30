// 必须先调入bdp-base-loader.js
loadResources([
	absUrl("~/Frame/Resources/bootstrap/js/bootstrap.js")
	//absUrl("~/Frame/Resources/bootstrap/js/ace-extra.min.js"),
	//absUrl("~/Frame/Resources/bootstrap/js/ace-elements.min.js"),
	//absUrl("~/Frame/Resources/bootstrap/js/ace.min.js")
]);
// IE9以下才需要调入这两个js
if (document.documentMode && document.documentMode < 9) {
	loadResources([
		absUrl("~/Frame/Resources/bootstrap/js/html5shiv.js"),
		absUrl("~/Frame/Resources/bootstrap/js/respond.src.js")
	]);
}