const connection = require("../sqlconnection");

const bcrypt = require("bcryptjs");
const saltRounds = 10;

const { Checkgroup } = require("../models/accounts.js");

const checkPL = async (req, res) => {
  try {
    const isProjectLead = await Checkgroup(req.user, "projectlead");
    res.json({ isAuthenticated: isProjectLead });
  } catch (error) {
    console.error("Error checking user group:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

const checkPM = async (req, res) => {
  try {
    const isProjectManager = await Checkgroup(req.user, "projectmanager");
    res.json({ isAuthenticated: isProjectManager });
  } catch (error) {
    console.error("Error checking user group:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

async function getAllAppNames(req, res) {
  try {
    connection.query(
      `SELECT app_acronym FROM application;`,
      (error, results) => {
        if (error) {
          console.error("Error querying database:", error);
          res.status(500).send("Error querying database");
        } else {
          //console.log(results);
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
    permissions,
  } = req.body;

  const {
    app_permit_create,
    app_permit_open,
    app_permit_todolist,
    app_permit_doing,
    app_permit_done,
  } = permissions;

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

async function getApplicationDetails(req, res) {
  const app_acronym = req.body.app_acronym;
  console.log("In get Application Details " + app_acronym);
  console.log("In get Application Details " + req.body.user);

  try {
    connection.query(
      `SELECT * FROM application WHERE app_acronym = ?;`,
      [app_acronym],
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

async function editApplication(req, res) {
  const {
    app_acronym,
    app_description,
    app_rnumber,
    app_startdate,
    app_enddate,
    permissions,
  } = req.body;

  const {
    app_permit_create,
    app_permit_open,
    app_permit_todolist,
    app_permit_doing,
    app_permit_done,
  } = permissions;

  console.log(app_acronym);

  // Prepare the SQL query and values
  const query = `
        UPDATE application
        SET
            app_description = ?, 
            app_rnumber = ?, 
            app_startdate = ?, 
            app_enddate = ?, 
            app_permit_create = ?, 
            app_permit_open = ?, 
            app_permit_todolist = ?, 
            app_permit_doing = ?, 
            app_permit_done = ?
        WHERE app_acronym = ?
    `;

  const values = [
    app_description !== undefined ? app_description : null,
    app_rnumber,
    app_startdate,
    app_enddate,
    app_permit_create !== undefined ? app_permit_create : null,
    app_permit_open !== undefined ? app_permit_open : null,
    app_permit_todolist !== undefined ? app_permit_todolist : null,
    app_permit_doing !== undefined ? app_permit_doing : null,
    app_permit_done !== undefined ? app_permit_done : null,
    app_acronym,
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
  checkPL,
  checkPM,
  getAllAppNames,
  createApplication,
  getApplicationDetails,
  editApplication,
};
