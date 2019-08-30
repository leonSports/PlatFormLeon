using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace WinPlatformApp
{
    public partial class FormLogin : Form
    {
        public FormLogin()
        {
            InitializeComponent();
        }

        private void btnLogin_Click(object sender, EventArgs e)
        {
            if (this.txtUserName.Text.Trim().Length == 0)
            {
                MessageBox.Show(Owner, "请输入帐号！", "提示", MessageBoxButtons.OK);
                this.txtUserName.Focus();
                return;
            }

            if (this.txtPwd.Text.Trim().Length == 0)
            {
                MessageBox.Show(Owner, "请输入密码！", "提示", MessageBoxButtons.OK);
                this.txtPwd.Focus();
                return;
            }

            //打开系统主页
            FormMain m = new FormMain();
            this.Hide();
            m.ShowDialog();
        }

        private void btnColse_Click(object sender, EventArgs e)
        {

        }

        private void InitSystemInfo()
        {
            //1、登陆用户、权限等信息
        }
    }
}
