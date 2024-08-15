const connection = require("../sqlconnection");

const bcrypt = require("bcryptjs");
const saltRounds = 10;
const util = require("util");

const { Checkgroup } = require("../models/accounts.js");

const sendEmail = require("../utils/emailService.js");

const query = util.promisify(connection.query).bind(connection);

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
    app_permit_create,
    app_permit_open,
    app_permit_todolist,
    app_permit_doing,
    app_permit_done,
  } = req.body;

  if (!app_acronym) {
    return res.status(400).send("App Acronym is required");
  }

  const trimmedAcronym = app_acronym.trim();
  if (trimmedAcronym.length < 4 || trimmedAcronym.length > 20) {
    return res
      .status(400)
      .send("App Acronym length must be between 4 and 20 characters");
  }

  const invalidCharPattern = /[^a-zA-Z0-9_]/;
  if (invalidCharPattern.test(trimmedAcronym)) {
    return res
      .status(400)
      .send(
        "App Acronym should contain only letters, numbers, underscores, and no white space inbetween"
      );
  }

  // Process the valid app_acronym
  const processedAcronym = trimmedAcronym.toLowerCase();

  if (!app_rnumber) {
    return res.status(400).send("App Rnumber is required");
  }

  if (app_rnumber < 0) {
    return res.status(400).send("App Rnumber must be a non-negative number");
  }

  if (!app_startdate) {
    return res.status(400).send("App Start Date is required");
  }

  if (!app_enddate) {
    return res.status(400).send("App End Date is required");
  }

  if (app_startdate > app_enddate) {
    return res.status(400).send("App Start Date cannot be after App End Date");
  }

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
    processedAcronym,
    app_description,
    app_rnumber,
    app_startdate,
    app_enddate,
    app_permit_create,
    app_permit_open,
    app_permit_todolist,
    app_permit_doing,
    app_permit_done,
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
          if (error.code === "ER_DUP_ENTRY") {
            return connection.rollback(() => {
              res.status(400).send("App Acronym already exists");
            });
          }
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
    app_startdate,
    app_enddate,
    app_permit_create,
    app_permit_open,
    app_permit_todolist,
    app_permit_doing,
    app_permit_done,
  } = req.body;

  if (app_startdate || app_enddate) {
    if (app_startdate > app_enddate) {
      return res
        .status(400)
        .send("App Start Date cannot be after App End Date");
    }
  }

  const setClause = [];
  const values = [];

  if (app_description !== undefined) {
    setClause.push("app_description = ?");
    values.push(app_description);
  }
  if (app_startdate !== undefined) {
    setClause.push("app_startdate = ?");
    values.push(app_startdate);
  }
  if (app_enddate !== undefined) {
    setClause.push("app_enddate = ?");
    values.push(app_enddate);
  }
  if (app_permit_create !== undefined) {
    setClause.push("app_permit_create = ?");
    values.push(app_permit_create);
  }
  if (app_permit_open !== undefined) {
    setClause.push("app_permit_open = ?");
    values.push(app_permit_open);
  }
  if (app_permit_todolist !== undefined) {
    setClause.push("app_permit_todolist = ?");
    values.push(app_permit_todolist);
  }
  if (app_permit_doing !== undefined) {
    setClause.push("app_permit_doing = ?");
    values.push(app_permit_doing);
  }
  if (app_permit_done !== undefined) {
    setClause.push("app_permit_done = ?");
    values.push(app_permit_done);
  }

  if (setClause.length === 0) {
    return res.status(400).send("No fields to update");
  }

  // Final query string
  const query = `
    UPDATE application
    SET ${setClause.join(", ")}
    WHERE app_acronym = ?
  `;
  values.push(app_acronym);

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

