
using System;
using System.Collections.Generic;
using System.Data;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.NetworkInformation;
using System.Runtime.InteropServices;
using System.Text;
using System.Text.RegularExpressions;


namespace ts.Business
{
    public class CommonMethod
    {
        public static string MsgNotLogin = "未检查到登录信息，可能是登录超时，请重新登录。";
        //是否测试模式
        private static string isDebug = System.Configuration.ConfigurationManager.AppSettings["IsDebug"];
        //是否调用接口
        private static string isInvokeInterface = System.Configuration.ConfigurationManager.AppSettings["IsInvokeInterface"];
        //是否播放视频
        private static string isPlayVideo = System.Configuration.ConfigurationManager.AppSettings["IsPlayVideo"];
        //是否字幕叠加
        private static string isOSDVideo = System.Configuration.ConfigurationManager.AppSettings["IsOSDVideo"];


        /// <summary>
        /// 是否开启测试模式
        /// </summary>
        public static bool IsTest = Convert.ToBoolean((isDebug ?? "false"));
        /// <summary>
        /// 是否调用接口
        /// </summary>
        public static bool IsInvokeInterface = Convert.ToBoolean((isInvokeInterface ?? "true"));
        /// <summary>
        /// 是否播放视频
        /// </summary>
        public static bool IsPlayVideo = Convert.ToBoolean((isPlayVideo ?? "false"));
        /// <summary>
        /// 是否字幕叠加
        /// </summary>
        public static bool IsOSDVideo = Convert.ToBoolean((isOSDVideo ?? "false"));

        /// <summary>
        /// 获取服务端IP地址
        /// </summary>
        /// <returns></returns>
        public static List<string> GetServerIP()
        {
            try
            {
                IPHostEntry ieh = Dns.GetHostEntry(Dns.GetHostName());
                string strReg = @"^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$";
                Regex regex = new Regex(strReg);

                List<string> strIps = new List<string>();
                foreach (IPAddress address in ieh.AddressList)
                {
                    if (regex.IsMatch(address.ToString()))
                    {
                        strIps.Add(address.ToString());
                        //return address.ToString();
                    }
                }
                return strIps;
            }
            catch (Exception)
            {
                return null;
            }
        }

        ///// <summary>
        ///// 获取客户端Ip
        ///// </summary>
        ///// <returns></returns>
        //public static string GetClientIp()
        //{
        //    string clientIPAddress = "";
        //    if (System.Web.HttpContext.Current != null)
        //    {
        //        if (System.Web.HttpContext.Current.Request.Cookies["clientIPAddress"] != null)
        //        {
        //            clientIPAddress = System.Web.HttpContext.Current.Request.Cookies["clientIPAddress"].Value;
        //        }
        //    }
        //    else if (GetServerIP() != null)
        //    {
        //        clientIPAddress = GetServerIP()[0];
        //    }

        //    return clientIPAddress;
        //}

        private const string _SuccessValue = "网络已连通";
        private const string _FailValue = "网络连接失败";

        /// <summary>
        /// 调用Windows内核函数，判断网络是否连能
        /// </summary>
        /// <param name="conState">输出网络状态值</param>
        /// <param name="reder">此参数必须为0</param>
        /// <returns>true:连通，false：未连通</returns>
        [DllImport("wininet.dll", EntryPoint = "InternetGetConnectedState")]
        private static extern bool InternetGetConnectedState(out int conState, int reder);

        /// <summary>
        /// 测试网络状态
        /// </summary>
        /// <param name="Flag"></param>
        /// <returns></returns>
        public static string GetLanData(out bool Flag)
        {
            int _State;
            bool _Flag = InternetGetConnectedState(out _State, 0);
            if (_Flag)
            {
                Flag = _Flag;
                return _SuccessValue;
            }
            else
            {
                Flag = _Flag;
                return _FailValue;
            }
        }

