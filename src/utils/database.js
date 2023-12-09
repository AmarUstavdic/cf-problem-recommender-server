const mysql = require('mysql2/promise'); // Using promise for async/await support
const ssh = require('./sshTunnel');

let pool;

async function connectToDatabase() {
    const tunnelStream = await ssh.setupTunnel();

    pool = mysql.createPool({
        host: '127.0.0.1',
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        connectionLimit: 10, // Number of parallel connections to database
        stream: tunnelStream // Talking to database over ssh tunnel
    });

    console.log('Connected to MySQL through SSH tunnel with connection pooling.');
}

async function closeDatabaseConnection() {
    if (pool) {
        await pool.end();
        console.log('MySQL connection pool closed.');
    }
}

function getDatabasePool() {
    return pool;
}

module.exports = {
    connectToDatabase,
    closeDatabaseConnection,
    getDatabasePool
};
