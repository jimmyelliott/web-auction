const db = require('../../database');

const new_bid = (id, amount, done) => {
    const sql = `INSERT INTO bids (user_id, amount)
                 VALUES (?, ?)`;

    db.run(sql, [id, amount], function(err) {
        if (err) {
            return done(err);
        }
        return done(null, this.lastID); // <= return ID only!
    });
};

module.exports = {
    new_bid,
};