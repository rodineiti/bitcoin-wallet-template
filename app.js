const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const exphbs = require("express-handlebars");
dotenv.config({ path: "./.env" });
const app = express();
const publicDirectory = path.join(__dirname, "./public");
app.use(express.static(publicDirectory));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET,
    cookie: {
      httpOnly: true,
      maxAge: Date.now() + 30 * 86400 * 1000
    }
  })
);

app.engine(
  "hbs",
  exphbs({
    defaultLayout: "master",
    partialsDir: __dirname + "/views/partials",
    extname: ".hbs"
  })
);
app.set("view engine", "hbs");

// Routes
app.use("/", require("./src/routes/pages"));
app.use("/auth", require("./src/routes/auth"));
app.use("/authApi", require("./src/routes/authApi"));
app.use("/transactions", require("./src/routes/transactions"));
app.use("/users", require("./src/routes/users"));

app.listen(9009, () => {
  console.log("Server running on port 9009");
});
