const connection = require("../sqlconnection");

const bcrypt = require("bcryptjs");
const saltRounds = 10;
const util = require("util");

const { Checkgroup } = require("../models/accounts.js");

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

async function createPlan(req, res) {
  const { plan_MVP_name, plan_startDate, plan_endDate, plan_app_Acronym } =
    req.body;

  // Validate required fields
  if (!plan_MVP_name || !plan_startDate || !plan_endDate || !plan_app_Acronym) {
    return res.status(400).send("Missing required fields.");
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
    plan_MVP_name,
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

  // Prepare the SQL query and values
  const query = `
    UPDATE plan
    SET
      plan_startDate = ?, 
      plan_endDate = ?
    WHERE plan_MVP_name = ? AND plan_app_Acronym = ?
  `;

  const values = [
    plan_startDate !== undefined ? plan_startDate : null,
    plan_endDate !== undefined ? plan_endDate : null,
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

async function updateTaskWithStateChange(req, res) {
  const {
    task_id,
    task_description,
    task_plan,
    task_state,
    task_owner,
    notes,
  } = req.body;

  console.log(task_owner);

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
};
