const bids = require('../models/bid.server.models');
const items = require('../models/item.server.models');
const users = require('../models/user.server.models');
const questions = require('../models/question.server.models');
const Joi = require("joi");

const get_question_item = (req, res) => {
    const item_id = (req.params.item_id);

    items.get_item_by_id(item_id, (err, item) => { // checks seperately if there is an item, so that later an empty list can be returned 
        if (err) return res.sendStatus(500);
        if (!item) {
            return res.status(404).send({ error_message: "Invalid item" });
        }

        questions.get_questions_for_item(item_id, (err, questions) => {
            if (err) return res.sendStatus(500);

            return res.status(200).json(questions);
        });
    });
}

const question_item = (req, res) => {
    const item_id = (req.params.item_id);
    const schema = Joi.object({
        question_text: Joi.string().required()
    });
    
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).send({ error_message: error.details[0].message });

    let question = { ...req.body };

    const token = req.header("X-Authorization");
    if (!token) return res.sendStatus(401);

    users.getIdFromToken(token, (err, user_id) => { //gets the user's ID
        if (err || !user_id) return res.sendStatus(401);

        items.get_item_by_id(item_id, (err, item) => { //retrieves the item details 
            if (err || !item) return res.sendStatus(404);

            if (item.creator_id === user_id) {
                return res.status(403).send({ error_message: "You cannot ask a question on your own item" });
            }
            
            questions.create_new_question(question, user_id, item_id, (err, question_id) => { //enters bid for item
                if (err) return res.sendStatus(500);
                return res.status(200).send({ question_id });
            });
        });
    });
}

const question_answer_item = (req, res) => {
    const question_id = req.params.question_id;

    const schema = Joi.object({
        answer_text: Joi.string().required()
    }).unknown(false);

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).send({ error_message: error.details[0].message });
    }

    const token = req.header("X-Authorization");
    if (!token) return res.sendStatus(401);

    users.getIdFromToken(token, (err, user_id) => {
        if (err || !user_id) return res.sendStatus(401);

        questions.get_question_with_item_owner(question_id, (err, question) => {
            if (err) return res.sendStatus(500);
            if (!question) return res.sendStatus(404); // ✅ REQUIRED BY TEST

            if (question.creator_id !== user_id) {
                return res.status(403).send({
                    error_message: "Only the seller can answer questions on their items"
                });
            }

            if (question.answer !== null) {
                return res.status(400).send({
                    error_message: "Question already answered"
                });
            }

            questions.answer_question_if_owner(
                req.body.answer_text,
                question_id,
                user_id,
                (err, success) => {
                    if (err) return res.sendStatus(500);
                    return res.sendStatus(200);
                }
            );
        });
    });
};



module.exports = {
    get_question_item: get_question_item,
    question_item: question_item,
    question_answer_item: question_answer_item
}