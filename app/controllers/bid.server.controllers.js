const bids = require('../models/bid.server.models');
const items = require('../models/item.server.models');
const users = require('../models/user.server.models');
const Joi = require("joi");

const bid_item = (req, res) => {
    const item_id = (req.params.item_id);
    const schema = Joi.object({
        amount: Joi.number().min(0).required()
    });
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).send({ error_message: error.details[0].message });

    const token = req.header("X-Authorization");
    if (!token) return res.sendStatus(401);

    users.getIdFromToken(token, (err, user_id) => { //gets the user's ID
        if (err || !user_id) return res.sendStatus(401);

        items.get_item_by_id(item_id, (err, item) => { //Validate's bid against original listing 
            if (err || !item) return res.sendStatus(404);

            if (item.creator_id === user_id) {
                return res.status(403).send({ error_message: "Cannot bid on your own item" });
            }

            if (item.starting_bid >= req.body.amount) {
                return res.status(400).send({ error_message: `bid must be higher than ${item.starting_bid}`});
            }
            bids.get_highest_bid(item_id, (err, highest) => {
                if (err) return res.sendStatus(500);

                // If no previous bids, allow as long as it's above starting_bid
                if (highest !== null && req.body.amount <= highest) {
                    return res.status(400).send({
                        error_message: `bid must be higher than ${highest}`
                    });
                }

                console.log(user_id, item_id, req.body.amount)
                
                bids.new_bid(user_id, item_id, req.body.amount, (err, bid_id) => { //enters bid for item
                    if (err) return res.status(400).send({ error_message: "Invalid bid" });

                    return res.status(201).json({ bid_id: bid_id });
                });
            });
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