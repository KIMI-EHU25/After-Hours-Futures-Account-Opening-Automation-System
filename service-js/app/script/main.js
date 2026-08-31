let lastUrl = "";

function runYourLogic() {
    if (location.href === lastUrl) return;
    lastUrl = location.href;

    console.log("执行页面逻辑：", location.href);

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

let data = {
    "p6-launderingBack" : {
        "6-1" : "A",    // 居民税收身份
        "6-2" : "D",    // 政要人物关系 !注意最后两个选项的 E 和 D 的 value 反过来了
        "6-3" : "C",    // 投资期限
        "6-4" : "C",    // 期望收益
        "6-5" : "A",    // 账户是否存在被他人控制
        "6-6" : "A",    // 账户交易实际受益人为
        "6-7" : [       // 想投资的品种
            1,
            2,
            3
        ],
        "6-8" : "I",    // 是否有来源以下机构不良诚信记录
        "6-10" : [      // 参与期货的主要交易类型
            1,
            2,
            3
        ]
    }
};

async function main_func() {
    let pathname = window.location.pathname;
    window.alert(`current pathname : ${pathname}`);

    await distinguish();

    return;
}

async function distinguish() {

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
        
        case "" :{
            break;
        }
        
        case "" :{
            break;
        }
        
        case "" :{
            break;
        }
        
        case "" :{
            break;
        }

        default:
            break;
    }
    
    return;
}

function canahartaLogin() {
    const element = document.querySelector(
        'input.van-field__control[placeholder="请输入身份证"][maxlength="18"]'
    );

    if (!element) return;

    element.value = "110101199003071233";
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
}

function idcardUpload() {
    // 上传身份证图片 用户自己操作
    return;
}

async function launderingBack() {
    // 填写基本资料表单

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
            console.warn("未找到目标选项：", questionText, selectedValue);
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
            console.warn("未找到多选题：", questionText);
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
                    console.warn("未找到多选项点击节点：", questionText, index + 1);
                    return;
                }

                toggle.click();

                // Vant 通过 Vue 的 v-model 异步写回父组件；等待后再处理下一项，
                // 避免下一次点击基于旧数组覆盖本次选择。
                await new Promise((resolve) => setTimeout(resolve, 0));
            }
        }
    }

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
