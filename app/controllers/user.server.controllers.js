const users = require('../models/user.server.models');
const items = require('../models/item.server.models');
const Joi = require("joi");

const create_account = (req, res) => {
    const schema = Joi.object({
        first_name: Joi.string().required(),
        last_name: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&])[A-Za-z\d@.#$!%*?&]{8,30}/)).required()
    });

    const { error } = schema.validate(req.body);
    if(error) return res.status(400).send({error_message: error.details[0].message});

    let user = { ...req.body };

    users.create_new_account(user, (err, id) => {
        if (err) return res.status(400).send({error_message: "Invalid E-Mail"});

        return res.status(201).json({ user_id: id });
    });

};

const login = (req, res) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().pattern(new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&])[A-Za-z\d@.#$!%*?&]{8,30}/)).required()
    });

    const { error } = schema.validate(req.body);
    if(error) return res.status(400).send({error_message: error.details[0].message});

    users.login_account (req.body.email, req.body.password, (err, id) => {
        if(err === 404) return res.status(400).send("Invalid email/password supplied")
        if (err) return res.sendStatus(500)

        users.getToken(id, (err, token) => {
            if (err) return res.sendStatus(500)

            if(token){
                return res.status(200).send({user_id: id, session_token: token})
            }else{
                users.setToken(id, (err, token) => {
                    if (err) return res.sendStatus(500)
                    return res.status(200).send({user_id: id, session_token: token})
                })
            }
        })
    })
};

const logout = (req, res) => {
    res.setHeader("Content-Type", "application/json");

    const token = req.header("X-Authorization");
    if (!token) return res.sendStatus(401);

    users.removeToken(token, (err, changes) => {
        if (err) return res.sendStatus(500);

        if (changes === 0) {
            return res.sendStatus(401); // token didn’t match any user
        }

        return res.sendStatus(200);
    });
};

const profile = (req, res) => {
    const user_id = req.params.user_id;

    users.get_user_by_id(user_id, (err, user) => {
        if (err) return res.sendStatus(500);
        if (!user) return res.status(404).send({ error_message: "Invalid user" });

        const millis = Date.now();

        items.get_selling(user.user_id, millis, (err, selling) => {
            if (err) return res.sendStatus(500);

            return res.status(200).json({
                user_id: user.user_id,
                first_name: user.first_name,
                last_name: user.last_name,
                selling: selling
            });
        });
    });
};


module.exports = {
    create_account,
    login,
    logout,
    profile
};
