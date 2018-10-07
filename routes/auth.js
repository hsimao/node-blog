const express = require("express");
const firebaseClient = require("../firebase/client");
var firebaseAdmin = require("../firebase/admin");
const router = express.Router();
var fireAuth = firebaseClient.auth();

// 註冊頁面
router.get("/signup", (req, res) => {
  const messages = req.flash("messages")[0];
  res.render("dashboard/signup", {
    title: "註冊",
    messages,
    auth: req.session.uid
  });
});

// 信箱、密碼註冊
router.post("/signup", function(req, res) {
  var email = req.body.email;
  var password = req.body.password;
  var nickname = req.body.nickname;

  fireAuth
    .createUserWithEmailAndPassword(email, password)
    .then(value => {
      var userData = {
        email: email,
        nickname: nickname,
        uid: value.user.uid
      };
      req.session.uid = value.user.uid;
      firebaseAdmin.ref("/users/" + value.user.uid).set(userData);
      req.flash("messages", "註冊成功，目前已經登入");
      res.redirect("/dashboard");
    })
    .catch(error => {
      var errorMessage = "註冊失敗！";
      if (error.code == "auth/weak-password") errorMessage = "密碼至少要6個字以上。";
      if (error.code == "auth/invalid-email") errorMessage = "電子郵件地址格式錯誤。";
      if (error.code == "auth/email-already-in-use") errorMessage = "此信箱已經有人使用。";
      console.log(error);
      req.flash("messages", errorMessage);
      res.redirect("/auth/signup");
    });
});

// 登入頁面
router.get("/signin", function(req, res) {
  const auth = req.session.uid;

  const messages = req.flash("messages")[0];
  console.log(messages);
  res.render("dashboard/signin", {
    title: "登入",
    messages,
    auth
  });
});

router.post("/signin", (req, res) => {
  fireAuth
    .signInWithEmailAndPassword(req.body.email, req.body.password)
    .then(val => {
      req.session.uid = val.user.uid;
      res.redirect("/dashboard");
    })
    .catch(error => {
      let errorMessage = "登入失敗。";
      if (error.code === "auth/invalid-email") errorMessage = "信箱格式錯誤。";
      if (error.code === "auth/wrong-password") errorMessage = "密碼錯誤。";
      if (error.code === "auth/user-not-found") errorMessage = "查無此帳號。";
      console.log(error);
      req.flash("error", errorMessage);
      res.redirect("/auth/signin");
    });
});

// 登出
router.get("/signout", (req, res) => {
  req.session.uid = "";
  res.redirect("/dashboard");
});

module.exports = router;
