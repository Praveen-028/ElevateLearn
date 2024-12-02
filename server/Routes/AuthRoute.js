const { Signup, Login, userextract, logout, userProfile, updateUserProfile } = require("../Controllers/AuthController");
const { userVerification } = require("../Middlewares/AuthMiddleware");
const router = require("express").Router();
const {
    storeQuizResults,
    getUserStatistics,
    getQuizStatistics,
    compareQuizResultsBySubject,
    compareRecentQuizzesBySubject,
    getQuizComparison,
    addQuestion,
    uploadQuestions,
    getQuizResults
} = require("../Controllers/QuizController");
const { getSubjects, getQuizResult,getQuestionsBySubject,storeFeedback,newQuizresultsave,getMaterialByTopic } = require("../Controllers/SubQuesController");

router.post("/signup", Signup);
router.post("/login", Login);
router.post('/', userVerification);
router.get('/userextract', userextract);
router.post("/logout", logout);
router.get('/userprofile', userProfile);
router.patch('/updateuserprofile', updateUserProfile);
router.post("/storequiz", storeQuizResults);
router.get("/userstatistics", getUserStatistics);
router.get("/quizstatistics", getQuizStatistics);
router.get("/compareQuizResultsBySubject", compareQuizResultsBySubject);
router.get("/compareRecentQuizzes", compareRecentQuizzesBySubject);
router.get("/getQuizComparison", getQuizComparison);
router.get("/getSubjects", getSubjects);
router.get("/quizresults",getQuizResults)
router.get("/getQuizResultts",newQuizresultsave)
router.get("/quizresult", getQuizResult);
router.get("/questions",getQuestionsBySubject);
router.post("/feedback",storeFeedback);
router.post("/question", addQuestion);
router.post("/upload-questions",uploadQuestions);
router.get("/getMaterial", getMaterialByTopic);


module.exports = router;