        /// <summary>
        /// 测试网络是否畅通
        /// </summary>
        /// <param name="networkAddress"></param>
        /// <returns></returns>
        public static bool CheckNetwork(string networkAddress)
        {
            try
            {
                //构造Ping实例
                Ping ping = new Ping();
                //Ping选项设置，用于控制如何传输数据包
                PingOptions poptions = new PingOptions();
                poptions.DontFragment = true;
                //测试数据
                string data = "are you ok?";
                Byte[] buffer = Encoding.ASCII.GetBytes(data);
                //设置超时时间，单位毫秒
                int timeout = 1000;
                //调用同步send方法发送数据，将返回结果保存至PingReply实例
                //此处如果直接ping IP的话，先引用命名空间using System.Net;
                //然后代码改为：PingReply pingreply = ping.Send(IPadress.Parse("192.168.1.1"),timeout,buffer,poptions);
                PingReply pingreply = ping.Send(networkAddress, timeout, buffer, poptions);
                if (pingreply.Status != IPStatus.Success)
                {
                    return false;
                }
                return true;
            }
            catch (Exception)
            {
                return false;
            }

        }

        /// <summary>
        /// 检查COM口是否存在
        /// </summary>
        /// <param name="portName"></param>
        /// <returns></returns>
        public static bool CheckPorts(string portName)
        {
            try
            {
                string[] sAllPort = System.IO.Ports.SerialPort.GetPortNames();
                if (!sAllPort.Contains(portName))
                {
                    return false;
                }
                return true;
            }
            catch (Exception)
            {
                return false;
            }

        }

