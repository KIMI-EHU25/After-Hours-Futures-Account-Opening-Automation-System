import { initQuestionnairePage } from "../utils/questionnaire.js";

initQuestionnairePage({
    configPath: "/api/launderingBack/config",
    answerPath: "/api/launderingBack/answer",
    nextPage: "../addInfo/index.html",
});
