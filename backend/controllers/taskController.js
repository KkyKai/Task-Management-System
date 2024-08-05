const connection = require("../sqlconnection");

const bcrypt = require("bcryptjs");
const saltRounds = 10;

const { Checkgroup } = require("../models/accounts.js");

async function getAllApplications(req, res) {
  try {
    connection.query(
      `SELECT app_acronym FROM application;`,
      (error, results) => {
        if (error) {
          console.error("Error querying database:", error);
          res.status(500).send("Error querying database");
        } else {
          console.log(results);
          res.json(results);
        }
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).send("Unexpected error");
  }
}

async function createApplication(req, res) {
  const {
    app_acronym,
    app_description,
    app_rnumber,
    app_startdate,
    app_enddate,
    app_permit_create,
    app_permit_open,
    app_permit_todolist,
    app_permit_doing,
    app_permit_done,
  } = req.body;

  // Prepare the SQL query and values
  const query = `
        INSERT INTO application (
            app_acronym, 
            app_description, 
            app_rnumber, 
            app_startdate, 
            app_enddate, 
            app_permit_create, 
            app_permit_open, 
            app_permit_todolist, 
            app_permit_doing, 
            app_permit_done
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

  const values = [
    app_acronym,
    app_description !== undefined ? app_description : null,
    app_rnumber,
    app_startdate,
    app_enddate,
    app_permit_create !== undefined ? app_permit_create : null,
    app_permit_open !== undefined ? app_permit_open : null,
    app_permit_todolist !== undefined ? app_permit_todolist : null,
    app_permit_doing !== undefined ? app_permit_doing : null,
    app_permit_done !== undefined ? app_permit_done : null,
  ];

  // Start a transaction
  connection.beginTransaction(async (err) => {
    if (err) {
      console.error("Error starting transaction:", err);
      return res.status(500).send("Error starting transaction");
    }

    try {
      connection.query(query, values, (error, results) => {
        if (error) {
          // Rollback transaction on error
          return connection.rollback(() => {
            console.error("Error querying database:", error);
            res.status(500).send("Error querying database");
          });
        }

        // Commit transaction on success
        connection.commit((commitError) => {
          if (commitError) {
            // Rollback transaction on commit error
            return connection.rollback(() => {
              console.error("Error committing transaction:", commitError);
              res.status(500).send("Error committing transaction");
            });
          }

          console.log("Record inserted:", results);
          res.status(201).json({ id: results.insertId });
        });
      });
    } catch (error) {
      // Rollback transaction on unexpected error
      connection.rollback(() => {
        console.error("Unexpected error:", error);
        res.status(500).send("Unexpected error");
      });
    }
  });
}

module.exports = {
  getAllApplications,
  createApplication,
};
