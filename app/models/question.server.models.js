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

const get_question_with_item_owner = (question_id, done) => {
    const sql = `
        SELECT q.question_id, q.answer, i.creator_id
        FROM questions q
        JOIN items i ON q.item_id = i.item_id
        WHERE q.question_id = ?
    `;

    db.get(sql, [question_id], (err, row) => {
        if (err) return done(err);
        return done(null, row); // if the row is undefined then the question is undefined
    });
};

const answer_question_if_owner = (answer_text, question_id, user_id, done) => {
    const sql = `
        UPDATE questions
        SET answer = ?
        WHERE question_id = ?
        AND EXISTS (
            SELECT 1
            FROM items
            WHERE items.item_id = questions.item_id
            AND items.creator_id = ?
        )
        AND answer IS NULL
    `;

    const values = [answer_text, question_id, user_id];

    db.run(sql, values, function (err) {
        if (err) return done(err);
        return done(null, this.changes > 0);
    });
};

const get_questions_for_item = (item_id, done) => {
    const sql = `
        SELECT
            question_id,
            question AS question_text,
            answer AS answer_text
        FROM questions
        WHERE item_id = ?
        ORDER BY question_id DESC
    `;

    db.all(sql, [item_id], (err, rows) => {
        if (err) return done(err);

        return done(null, rows);
    });
};


module.exports = {
    create_new_question,
    answer_question_if_owner,
    get_question_with_item_owner,
    get_questions_for_item
};