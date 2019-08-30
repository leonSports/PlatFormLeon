<%@ Page Title="" Language="C#" MasterPageFile="~/Frame/Master/TreeGrid.Master" AutoEventWireup="true" CodeBehind="RoleMgr.aspx.cs" Inherits="Hongbin.Web.Frame.Account.RoleMgr" %>

<asp:Content ID="Content1" ContentPlaceHolderID="PlaceCss" runat="server">
    <style type="text/css">
        #roletree span.folder,
        #roletree ul li span.folder,
        #roletree li.expandable span.folder,
        #roletree li.collapsable span.folder {
            background: url('data:image/gif;base64,R0lGODlhEAAQAPcAAAAAAP///3WacjqWMdHlz0qmPl20UmKlWpDEiXumdVy2Tm/GYG+5ZILCd4LTcoLQcpHdgrDjppHegIzUfaLfkq/lodTvzZ/fjbLno8DqtPPz8vDw7+3t7Onp6OW0UuW2WOe6X+S3YevEeenFfOnFfejEfenFfujEfu/Rlu/TnO/Vou/Xpu/Xqe/YquayUOSyU9+tUuW0V+GzX+S3Yum7aeq/cevAdevCduvCd+vDd+vEe+XAfO/Tnu/Tn+/Uoe3WrOapRuWpSeWpSuWsS+atT92pUuKvW+q8buS8fN28huXIl+rRp+OhQ+WlReWmRdimWd+0deOeQNyvcdKUS9SladGeZMyPU/Hw77++vcqPWcN7QcaKVrhvQsLAv7JgObFbN69gPvPx8evq6vz8/Pv7+/r6+vn5+fj4+PX19fPz89fX19XV1dPT09HR0c/Pz8zMzMvLy8nJyb6+vry8vLq6uri4uLW1tbOzs7CwsK6urqurq6qqqqmpqaampqOjo5iYmHx8fP///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAAIEALAAAAAAQABAAAAjJAAMJHEiwoMFAUZg4CXKQIBMaKFLccNEwUJMjPHqoaEHixUEgNXzkiPGhxI8dRQoKsbFCBwgOHGQgWQJlysAhOFiMCNHhjJkrT6QooaIlEBERLUzMEOPTjJkNVqokyeIlkIcTRsI0dWpGA5ctXwbC6DLGTB8+e/SYIYMFTEE5ZczsiQMnz1o+Bus4zfPGzZ21fgo6aEDADJ42bPRagPBgQSAJFCpcQIDGzho1c9JEyIBhQgEHCxQcEPCHzhw5cgAlYGCgwICKBwMCADs=') /*../../Images/Toolbutton/treeunit.gif*/ no-repeat;
            *background: url("../../Images/Toolbutton/treeunit.gif") no-repeat; /* For IE 6 and 7 */
        }

        #roletree span.file {
            background: url('data:image/gif;base64,R0lGODlhEAAQAPcAAAAAAP///3WacjqWMdHlz0qmPl20UmKlWpDEiXumdVy2Tm/GYG+5ZILCd4LTcoLQcpHdgrDjppHegIzUfaLfkq/lodTvzZ/fjbLno8DqtPPz8vDw7+3t7Onp6OW0UuW2WOe6X+S3YevEeenFfOnFfejEfenFfujEfu/Rlu/TnO/Vou/Xpu/Xqe/YquayUOSyU9+tUuW0V+GzX+S3Yum7aeq/cevAdevCduvCd+vDd+vEe+XAfO/Tnu/Tn+/Uoe3WrOapRuWpSeWpSuWsS+atT92pUuKvW+q8buS8fN28huXIl+rRp+OhQ+WlReWmRdimWd+0deOeQNyvcdKUS9SladGeZMyPU/Hw77++vcqPWcN7QcaKVrhvQsLAv7JgObFbN69gPvPx8evq6vz8/Pv7+/r6+vn5+fj4+PX19fPz89fX19XV1dPT09HR0c/Pz8zMzMvLy8nJyb6+vry8vLq6uri4uLW1tbOzs7CwsK6urqurq6qqqqmpqaampqOjo5iYmHx8fP///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAAIEALAAAAAAQABAAAAjJAAMJHEiwoMFAUZg4CXKQIBMaKFLccNEwUJMjPHqoaEHixUEgNXzkiPGhxI8dRQoKsbFCBwgOHGQgWQJlysAhOFiMCNHhjJkrT6QooaIlEBERLUzMEOPTjJkNVqokyeIlkIcTRsI0dWpGA5ctXwbC6DLGTB8+e/SYIYMFTEE5ZczsiQMnz1o+Bus4zfPGzZ21fgo6aEDADJ42bPRagPBgQSAJFCpcQIDGzho1c9JEyIBhQgEHCxQcEPCHzhw5cgAlYGCgwICKBwMCADs=') /*../../Images/Toolbutton/treeunit.gif*/ no-repeat;
            *background: url("../../Images/Toolbutton/treeunit.gif") no-repeat; /* For IE 6 and 7 */
        }

        #roletree ul li span.role {
            background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA1FJREFUeNpskk1sVFUUx//3vvvefHRmOpROO5NMo4VQAUObQiFqiQlKiTEsiKSuMKKBBbpxoSwgrMA0KisSFi40BBYGYzCmQTRGpEHcAIWitHQmDhY7Q+eDvpl58zrzvu7lzgxNXHhezuLel///nHPPj3zyWheaIQQQDDGs1FwQeeaUgXIXnIt+1U/SiXiHYjYECvkVT6VigBCSaeoY/hNcunDOmwZRQUVZ2sIReDA60qOEInFUDMhcVPRCKUUV2tLSVbEQYp3ncqd/fUR0x8M693hd3vk1DZrjqfAQgc3XgGmdsD0onqDgUs48Qlrte5ynRrfFlFBnApWqQNnI+ktLhbQ/YGPDtp0IBKPY3tuNnXtqOPbh56CUghAK6vdRNFNTieK4spIItyupEVg2T9YMe254bBeSyThMw5RvVIcinKIKGz5hg9m2I2cHGvV2JX9AVkqsxejYEI4emsC3f7v7J+6mZudqGVimCfZEQ4p3jX/85jD+6iuDiVpFPhRD3XSLw2OvxiqPHkNfrqBRa0Dl7vyJL0fy9xdy+ePZr3vfHwnjUsYobn1vIH87WIDWkJu6c1DH7t2bMetEx/+dnoGhV1Arm8hlc4gdfj5INN+TelT0Mg688sIRvDXSGcux9JziKncppxHGGkWcif+IwBE3P5X9rthP0rF8roKv3G+Q7Ev0GV4Ki6UUBnq6QWgAm/rekMv/BT/fvjW0mWzXGTw77Lne9T2DPUMvhtdhZf6ebL+K5QBwdu9xVK0rcktUJodC1+J+4SIGn3tHrvMKJm9MU+Y5TvXT/UkEOoJIdu1D7KV92GEBZz4j0K0HuLlw+RkoEjRcBtWA2dIFDPcfxMXfz4GFVIG6A/wwY0KVWJ3c5Yfn+MAkjlVMw9eJNtpNVuy2l6IAk3+ek7hGwZZKBtIFC8ViHY4HHLhgyFlDWBN+HRPnf22JJWuwpfjd8bbRP4vAzM2wxe8ljrKFXBl/zC+jO9rRIrLZKkgDvcFLUuhDSbcwee2R9fLWLT7WAaRSwG/X8NPUKeMYMJdhZub6R9+bK6cl96xlsBoSU9L6mO0+vHGY7cD57BIwdRVXp07hg7e/CD1M1gdbHcopsR7tUf8vJAGQdbHx2VmXmVn9+VSAAQBiM4EAxITAXQAAAABJRU5ErkJggg==') /*../../Images/Toolbutton/tool-officer-move.png*/ no-repeat;
            *background: url("../../Images/Toolbutton/tool-officer-move.png") no-repeat; /* For IE 6 and 7 */
        }

        .res {
            background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAONJREFUeNpi/P//PwMlgImBQjDwBrBgE2RkZGSQad05/e+/fxn/gGHEBOQzMzHNeFLtnokeZlgNAGkW4uXNCDFSY2BhYWb48+cvw6qztzIYWneCpDMJegFkc5iJBsPxZz8Zdt/7DKYjTDXA4sSFAdCVDz7/Zfjx5x/IQ2AaxGf4T2wYAI398fs/gzQfGwPIz6AwAfEZmYiMhf8f36y9fO82gwQPC4O8ICeYBvFB4hiWYUuJQBvlJEsX9zHwiQTDXMDw6c3a592xRUD+I2IMAFFyQCyKJPwaiB+hq2cczQsMAAEGAJxaavhl5lMVAAAAAElFTkSuQmCC') /*../../Images/Ico/bullet_blue.png*/ no-repeat;
            *background: url("../../Images/Ico/bullet_blue.png") no-repeat; /* For IE 6 and 7 */
        }

        .mod {
            background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAYlJREFUeNpi/P//P4Nex67333/9Ffj97z8DiI8MGBkZGJiBBCsz0+ubtZ5iMHG4OhBDpXHbf0Lg8J3X/xXqty5DNgCEWUAckM0gsOnmCwZGqK0gC/4B2f7qEgwcRWsZfvQFM8yPNo1MZNjK+KDROxJmEAuyczhYmIHOBRoAhEDzGf5CxUFe+P73H4ODqijD4liziBSW7axA4RC4ATDAwcLEwMTICHYFSOs/qMvSrJQYRMo2MPwB8n/2BzP8/vsvGMUFMMDOzAR0PsQAEPjH9J/h0cfvDP3BBmAMA3+QAhrFADZmZrD/YQaAlL399ovhzddfcDVGUvwQCWwGgLzAyIAJ/jNAAhUbQPMCRDsuQwgawMXOAolGXK4gZMCxh++AsQBJBxgGgNIFEAdpSWIaAFPPBE22WA1AIhkxDIDqAMc9kGT8z4jFgP9wLzAi2QA2gIUJIhCoKclADICphxvA+vvLQdWm7faglPYfZ3hDkjhIM0g9XAyUD4BOUgayBRiIBx+A+u6CGAABBgBmFq9IdRyTmAAAAABJRU5ErkJggg==') /*../../Images/Ico/page.png*/ no-repeat;
            *background: url("../../Images/Ico/page.png") no-repeat; /* For IE 6 and 7 */
        }

        .om-tree li.om-tree-node span.common-users,
        .om-tree li.om-tree-node span.company {
            background: url('data:image/gif;base64,R0lGODlhEAAQAPcAAAAAAP///3WacjqWMdHlz0qmPl20UmKlWpDEiXumdVy2Tm/GYG+5ZILCd4LTcoLQcpHdgrDjppHegIzUfaLfkq/lodTvzZ/fjbLno8DqtPPz8vDw7+3t7Onp6OW0UuW2WOe6X+S3YevEeenFfOnFfejEfenFfujEfu/Rlu/TnO/Vou/Xpu/Xqe/YquayUOSyU9+tUuW0V+GzX+S3Yum7aeq/cevAdevCduvCd+vDd+vEe+XAfO/Tnu/Tn+/Uoe3WrOapRuWpSeWpSuWsS+atT92pUuKvW+q8buS8fN28huXIl+rRp+OhQ+WlReWmRdimWd+0deOeQNyvcdKUS9SladGeZMyPU/Hw77++vcqPWcN7QcaKVrhvQsLAv7JgObFbN69gPvPx8evq6vz8/Pv7+/r6+vn5+fj4+PX19fPz89fX19XV1dPT09HR0c/Pz8zMzMvLy8nJyb6+vry8vLq6uri4uLW1tbOzs7CwsK6urqurq6qqqqmpqaampqOjo5iYmHx8fP///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAAIEALAAAAAAQABAAAAjJAAMJHEiwoMFAUZg4CXKQIBMaKFLccNEwUJMjPHqoaEHixUEgNXzkiPGhxI8dRQoKsbFCBwgOHGQgWQJlysAhOFiMCNHhjJkrT6QooaIlEBERLUzMEOPTjJkNVqokyeIlkIcTRsI0dWpGA5ctXwbC6DLGTB8+e/SYIYMFTEE5ZczsiQMnz1o+Bus4zfPGzZ21fgo6aEDADJ42bPRagPBgQSAJFCpcQIDGzho1c9JEyIBhQgEHCxQcEPCHzhw5cgAlYGCgwICKBwMCADs=') /*../../Images/Toolbutton/treeunit.gif*/ no-repeat;
            *background: url("../../Images/Toolbutton/treeunit.gif") no-repeat; /* For IE 6 and 7 */
        }

        .om-tree li.om-tree-node span.dept {
            background: url('data:image/gif;base64,R0lGODlhEAAQAPcAAAAAAP////r7Ufryafjqcfjma/rzxfz43Pz43fnurvnusfrwt/v0zfz20/z32fz32/nqpPnrpPnrpvrwuvnvv/rxxfbiivflmPfmmvflm/jprPnstPXZdfXbgvbgjPjmovTWd/XekfbhmvDKZPPRb/LObvPRcfPSevXaifnkp/nlq/DJZfHLaeWzRu/CXPDEYeW7YeO2WuS5Xue9ZPbPg/XOg96pS+CtUOayVOGvVeKyWPPFdfXKe/TKfvbNgPbPhfbPhtuhRNyjRuKoS96mSfG/bPC+bPTFddqdQtufQ+uwWeqwXO63Yu23ZNybQOioUOaoUdWNNN6WPt2WQOOeR+GdSbdqFsx9J9OELtGFMdiNN9eOObJiD7RkELVlErdnE7pqFsBvG8Z1Icd5J97e3t3d3dzc3Nvb29ra2tnZ2djY2NfX19bW1pmZmYCAgH5+fn19fXx8fHp6end3d3V1dXNzc3JycnFxcXBwcGxsbGhoaGRkZGBgYFxcXFhYWFRUVFFRUU9PT0xMTEpKSkdHR0VFRf///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAAIYALAAAAAAQABAAAAjdAA0JHEhwoA8eRwoq/OEjxYwiAt28iSNnDh07QGioQPAABhOBcNiIZLNmTY0DCAxMkKFEoJyRa9So6eFgQQIFMZ4InEMyZpo0OxokiCBBBxWBdWKq+ZnGCAMIGDLkkCIQz9KfaNA0qXDBwoAbWgTmYZr1zBIKHggIaIFFoJ40Zc+YgbKhA4cCNq4I3FPWjN8qGkCUMEFEjEA+Z+T6LTPlA4kRLISEEdjHr5kyZchsEbHCxYsgYAT6WUymdJYQIVCcSOKlzZ0/gAIJGkSo0JgoTobgQMJFocIvXaxwCQgAOw==') /*../../Images/Toolbutton/treedept.gif*/ no-repeat;
            *background: url("../../Images/Toolbutton/treedept.gif") no-repeat; /* For IE 6 and 7 */
        }

        #tabs .om-panel-body {
            padding: 0 3px 3px 3px;
        }

    </style>
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="head" runat="server">
    <script src="RoleMgr.js"></script>
