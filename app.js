// IMPORTS -
const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const errorMiddleware = require("./middlewares/error");
const cors = require("cors");
const path = require("path");

// CONFIG -
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({ path: "./config/config.env" });
}

// FOR DEPLOYMENT -
app.get("/", (req, res) => {
  res.send("<h1>Processing</h1>");
});

// MIDDLEWARES -
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(fileUpload());
app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// ROUTES -
const user = require("./routes/userRoute");
const product = require("./routes/productRoute");
const formula = require("./routes/formulaRoute");
const sale = require("./routes/saleRoute");
const expense = require("./routes/expenseRoute");

app.use("/hi-class-feed", user);
app.use("/hi-class-feed", product);
app.use("/hi-class-feed", formula);
app.use("/hi-class-feed", sale);
app.use("/hi-class-feed", expense);

// MIDDLEWARE  FOR ERRORS -
app.use(errorMiddleware);
module.exports = app;
