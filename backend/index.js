const express = require("express");
const app = express();

//require config and set up config file path
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });

const sqlconnection = require("./routes/accountRouter");
app.use(express.json());
app.use(sqlconnection);

const PORT = process.env.PORT;
/** App listening on port */
app.listen(PORT, () => {
  console.log(
    `TMS app listening at http://localhost:${process.env.PORT} in ${process.env.NODE_ENV} mode`
  );
});