        /// <summary>
        /// 获取服务器时间
        /// </summary>
        /// <returns>服务器时间</returns>
        public static DateTime? GetServerTime()
        {
            try
            {
                //GeneralDataContainer gdc = new GeneralDataContainer();
                ////string strSQL = "select getdate()";string 
                //string strSQL = " select sysdate from dual ";
                //DataTable table = gdc.ExecuteStoreQuery(strSQL);
                //if (table != null)
                //{
                //    if (table.Rows.Count > 0)
                //    {
                //        return Convert.ToDateTime(table.Rows[0][0]);
                //    }
                //}
                //return null;

                return DateTime.Now;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        /// <summary>
        /// 构造自定义时间（自定义年月日+当前时分秒）
        /// </summary>
        /// <param name="strDate"></param>
        /// <returns></returns>
        public static DateTime CreateDateTime(string strDate)
        {
            var date = Convert.ToDateTime(strDate).ToString("yyyy-MM-dd");
            DateTime dtNow = DateTime.Now;
            string dateStr = string.Format("{0}:{1}:{2}", dtNow.Hour, dtNow.Minute, dtNow.Second);
            DateTime dt = Convert.ToDateTime(date + " " + dateStr);
            return dt;
        }

        #region 图片处理（保存与生成）

        /// <summary>
        /// 二进制转换image对象
        /// </summary>
        /// <param name="buffer"></param>
        /// <returns></returns>
        public static Image BytesToImage(byte[] buffer)
        {
            MemoryStream ms = new MemoryStream(buffer);
            Image image = System.Drawing.Image.FromStream(ms);
            return image;
        }

        /// <summary>
        /// Convert Image to Byte[]
        /// </summary>
        /// <param name="image"></param>
        /// <returns></returns>
        public static byte[] ImageToBytes(Image image)
        {
            ImageFormat format = image.RawFormat;
            using (MemoryStream ms = new MemoryStream())
            {
                if (format.Equals(ImageFormat.Jpeg))
                {
                    image.Save(ms, ImageFormat.Jpeg);
                }
                else if (format.Equals(ImageFormat.Png))
                {
                    image.Save(ms, ImageFormat.Png);
                }
                else if (format.Equals(ImageFormat.Bmp))
                {
                    image.Save(ms, ImageFormat.Bmp);
                }
                else if (format.Equals(ImageFormat.Gif))
                {
                    image.Save(ms, ImageFormat.Gif);
                }
                else if (format.Equals(ImageFormat.Icon))
                {
                    image.Save(ms, ImageFormat.Icon);
                }
                byte[] buffer = new byte[ms.Length];
                //Image.Save()会改变MemoryStream的Position，需要重新Seek到Begin
                ms.Seek(0, SeekOrigin.Begin);
                ms.Read(buffer, 0, buffer.Length);
                return buffer;
            }
        }

        /// <summary>
        /// 二进制转换图片文件
        /// </summary>
        /// <param name="fileName"></param>
        /// <param name="buffer"></param>
        /// <returns></returns>
        public static string CreateImageFromBytes(string fileName, byte[] buffer)
        {
            string file = fileName;
            Image image = BytesToImage(buffer);
            ImageFormat format = image.RawFormat;
            if (format.Equals(ImageFormat.Jpeg))
            {
                file += ".jpeg";
            }
            else if (format.Equals(ImageFormat.Png))
            {
                file += ".png";
            }
            else if (format.Equals(ImageFormat.Bmp))
            {
                file += ".bmp";
            }
            else if (format.Equals(ImageFormat.Gif))
            {
                file += ".gif";
            }
            else if (format.Equals(ImageFormat.Icon))
            {
                file += ".icon";
            }
            System.IO.FileInfo info = new System.IO.FileInfo(file);
            System.IO.Directory.CreateDirectory(info.Directory.FullName);
            File.WriteAllBytes(file, buffer);
            return file;
        }

        /// <summary>
        /// 使用空格将字符串隔开
        /// </summary>
        /// <param name="str"></param>
        /// <returns></returns>
        public static string StringSplitbySpace(string str)
        {
            try
            {
                string resStr = "";
                for (int i = 0; i < str.Trim().Length; i++)
                {
                    resStr += str[i] + " ";
                }
                return resStr.Trim();
            }
            catch (Exception)
            {
                //如果异常将原数据输出
                return str;
            }

        }
        #endregion
        /// <summary>
        /// 加载本地图片
        /// </summary>
        public static void LoadModulesImage(System.Windows.Forms.ImageList imgList)
        {
            imgList.Images.Clear();
            string path = AppDomain.CurrentDomain.BaseDirectory + "Images\\modules\\";
            imgList.Images.Add("采购磅单查询", Image.FromFile(path + "采购磅单查询.png"));
            imgList.Images.Add("集中计量设置", Image.FromFile(path + "集中计量设置.png"));
            imgList.Images.Add("系统参数设置", Image.FromFile(path + "系统参数设置.png"));
            imgList.Images.Add("车辆出厂", Image.FromFile(path + "车辆出厂.png"));
            imgList.Images.Add("称重", Image.FromFile(path + "称重.png"));
            imgList.Images.Add("出入口设置", Image.FromFile(path + "出入口设置.png"));
            imgList.Images.Add("角色管理", Image.FromFile(path + "角色管理.png"));
            imgList.Images.Add("客户管理", Image.FromFile(path + "客户管理.png"));
            imgList.Images.Add("临时榜单查询", Image.FromFile(path + "临时榜单查询.png"));
            imgList.Images.Add("采购零磅单管理", Image.FromFile(path + "采购零磅单管理.png"));
            imgList.Images.Add("模块管理", Image.FromFile(path + "模块管理.png"));
            imgList.Images.Add("设备分类", Image.FromFile(path + "设备分类.png"));
            imgList.Images.Add("设备信息", Image.FromFile(path + "设备信息.png"));
            imgList.Images.Add("数据同步", Image.FromFile(path + "数据同步.png"));
            imgList.Images.Add("销售榜单查询", Image.FromFile(path + "销售榜单查询.png"));
            imgList.Images.Add("集中计量设置", Image.FromFile(path + "集中计量设置.png"));
            imgList.Images.Add("卸车叫号", Image.FromFile(path + "卸车叫号.png"));
            imgList.Images.Add("卸车排队", Image.FromFile(path + "卸车排队.png"));
            imgList.Images.Add("信号灯设置", Image.FromFile(path + "信号灯设置.png"));
            imgList.Images.Add("用户管理", Image.FromFile(path + "用户管理.png"));
            imgList.Images.Add("用户信息", Image.FromFile(path + "用户管理.png"));
            imgList.Images.Add("装车叫号", Image.FromFile(path + "装车叫号.png"));
            imgList.Images.Add("装车排队", Image.FromFile(path + "装车排队.png"));
            imgList.Images.Add("接口设置", Image.FromFile(path + "接口设置.png"));
            imgList.Images.Add("同步物料信息", Image.FromFile(path + "同步物料信息.png"));
            imgList.Images.Add("物资类别", Image.FromFile(path + "物资类别.png"));
            imgList.Images.Add("物资信息", Image.FromFile(path + "物资信息.png"));
            imgList.Images.Add("卸车单管理", Image.FromFile(path + "卸车单管理.png"));
            imgList.Images.Add("卡注册管理", Image.FromFile(path + "卡注册管理.png"));
            imgList.Images.Add("车辆信息", Image.FromFile(path + "车辆信息.png"));
            imgList.Images.Add("地衡仪表", Image.FromFile(path + "地衡仪表.png"));
            imgList.Images.Add("废料管理", Image.FromFile(path + "废料管理.png"));
            imgList.Images.Add("工具", Image.FromFile(path + "工具.png"));
            imgList.Images.Add("供应商管理", Image.FromFile(path + "供应商管理.png"));
            imgList.Images.Add("红外监控", Image.FromFile(path + "红外监控.png"));
            imgList.Images.Add("计量对讲信息设置", Image.FromFile(path + "计量对讲信息设置.png"));
            imgList.Images.Add("使用地权限管理", Image.FromFile(path + "使用地权限管理.png"));
            imgList.Images.Add("提货车辆安排", Image.FromFile(path + "提货车辆安排.png"));
            imgList.Images.Add("卸车进厂车辆查询", Image.FromFile(path + "卸车进厂车辆查询.png"));
            imgList.Images.Add("质量检测结果", Image.FromFile(path + "质量检测结果.png"));
            imgList.Images.Add("装车进厂车辆查询", Image.FromFile(path + "装车进厂车辆查询.png"));
        }

        /// <summary>
        /// 获取编码
        /// </summary>
        /// <param name="tableName">表名</param>
        /// <param name="codeFileName">编码字段名</param>
        /// <param name="headString">编码前缀</param>
        /// <returns></returns>
        public static string GetCode(string tableName, string codeFileName, string headString = null)
        {
            try
            {
                string res = "";
                //_gdc1 = new GeneralDataContainer();
                //OracleParameter[] parameters ={
                //                 new OracleParameter("tableName",OracleDbType.NVarchar2,50),
                //                 new OracleParameter("codeName",OracleDbType.NVarchar2,50),
                //                 new OracleParameter("billCode",OracleDbType.RefCursor)
                //                                };
                //parameters[0].Value = tableName;
                //parameters[1].Value = codeFileName;
                //parameters[2].Direction = ParameterDirection.Output;

                //var sysDatabaseSchema = _gdc1.DbCfg.EfModelInfos["SystemData"].Schema;
                //var connStr = _gdc1.DbCfg.DBConnectionString;
                ////根据webconfig 的配置文件构造新的连接字符串
                //string conn = TConncetionString.ConnectionToString(connStr);
                //var dt = ts.DataOracleManage.OracleHelper.ExecuteDataTable(conn, CommandType.StoredProcedure, sysDatabaseSchema + ".UP_GetCode", parameters);
                //if (dt.Rows.Count != 0)
                //{
                //    res = dt.Rows[0][0].ToString();
                //    if (!string.IsNullOrEmpty(headString))
                //    {
                //        res = headString + res;
                //    }
                //}
                return res;
            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
                //_gdc1.Dispose();
            }
        }

    }
}
