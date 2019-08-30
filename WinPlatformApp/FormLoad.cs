using DevExpress.XtraEditors;
using FormFactory;
using System;
using System.Data;
using System.Linq;
using System.Reflection;
using System.Threading;
using System.Windows.Forms;

namespace WinPlatformApp
{
    public partial class FormLoad : Form
    {
        /// <summary>
        /// 检测成功标识
        /// </summary>
        bool sucess = true;

        public FormLoad()
        {
            InitializeComponent();
            Control.CheckForIllegalCrossThreadCalls = false;
        }

        //public static Dictionary<string, XtraUserControl> formsDic = new Dictionary<string, XtraUserControl>();
        private void FormLoad_Load(object sender, EventArgs e)
        {
            this.backgroundWorker1.RunWorkerAsync();            
        }

        /// <summary>
        /// 加载页面资源
        /// </summary>
        private void CreateFormObject()
        {
            try
            {
                //加载程序集
                var assembly = Assembly.Load("WinPlatformApp");
                //匹配继承了XtraUserControlBase的类
                var ass = assembly.GetTypes().Where(x => x.BaseType != null && x.BaseType.Name == "XtraUserControlBase");
                //并且类特性为 CreateFormFlagAttribute，才可以实例化并加到对象中
                foreach (var item in ass)
                {
                    Type type = assembly.GetType(item.FullName);
                    if (type.IsDefined(typeof(CreateFormFlagAttribute), true))
                    {
                        //获取构造函数
                        ConstructorInfo ct1 = type.GetConstructor(System.Type.EmptyTypes);
                    
                        var obj = ct1.Invoke(null);
                        var xucObj = (XtraUserControl)obj;
                        FromsObject.formsDic.Add(item.Name, xucObj);
                    }
                }
            }
            catch (Exception ex)
            {

            }
        }

        /// <summary>
        /// 初始化系统信息
        /// </summary>
        private void InitSystemInfo()
        {
            //1、出入口信息
            //2、设备信息
        }

        private void backgroundWorker1_DoWork(object sender, System.ComponentModel.DoWorkEventArgs e)
        {
            this.lblMsg.Text = "系统正在初始化，请稍候……";
            Thread.Sleep(1000);
            #region 同步服务器时间
            this.lblMsg.Text = "正在同步服务器时间……";
            //TODO 同步服务器时间
            Thread.Sleep(500);
            #endregion

            #region 检测客户端相关设备状态
            this.lblMsg.Text = "正在检测客户端连接设备状态……";
            //TODO 检测客户端相关设备状态
            Thread.Sleep(500);
            #endregion

            #region 加载窗体资源
            this.lblMsg.Text = "正在加载窗体资源……";
            CreateFormObject();
            Thread.Sleep(500);
            #endregion
        }

        private void backgroundWorker1_RunWorkerCompleted(object sender, System.ComponentModel.RunWorkerCompletedEventArgs e)
        {
            if (sucess)
            {
                FormLogin f = new FormLogin();
                this.Hide();
                f.ShowDialog();
            }
        }
    }
}
