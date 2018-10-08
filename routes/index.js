var express = require("express");
var router = express.Router();
var firebaseAdminDB = require("../firebase/admin");
const pagination = require("../modules/pagination");
const moment = require("moment");
const stringtags = require("striptags");

// data路徑
const categoriesRef = firebaseAdminDB.ref("/categories/");
const articlesRef = firebaseAdminDB.ref("/articles");
const usersRef = firebaseAdminDB.ref("/users");

// 文章列表
router.get("/", function(req, res) {
  let currentPage = Number.parseInt(req.query.page) || 1;
  let categories = {};
  let users = {};
  categoriesRef
    .once("value")
    .then(val => {
      categories = val.val();
      return usersRef.once("value");
    })
    .then(userVal => {
      users = userVal.val();
      // 取出文章資料，依updateTime排序
      return articlesRef.orderByChild("updateTime").once("value");
    })
    .then(articlesVal => {
      // 將文章物件資料轉成陣列
      let articles = [];
      articlesVal.forEach(childVal => {
        // 只顯示公開文章
        if ("public" === childVal.val().status) {
          articles.push(childVal.val());
        }
      });
      articles.reverse(); // 文章資料排序反轉(最先創建文章在上方=>最後創建文章在上方)

      const data = pagination(articles, currentPage);

      res.render("index", {
        title: "Express",
        articles: data.newData,
        page: data.page,
        categories,
        stringtags,
        moment,
        users
      });
    });
});

// 讀取單一文章頁面 show article
router.get("/post/:id", function(req, res) {
  const id = req.param("id");
  let categories = {};
  let article = {};
  categoriesRef
    .once("value")
    .then(val => {
      categories = val.val();
      return articlesRef.child(id).once("value");
    })
    .then(val => {
      article = val.val();
      return firebaseAdminDB.ref("/users/" + val.val().userId).once("value");
    })
    .then(val => {
      res.render("post", {
        categories: categories,
        author: val.val().nickname,
        article,
        moment
      });
    })
    .catch(error => {
      res.render("error", {
        title: '找不到該文章'
      });
    });
});

router.get("/post", function(req, res, next) {
  res.render("post", {
    title: "Express"
  });
});

router.get("/dashboard/signup", function(req, res, next) {
  res.render("dashboard/signup", {
    title: "Express"
  });
});

module.exports = router;
