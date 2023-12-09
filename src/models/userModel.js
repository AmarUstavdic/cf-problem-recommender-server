const { getDatabasePool } = require('../utils/database');

const pool = getDatabasePool();


async function getUserByUsername(handle) {
    const [rows] = await pool.query('SELECT * FROM users WHERE handle = ?', [handle]);
    return rows[0];
}

async function saveUser(user) {

}


module.exports = {
    getUserByUsername,
    saveUser
};
