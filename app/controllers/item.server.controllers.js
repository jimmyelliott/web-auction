const items = require('../models/item.server.models');
const users = require('../models/user.server.models');
const Joi = require("joi");

const search = (req, res) => {
    return res.sendStatus(500);
}

const create_item = (req, res) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        description: Joi.string().required(),
        starting_bid: Joi.number().min(0).required(),
        end_date: Joi.number().min(1800000000000).required()
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).send({ error_message: error.details[0].message });

    const item = { ...req.body };
    const token = req.header("X-Authorization");
    if (!token) return res.sendStatus(401);

    users.getIdFromToken(token, (err, user_id) => {
        if (err || !user_id) return res.sendStatus(401);

        items.create_new_item(item, user_id, (err, item_id) => {
            if (err) return res.status(400).send({ error_message: "Invalid item" });

            return res.status(201).json({ item_id: item_id });
        });
    });
};


const get_item = (req, res) => {
    const item_id = req.params.item_id;

    items.get_item_by_id(item_id, (err, item) => {
        if (err || !item) {
            return res.status(404).send({ error_message: "Invalid item" });
        }

        return res.status(200).json(item);
    });
};


module.exports = {
    search: search,
    create_item: create_item,
    get_item: get_item,
}