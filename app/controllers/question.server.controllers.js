const bids = require('../models/bid.server.models');
const items = require('../models/item.server.models');
const users = require('../models/user.server.models');
const questions = require('../models/question.server.models');
const Joi = require("joi");

const get_question_item = (req, res) => {
    return res.sendStatus(500);
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
    const question_id = (req.params.question_id);
    const schema = Joi.object({
        answer_text: Joi.string().required()
    });
    
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).send({ error_message: error.details[0].message });

    let answer = { ...req.body };

    const token = req.header("X-Authorization");
    if (!token) return res.sendStatus(401);

    users.getIdFromToken(token, (err, user_id) => { //gets the user's ID
        if (err || !user_id) return res.sendStatus(401);

        questions.get_owner_by_item_id(question_id, (err, owner) => { //Validate's bid against original listing 
            if (err || !owner) return res.sendStatus(404);

            if (owner.creator_id != user_id) {
                return res.status(403).send({ error_message: "Only the seller can answer questions on their items" });
            }
            
            questions.create_new_question(question, user_id, item_id, (err, question_id) => { //enters bid for item
                if (err) return res.sendStatus(500);
                return res.status(200).send({ question_id });
            });
        });
    });
}

module.exports = {
    get_question_item: get_question_item,
    question_item: question_item,
    question_answer_item: question_answer_item
}