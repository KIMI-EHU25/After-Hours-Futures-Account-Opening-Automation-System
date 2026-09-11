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
// 单选题使用一个选项字母，多选题使用连续的选项字母字符串，例如 "ABC"
const data = {
    "launderingBack" : {
        "p1" : "A",    // 居民税收身份

        "p2" : "D",    // 政要人物关系
                        // !注意最后两个选项的 E 和 D 的 value 反过来了
                        // value="E" 为倒数第二个选项 value="D" 为最后一个选项

        "p3" : "C",    // 投资期限
        "p4" : "A",    // 期望收益
        "p5" : "A",    // 账户是否存在被他人控制
        "p6" : "A",    // 账户交易实际受益人为
        "p7" : "AB",       // 想投资的品种
        "p8" : "I",    // 是否有来源以下机构不良诚信记录
        "p9" : "AB"      // 参与期货的主要交易类型
    },

    "addInfo" : {
        "name" : "张三",                                      // 姓名 
        "idCardNumber" : "110101199003071233",                 // 身份证号
        "idCardAddress" : "北京市东城区示例路1号101室",    // 身份证地址
        "idCardValidPeriodStart" : "2026-02-04",                 // 身份证有效期起始
        "idCardValidPeriodEnd" : "2036-02-04",                   // 身份证有效期结束
        "ifIdCardPermanentlyValid" : false,                     // 身份证是否长期有效
        "contactAddressProvince" : "156110000",
        "contactAddressCity" : "156110101",
        "contactAddress" : "北京市东城区示例路1号101室",     // 联系地址
        "postalCode" : "200000",                               // 邮政编码
        "departmentProvince" : "湖北省",                        // 开户营业部省
        "departmentCity" : "武汉市",                            // 开户营业部市
        "departmentCategory" : "0",                            // 营业部类别
        "departmentName" : "2015",                             // 开户营业部
        "contactnumber" : "13900000000",                       // 联系电话
        "emailAddress" : null,                                 // 电子邮箱
        "occupation" : "537",
        "educationalQualification" : "3",
        "ifIntermediary" : false,                              // 是否存在居间人
        "intermediaryName" : null,                             // 居间人姓名
        "intermediaryCode" : null,                             // 居间人登记编号
        "referencePersonCode" : null,                          // 推荐人代码
        "referencePersonName" : null,                          // 推荐人姓名
    },

    "question" : {
        "p1" : "A",   // 是否具有民事行为能力
        "p2" : "A",   // 主要收入来源
        "p3" : "A",   // 计划用于金融投资的主要资金来源
        "p4" : "B",   // 年平均收入
        "p5" : "C",   // 金融资产情况
        "p6" : "A",   // 是否有尚未清偿的数额较大的债务
        "p7" : "A",   // 投资回报主要用于
        "p8" : "B",   // 关于专业背景、教育经历、投资知识等描述
        "p9" : "B",   // 主要依据什么作出金融投资决策
        "p10" : "B",  // 投资经历
        "p11" : "C",  // 交易频率
        "p12" : "B",  // 投资资产分配
        "p13" : "A",  // 可承受的最大损失
        "p14" : "C",  // 账户亏损约为
    },

    "chooseFutures" : {
        "p1" : "AC"
    }
};


/* utils */
// Page 6 单选题内容注入
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
        window.alert(`未找到目标选项：${questionText}，选项值：${selectedValue}`);
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


// 将多选题字母字符串转换为从 1 开始的选项序号，例如 "AC" 转换为 [1, 3]。
function parseMultipleOptionLetters(selectedLetters, context) {
    if (typeof selectedLetters !== "string") {
        window.alert(`多选题数据必须是字母字符串：${context}`);
        return null;
    }

    const normalizedLetters = selectedLetters.trim().toUpperCase();
    if (!/^[A-Z]+$/.test(normalizedLetters)) {
        window.alert(`多选题数据格式错误：${context}，选项值：${selectedLetters}`);
        return null;
    }

    return Array.from(new Set(normalizedLetters)).map(
        (letter) => letter.charCodeAt(0) - "A".charCodeAt(0) + 1
    );
}