async function createPlan(req, res) {
  const { plan_MVP_name, plan_startDate, plan_endDate, plan_app_Acronym } =
    req.body;

  // Validate required fields
  if (!plan_MVP_name || !plan_startDate || !plan_endDate || !plan_app_Acronym) {
    return res.status(400).send("Missing required fields.");
  }

  const trimmedPlanMVPName = plan_MVP_name.trim().toLowerCase();
  const nameLength = trimmedPlanMVPName.length;
  const namePattern = /^[a-zA-Z0-9_ ]+$/;

  if (nameLength < 4 || nameLength > 20) {
    return res
      .status(400)
      .send("plan_MVP_name must be between 4 and 20 characters.");
  }

  if (!namePattern.test(trimmedPlanMVPName)) {
    return res
      .status(400)
      .send(
        "plan_MVP_name can only contain alphanumeric characters, underscores, and spaces."
      );
  }

  if (plan_startDate && plan_endDate) {
    if (plan_startDate > plan_endDate) {
      return res.status(400).send("Start Date cannot be after End Date");
    }
  }

  // Prepare the SQL query and values
  const query = `
        INSERT INTO plan (
            plan_MVP_name, 
            plan_startDate, 
            plan_endDate, 
            plan_app_Acronym
        ) VALUES (?, ?, ?, ?)
    `;

  const values = [
    trimmedPlanMVPName,
    plan_startDate,
    plan_endDate,
    plan_app_Acronym,
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
          if (error.code === "ER_DUP_ENTRY") {
            return connection.rollback(() => {
              res.status(400).send("Plan MVP name already exists");
            });
          }
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

async function getAllPlans(req, res) {
  // Prepare the SQL query
  const query = `SELECT * FROM plan`;

  try {
    // Execute the query
    connection.query(query, (error, results) => {
      if (error) {
        console.error("Error querying database:", error);
        return res.status(500).send("Error querying database");
      } else {
        // Send the results as JSON
        res.status(200).json(results);
      }
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).send("Unexpected error");
  }
}

async function getApplicationPlan(req, res) {
  const plan_app_Acronym = req.body.app_acronym;

  if (!plan_app_Acronym) {
    return res.status(400).send("Application acronym is required");
  }

  console.log("Fetching plans for acronym:", plan_app_Acronym);

  const sqlQuery = `SELECT * FROM plan WHERE plan_app_Acronym = ?`;
  const values = [plan_app_Acronym];

  try {
    // Execute the query using the promisified query method
    const results = await query(sqlQuery, values);
    //console.log("Query results:", results);
    res.status(200).json(results);
  } catch (error) {
    console.error("Error querying database:", error);
    res.status(500).send("Error querying database");
  }
}

async function editPlan(req, res) {
  const { plan_MVP_name, plan_startDate, plan_endDate, plan_app_Acronym } =
    req.body;

  console.log(plan_MVP_name, plan_app_Acronym);

  const formatDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    return d.toISOString().split("T")[0]; // Only keep 'YYYY-MM-DD'
  };

  const startDateFormatted = formatDate(plan_startDate);
  const endDateFormatted = formatDate(plan_endDate);

  if (startDateFormatted && endDateFormatted) {
    if (startDateFormatted > endDateFormatted) {
      return res.status(400).send("Start Date cannot be after End Date");
    }
  }

  // Prepare the SQL query and values
  const query = `
    UPDATE plan
    SET
      plan_startDate = ?, 
      plan_endDate = ?
    WHERE plan_MVP_name = ? AND plan_app_Acronym = ?
  `;

  const values = [
    startDateFormatted,
    endDateFormatted,
    plan_MVP_name,
    plan_app_Acronym,
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

          console.log("Record updated:", results);
          res.status(200).json({ message: "Plan updated successfully" });
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

async function getAppPermitCreate(req, res) {
  const acronym = req.body.app_acronym;

  try {
    // Query the database to get the app permit
    const results = await query(
      `SELECT app_permit_create FROM application WHERE app_acronym = ?;`,
      [acronym]
    );

    if (results.length === 0) {
      return res.status(404).send("Application not found");
    }

    // Assuming the results[0] contains the app permit information
    const appPermit = results[0].app_permit_create;

    // Check group permission
    const hasPermission = await Checkgroup(req.user, appPermit);

    // Return the result based on the permission check
    res.json({ hasPermission });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).send("Unexpected error");
  }
}

async function getAppPermitOpen(req, res) {
  const acronym = req.body.app_acronym;

  try {
    // Query the database to get the app permit
    const results = await query(
      `SELECT app_permit_open FROM application WHERE app_acronym = ?;`,
      [acronym]
    );

    if (results.length === 0) {
      return res.status(404).send("Application not found");
    }

    // Assuming the results[0] contains the app permit information
    const appPermit = results[0].app_permit_open;

    // Check group permission
    const hasPermission = await Checkgroup(req.user, appPermit);

    // Return the result based on the permission check
    res.json({ hasPermission });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).send("Unexpected error");
  }
}

async function getAppPermitTodo(req, res) {
  const acronym = req.body.app_acronym;

  try {
    // Query the database to get the app permit
    const results = await query(
      `SELECT app_permit_todolist FROM application WHERE app_acronym = ?;`,
      [acronym]
    );

    if (results.length === 0) {
      return res.status(404).send("Application not found");
    }

    // Assuming the results[0] contains the app permit information
    const appPermit = results[0].app_permit_todolist;

    // Check group permission
    const hasPermission = await Checkgroup(req.user, appPermit);

    // Return the result based on the permission check
    res.json({ hasPermission });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).send("Unexpected error");
  }
}

async function getAppPermitDoing(req, res) {
  const acronym = req.body.app_acronym;

  try {
    // Query the database to get the app permit
    const results = await query(
      `SELECT app_permit_doing FROM application WHERE app_acronym = ?;`,
      [acronym]
    );

    if (results.length === 0) {
      return res.status(404).send("Application not found");
    }

    // Assuming the results[0] contains the app permit information
    const appPermit = results[0].app_permit_doing;

    // Check group permission
    const hasPermission = await Checkgroup(req.user, appPermit);

    // Return the result based on the permission check
    res.json({ hasPermission });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).send("Unexpected error");
  }
}

