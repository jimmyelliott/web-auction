const db = require('../../database');

const create_new_item = (item, user_id, done) => {
    const sql = `INSERT INTO items (name, description, starting_bid, end_date, creator_id)
                 VALUES (?, ?, ?, ?, ?)`;

    const values = [item.name, item.description, item.starting_bid, item.end_date, user_id];

    db.run(sql, values, function(err) {
        if (err) {
            return done(err);
        }
        return done(null, this.lastID); // return item_id
    });
};

const get_item_by_id = (id, done) => {
    const sql = `SELECT * FROM items WHERE item_id = ?`;
    db.get(sql, [id], (err, item) => {
        return done(err, item);
    });
};

module.exports = {
    create_new_item,
    get_item_by_id,
};