// Page 6 多选题内容注入
async function selectMultipleVantCheckboxes(questionText, selectedLetters) {
    const question = Array.from(document.querySelectorAll("p.monicker")).find(
        (element) => element.textContent.includes(questionText)
    );
    const getOptions = () => Array.from(
        question?.nextElementSibling?.querySelectorAll(".van-checkbox") ?? []
    );
    const optionCount = getOptions().length;

    if (optionCount === 0) {
        window.alert(`未找到多选题：${questionText}`);
        return;
    }

    const selectedIndexes = parseMultipleOptionLetters(selectedLetters, questionText);
    if (!selectedIndexes) return;

    if (selectedIndexes.some((index) => index > optionCount)) {
        window.alert(`多选题包含不存在的选项：${questionText}，选项值：${selectedLetters}`);
        return;
    }

    const selected = new Set(selectedIndexes);

    for (let index = 0; index < optionCount; index += 1) {
        // 每次都重新取 DOM，避免 Vue 重渲染后继续使用旧状态。
        const option = getOptions()[index];
        const shouldBeSelected = selected.has(index + 1);
        const isSelected = option.querySelector(".van-checkbox__icon--checked") !== null;

        if (shouldBeSelected !== isSelected) {
            const toggle = option.querySelector(
                ".van-checkbox__icon, .van-checkbox__label"
            );

            if (!toggle) {
                window.alert(`未找到多选项点击节点：${questionText}，选项序号：${index + 1}`);
                return;
            }

            toggle.click();

            // Vant 通过 Vue 的 v-model 异步写回父组件；等待后再处理下一项，
            // 避免下一次点击基于旧数组覆盖本次选择。
            await new Promise((resolve) => setTimeout(resolve, 0));
        }
    }
}


// Page 7 判断当前字段是否为 null 或 undefined 以确定是否跳过
function hasInjectionValue(value) {
    return value !== null && value !== undefined && value !== "";
}


// Page 7 获取 vue 页面实例
function getAddInfoViewModel() {
    const viewModel = document.querySelector("#addInfo")?.__vue__;

    if (!viewModel?.ruleForm3) {
        window.alert("未找到 addInfo 的 Vue 页面实例");
        return null;
    }

    return viewModel;
}


// Page 7 等待页面更新
function nextVueTick(viewModel) {
    return new Promise((resolve) => {
        if (typeof viewModel?.$nextTick === "function") {
            viewModel.$nextTick(resolve);
            return;
        }

        setTimeout(resolve, 0);
    });
}


// Page 7 单个普通文本字段注入：按页面标签定位 input 或 textarea。
function fillTextField({ label, value }) {
    if (!hasInjectionValue(value)) return;

    const field = Array.from(document.querySelectorAll(".van-cell")).find((element) =>
        element.querySelector(".van-cell__title span")?.textContent.trim() === label
    );
    const control = field?.querySelector("input.van-field__control, textarea.van-field__control");

    if (!control) {
        window.alert(`未找到文本字段：${label}`);
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


// Page 7 单个日期字段注入：Vux datetime 的数据模型字段使用 YYYY-MM-DD 格式。
async function fillDateField({ modelKey, value }) {
    if (!hasInjectionValue(value)) return;

    const viewModel = getAddInfoViewModel();
    if (!viewModel) return;

    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        window.alert(`日期字段必须使用 YYYY-MM-DD 格式：${modelKey}，当前值：${value}`);
        return;
    }

    viewModel.$set(viewModel.ruleForm3, modelKey, value);
    await nextVueTick(viewModel);
}


// Page 7 等待关联 picker 的选项列表中出现目标 value。
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

    window.alert(`关联 picker 未加载目标选项：${optionsKey}，目标值：${expectedValue}`);
    return false;
}


// Page 7 单个 Vux popup picker 注入；value 会转换为 picker 所需的一项数组。
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


// Page 7 单个 Vant checkbox 注入，用于“身份证长期有效”。
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


// Page 7 单个 Vant radio 注入，用于“是否存在居间人”。
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


// Page 10 等待异步问卷加载完成。
async function waitForPage10RadioGroups(expectedCount, timeout = 8000) {
    const deadline = Date.now() + timeout;

    while (Date.now() < deadline) {
        const groups = document.querySelectorAll(".question .van-radio-group");
        if (groups.length >= expectedCount) {
            return true;
        }

        await new Promise((resolve) => setTimeout(resolve, 50));
    }

    window.alert(`Page 10 单选题加载超时：应有 ${expectedCount} 题`);
    return false;
}


