const db = require('../../database');

const new_bid = (user_id, item_id, amount, done) => {
    const sql = `INSERT INTO bids (item_id, user_id, amount)
                 VALUES (?, ?, ?)`;

    db.run(sql, [item_id, user_id, amount], function(err) {
        if (err) return done(err);

        return done(null, this.lastID);
    });
};


const get_highest_bid = (item_id, done) => {
    const sql = `SELECT MAX(amount) AS highest_bid
                 FROM bids
                 WHERE item_id = ?`;

    db.get(sql, [item_id], (err, row) => {
        if (err) return done(err);

        const highest = row?.highest_bid ?? null;

        return done(null, highest);
    });
};

const get_bids_for_item = (item_id, done) => {
    const sql = `
        SELECT
            b.item_id,
            b.amount,
            b.timestamp,
            b.user_id,
            u.first_name,
            u.last_name
        FROM bids b
        JOIN users u ON b.user_id = u.user_id
        WHERE b.item_id = ?
        ORDER BY b.amount DESC
    `;

    db.all(sql, [item_id], (err, rows) => {
        if (err) return done(err);

        return done(null, rows);
    });
};

module.exports = {
    new_bid,
    get_highest_bid,
    get_bids_for_item
};