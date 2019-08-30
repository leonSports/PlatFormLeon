/**********************************************************   
 * 版权归Leon个人所有
 * 文件名   ： CreateFormFlagAttribute
 * 功能描述 ： (Form窗体标记是否需要反射创建) 
 * 创建日期 ： 2019-08-28 09:57:16
 * 创建人   ： Leon
 *********************************************************/
using System;

namespace FormFactory
{
    /**
     * 功能描述 ： (Form窗体标记是否需要反射创建) 
     * 创建日期 ： 2019-08-28 09:57:16 
     * 创建人   ： Leon
     */
    public class CreateFormFlagAttribute : Attribute
    {
        public CreateFormFlagAttribute(string Description_in)
        {
            this.description = Description_in;
        }

        protected String description;
        public String Description
        {
            get
            {
                return this.description;
            }
        }
    }
}
