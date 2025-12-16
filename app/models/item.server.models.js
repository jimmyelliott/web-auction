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

const get_item_by_id = (item_id, done) => {
    const sql = `
        SELECT
            i.item_id,
            i.name,
            i.description,
            i.starting_bid,
            i.start_date,
            i.end_date,
            i.creator_id,
            u.first_name AS creator_first_name,
            u.last_name AS creator_last_name,
            MAX(b.amount) AS current_bid,
            b2.user_id AS current_bid_user_id,
            u2.first_name AS current_bid_first_name,
            u2.last_name AS current_bid_last_name
        FROM items i
        JOIN users u ON i.creator_id = u.user_id
        LEFT JOIN bids b ON b.item_id = i.item_id
        LEFT JOIN bids b2 
            ON b2.item_id = i.item_id 
           AND b2.amount = (
                SELECT MAX(amount) FROM bids WHERE item_id = i.item_id
           )
        LEFT JOIN users u2 ON b2.user_id = u2.user_id
        WHERE i.item_id = ?
        GROUP BY i.item_id
    `;

    db.get(sql, [item_id], (err, row) => {
        if (err) return done(err);
        if (!row) return done(null, null);

        const item = {
            item_id: row.item_id,
            name: row.name,
            description: row.description,
            starting_bid: row.starting_bid,
            start_date: row.start_date,
            end_date: row.end_date,
            creator_id: row.creator_id,
            first_name: row.creator_first_name,
            last_name: row.creator_last_name,
            current_bid: row.current_bid ?? null,
            current_bid_holder: row.current_bid_user_id
                ? {
                    user_id: row.current_bid_user_id,
                    first_name: row.current_bid_first_name,
                    last_name: row.current_bid_last_name
                }
                : null
        };

        return done(null, item);
    });
};


module.exports = {
    create_new_item,
    get_item_by_id,
};