const express = require('express');
const { connectToDatabase, getDatabasePool, closeDatabaseConnection } = require('./src/utils/database');


const server = express();


connectToDatabase()
    .then(() => {
        // Making sure server is started only after database is connected
        const port = process.env.PORT || 3000;
        server.listen(port, () => {
            console.log(`Server is listening on port ${port}`);
        });
    })
    .catch((error) => {
        console.error('Error connecting to the database:', error);
        process.exit(1);
    });


// Middleware to get a database connection from the pool for each incoming request
server.use(async (req, res, next) => {
    try {
        const pool = getDatabasePool();
        req.dbConnection = await pool.getConnection();
        next();
    } catch (error) {
        console.error('Error getting database connection:', error);
        res.status(500).send('Internal Server Error');
    }
});


// Define routes bellow
server.get('/', async (req, res) => {
    try {
        const db = req.dbConnection;
        const [rows] = await db.query('SELECT * FROM your_table');
        res.json(rows);
    } catch (error) {
        console.error('Error querying database:', error);
        res.status(500).send('Internal Server Error');
    } finally {
        if (req.dbConnection) {
            req.dbConnection.release();
        }
    }
});


// Close db conn when server is shutdown
process.on('exit', async () => {
    try {
        await closeDatabaseConnection();
        console.log('Application is exiting. Database connection closed.');
    } catch (error) {
        console.error('Error closing database connection:', error);
        process.exit(1);
    }
});