// Page 10 单个 Vant 单选题注入：按题号和选项字母定位并真实点击。
async function selectSingleVantRadio({ questionNumber, selectedValue }) {
    if (!hasInjectionValue(selectedValue)) return true;

    const normalizedValue = String(selectedValue).trim().toUpperCase();
    const group = Array.from(
        document.querySelectorAll(".question .van-radio-group")
    ).find((element) => {
        const title = element.querySelector(".question_title")?.textContent
            .replace(/\s+/g, " ")
            .trim();
        return title?.startsWith(`${questionNumber}.`);
    });

    if (!group) {
        window.alert(`未找到 Page 10 单选题：${questionNumber}`);
        return false;
    }

    const option = Array.from(group.querySelectorAll(".van-radio")).find((element) => {
        const label = element.querySelector(".van-radio__label")?.textContent
            .replace(/\s+/g, " ")
            .trim();
        const optionValue = label?.match(/^([A-Z])\s*[.．、]/i)?.[1].toUpperCase();
        return optionValue === normalizedValue;
    });

    if (!option) {
        window.alert(`未找到 Page 10 单选题选项：${questionNumber}，选项值：${normalizedValue}`);
        return false;
    }

    const control = option.querySelector('input.van-radio__control[type="radio"]');
    if (!control) {
        window.alert(`未找到 Page 10 单选项点击节点：${questionNumber}，选项值：${normalizedValue}`);
        return false;
    }

    if (!control.checked) {
        control.click();
        await new Promise((resolve) => setTimeout(resolve, 0));
    }

    if (!control.checked) {
        window.alert(`Page 10 单选题未成功选中：${questionNumber}，选项值：${normalizedValue}`);
        return false;
    }

    return true;
}


// 等待 Page 12 指定账户类型的选项加载完成。
async function waitForPage12CheckboxOptions({ sectionTitle, minimumCount, timeout = 8000 }) {
    const deadline = Date.now() + timeout;

    while (Date.now() < deadline) {
        const section = Array.from(document.querySelectorAll(".accountListCommon")).find(
            (element) => element.querySelector(".accounlCommon")?.textContent.includes(sectionTitle)
        );
        const optionCount = section?.querySelectorAll(".van-checkbox").length ?? 0;

        if (section && optionCount >= minimumCount) {
            return section;
        }

        await new Promise((resolve) => setTimeout(resolve, 50));
    }

    window.alert(`Page 12 选项加载超时：${sectionTitle}`);
    return null;
}


// Page 12 多选题注入：selectedLetters 使用字母字符串，例如 "ABCD"。
async function selectPage12MultipleVantCheckboxes({ sectionTitle, selectedLetters }) {
    if (!hasInjectionValue(selectedLetters)) return true;

    const selectedIndexes = parseMultipleOptionLetters(selectedLetters, sectionTitle);
    if (!selectedIndexes) return false;

    const selected = new Set(selectedIndexes);
    const minimumCount = selectedIndexes.length > 0
        ? Math.max(...selectedIndexes)
        : 1;
    const section = await waitForPage12CheckboxOptions({ sectionTitle, minimumCount });
    if (!section) return false;

    const getOptions = () => Array.from(section.querySelectorAll(".van-checkbox"));
    const optionCount = getOptions().length;

    for (let index = 0; index < optionCount; index += 1) {
        // 每次重新获取节点，避免 Vant/Vue 更新后继续使用旧 DOM。
        const option = getOptions()[index];
        const icon = option.querySelector(".van-checkbox__icon");
        const label = option.querySelector(".van-checkbox__label");
        const isDisabled = icon?.classList.contains("van-checkbox__icon--disabled")
            || label?.classList.contains("van-checkbox__label--disabled");
        const shouldBeSelected = selected.has(index + 1);
        const isSelected = icon?.classList.contains("van-checkbox__icon--checked") ?? false;

        if (isDisabled) {
            if (shouldBeSelected && !isSelected) {
                window.alert(`Page 12 目标选项不可操作：${sectionTitle}，选项序号：${index + 1}`);
                return false;
            }
            continue;
        }

        if (shouldBeSelected !== isSelected) {
            const toggle = icon ?? label;
            if (!toggle) {
                window.alert(`未找到 Page 12 多选项点击节点：${sectionTitle}，选项序号：${index + 1}`);
                return false;
            }

            toggle.click();
            await new Promise((resolve) => setTimeout(resolve, 0));

            const updatedIcon = getOptions()[index]?.querySelector(".van-checkbox__icon");
            const updatedSelected = updatedIcon?.classList.contains(
                "van-checkbox__icon--checked"
            ) ?? false;
            if (updatedSelected !== shouldBeSelected) {
                window.alert(`Page 12 多选项未成功更新：${sectionTitle}，选项序号：${index + 1}`);
                return false;
            }
        }
    }

    return true;
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
        
        case "/settleBank" :{ // Page 8
            settleBank();
            break;
        }
        
        case "/appropriate" :{ // Page 9
            appropriate();
            break;
        }
        
        case "/question" :{ // Page 10
            await question();
            break;
        }

        case "/echarts" :{ // Page 11
            echarts();
            break;
        }

        case "/chooseFutures" :{ // Page 12
            await chooseFutures();
            break;
        }

        case "/agreement" :{ // Page 13
            agreement();
            break;
        }

        case "/video" :{ // Page 14
            video();
            break;    
        }

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
    selectSingleCheckbox("税收居民身份", data["launderingBack"]["p1"]);
    selectSingleCheckbox("政要人物关系", data["launderingBack"]["p2"]);
    selectSingleCheckbox("投资期限", data["launderingBack"]["p3"]);
    selectSingleCheckbox("期望收益", data["launderingBack"]["p4"]);
    selectSingleCheckbox("账户是否存在被他人控制", data["launderingBack"]["p5"]);
    selectSingleCheckbox("账户交易实际受益人为", data["launderingBack"]["p6"]);
    selectSingleCheckbox("是否有来源以下机构不良诚信记录", data["launderingBack"]["p8"]);

    // 7、9：多选题。数组中的数字为选项序号（从 1 开始）。
    await selectMultipleVantCheckboxes("想投资的品种", data["launderingBack"]["p7"]);
    await selectMultipleVantCheckboxes("参与期货的主要交易类型", data["launderingBack"]["p9"]);

    return;
}


