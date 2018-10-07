var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var flash = require("connect-flash");
var session = require("express-session");

var indexRouter = require("./routes/index");
var authRouter = require("./routes/auth");
var dashboardRouter = require("./routes/dashboard/index");
var dashboardArticleRouter = require("./routes/dashboard/article");
var dashboardCategoriesRouter = require("./routes/dashboard/categories");
var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", require("express-ejs-extend"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// setting flash
app.use(
  session({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 60 * 10 * 1000 } // 10分鐘
  })
);
app.use(flash());

// 確認是否有登入 check
const authCheck = function(req, res, next) {
  if (req.session.uid) {
    return next();
  } else {
    req.flash("messages", "請先登入");
    return res.redirect("/auth/signin");
  }
};

app.use("/", indexRouter);
app.use("/dashboard", dashboardRouter);
app.use("/dashboard/article", authCheck, dashboardArticleRouter);
app.use("/dashboard/categories", dashboardCategoriesRouter);
app.use("/auth", authRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
