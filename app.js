const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const { ValidationError } = require("sequelize");
const indexRouter = require("./routes/index");
const userRouter = require("./routes/user");
const postRouter = require("./routes/post");
const { environment } = require("./config");
const app = express();

if (process.env.NODE_ENV === "production") {
  // app.use(cors({ origin: "https://cryptic-meadow-61382.herokuapp.com/" }));
  app.use(cors({ origin: "*" }));
} else {
  // app.use(cors({ origin: "https://cryptic-meadow-61382.herokuapp.com/" }));
  app.use(cors({ origin: "*" }));
}
app.use(morgan("dev"));
app.use(express.json());
app.use("/", indexRouter);
app.use("/api/users", userRouter);
app.use("/api", postRouter);

app.use("/favicon.ico", express.static("assets/favicon.ico"));

app.use((req, res, next) => {
  const err = new Error("The requested resource couldn't be found.");
  err.errors = ["The requested resource couldn't be found."];
  err.status = 404;
  next(err);
});

// Error handlers. (must have all four arguments to communicate to Express that
// this is an error-handling middleware function)

// Process sequelize errors
app.use((err, req, res, next) => {
  // check if error is a Sequelize error:
  if (err instanceof ValidationError) {
    err.errors = err.errors.map((e) => e.message);
    err.title = "Sequelize Error";
  }
  next(err);
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  const isProduction = environment === "production";
  res.json({
    title: err.title || "Server Error",
    errors: err.errors,
    stack: isProduction ? null : err.stack,
  });
});

module.exports = app;
