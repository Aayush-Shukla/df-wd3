var mysql = require('mysql')
const dotenv = require('dotenv')
dotenv.config({ path: '.env' })
var connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database : process.env.DB_NAME,
	
  insecureAuth : true
  
});

connection.connect(function(err) {
  if (err) {
    return console.error('error: ' + err.message);
  }
})










connection.query(`CREATE TABLE accepted (invite_id int NOT NULL,user int DEFAULT NULL,bool tinyint DEFAULT NULL,number int NOT NULL AUTO_INCREMENT,PRIMARY KEY (number)) `, function (error,results, fields) {
  if (error) throw error+"   1111111111111111111111111";
});

connection.query(`CREATE TABLE invites (invite_id int NOT NULL AUTO_INCREMENT,author_id int DEFAULT NULL,heading varchar(100) DEFAULT NULL,content varchar(400) DEFAULT NULL,footer varchar(100) DEFAULT NULL,eligiblemem json DEFAULT NULL,created_at datetime DEFAULT CURRENT_TIMESTAMP,link varchar(45) DEFAULT NULL,event_at datetime DEFAULT NULL,inviteall tinyint DEFAULT NULL,PRIMARY KEY (invite_id),UNIQUE KEY invite_id_UNIQUE (invite_id))`, function (error, results, fields) {
  if (error) throw error+"   2222222222222222222222";
  
});

connection.query(`CREATE TABLE users (id int unsigned NOT NULL AUTO_INCREMENT,name varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,email varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,pass varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,PRIMARY KEY (id),UNIQUE KEY id (id))`, function (error, results, fields) {
  if (error) throw error+"   333333333333333333333";
  
});

// connection.query(`ALTER TABLE accepted ADD PRIMARY KEY (number)`, function (error, results, fields) {
//   if (error) throw error;
//
// });

// connection.query(`ALTER TABLE invites ADD PRIMARY KEY (number)`, function (error, results, fields) {
//   if (error) throw error;
//
// });
//
// connection.query(`ALTER TABLE accepted ADD PRIMARY KEY (number)`, function (error, results, fields) {
//   if (error) throw error;
//
// });


console.log("All Table Created Successfully")








module.exports = connection;
