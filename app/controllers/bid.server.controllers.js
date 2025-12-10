const bids = require('../models/bid.server.models');
const users = require('../models/user.server.models');
const Joi = require("joi");

const bid_item = (req, res) => {
    const schema = Joi.object({
        amount: Joi.number().min(0).required()
    });

    const { error } = schema.validate(req.body);
    if(error) return res.status(400).send({error_message: error.details[0].message});

    const token = req.header("X-Authorization");
    if (!token) return res.sendStatus(401);

    users.getIdFromToken(token, (err, id) => {
        if (err || !id) return res.sendStatus(401);

        req.user_id = id;

        bids.new_bid(id, req.body.amount, (err) => {
            if (err) return res.status(401).send({error_message: "Invalid item"});

            return res.status(201).json({ item_id: id });
        });
    });
}

const get_bid_history = (req, res) => {
    return res.sendStatus(500);
}

const get_question_item = (req, res) => {
    return res.sendStatus(500);
}

const question_item = (req, res) => {
    return res.sendStatus(500);
}

const question_answer_item = (req, res) => {
    return res.sendStatus(500);
}

module.exports = {
    bid_item: bid_item,
    get_bid_history: get_bid_history,
    get_question_item: get_question_item,
    question_item: question_item,
    question_answer_item: question_answer_item
}