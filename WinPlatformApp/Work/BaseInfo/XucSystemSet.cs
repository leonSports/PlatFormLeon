using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Drawing;
using System.Data;
using System.Text;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Forms;
using DevExpress.XtraEditors;
using FormFactory;

namespace WinPlatformApp.Work.BaseInfo
{
    [CreateFormFlag("需要实例化的类")]
    public partial class XucSystemSet : XtraUserControlBase
    {
        public XucSystemSet()
        {
            InitializeComponent();
        }
    }
}
