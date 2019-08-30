using DevExpress.LookAndFeel;
using DevExpress.XtraBars;
using DevExpress.XtraBars.Docking2010.Views;
using DevExpress.XtraBars.Navigation;
using DevExpress.XtraEditors;
using FormFactory;
using System.Collections.Generic;
using System.Drawing;

namespace WinPlatformApp
{
    public partial class FormMain : DevExpress.XtraBars.Ribbon.RibbonForm
    {
        //XtraUserControl employeesUserControl;
        //XtraUserControl customersUserControl;

        public FormMain()
        {
            InitializeComponent();
            UserLookAndFeel.Default.SetSkinStyle("Office 2016 Colorful");//皮肤主题
            //employeesUserControl = CreateUserControl("Employees");
            //customersUserControl = CreateUserControl("Customers");
            //accordionControl.SelectedElement = employeesAccordionControlElement;
            InitPages();
            this.tabbedView.DocumentClosing += TabbedView_DocumentClosing;
        }

        private void TabbedView_DocumentClosing(object sender, DocumentCancelEventArgs e)
        {
            e.Document.Control.Hide();
        }

        XtraUserControl CreateUserControl(string text)
        {
            XtraUserControl result = new XtraUserControl();
            result.Name = text.ToLower() + "UserControl";
            result.Text = text;
            LabelControl label = new LabelControl();
            label.Parent = result;
            label.Appearance.Font = new Font("Tahoma", 25.25F);
            label.Appearance.ForeColor = Color.Gray;
            label.Dock = System.Windows.Forms.DockStyle.Fill;
            label.AutoSizeMode = LabelAutoSizeMode.None;
            label.Appearance.TextOptions.HAlignment = DevExpress.Utils.HorzAlignment.Center;
            label.Appearance.TextOptions.VAlignment = DevExpress.Utils.VertAlignment.Center;
            label.Text = text;
            return result;
        }

        List<PagesModel> listUserControl = new List<PagesModel>();
        /// <summary>
        /// 初始化模块资源
        /// </summary>
        private void InitPages()
        {
            //1、根据权限获取节点名称,并绑定左侧树
            //2、根据节点名称从容器中获取树对象

            AccordionControlElement accordionControlElement = new AccordionControlElement();
            accordionControlElement.Text = "系统参数";
            accordionControlElement.Style = ElementStyle.Group;
            accordionControl.Elements.Add(accordionControlElement);

            AccordionControlElement childElement = new AccordionControlElement();
            childElement.Text = "系统参数";
            childElement.Name = "XucSystemSet";
            childElement.Style = ElementStyle.Item;
            //TODO 模块图标
            accordionControlElement.Elements.Add(childElement);

            PagesModel pagesModel = new PagesModel();
            if (FromsObject.formsDic.ContainsKey("XucSystemSet"))
            {
                pagesModel.PageName = "XucSystemSet";
                pagesModel.PageText = "系统参数";
                accordionControl.Name = "";
                pagesModel.xtraUserControl = FromsObject.formsDic["XucSystemSet"];
                listUserControl.Add(pagesModel);
            }

            #region 此处的代码可以从数据库的模块管理表中查询并赋值
            //1、先取分组信息
            //2、根据分组信息，取节点并添加到分组内
            AccordionControlElement accordionControlElement1 = new AccordionControlElement();
            accordionControlElement1.Text = "称重计量";
            accordionControlElement1.Style = ElementStyle.Group;
            accordionControl.Elements.Add(accordionControlElement1);

            AccordionControlElement childElement1 = new AccordionControlElement();
            childElement1.Text = "集中计量";
            childElement1.Name = "XucFocusWeight";
            childElement1.Style = ElementStyle.Item;
            //TODO 模块图标
            //childElement1.Image = "";
            accordionControlElement1.Elements.Add(childElement1);
            if (FromsObject.formsDic.ContainsKey("XucFocusWeight"))
            {
                pagesModel = new PagesModel();
                pagesModel.PageName = "XucFocusWeight";
                pagesModel.PageText = "集中计量";
                pagesModel.xtraUserControl = FromsObject.formsDic["XucFocusWeight"];
                listUserControl.Add(pagesModel);
            }

            AccordionControlElement childElement2 = new AccordionControlElement();
            childElement2.Text = "集中计量222";
            childElement2.Name = "XtraForm1";
            childElement2.Style = ElementStyle.Item;
            //TODO 模块图标
            //childElement1.Image = "";
            accordionControlElement1.Elements.Add(childElement2);
            if (FromsObject.formsDic.ContainsKey("XtraForm1"))
            {
                pagesModel = new PagesModel();
                pagesModel.PageName = "XtraForm1";
                pagesModel.PageText = "集中计量222";
                pagesModel.xtraUserControl = FromsObject.formsDic["XtraForm1"];
                listUserControl.Add(pagesModel);
            }
            #endregion

        }

        /// <summary>
        /// 点击左侧树节点
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        void accordionControl_SelectedElementChanged(object sender, SelectedElementChangedEventArgs e)
        {
            if (e.Element == null) return;
            //防止重复实例化页面对象
            if (tabbedView.Documents.Exists(x=>x.Control.Name== e.Element.Name))
            {
                //tabbedView.ActivateDocument(e.Element.AccordionControl);
                return;
            }
            else
            {
                if (FromsObject.formsDic.ContainsKey(e.Element.Name))
                {
                    XtraUserControl userControl = (XtraUserControl)CreateFormInstance.CreateObject(e.Element.Name);
                    userControl.Text = e.Element.Text;
                    tabbedView.AddDocument(userControl);
                    tabbedView.ActivateDocument(userControl);
                }
            }
        }

        void tabbedView_DocumentClosed(object sender, DocumentEventArgs e)
        {
            SetAccordionSelectedElement(e);
        }
        /// <summary>
        /// 设置菜单选择项
        /// </summary>
        /// <param name="e"></param>
        void SetAccordionSelectedElement(DocumentEventArgs e)
        {
            if (tabbedView.Documents.Count == 0)
            {
                accordionControl.SelectedElement = null;
            }
        }

        #region 功能菜单
        /// <summary>
        /// 关于
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void barBtnAbout_ItemClick(object sender, ItemClickEventArgs e)
        {
            FormAbout formAbout = new FormAbout();
            formAbout.Text = "关于";
            formAbout.ShowDialog();
        }

        /// <summary>
        /// 打开功能列表
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void barBtnFunList_ItemClick(object sender, ItemClickEventArgs e)
        {
            this.dockPanel.Show();
        }
        #endregion

        /// <summary>
        /// 窗体属性
        /// </summary>
        public class PagesModel
        {
            /// <summary>
            /// 窗体name
            /// </summary>
            public string PageName { get; set; }
            /// <summary>
            /// 窗体text
            /// </summary>
            public string PageText { get; set; }
            public XtraUserControl xtraUserControl { get; set; }
        }
    }
}