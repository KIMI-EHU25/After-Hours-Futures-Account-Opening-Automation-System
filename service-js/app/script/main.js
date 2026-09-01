let lastUrl = "";

function runYourLogic() {
    if (location.href === lastUrl) return;
    lastUrl = location.href;

    main_func();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runYourLogic);
}
else {
    runYourLogic();
}

const rawPushState = history.pushState;
history.pushState = function (...args) {
    const result = rawPushState.apply(this, args);
    runYourLogic();
    return result;
};

const rawReplaceState = history.replaceState;
history.replaceState = function (...args) {
    const result = rawReplaceState.apply(this, args);
    runYourLogic();
    return result;
};

window.addEventListener("popstate", runYourLogic);
window.addEventListener("hashchange", runYourLogic);

// 上面勿动
// =============================
// =============================
// 每次跳转 刷新页面都会触发下面的 main_func 函数


/* main.js */
async function main_func() {
    let currentPathname = window.location.pathname;
    window.alert(`current pathname : ${currentPathname}`);

    await pathname();

    return;
}

/* api.js */
// data 存模拟用户数据
// 选择题的值用 "1,2,3" 或 "A,B,C" 表示都可以
const data = {
    "p6-launderingBack" : {
        "6-1" : "A",    // 居民税收身份

        "6-2" : "D",    // 政要人物关系 
                        // !注意最后两个选项的 E 和 D 的 value 反过来了
                        // value="E" 为倒数第二个选项 value="D" 为最后一个选项

        "6-3" : "C",    // 投资期限
        "6-4" : "C",    // 期望收益
        "6-5" : "A",    // 账户是否存在被他人控制
        "6-6" : "A",    // 账户交易实际受益人为
        "6-7" : [       // 想投资的品种
            1
        ],
        "6-8" : "I",    // 是否有来源以下机构不良诚信记录
        "6-10" : [      // 参与期货的主要交易类型
            1
        ]
    },

    "p7-addInfo" : {
        "name" : "张三",                                      // 姓名 
        "idCardNumber" : "110101199003071233",                 // 身份证号
        "idCardAddress" : "北京市东城区示例路1号101室",    // 身份证地址
        "nationality" : null ,                                 // 国籍 - 只读
        "idCardValidPeriodStart" : new Date(2026, 2, 3),       // 身份证有效期起始
        "idCardValidPeriodEnd" : new Date(2036, 2, 3),         // 身份证有效期结束
        "ifIdCardPermanentlyValid" : true,                     // 身份证是否长期有效
        "contactAddressProvince" : {                           // 联系地址省
            "value" : "156310000",
            "label" : "上海市"
        },
        "contactAddressCity" : {                               // 联系地址市
            "value" : "156310105",
            "label" : "长宁区"
        },
        "contactAddress" : "北京市东城区示例路1号101室",     // 联系地址
        "postalCode" : "200000",                               // 邮政编码
        "departmentProvince" : "湖北省",                        // 开户营业部省
        "departmentCity" : "武汉市",                            // 开户营业部市
        "departmentCategory" : "0",                            // 营业部类别
        "departmentName" : "2015",                             // 开户营业部
        "contactnumber" : "13900000000",                       // 联系电话
        "phonenumber" : null,                                  // 联系手机 - 只读
        "emailAddress" : null,                                 // 电子邮箱
        "occupation" : {                                       // 职业
            "value" : "537",
            "label" : "学生"
        },                                     
        "educationalQualification" : {                         // 学历
            "value" : "3",
            "label" : "大学本科"
        },                       
        "ifIntermediary" : false,                              // 是否存在居间人
        "intermediaryName" : null,                             // 居间人姓名
        "intermediaryCode" : null,                             // 居间人登记编号
        "referencePersonCode" : null,                          // 推荐人代码
        "referencePersonName" : null,                          // 推荐人姓名
    },
};


