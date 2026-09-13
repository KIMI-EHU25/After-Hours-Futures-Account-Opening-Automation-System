import { initQuestionnairePage } from "../utils/questionnaire.js";

initQuestionnairePage({
    configPath: "/api/chooseFutures/config",
    answerPath: "/api/chooseFutures/answer",
    nextPage: "../dataprint/index.html",
});