</asp:Content>
<asp:Content ID="Content3" ContentPlaceHolderID="PlaceToolbar" runat="server">
    <div id="menu"></div>
</asp:Content>
<asp:Content ID="Content4" ContentPlaceHolderID="PlaceSearch" runat="server">
</asp:Content>
<asp:Content ID="Content5" ContentPlaceHolderID="PlaceLeft" runat="server">
    <div id="roletree"></div>
</asp:Content>
<asp:Content ID="Content6" ContentPlaceHolderID="PlaceContent" runat="server">
    <div id="tabs" style="display: none;">
        <ul>
            <li><a href="#tab1" data-index="0">基本信息</a></li>
            <li><a href="#tab2" data-index="1">功能操作权限</a></li>
            <li><a href="#tab3" data-index="2">业务组织权限</a></li>
            <li><a href="#tab4" data-index="3">消息处理权限</a></li>
            <li><a href="#tab5" data-index="4">授权用户</a></li>
            <li><a href="#tab6" data-index="5">授权机构</a></li>
        </ul>
        <div id="tab1" class="portlet">
            <div id="role-info-panel">
                <span class="label">名称：</span>
                <label id="rname"></label>
                <br />
                <br />
                <span class="label">代码：</span>
                <label id="rcode"></label>
                <br />
                <br />
                <span class="label">是否公开：</span>
                <label id="rIsPublic"></label>
                <br />
                <br />
                <span class="label">所属系统：</span>
                <label id="rsys"></label>
                <br />
                <br />
                <span class="label">所属公司：</span>
                <label id="rcomp"></label>
                <br />
                <br />
                <span class="label">说明：</span>
                <label id="rdesc"></label>
                <br />
                <br />
            </div>
        </div>
        <div id="tab2">
            <table id="fngrid" class="table_tree"></table>
        </div>
        <div id="tab3">
            <div id="botool"></div>
            <div id="bocc" class="portlet">
                <table>
                    <tr>
                        <td style="vertical-align: top;">
                            <div id="bocc-box" style="position: absolute; line-height: 2;">
                                <input type="radio" name="bomode" value="0" id="bo0" />
                                <label for="bo0">不限制</label><br />
                                <input type="radio" name="bomode" value="1" id="bo1" />
                                <label for="bo1">仅所属单位</label><br />
                                <input type="radio" name="bomode" value="2" id="bo2" />
                                <label for="bo2">仅所属部门</label><br />
                                <input type="radio" name="bomode" value="3" id="bo3" />
                                <label for="bo3">指定单位或部门</label><br />
                                <br />
                                <input type="checkbox" id="bosub" />
                                <label for="bosub">是否包括下级</label>
                            </div>
                        </td>
                        <td style="vertical-align: top;">
                            <div id="bocc-treebox">
                                <ul id="botree"></ul>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>
        </div>
        <div id="tab4">
            <table id="msggrid"></table>
        </div>
        <div id="tab5">
            <table id="usergrid"></table>
        </div>
        <div id="tab6">
            <div id="orgtool"></div>
            <div id="orgdiv">
                <ul id="orgtree"></ul>
            </div>
        </div>
    </div>
    <div id="role-editor"></div>
    <input type="hidden" id="hidediting" />
    <input type="hidden" id="hidvalue" />
    <div id="UserSelector"></div>
</asp:Content>