/* utils */
// 单选题内容注入
function selectSingleCheckbox(questionText, selectedValue) {
    const question = Array.from(document.querySelectorAll("p.monicker")).find(
        (element) => element.textContent.includes(questionText)
    );

    const options = Array.from(
        question?.nextElementSibling?.querySelectorAll(
            'input.weui-check[type="checkbox"]'
        ) ?? []
    );
    const target = Number.isInteger(selectedValue)
        ? options[selectedValue - 1]
        : options.find((option) => option.value === String(selectedValue));

    if (!target) {
        window.alert("未找到目标选项：", questionText, selectedValue);
        return;
    }

    // 这些题目业务上是单选；先通过真实点击取消其余已选项。
    options.forEach((option) => {
        if (option !== target && option.checked) {
            option.click();
        }
    });

    if (!target.checked) {
        target.click();
    }
}


// 多选题内容注入
async function selectMultipleVantCheckboxes(questionText, selectedIndexes) { 
    const question = Array.from(document.querySelectorAll("p.monicker")).find(
        (element) => element.textContent.includes(questionText)
    );
    const getOptions = () => Array.from(
        question?.nextElementSibling?.querySelectorAll(".van-checkbox") ?? []
    );
    const optionCount = getOptions().length;
    const selected = new Set(selectedIndexes.map(String));

    if (optionCount === 0) {
        window.alert("未找到多选题：", questionText);
        return;
    }

    for (let index = 0; index < optionCount; index += 1) {
        // 每次都重新取 DOM，避免 Vue 重渲染后继续使用旧状态。
        const option = getOptions()[index];
        const shouldBeSelected = selected.has(String(index + 1));
        const isSelected = option.querySelector(".van-checkbox__icon--checked") !== null;

        if (shouldBeSelected !== isSelected) {
            const toggle = option.querySelector(
                ".van-checkbox__icon, .van-checkbox__label"
            );

            if (!toggle) {
                window.alert("未找到多选项点击节点：", questionText, index + 1);
                return;
            }

            toggle.click();

            // Vant 通过 Vue 的 v-model 异步写回父组件；等待后再处理下一项，
            // 避免下一次点击基于旧数组覆盖本次选择。
            await new Promise((resolve) => setTimeout(resolve, 0));
        }
    }
}


function hasInjectionValue(value) {
    return value !== null && value !== undefined && value !== "";
}


function getAddInfoViewModel() {
    const viewModel = document.querySelector("#addInfo")?.__vue__;

    if (!viewModel?.ruleForm3) {
        window.alert("未找到 addInfo 的 Vue 页面实例");
        return null;
    }

    return viewModel;
}


function nextVueTick(viewModel) {
    return new Promise((resolve) => {
        if (typeof viewModel?.$nextTick === "function") {
            viewModel.$nextTick(resolve);
            return;
        }

        setTimeout(resolve, 0);
    });
}


// 单个普通文本字段注入：按页面标签定位 input 或 textarea。
function fillTextField({ label, value }) {
    if (!hasInjectionValue(value)) return;

    const field = Array.from(document.querySelectorAll(".van-cell")).find((element) =>
        element.querySelector(".van-cell__title span")?.textContent.trim() === label
    );
    const control = field?.querySelector("input.van-field__control, textarea.van-field__control");

    if (!control) {
        window.alert("未找到文本字段：", label);
        return;
    }

    const prototype = control instanceof HTMLTextAreaElement
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype;
    const valueSetter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;

    if (valueSetter) {
        valueSetter.call(control, String(value));
    } else {
        control.value = String(value);
    }

    control.dispatchEvent(new Event("input", { bubbles: true }));
    control.dispatchEvent(new Event("change", { bubbles: true }));
}


// 单个日期字段注入：Vux datetime 的数据模型字段使用 yyyy-MM-dd 格式。
async function fillDateField({ modelKey, value }) {
    if (!hasInjectionValue(value)) return;

    const viewModel = getAddInfoViewModel();
    if (!viewModel) return;

    const dateText = value instanceof Date
        ? `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`
        : String(value);

    viewModel.$set(viewModel.ruleForm3, modelKey, dateText);
    await nextVueTick(viewModel);
}


