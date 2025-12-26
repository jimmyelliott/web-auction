const db = require('../../database');

const create_new_question = (question, user_id, item_id, done) => {

    const sql = `INSERT INTO questions (question, asked_by, item_id)
                 VALUES (?, ?, ?)`;
    
    const values = [question.question_text, user_id, item_id];

    db.run(sql, values, function(err) {
        if (err) {
            return done(err);
        }
        return done(null, this.lastID); // <= return ID only!
    });
};

module.exports = {
    create_new_question,
};