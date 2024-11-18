const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// const testConnection = async () => {
//     try {
//         const connection = await pool.getConnection();
//         console.log('Connected to database');
//         connection.release();
//     } catch (error) {
//         console.error('Error connecting to database: ', error);
//     }
// }

module.exports = pool;