// 等待关联 picker 的选项列表中出现目标 value。
async function waitForPickerOption({ viewModel, optionsKey, value, timeout = 8000 }) {
    const expectedValue = String(value);
    const deadline = Date.now() + timeout;

    while (Date.now() < deadline) {
        const options = (viewModel[optionsKey] ?? []).flat();
        if (options.some((option) => String(option.value) === expectedValue)) {
            return true;
        }

        await new Promise((resolve) => setTimeout(resolve, 50));
    }

    window.alert("关联 picker 未加载目标选项：", optionsKey, expectedValue);
    return false;
}


// 单个 Vux popup picker 注入；value 会转换为 picker 所需的一项数组。
async function fillPopupPickerField({
    modelKey,
    value,
    onChange,
    changeFlagKey,
    waitOptionsKey,
    waitForValue,
}) {
    if (!hasInjectionValue(value)) return;

    const viewModel = getAddInfoViewModel();
    if (!viewModel) return;

    const pickerValue = Array.isArray(value) ? value.map(String) : [String(value)];
    viewModel.$set(viewModel.ruleForm3, modelKey, pickerValue);

    if (onChange && typeof viewModel[onChange] === "function") {
        // 页面初始数据可能已经保留上一轮的下级选项。先清空，避免等待函数
        // 把旧选项误判为本次关联接口已返回的数据。
        if (waitOptionsKey) {
            viewModel[waitOptionsKey] = [];
        }

        if (changeFlagKey) {
            viewModel[changeFlagKey] = true;
        }

        const result = viewModel[onChange](pickerValue);
        if (result?.then) await result;
    }

    await nextVueTick(viewModel);

    if (waitOptionsKey && hasInjectionValue(waitForValue)) {
        return waitForPickerOption({
            viewModel,
            optionsKey: waitOptionsKey,
            value: waitForValue,
        });
    }

    return true;
}


// 单个 Vant checkbox 注入，用于“身份证长期有效”。
async function fillVantCheckboxField({ value }) {
    if (typeof value !== "boolean") return;

    const viewModel = getAddInfoViewModel();
    if (!viewModel) return;

    viewModel.longTerm = value;

    if (value && typeof viewModel.longTermCheck === "function") {
        viewModel.longTermCheck();
    } else if (!value) {
        // 页面原生 longTermCheck() 在 false 分支会把 endTime 重置为当天，
        // 非长期有效时只解除只读状态，保留随后写入的实际结束日期。
        viewModel.isLongTerm = false;
    }

    await nextVueTick(viewModel);
}


// 单个 Vant radio 注入，用于“是否存在居间人”。
async function fillVantRadioField({ value }) {
    if (typeof value !== "boolean") return;

    const viewModel = getAddInfoViewModel();
    if (!viewModel) return;

    const radioValue = value ? "Y" : "N";
    viewModel.radio = radioValue;
    if (typeof viewModel.radioClick === "function") {
        viewModel.radioClick(radioValue);
    }

    await nextVueTick(viewModel);
}


// 获取当前页面路径，并执行相应逻辑
async function pathname() {

    await new Promise((resolve) => setTimeout(resolve, 1000)); // 等待 DOM 加载完毕

    let pathname = window.location.pathname;

    switch (pathname) {
        case "/canahartaLogin" :{ // Page 3 Page 4
            canahartaLogin();
            break;
        }
        
        case "/idcardUpload" :{ // Page 5
            idcardUpload();
            break;
        }
        
        case "/launderingBack" :{ // Page 6
            await launderingBack();
            break;
        }
        
        case "/addInfo" :{ // Page 7
            await addInfo();
            break;
        }
        
        // case "" :{
        //     break;
        // }
        
        // case "" :{
        //     break;
        // }
        
        // case "" :{
        //     break;
        // }

        default:
            break;
    }
    
    return;
}


/* pages */
// Page 3 Page 4 此处填入身份证号为了方便测试测试，实际不需要填入身份证号
function canahartaLogin() {
    const element = document.querySelector(
        'input.van-field__control[placeholder="请输入身份证"][maxlength="18"]'
    );

    if (!element) return;

    element.value = "110101199003071233";
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
}


// Page 5 上传身份证图片 用户自己操作
function idcardUpload() {
    
    return;
}