async function getAppPermitDone(req, res) {
  const acronym = req.body.app_acronym;

  try {
    // Query the database to get the app permit
    const results = await query(
      `SELECT app_permit_done FROM application WHERE app_acronym = ?;`,
      [acronym]
    );

    if (results.length === 0) {
      return res.status(404).send("Application not found");
    }

    // Assuming the results[0] contains the app permit information
    const appPermit = results[0].app_permit_done;

    // Check group permission
    const hasPermission = await Checkgroup(req.user, appPermit);

    // Return the result based on the permission check
    res.json({ hasPermission });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).send("Unexpected error");
  }
}

/*async function getAppPermitDone(req, res) {
  try {
    const acronym = req.body.app_acronym;

    connection.query(
      `SELECT app_permit_done FROM application WHERE app_acronym = ?;`,
      [acronym],
      (error, results) => {
        if (error) {
          console.error("Error querying database:", error);
          res.status(500).send("Error querying database");
        } else {
          //console.log(results);
          res.json(results[0]);
        }
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).send("Unexpected error");
  }
} */

async function createTask(req, res) {
  const {
    task_name,
    task_description,
    task_plan,
    task_app_Acronym,
    task_creator,
    task_owner,
  } = req.body;

  // Validate required fields
  if (!task_name || !task_app_Acronym || !task_creator || !task_owner) {
    return res.status(400).send("Missing required fields.");
  }

  // Prepare SQL queries
  const selectAppQuery =
    "SELECT app_rnumber FROM application WHERE app_acronym = ?";
  const updateAppQuery =
    "UPDATE application SET app_rnumber = ? WHERE app_acronym = ?";
  const insertTaskQuery = `
    INSERT INTO task (
      task_id, 
      task_name, 
      task_description, 
      task_plan,
      task_app_Acronym,
      task_creator,
      task_owner,
      task_state,
      task_createDate
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const insertTaskNoteQuery = `
    INSERT INTO task_note (
      task_id, 
      notes, 
      tasknote_created
    ) VALUES (?, ?, ?)
  `;

  // Start a transaction
  connection.beginTransaction(async (err) => {
    if (err) {
      console.error("Error starting transaction:", err);
      return res.status(500).send("Error starting transaction");
    }

    try {
      // Step 1: Get the current app_rnumber
      connection.query(
        selectAppQuery,
        [task_app_Acronym],
        (selectError, selectResults) => {
          if (selectError) {
            return connection.rollback(() => {
              console.error("Error querying application:", selectError);
              res.status(500).send("Error querying application");
            });
          }

          if (selectResults.length === 0) {
            return connection.rollback(() => {
              console.error("Application not found.");
              res.status(404).send("Application not found");
            });
          }

          const currentRnumber = selectResults[0].app_rnumber;
          const newRnumber = currentRnumber + 1;
          const task_id = `${task_app_Acronym}_${currentRnumber}`;

          // Set default values for nullable fields
          const task_description = req.body.task_description || null;
          const task_plan = req.body.task_plan || null;

          // Assume default values for task_state and task_createDate
          const task_state = "open"; // default state
          const task_createDate = new Date()
            .toISOString()
            .slice(0, 19)
            .replace("T", " "); // Current datetime in YYYY-MM-DD HH:MM:SS format

          // Step 2: Insert into the task table
          connection.query(
            insertTaskQuery,
            [
              task_id,
              task_name,
              task_description,
              task_plan,
              task_app_Acronym,
              task_creator,
              task_owner,
              task_state,
              task_createDate,
            ],
            (insertError, insertResults) => {
              if (insertError) {
                return connection.rollback(() => {
                  console.error("Error inserting into task:", insertError);
                  res.status(500).send("Error inserting into task");
                });
              }

              // Step 3: Insert into the task_note table
              const note = `[System, ${task_state}] ${task_createDate} User ${task_creator} has created the task.`;
              const noteCreatedDate = task_createDate; // Use the same datetime as task_createDate

              connection.query(
                insertTaskNoteQuery,
                [task_id, note, noteCreatedDate],
                (noteError) => {
                  if (noteError) {
                    return connection.rollback(() => {
                      console.error(
                        "Error inserting into task_note:",
                        noteError
                      );
                      res.status(500).send("Error inserting into task_note");
                    });
                  }

                  // Step 4: Update app_rnumber
                  connection.query(
                    updateAppQuery,
                    [newRnumber, task_app_Acronym],
                    (updateError) => {
                      if (updateError) {
                        return connection.rollback(() => {
                          console.error(
                            "Error updating app_rnumber:",
                            updateError
                          );
                          res.status(500).send("Error updating app_rnumber");
                        });
                      }

                      // Commit transaction on success
                      connection.commit((commitError) => {
                        if (commitError) {
                          return connection.rollback(() => {
                            console.error(
                              "Error committing transaction:",
                              commitError
                            );
                            res
                              .status(500)
                              .send("Error committing transaction");
                          });
                        }

                        console.log("Record inserted:", insertResults);
                        res.status(201).json({ id: insertResults.insertId });
                      });
                    }
                  );
                }
              );
            }
          );
        }
      );
    } catch (error) {
      // Rollback transaction on unexpected error
      connection.rollback(() => {
        console.error("Unexpected error:", error);
        res.status(500).send("Unexpected error");
      });
    }
  });
}

async function getAllTask(req, res) {
  const task_app_Acronym = req.body.task_app_Acronym; // Extract the acronym from request body

  if (!task_app_Acronym) {
    return res.status(400).send("Task app acronym is required");
  }

  // Prepare the SQL query and parameters
  const sqlQuery = "SELECT * FROM task WHERE task_app_Acronym = ?";
  const params = [task_app_Acronym];

  try {
    // Execute the query
    const results = await query(sqlQuery, params);

    // Send the results as JSON
    res.status(200).json(results);
  } catch (error) {
    console.error("Error querying database:", error);
    res.status(500).send("Error querying database");
  }
}

async function getTaskDetails(req, res) {
  const task_id = req.body.task_id;

  if (!task_id) {
    return res.status(400).send("Task id  is required");
  }

  // Prepare the SQL query and parameters
  const sqlQuery = "SELECT * FROM task WHERE task_id = ?";
  const params = [task_id];

  try {
    // Execute the query
    const results = await query(sqlQuery, params);

    // Send the results as JSON
    res.status(200).json(results[0]);
  } catch (error) {
    console.error("Error querying database:", error);
    res.status(500).send("Error querying database");
  }
}

async function getAuditTrail(req, res) {
  const task_id = req.body.task_id;

  if (!task_id) {
    return res.status(400).send("Task id  is required");
  }

  // Prepare the SQL query and parameters
  const sqlQuery =
    "SELECT notes, tasknote_created FROM task_note WHERE task_id = ? ORDER BY tasknote_created DESC";
  const params = [task_id];

  try {
    // Execute the query
    const results = await query(sqlQuery, params);

    // Send the results as JSON
    res.status(200).json(results);
  } catch (error) {
    console.error("Error querying database:", error);
    res.status(500).send("Error querying database");
  }
}

async function getUserEmailsByGroupName(groupname) {
  const sql = `
    SELECT u.email
    FROM usergroup ug
    JOIN user u ON ug.userID = u.username
    WHERE ug.groupname = ? AND u.email != '-';
  `;

  try {
    // Execute the query and get the results
    const rows = await query(sql, [groupname]);

    console.log("Query results:", rows);

    // Check if rows is an array and map to get emails
    if (Array.isArray(rows)) {
      return rows.map((user) => user.email);
    } else {
      console.error("Unexpected result format:", rows);
      return [];
    }
  } catch (error) {
    console.error("Error fetching user emails:", error);
    throw error;
  }
}

/*async function updateTaskWithStateChange(req, res) {
  const {
    task_id,
    task_description,
    task_plan,
    task_state,
    task_owner,
    notes,
    app_acronym,
    task_name,
  } = req.body;

  console.log("in update task" + app_acronym);

  const currentDateTime = new Date()
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");

  const systemDateTime = new Date(Date.now() + 1000)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");
  console.log(currentDateTime);

  // Define note messages based on task_state
  const noteMessages = {
    todo: `User ${task_owner} has released task.`,
    doing: `User ${task_owner} has taken on task.`,
    done: `User ${task_owner} has submitted task.`,
    closed: `User ${task_owner} has closed task.`,
  };

  const newNote = `[System, ${task_state}] ${currentDateTime} ${
    noteMessages[task_state] || "Task state updated."
  }`;

  const queryIfDescription = `UPDATE task SET task_description = ? WHERE task_id = ?`;
  const queryIfPlan = "UPDATE task SET task_plan = ? WHERE task_id = ?";
  const querySetState =
    "UPDATE task SET task_state = ?, task_owner = ? WHERE task_id = ?";
  const queryTaskNotes = `INSERT INTO task_note (task_id, notes, tasknote_created) VALUES (?, ?, ?)`;

  const descriptionValues = [task_description, task_id];
  const planValues = [task_plan, task_id];
  const stateValues = [task_state, task_owner, task_id];
  const taskNoteValues = [task_id, notes, systemDateTime];
  const taskSystemNoteValues = [task_id, newNote, currentDateTime];

  connection.beginTransaction(async (err) => {
    if (err) {
      console.error("Error starting transaction:", err);
      return res.status(500).send("Error starting transaction");
    }

    try {
      // Update task_description if provided
      if (task_description !== undefined && task_description !== "") {
        await query(queryIfDescription, descriptionValues);
      }

      // Update task_plan if provided
      if (task_plan !== undefined && task_plan !== "") {
        await query(queryIfPlan, planValues);
      }

      // Update task_state
      await query(querySetState, stateValues);

      if (notes !== undefined && notes !== "") {
        // Insert into task_note
        await query(queryTaskNotes, taskNoteValues);
      }

      // Insert into task_note system message
      await query(queryTaskNotes, taskSystemNoteValues);

      // Send email notification

      if (task_state === "done") {
        const queryGetGroupName = `SELECT app_permit_done FROM application WHERE app_acronym = ?`;
        const results = await query(queryGetGroupName, [app_acronym]);
        const groupname = results[0]?.app_permit_done;

        if (groupname) {
          const subject = `Task ${task_name} Done`;
          const text = `Task Name: ${task_name} has been completed. Please Review.`;
          console.log(subject);
          console.log(text);

          const emails = await getUserEmailsByGroupName(groupname);

          console.log(emails);
          await sendEmail(emails, subject, text);
        }
      }

      // Commit transaction
      connection.commit((err) => {
        if (err) {
          console.error("Error committing transaction:", err);
          return connection.rollback(() => {
            res.status(500).send("Error committing transaction");
          });
        }

        res.send("Task updated and note added successfully");
      });
    } catch (error) {
      // Rollback transaction on error
      console.error("Error processing transaction:", error);
      connection.rollback(() => {
        res.status(500).send("Error processing transaction");
      });
    }
  });
} */

async function updateTaskWithStateChange(req, res) {
  const {
    task_id,
    task_description,
    task_plan,
    task_state,
    task_owner,
    notes,
    task_app_Acronym,
    task_name,
  } = req.body;

  const currentDateTime = new Date()
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");

  const systemDateTime = new Date(Date.now() + 1000)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");
  //console.log(currentDateTime);

  // Define note messages based on task_state
  const noteMessages = {
    todo: `User ${task_owner} has released task.`,
    doing: `User ${task_owner} has taken on task.`,
    done: `User ${task_owner} has submitted task.`,
    closed: `User ${task_owner} has closed task.`,
  };

  const newNote = `[System, ${task_state}] ${currentDateTime} ${
    noteMessages[task_state] || "Task state updated."
  }`;

  const queryGetCurrentState = `SELECT task_state FROM task WHERE task_id = ?`;
  const queryIfDescription = `UPDATE task SET task_description = ? WHERE task_id = ?`;
  const queryIfPlan = "UPDATE task SET task_plan = ? WHERE task_id = ?";
  const querySetState =
    "UPDATE task SET task_state = ?, task_owner = ? WHERE task_id = ?";
  const queryTaskNotes = `INSERT INTO task_note (task_id, notes, tasknote_created) VALUES (?, ?, ?)`;

  const descriptionValues = [task_description, task_id];
  const planValues = [task_plan, task_id];
  const stateValues = [task_state, task_owner, task_id];
  const taskNoteValues = [task_id, notes, systemDateTime];
  const taskSystemNoteValues = [task_id, newNote, currentDateTime];

  connection.beginTransaction(async (err) => {
    if (err) {
      console.error("Error starting transaction:", err);
      return res.status(500).send("Error starting transaction");
    }

    try {
      // Fetch current task state
      const [currentStateResult] = await query(queryGetCurrentState, [task_id]);
      const currentTaskState = currentStateResult?.task_state;

      //console.log("current task state " + currentTaskState);

      // Define valid state transitions
      const validTransitions = {
        open: ["todo"],
        todo: ["doing"],
        doing: ["done"],
        done: ["closed"],
      };

      // Check if the transition is valid
      if (
        validTransitions[currentTaskState] &&
        validTransitions[currentTaskState].includes(task_state)
      ) {
        // Update task_description if provided
        /*if (task_description !== undefined && task_description !== "") {
          await query(queryIfDescription, descriptionValues);
        }

        // Update task_plan if provided
        if (task_plan !== undefined && task_plan !== "") {
          await query(queryIfPlan, planValues);
        } */

        // Update task_description if provided and in valid state
        if (
          task_description !== undefined &&
          task_description !== "" &&
          (currentTaskState === "open" || currentTaskState === "done")
        ) {
          await query(queryIfDescription, descriptionValues);
        }

        // Update task_plan if provided and in valid state
        if (
          task_plan !== undefined &&
          task_plan !== "" &&
          (currentTaskState === "open" || currentTaskState === "done")
        ) {
          await query(queryIfPlan, planValues);
        }

        // Update task_state
        await query(querySetState, stateValues);

        if (notes !== undefined && notes !== "") {
          // Insert into task_note
          await query(queryTaskNotes, taskNoteValues);
        }

        // Insert into task_note system message
        await query(queryTaskNotes, taskSystemNoteValues);

        // Send email notification
        if (task_state === "done") {
          const queryGetGroupName = `SELECT app_permit_done FROM application WHERE app_acronym = ?`;
          const results = await query(queryGetGroupName, [task_app_Acronym]);
          const groupname = results[0]?.app_permit_done;

          if (groupname) {
            const subject = `Task ${task_name} Done`;
            const text = `Task Name: ${task_name} has been completed. Please Review.`;
            //console.log(subject);
            //console.log(text);

            const emails = await getUserEmailsByGroupName(groupname);

            //console.log(emails);
            await sendEmail(emails, subject, text);
          }
        }

        // Commit transaction
        connection.commit((err) => {
          if (err) {
            console.error("Error committing transaction:", err);
            return connection.rollback(() => {
              res.status(500).send("Error committing transaction");
            });
          }

          res.send("Task updated and note added successfully");
        });
      } else {
        // Rollback transaction if transition is invalid
        connection.rollback(() => {
          res.status(400).send("Invalid task state transition");
        });
      }
    } catch (error) {
      // Rollback transaction on error
      console.error("Error processing transaction:", error);
      connection.rollback(() => {
        res.status(500).send("Error processing transaction");
      });
    }
  });
}

async function updateTaskNoStateChange(req, res) {
  const { task_id, task_description, task_plan, notes } = req.body;

  //const currentDateTime = new Date().toISOString();

  const currentDateTime = new Date()
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");

  const queryIfDescription = `UPDATE task SET task_description = ? WHERE task_id = ?`;
  const queryIfPlan = "UPDATE task SET task_plan = ? WHERE task_id = ?";
  const queryTaskNotes = `INSERT INTO task_note (task_id, notes, tasknote_created) VALUES (?, ?, ?)`;

  const descriptionValues = [task_description, task_id];
  const planValues = [task_plan, task_id];
  const taskNoteValues = [task_id, notes, currentDateTime];

  connection.beginTransaction(async (err) => {
    if (err) {
      console.error("Error starting transaction:", err);
      return res.status(500).send("Error starting transaction");
    }

    try {
      // Update task_description if provided
      if (task_description !== undefined && task_description !== "") {
        await query(queryIfDescription, descriptionValues);
      }

      // Update task_plan if provided
      if (task_plan !== undefined && task_plan !== "") {
        await query(queryIfPlan, planValues);
      }

      if (notes !== undefined && notes !== "") {
        // Insert into task_note
        await query(queryTaskNotes, taskNoteValues);
      }

      // Commit transaction
      connection.commit((err) => {
        if (err) {
          console.error("Error committing transaction:", err);
          return connection.rollback(() => {
            res.status(500).send("Error committing transaction");
          });
        }
        res.send("Task updated and note added successfully");
      });
    } catch (error) {
      // Rollback transaction on error
      console.error("Error processing transaction:", error);
      connection.rollback(() => {
        res.status(500).send("Error processing transaction");
      });
    }
  });
}

async function rejectTaskWithStateChange(req, res) {
  const {
    task_id,
    task_description,
    task_plan,
    task_state,
    task_owner,
    notes,
  } = req.body;

  console.log("I am task state " + task_state);

  //const currentDateTime = new Date().toISOString();

  const currentDateTime = new Date()
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");

  const systemDateTime = new Date(Date.now() + 1000)
    .toISOString()
    .slice(0, 19)
    .replace("T", " ");
  console.log(currentDateTime);

  // Define note messages based on task_state
  const noteMessages = {
    todo: `User ${task_owner} has given up task.`,
    doing: `User ${task_owner} has rejected the task.`,
  };

  const newNote = `[System, ${task_state}] ${currentDateTime} ${
    noteMessages[task_state] || "Task state updated."
  }`;
  console.log(noteMessages[task_state]);

  console.log(newNote);

  const queryIfDescription = `UPDATE task SET task_description = ? WHERE task_id = ?`;
  const queryIfPlan = "UPDATE task SET task_plan = ? WHERE task_id = ?";
  const querySetState =
    "UPDATE task SET task_state = ?, task_owner = ? WHERE task_id = ?";
  const queryTaskNotes = `INSERT INTO task_note (task_id, notes, tasknote_created) VALUES (?, ?, ?)`;

  const descriptionValues = [task_description, task_id];
  const planValues = [task_plan, task_id];
  const stateValues = [task_state, task_owner, task_id];
  const taskNoteValues = [task_id, notes, systemDateTime];
  const taskSystemNoteValues = [task_id, newNote, currentDateTime];

  connection.beginTransaction(async (err) => {
    if (err) {
      console.error("Error starting transaction:", err);
      return res.status(500).send("Error starting transaction");
    }

    try {
      // Update task_description if provided
      if (task_description !== undefined && task_description !== "") {
        await query(queryIfDescription, descriptionValues);
      }

      // Update task_plan if provided
      if (task_plan !== undefined && task_plan !== "") {
        await query(queryIfPlan, planValues);
      }

      // Update task_state
      await query(querySetState, stateValues);

      if (notes !== undefined && notes !== "") {
        // Insert into task_note
        await query(queryTaskNotes, taskNoteValues);
      }

      // Insert into task_note system message
      await query(queryTaskNotes, taskSystemNoteValues);

      // Commit transaction
      connection.commit((err) => {
        if (err) {
          console.error("Error committing transaction:", err);
          return connection.rollback(() => {
            res.status(500).send("Error committing transaction");
          });
        }
        res.send("Task updated and note added successfully");
      });
    } catch (error) {
      // Rollback transaction on error
      console.error("Error processing transaction:", error);
      connection.rollback(() => {
        res.status(500).send("Error processing transaction");
      });
    }
  });
}

async function groupnametest(req, res) {
  try {
    const app_acronym = req.body.app_acronym;

    if (!app_acronym) {
      return res.status(400).send("app_acronym is required");
    }

    const queryGetGroupName =
      "SELECT app_permit_done FROM application WHERE app_acronym = ?";

    // Execute the query
    const results = await query(queryGetGroupName, [app_acronym]);

    console.log(results[0].app_permit_done);
    // Extract the desired data
    const groupname = results[0].app_permit_done; // Assuming 'app_permit_done' is the correct field name

    // Send the result
    res.status(200).json({ groupname });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).send("Unexpected error");
  }
}

module.exports = {
  checkPL,
  checkPM,
  getAllAppNames,
  createApplication,
  getApplicationDetails,
  editApplication,
  createPlan,
  getAllPlans,
  getApplicationPlan,
  editPlan,
  createTask,
  getAppPermitCreate,
  getAppPermitOpen,
  getAppPermitTodo,
  getAppPermitDoing,
  getAppPermitDone,
  getAllTask,
  getTaskDetails,
  getAuditTrail,
  updateTaskWithStateChange,
  updateTaskNoStateChange,
  rejectTaskWithStateChange,
  groupnametest,
};
