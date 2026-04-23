// db.js
const mysql = require("mysql2");
// Create a connection pool
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",       
  database: "pssms",  
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
// Optional: Test the connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to MySQL database!");
    connection.release(); // release back to the pool
  }
});
// Export pool with promises for async/await
module.exports = pool.promise();