// Page 7 基本信息资料填写
async function addInfo() {
    const form = data["addInfo"];

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
        value: form.contactAddressProvince,
        onChange: "provinceChange",
        waitOptionsKey: "cityListSelect",
        waitForValue: form.contactAddressCity,
    });
    if (cityReady) {
        await fillPopupPickerField({ modelKey: "shi", value: form.contactAddressCity });
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
    await fillPopupPickerField({ modelKey: "profession", value: form.occupation });
    await fillPopupPickerField({ modelKey: "educational", value: form.educationalQualification });

    await fillVantRadioField({ value: form.ifIntermediary });
    fillTextField({ label: "居间人姓名", value: form.intermediaryName });
    fillTextField({ label: "居间人登记编号", value: form.intermediaryCode });
    fillTextField({ label: "推荐人代码", value: form.referencePersonCode });
    fillTextField({ label: "推荐人名称", value: form.referencePersonName });
}


// Page 8 上传银行卡照片 用户自己操作
function settleBank() {

    return;
}


// Page 9 交易者类型选择 用户自己操作
function appropriate() {

    return;
}


// Page 10 交易者风险测评问卷
async function question() {
    const form = data["question"];

    const ready = await waitForPage10RadioGroups(14);
    if (!ready) return;

    if (!await selectSingleVantRadio({ questionNumber: 1, selectedValue: form["p1"] })) return;
    if (!await selectSingleVantRadio({ questionNumber: 2, selectedValue: form["p2"] })) return;
    if (!await selectSingleVantRadio({ questionNumber: 3, selectedValue: form["p3"] })) return;
    if (!await selectSingleVantRadio({ questionNumber: 4, selectedValue: form["p4"] })) return;
    if (!await selectSingleVantRadio({ questionNumber: 5, selectedValue: form["p5"] })) return;
    if (!await selectSingleVantRadio({ questionNumber: 6, selectedValue: form["p6"] })) return;
    if (!await selectSingleVantRadio({ questionNumber: 7, selectedValue: form["p7"] })) return;
    if (!await selectSingleVantRadio({ questionNumber: 8, selectedValue: form["p8"] })) return;
    if (!await selectSingleVantRadio({ questionNumber: 9, selectedValue: form["p9"] })) return;
    if (!await selectSingleVantRadio({ questionNumber: 10, selectedValue: form["p10"] })) return;
    if (!await selectSingleVantRadio({ questionNumber: 11, selectedValue: form["p11"] })) return;
    if (!await selectSingleVantRadio({ questionNumber: 12, selectedValue: form["p12"] })) return;
    if (!await selectSingleVantRadio({ questionNumber: 13, selectedValue: form["p13"] })) return;
    if (!await selectSingleVantRadio({ questionNumber: 14, selectedValue: form["p14"] })) return;

    return;
}


// Page 11 交易者风险测评结果图表 用户自己手动点击
function echarts() {

    return;
}


// Page 12 账户类型选择 选择商品交易所等
async function chooseFutures() {
    const form = data["chooseFutures"];

    await selectPage12MultipleVantCheckboxes({
        sectionTitle: "商品期货",
        selectedLetters: form["p1"],
    });

    return;
}


// Page 13 阅读协议 用户手动点击
function agreement() {

    return;
}


// Page 14 视频验证 业务逻辑结束
function video() {

    return;
}
