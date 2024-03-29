﻿using DevExpress.LookAndFeel;
using DevExpress.XtraBars;
using DevExpress.XtraBars.Docking2010.Views;
using DevExpress.XtraBars.Navigation;
using DevExpress.XtraEditors;
using FormFactory;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Windows.Forms;

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
            string path = AppDomain.CurrentDomain.BaseDirectory + "Images\\devexpress\\";

            AccordionControlElement accordionControlElement = new AccordionControlElement();
            accordionControlElement.Text = "系统参数";
            accordionControlElement.Style = ElementStyle.Group;
            accordionControl.Elements.Add(accordionControlElement);
            accordionControlElement.Image= Image.FromFile(path + "customizegrid_32x32.png");

            AccordionControlElement childElement = new AccordionControlElement();
            childElement.Text = "系统参数";
            childElement.Name = "XucSystemSet";
            childElement.Style = ElementStyle.Item;
            childElement.Image= Image.FromFile(path + "scripts_16x16.png");
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
            accordionControlElement1.Image= Image.FromFile(path + "addnewdatasource_32x32.png");

            AccordionControlElement childElement1 = new AccordionControlElement();
            childElement1.Text = "集中计量";
            childElement1.Name = "XucFocusWeight";
            childElement1.Style = ElementStyle.Item;
            
            childElement1.Image = Image.FromFile(path + "addheader_16x16.png");
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
            #endregion

        }

        private void GetSystemImage()
        {
           
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

        /// <summary>
        /// 关闭窗体
        /// </summary>
        /// <param name="sender"></param>
        /// <param name="e"></param>
        private void FormMain_FormClosed(object sender, System.Windows.Forms.FormClosedEventArgs e)
        {

        }

        private void FormMain_FormClosing(object sender, System.Windows.Forms.FormClosingEventArgs e)
        {
            try
            {
                Application.Exit();
                //System.Environment.Exit(0);
                //1.this.Close();   只是关闭当前窗口，若不是主窗体的话，是无法退出程序的，另外若有托管线程（非主线程），也无法干净地退出；
                //2.Application.Exit();  强制所有消息中止，退出所有的窗体，但是若有托管线程（非主线程），也无法干净地退出；
                //3.Application.ExitThread(); 强制中止调用线程上的所有消息，同样面临其它线程无法正确退出的问题；
                //4.System.Environment.Exit(0);   这是最彻底的退出方式，不管什么线程都被强制退出，把程序结束的很干净。
            }
            catch 
            {
            }
            
        }
    }
}