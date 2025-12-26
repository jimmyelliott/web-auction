const questions = require("../controllers/question.server.controllers")
const auth = require("../lib/authentication")

module.exports = function(app){

    app.route("/item/:item_id/question")
    .get(questions.get_question_item);

    app.route("/item/:item_id/question")
    .post(auth.isAuthenticated, questions.question_item);

    app.route("/item/:item_id")
    .post(auth.isAuthenticated, questions.question_answer_item);
}