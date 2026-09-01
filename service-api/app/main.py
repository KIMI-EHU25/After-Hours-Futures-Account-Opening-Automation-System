from fastapi import FastAPI
from datetime import date
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

data = {
    "p6-launderingBack" : {
        "6-1" : "A",    # 居民税收身份

        "6-2" : "D",    # 政要人物关系 
                        # !注意最后两个选项的 E 和 D 的 value 反过来了
                        # value="E" 为倒数第二个选项 value="D" 为最后一个选项

        "6-3" : "C",    # 投资期限
        "6-4" : "A",    # 期望收益
        "6-5" : "A",    # 账户是否存在被他人控制
        "6-6" : "A",    # 账户交易实际受益人为
        "6-7" : [       # 想投资的品种
            1
        ],
        "6-8" : "I",    # 是否有来源以下机构不良诚信记录
        "6-10" : [      # 参与期货的主要交易类型
            1
        ]
    },

    "p7-addInfo" : {
        "name" : "张三",                                      # 姓名 
        "idCardNumber" : "110101199003071233",                 # 身份证号
        "idCardAddress" : "北京市东城区示例路1号101室",    # 身份证地址
        "nationality" : None ,                                 # 国籍 - 只读
        "idCardValidPeriodStart" : date(2026, 2, 3),           # 身份证有效期起始
        "idCardValidPeriodEnd" : date(2036, 2, 3),             # 身份证有效期结束
        "ifIdCardPermanentlyValid" : True ,                    # 身份证是否长期有效
        "contactAddressProvince" : {                           # 联系地址省
            "value" : "156310000",
            "label" : "上海市"
        },
        "contactAddressCity" : {                               # 联系地址市
            "value" : "156310105",
            "label" : "长宁区"
        },
        "contactAddress" : "北京市东城区示例路1号101室",     # 联系地址
        "postalCode" : "200000",                               # 邮政编码
        "departmentProvince" : "湖北省",                        # 开户营业部省
        "departmentCity" : "武汉市",                            # 开户营业部市
        "departmentCategory" : "0",                            # 营业部类别
        "departmentName" : "2015",                             # 开户营业部
        "contactnumber" : "13900000000",                       # 联系电话
        "phonenumber" : None,                                  # 联系手机 - 只读
        "emailAddress" : None,                                 # 电子邮箱
        "occupation" : {                                       # 职业
            "value" : "537",
            "label" : "学生"
        },                                     
        "educationalQualification" : {                         # 学历
            "value" : "3",
            "label" : "大学本科"
        },                       
        "ifIntermediary" : False,                              # 是否存在居间人
        "intermediaryName" : None,                             # 居间人姓名
        "intermediaryCode" : None,                             # 居间人登记编号
        "referencePersonCode" : None,                          # 推荐人代码
        "referencePersonName" : None,                          # 推荐人姓名
    },

    "p10-question" : {
        "10-1" : "A",   # 是否具有民事行为能力
        "10-2" : "A",   # 主要收入来源
        "10-3" : "A",   # 计划用于金融投资的主要资金来源
        "10-4" : "B",   # 年平均收入
        "10-5" : "C",   # 金融资产情况
        "10-6" : "A",   # 是否有尚未清偿的数额较大的债务
        "10-7" : "A",   # 投资回报主要用于
        "10-8" : "B",   # 关于专业背景、教育经历、投资知识等描述
        "10-9" : "B",   # 主要依据什么作出金融投资决策
        "10-10" : "B",  # 投资经历
        "10-11" : "C",  # 交易频率
        "10-12" : "B",  # 投资资产分配
        "10-13" : "A",  # 可承受的最大损失
        "10-14" : "C",  # 账户亏损约为
    },

    "p12-chooseFutures" : {
        "12-1" : [
            1,
            2,
            3,
            4
        ]
    }
}

@app.get("/data")
def get_data() :
    return data