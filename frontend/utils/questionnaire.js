import { requestJson, setStatus } from "./api.js";

function normalizeTitle(title) {
    return title.replace(/<br\s*\/?>/gi, "\n");
}

function createQuestion(question) {
    const fieldset = document.createElement("fieldset");
    fieldset.className = "question-card";
    fieldset.dataset.questionCode = String(question.question_code);

    const legend = document.createElement("legend");
    legend.className = "question-title";
    legend.textContent = `${question.question_code}. ${normalizeTitle(question.title)}`;
    fieldset.appendChild(legend);

    const optionList = document.createElement("div");
    optionList.className = "option-list";

    question.options.forEach((option, index) => {
        const optionLabel = document.createElement("label");
        optionLabel.className = "option-item";

        const input = document.createElement("input");
        input.type = question.type === "multiple-choice" ? "checkbox" : "radio";
        input.name = `p${question.question_code}`;
        input.value = option.option;

        if (question.type !== "multiple-choice" && index === 0) {
            input.required = true;
        }

        const text = document.createElement("span");
        text.textContent = `${option.option}. ${option.optiontext}`;

        optionLabel.append(input, text);
        optionList.appendChild(optionLabel);
    });

    fieldset.appendChild(optionList);
    return fieldset;
}

function collectAnswers(formContent) {
    const answers = { uid: 1 };
    const questions = formContent.querySelectorAll(".question-card");

    for (const question of questions) {
        const code = question.dataset.questionCode;
        const checked = [...question.querySelectorAll("input:checked")];

        if (checked.length === 0) {
            question.scrollIntoView({ behavior: "smooth", block: "center" });
            throw new Error(`请完成第 ${code} 题`);
        }

        answers[`p${code}`] = checked.map((input) => input.value).join("");
    }

    return answers;
}

export function initQuestionnairePage({ configPath, answerPath, nextPage }) {
    const form = document.querySelector("#dynamic-form");
    const formContent = document.querySelector("#form-content");
    const statusElement = document.querySelector("#status");
    const submitButton = document.querySelector("#next-button");

    async function loadConfig() {
        try {
            const questions = await requestJson(configPath);
            formContent.replaceChildren(...questions.map(createQuestion));
            formContent.classList.remove("loading");
            submitButton.hidden = false;
            setStatus(statusElement, "");
        } catch (error) {
            formContent.innerHTML = '<p class="loading">题目加载失败，请确认后端服务已经启动。</p>';
            setStatus(statusElement, error.message, "error");
        }
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        let body;
        try {
            body = collectAnswers(formContent);
        } catch (error) {
            setStatus(statusElement, error.message, "error");
            return;
        }

        submitButton.disabled = true;
        setStatus(statusElement, "正在提交，请稍候……");

        try {
            await requestJson(answerPath, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            setStatus(statusElement, "提交成功，正在进入下一页……", "success");
            window.location.href = nextPage;
        } catch (error) {
            setStatus(statusElement, error.message, "error");
            submitButton.disabled = false;
        }
    });

    loadConfig();
}
