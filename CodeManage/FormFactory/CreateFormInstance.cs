using DevExpress.XtraEditors;
using System;
using System.Linq;
using System.Reflection;

namespace FormFactory
{
    public class CreateFormInstance
    {
        //private static readonly string FilePath = "Ts.Win";
        //private static readonly string DALNameSpace = "Ts.Win";
        //public Dictionary<string, XtraUserControl> FormsDic = new Dictionary<string, XtraUserControl>();
        public static object CreateObject(string ClassName)
        {
            try
            {
                //加载程序集
                var assembly = Assembly.Load("WinPlatformApp");

                var ass = assembly.GetTypes().Where(x => x.BaseType != null && x.BaseType.Name == "XtraUserControlBase" && x.Name == ClassName);
                var fullName = ass.FirstOrDefault().FullName;


                Type type = assembly.GetType(fullName);
                if (type.IsDefined(typeof(CreateFormFlagAttribute), true))
                {
                    //获取构造函数
                    ConstructorInfo ct1 = type.GetConstructor(System.Type.EmptyTypes);
                    var obj = ct1.Invoke(null);
                    var xucObj = (XtraUserControl)obj;
                    return xucObj;
                }
                return null;


                //var assembly = Assembly.Load(FilePath);
                //string FullClassName = DALNameSpace + "." + ClassName;
                //Type type = assembly.GetType(FullClassName);

                ////获取FullClassName非公有的构造函数
                //System.Reflection.ConstructorInfo[] constructorInfoArray = type.GetConstructors(System.Reflection.BindingFlags.Instance
                //  | System.Reflection.BindingFlags.NonPublic);
                //System.Reflection.ConstructorInfo noParameterConstructorInfo = null;
                //foreach (System.Reflection.ConstructorInfo constructorInfo in constructorInfoArray)
                //{
                //    System.Reflection.ParameterInfo[] parameterInfoArray = constructorInfo.GetParameters();
                //    if (1 == parameterInfoArray.Length)
                //    {
                //        noParameterConstructorInfo = constructorInfo;
                //        break;
                //    }
                //}
                ////调用带1个string参数的构造函数生成实例
                //var instance = noParameterConstructorInfo.Invoke(new object[] { "" });

                ////方法名
                //string methodName = "GetInstance";
                //MethodInfo method = type.GetMethod(methodName);

                //return method.Invoke(instance, null);
            }
            catch (Exception ex)
            {
                return null;
            }
        }
    }
}
