const db = require('../../database');
const crypto = require("crypto")

const create_new_account = (user, done) => {
    const salt = crypto.randomBytes(64);
    const hash = getHash(user.password, salt);

    const sql = `INSERT INTO users (first_name, last_name, email, password, salt)
                 VALUES (?, ?, ?, ?, ?)`;

    const values = [user.first_name, user.last_name, user.email, hash, salt.toString('hex')];

    db.run(sql, values, function(err) {
        if (err) {
            return done(err);
        }
        return done(null, this.lastID); // <= return ID only!
    });
};

const getHash = function(password, salt){
        return crypto.pbkdf2Sync(password, salt, 1000, 256, 'sha256').toString('hex');
}

const login_account = (email, password, done) => {
    const sql = 'SELECT user_id, password, salt FROM users WHERE email=?'

    db.get(sql, [email], (err, row) => {
        if(err) return done(err)
        if(!row) return done(404) //wrong email

        if(row.salt === null) row.salt = ''

        let salt = Buffer.from(row.salt, 'hex')

        if (row.password === getHash(password, salt)){
            return done(false, row.user_id)
        }else{
            return done(404) //wrong password
        }
    })
}

const getToken = (id, done) => {
    const sql = 'SELECT session_token FROM users WHERE user_id = ?';

    db.get(sql, [id], (err, row) => {
        if (err) return done(err);

        if (!row || !row.session_token) {
            return done(null, null); // no existing token -> create one
        }

        return done(null, row.session_token);
    });
};

const setToken = (id, done) => {
    let token = crypto.randomBytes(16).toString('hex');

    const sql = 'UPDATE users SET session_token=? WHERE user_id=?'

    db.run(sql, [token, id], (err) => {
        return done(err, token)
    })
}

const removeToken = (token, done) => {
    const sql = 'UPDATE users SET session_token = NULL WHERE session_token = ?';

    db.run(sql, [token], function (err) {
        if (err) return done(err);
        return done(null, this.changes);  // number of rows updated
    });
};

const getIdFromToken = (token, done) => {
    const sql = 'SELECT user_id FROM users WHERE session_token = ?';

    db.get(sql, [token], (err, row) => {
        if (err) return done(err);
        if (!row) return done(null, null);

        return done(null, row.user_id);
    });
};

const get_user_by_id = (id, done) => {
    const sql = `SELECT * FROM users WHERE user_id = ?`;
    db.get(sql, [id], (err, user) => {
        return done(err, user);
    });
};



module.exports = {
    create_new_account,
    login_account,
    getToken,
    setToken,
    removeToken,
    getIdFromToken,
    get_user_by_id
};