// Page 6 基本信息资料问卷
async function launderingBack() {

    // 1-6、8：单选题。字母按 HTML value 匹配，数字按选项序号（从 1 开始）匹配。
    selectSingleCheckbox("税收居民身份", data["p6-launderingBack"]["6-1"]);
    selectSingleCheckbox("政要人物关系", data["p6-launderingBack"]["6-2"]);
    selectSingleCheckbox("投资期限", data["p6-launderingBack"]["6-3"]);
    selectSingleCheckbox("期望收益", data["p6-launderingBack"]["6-4"]);
    selectSingleCheckbox("账户是否存在被他人控制", data["p6-launderingBack"]["6-5"]);
    selectSingleCheckbox("账户交易实际受益人为", data["p6-launderingBack"]["6-6"]);
    selectSingleCheckbox("是否有来源以下机构不良诚信记录", data["p6-launderingBack"]["6-8"]);

    // 7、9：多选题。数组中的数字为选项序号（从 1 开始）。
    await selectMultipleVantCheckboxes("想投资的品种", data["p6-launderingBack"]["6-7"]);
    await selectMultipleVantCheckboxes("参与期货的主要交易类型", data["p6-launderingBack"]["6-10"]);

    return;
}


// Page 7 基本信息资料填写
async function addInfo() {
    const form = data["p7-addInfo"];

    fillTextField({ label: "姓名", value: form.name });
    fillTextField({ label: "身份证号", value: form.idCardNumber });
    fillTextField({ label: "身份证地址", value: form.idCardAddress });
    fillTextField({ label: "联系地址", value: form.contactAddress });
    fillTextField({ label: "邮政编码", value: form.postalCode });
    fillTextField({ label: "联系电话", value: form.contactnumber });
    fillTextField({ label: "电子邮箱", value: form.emailAddress });

    await fillVantCheckboxField({ value: form.ifIdCardPermanentlyValid });
    await fillDateField({ modelKey: "startTime", value: form.idCardValidPeriodStart });
    if (!form.ifIdCardPermanentlyValid) {
        await fillDateField({ modelKey: "endTime", value: form.idCardValidPeriodEnd });
    }

    const cityReady = await fillPopupPickerField({
        modelKey: "sheng",
        value: form.contactAddressProvince?.value,
        onChange: "provinceChange",
        waitOptionsKey: "cityListSelect",
        waitForValue: form.contactAddressCity?.value,
    });
    if (cityReady) {
        await fillPopupPickerField({ modelKey: "shi", value: form.contactAddressCity?.value });
    }

    const branchCityReady = await fillPopupPickerField({
        modelKey: "buss1",
        value: form.departmentProvince,
        onChange: "buss1Change",
        changeFlagKey: "buss1Flag",
        waitOptionsKey: "buss2ListSelect",
        waitForValue: form.departmentCity,
    });
    if (branchCityReady) {
        const branchCategoryReady = await fillPopupPickerField({
            modelKey: "buss2",
            value: form.departmentCity,
            onChange: "buss2Change",
            changeFlagKey: "buss2Flag",
            waitOptionsKey: "buss3ListSelect",
            waitForValue: form.departmentCategory,
        });

        if (branchCategoryReady) {
            const branchReady = await fillPopupPickerField({
                modelKey: "buss3",
                value: form.departmentCategory,
                onChange: "buss3Change",
                changeFlagKey: "buss3Flag",
                waitOptionsKey: "buss4ListSelect",
                waitForValue: form.departmentName,
            });

            if (branchReady) {
                await fillPopupPickerField({ modelKey: "buss4", value: form.departmentName });
            }
        }
    }
    await fillPopupPickerField({ modelKey: "profession", value: form.occupation?.value });
    await fillPopupPickerField({ modelKey: "educational", value: form.educationalQualification?.value });

    await fillVantRadioField({ value: form.ifIntermediary });
    fillTextField({ label: "居间人姓名", value: form.intermediaryName });
    fillTextField({ label: "居间人登记编号", value: form.intermediaryCode });
    fillTextField({ label: "推荐人代码", value: form.referencePersonCode });
    fillTextField({ label: "推荐人名称", value: form.referencePersonName });
}
