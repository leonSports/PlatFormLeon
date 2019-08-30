using System;
using System.Collections.Generic;
using System.Linq;
using System.Windows.Forms;
using DevExpress.UserSkins;
using DevExpress.Skins;
using DevExpress.LookAndFeel;
using System.Threading;
using System.Drawing;

namespace WinPlatformApp
{
    static class Program
    {
        ///// <summary>
        ///// The main entry point for the application.
        ///// </summary>
        //[STAThread]
        //static void Main()
        //{
        //    Application.EnableVisualStyles();
        //    Application.SetCompatibleTextRenderingDefault(false);
        //    System.Threading.Thread.CurrentThread.CurrentUICulture = new System.Globalization.CultureInfo("zh-CN");
        //    BonusSkins.Register();
        //    Application.Run(new FormLoad());
        //}

        public static Mutex mutex;
        /// <summary>
        /// 应用程序的主入口点。
        /// </summary>
        [STAThread]
        static void Main()
        {
            bool ret;
            mutex = new Mutex(true, Application.ProductName, out ret);
            if (ret)
            {
                DevExpress.Utils.AppearanceObject.DefaultFont = new Font("Tahoma", 10);
                System.Threading.Thread.CurrentThread.CurrentUICulture = new System.Globalization.CultureInfo("zh-CN");
                Application.EnableVisualStyles();
                Application.SetCompatibleTextRenderingDefault(false);
                Application.Run(new FormLoad());
                mutex.ReleaseMutex();
            }
            else
            {
                MessageBox.Show("程序已经在运行当中", "错误");
                Application.Exit();
            }
        }
    }
}
