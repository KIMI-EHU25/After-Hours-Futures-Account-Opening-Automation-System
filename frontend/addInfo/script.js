import { requestJson, setStatus } from "../utils/api.js";

import { initAccountBar } from "../utils/auth.js";

initAccountBar();

const form = document.querySelector("#dynamic-form");
const formContent = document.querySelector("#form-content");
const statusElement = document.querySelector("#status");
const submitButton = document.querySelector("#next-button");

let provinceCodes = [];
let cityCodes = [];
let occupationCodes = [];
let educationalQualificationCodes = [];

const optionalFields = new Set([
    "p4",
    "p5",
    "p16",
    "p20",
    "p21",
    "p22",
    "p23",
]);


const fixedSelectOptions = {
    p11: {
        label: "湖北省",
        value: "湖北省",
    },
    p12: {
        label: "武汉市",
        value: "武汉市",
    },
    p13: {
        label: "期货公司营业部",
        value: "0",
    },
    p14: {
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

    if (fieldName === "p7") {
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

    if (fieldName === "p17") {
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
    const citySelect = form.elements.namedItem("p8");
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
    const provinceSelect = form.elements.namedItem("p7");
    provinceSelect.addEventListener("change", () => {
        updateCitySelect(provinceSelect.value);
    });
}

function setupIdCardValidityFields() {
    const permanentlyValidSelect = form.elements.namedItem(
        "p6",
    );
    const startDateInput = form.elements.namedItem("p4");
    const endDateInput = form.elements.namedItem("p5");

    const updateDateInputs = () => {
        const isPermanentlyValid = permanentlyValidSelect.value === "true";

        if (isPermanentlyValid) {
            startDateInput.value = "";
            endDateInput.value = "";
        }

        startDateInput.required = !isPermanentlyValid;
        endDateInput.required = !isPermanentlyValid;
        startDateInput.disabled = isPermanentlyValid;
        endDateInput.disabled = isPermanentlyValid;
    };

    permanentlyValidSelect.addEventListener("change", updateDateInputs);
    updateDateInputs();
}

function setupIntermediaryFields() {
    const intermediarySelect = form.elements.namedItem("p19");
    const intermediaryNameInput = form.elements.namedItem("p20");
    const intermediaryCodeInput = form.elements.namedItem("p21");

    const updateIntermediaryInputs = () => {
        const hasNoIntermediary = intermediarySelect.value === "false";

        if (hasNoIntermediary) {
            intermediaryNameInput.value = "";
            intermediaryCodeInput.value = "";
        }

        intermediaryNameInput.required = intermediarySelect.value === "true";
        intermediaryCodeInput.required = intermediarySelect.value === "true";
        intermediaryNameInput.disabled = hasNoIntermediary;
        intermediaryCodeInput.disabled = hasNoIntermediary;
    };

    intermediarySelect.addEventListener("change", updateIntermediaryInputs);
    updateIntermediaryInputs();
}

function createInput(field) {
    const key = `p${field.field_id}`;
    if (fixedSelectOptions[key]) {
        return createFixedSelect(key);
    }

    if (
        key === "p7"
        || key === "p8"
    ) {
        return createAddressSelect(key);
    }

    if (
        key === "p17"
        || key === "p18"
    ) {
        return createCodeSelect(key);
    }

    if (field.type === "bool") {
        const select = document.createElement("select");
        select.name = key;
        select.required = true;
        select.dataset.valueType = "boolean";

        select.add(createPlaceholder("请选择"));
        select.add(new Option("是", "true"));
        select.add(new Option("否", "false"));
        return select;
    }

    const input = document.createElement("input");
    input.name = key;
    input.type = field.type === "date"
        ? "date"
        : key === "p16" ? "email" : "text";
    input.required = !optionalFields.has(key);
    if (key === "p2") { input.pattern = "[1-9][0-9]{16}[0-9Xx]"; input.maxLength = 18; }
    if (key === "p10") { input.pattern = "[0-9]{6}"; input.inputMode = "numeric"; }
    if (key === "p15") { input.type = "tel"; input.pattern = "1[3-9][0-9]{9}"; }
    input.autocomplete = "off";
    return input;
}

function createField(field) {
    const key = `p${field.field_id}`;
    const wrapper = document.createElement("div");
    wrapper.className = "field-item";

    const label = document.createElement("label");
    label.htmlFor = `field-${field.field_id}`;
    label.textContent = field.field_name;

    if (optionalFields.has(key)) {
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
    const body = {};

    for (const element of form.elements) {
        if (!element.name) {
            continue;
        }

        const value = formData.get(element.name);
        if (element.dataset.valueType === "boolean") {
            body[element.name] = value === "true";
        } else if (optionalFields.has(element.name) && (value === "" || value === null)) {
            body[element.name] = null;
        } else {
            body[element.name] = typeof value === "string" ? value.trim() : value;
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
        setupIdCardValidityFields();
        setupIntermediaryFields();
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
            authenticated: true,
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
