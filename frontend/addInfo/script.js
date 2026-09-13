import { requestJson, setStatus } from "../utils/api.js";

const form = document.querySelector("#dynamic-form");
const formContent = document.querySelector("#form-content");
const statusElement = document.querySelector("#status");
const submitButton = document.querySelector("#next-button");

let provinceCodes = [];
let cityCodes = [];
let occupationCodes = [];
let educationalQualificationCodes = [];

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

const fixedSelectOptions = {
    departmentProvince: {
        label: "湖北省",
        value: "湖北省",
    },
    departmentCity: {
        label: "武汉市",
        value: "武汉市",
    },
    departmentCategory: {
        label: "期货公司营业部",
        value: "0",
    },
    departmentName: {
        label: "总部",
        value: "2015",
    },
};

function createPlaceholder(text) {
    const placeholder = new Option(text, "");
    placeholder.disabled = true;
    placeholder.selected = true;
    return placeholder;
}

function createAddressSelect(fieldName) {
    const select = document.createElement("select");
    select.name = fieldName;
    select.required = true;

    if (fieldName === "contactAddressProvince") {
        select.add(createPlaceholder("请选择省份"));
        provinceCodes.forEach((province) => {
            select.add(new Option(province.name, province.province_code));
        });
    } else {
        select.add(createPlaceholder("请先选择省份"));
        select.disabled = true;
    }

    return select;
}

function createCodeSelect(fieldName) {
    const select = document.createElement("select");
    select.name = fieldName;
    select.required = true;

    if (fieldName === "occupation") {
        select.add(createPlaceholder("请选择职业"));
        occupationCodes.forEach((occupation) => {
            select.add(new Option(occupation.name, occupation.occupation_code));
        });
    } else {
        select.add(createPlaceholder("请选择学历"));
        educationalQualificationCodes.forEach((education) => {
            select.add(new Option(
                education.name,
                education.educationalqualification_code,
            ));
        });
    }

    return select;
}

function createFixedSelect(fieldName) {
    const select = document.createElement("select");
    const option = fixedSelectOptions[fieldName];

    select.name = fieldName;
    select.required = true;
    select.add(new Option(option.label, option.value, true, true));

    return select;
}

function updateCitySelect(provinceCode) {
    const citySelect = form.elements.namedItem("contactAddressCity");
    citySelect.replaceChildren(createPlaceholder("请选择城市"));

    const matchedCities = cityCodes.filter(
        (city) => city.province_code === provinceCode,
    );

    matchedCities.forEach((city) => {
        citySelect.add(new Option(city.name, city.city_code));
    });
    citySelect.disabled = matchedCities.length === 0;
}

function setupAddressSelectors() {
    const provinceSelect = form.elements.namedItem("contactAddressProvince");
    provinceSelect.addEventListener("change", () => {
        updateCitySelect(provinceSelect.value);
    });
}

function createInput(field) {
    if (fixedSelectOptions[field.field_name]) {
        return createFixedSelect(field.field_name);
    }

    if (
        field.field_name === "contactAddressProvince"
        || field.field_name === "contactAddressCity"
    ) {
        return createAddressSelect(field.field_name);
    }

    if (
        field.field_name === "occupation"
        || field.field_name === "educationalQualification"
    ) {
        return createCodeSelect(field.field_name);
    }

    if (field.type === "bool") {
        const select = document.createElement("select");
        select.name = field.field_name;
        select.required = true;
        select.dataset.valueType = "boolean";

        select.add(createPlaceholder("请选择"));
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
        if (element.dataset.valueType === "boolean") {
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
        [
            provinceCodes,
            cityCodes,
            occupationCodes,
            educationalQualificationCodes,
        ] = await Promise.all([
            requestJson("/api/code/province"),
            requestJson("/api/code/city"),
            requestJson("/api/code/occupation"),
            requestJson("/api/code/educationalqualification"),
        ]);

        provinceCodes.sort((left, right) => (
            left.province_code.localeCompare(right.province_code)
        ));
        cityCodes.sort((left, right) => (
            left.city_code.localeCompare(right.city_code)
        ));
        occupationCodes.sort((left, right) => (
            left.occupation_code.localeCompare(right.occupation_code)
        ));
        educationalQualificationCodes.sort((left, right) => (
            left.educationalqualification_code.localeCompare(
                right.educationalqualification_code,
            )
        ));

        const fields = await requestJson("/api/addInfo/config");
        formContent.replaceChildren(...fields.map(createField));
        setupAddressSelectors();
        formContent.classList.remove("loading");
        submitButton.hidden = false;
        setStatus(statusElement, "");
    } catch (error) {
        formContent.innerHTML = '<p class="loading">字段或代码列表加载失败，请确认后端服务已经启动。</p>';
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
        window.location.href = "../question/index.html";
    } catch (error) {
        setStatus(statusElement, error.message, "error");
        submitButton.disabled = false;
    }
});

loadConfig();
