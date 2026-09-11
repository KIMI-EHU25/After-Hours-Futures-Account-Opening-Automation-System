import { requestJson, setStatus } from "./api.js";

const form = document.querySelector("#dynamic-form");
const formContent = document.querySelector("#form-content");
const statusElement = document.querySelector("#status");
const submitButton = document.querySelector("#next-button");

const optionalFields = new Set([
    "idCardValidPeriodStart",
    "idCardValidPeriodEnd",
    "emailAddress",
    "intermediaryName",
    "intermediaryCode",
    "referencePersonCode",
    "referencePersonName",
]);

const fieldLabels = {
    name: "姓名",
    idCardNumber: "身份证号码",
    idCardAddress: "身份证地址",
    idCardValidPeriodStart: "身份证有效期开始日期",
    idCardValidPeriodEnd: "身份证有效期结束日期",
    ifIdCardPermanentlyValid: "身份证是否长期有效",
    contactAddressProvince: "联系地址省份代码",
    contactAddressCity: "联系地址城市代码",
    contactAddress: "联系地址",
    postalCode: "邮政编码",
    departmentProvince: "营业部省份",
    departmentCity: "营业部城市",
    departmentCategory: "营业部类别代码",
    departmentName: "营业部代码",
    contactnumber: "联系电话",
    emailAddress: "电子邮箱",
    occupation: "职业代码",
    educationalQualification: "学历代码",
    ifIntermediary: "是否为居间人客户",
    intermediaryName: "居间人姓名",
    intermediaryCode: "居间人代码",
    referencePersonCode: "推荐人代码",
    referencePersonName: "推荐人姓名",
};

function createInput(field) {
    if (field.type === "bool") {
        const select = document.createElement("select");
        select.name = field.field_name;
        select.required = true;

        const placeholder = new Option("请选择", "");
        placeholder.disabled = true;
        placeholder.selected = true;
        select.add(placeholder);
        select.add(new Option("是", "true"));
        select.add(new Option("否", "false"));
        return select;
    }

    const input = document.createElement("input");
    input.name = field.field_name;
    input.type = field.type === "date"
        ? "date"
        : field.field_name === "emailAddress" ? "email" : "text";
    input.required = !optionalFields.has(field.field_name);
    input.autocomplete = "off";
    return input;
}

function createField(field) {
    const wrapper = document.createElement("div");
    wrapper.className = "field-item";

    const label = document.createElement("label");
    label.htmlFor = `field-${field.field_id}`;
    label.textContent = fieldLabels[field.field_name] || field.field_name;

    if (optionalFields.has(field.field_name)) {
        const optionalMark = document.createElement("span");
        optionalMark.className = "optional-mark";
        optionalMark.textContent = "（可不填）";
        label.appendChild(optionalMark);
    }

    const input = createInput(field);
    input.id = `field-${field.field_id}`;
    wrapper.append(label, input);
    return wrapper;
}

function collectData() {
    const formData = new FormData(form);
    const body = { uid: 1 };

    for (const element of form.elements) {
        if (!element.name) {
            continue;
        }

        const value = formData.get(element.name);
        if (element.tagName === "SELECT") {
            body[element.name] = value === "true";
        } else if (optionalFields.has(element.name) && value === "") {
            body[element.name] = null;
        } else {
            body[element.name] = value;
        }
    }

    return body;
}

async function loadConfig() {
    try {
        const fields = await requestJson("/api/addInfo/config");
        formContent.replaceChildren(...fields.map(createField));
        formContent.classList.remove("loading");
        submitButton.hidden = false;
        setStatus(statusElement, "");
    } catch (error) {
        formContent.innerHTML = '<p class="loading">字段加载失败，请确认后端服务已经启动。</p>';
        setStatus(statusElement, error.message, "error");
    }
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.reportValidity()) {
        return;
    }

    submitButton.disabled = true;
    setStatus(statusElement, "正在提交，请稍候……");

    try {
        await requestJson("/api/addInfo/answer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(collectData()),
        });
        setStatus(statusElement, "提交成功，正在进入下一页……", "success");
        window.location.href = "./question.html";
    } catch (error) {
        setStatus(statusElement, error.message, "error");
        submitButton.disabled = false;
    }
});

loadConfig();
