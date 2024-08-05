const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
app.use(cookieParser());

//require config and set up config file path
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });

const accountRouter = require("./routes/accountRouter");
const authRouter = require("./routes/authRouter");
const taskRouter = require("./routes/taskRouter");

const cors = require("cors");

app.use(
  cors({
    origin: "http://localhost:3000", // Restrict access to this origin
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Access-Control-Allow-Credentials",
    ], // Allow only Content-Type header
    optionsSuccessStatus: 200, // Return status 200 for preflight requests
    credentials: true, // Allow credentials (cookies)
  })
);

app.use(express.json());
app.use(authRouter);
app.use(accountRouter);
app.use(taskRouter);

const PORT = process.env.PORT;
/** App listening on port */
app.listen(PORT, () => {
  console.log(
    `TMS app listening at http://localhost:${process.env.PORT} in ${process.env.NODE_ENV} mode`
  );
});
