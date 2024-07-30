const mysql = require('mysql2');

const express = require('express');

// create a new MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  //password: 'root',
password: 'kaiyang123',
  database: 'nodelogin'
});

// connect to the MySQL database
connection.connect((error)=>{
    if(error) {
        console.error('Error connecting to MySQL database:', error);
    }
    else {
        console.log('Connected to MySQL database as id!', connection.threadId);
    }
});

module.exports = connection;