import { initQuestionnairePage } from "../utils/questionnaire.js";

initQuestionnairePage({
    configPath: "/api/question/config",
    answerPath: "/api/question/answer",
    nextPage: "../chooseFutures/index.html",
});
