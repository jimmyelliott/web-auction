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

        // row.highest_bid will be null if no bids exist
        const highest = row?.highest_bid ?? null;

        return done(null, highest);
    });
};



module.exports = {
    new_bid,
    get_highest_bid
};