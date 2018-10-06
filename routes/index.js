var express = require("express");
var router = express.Router();
var firebaseAdminDB = require("../firebase/admin");
const moment = require("moment");
const stringtags = require("striptags");

// data路徑
const categoriesRef = firebaseAdminDB.ref("/categories/");
const articlesRef = firebaseAdminDB.ref("/articles");

// 文章列表
router.get("/", function(req, res) {
  let categories = {};
  categoriesRef
    .once("value")
    .then(val => {
      categories = val.val();
      // 取出文章資料，依updateTime排序
      return articlesRef.orderByChild("updateTime").once("value");
    })
    .then(val => {
      // 將文章物件資料轉成陣列
      let articles = [];
      val.forEach(childVal => {
        // 只顯示公開文章
        if ("public" === childVal.val().status) {
          articles.push(childVal.val());
        }
      });
      articles.reverse(); // 文章資料排序反轉(最先創建文章在上方=>最後創建文章在上方)
      res.render("index", {
        title: "Express",
        articles,
        categories,
        stringtags,
        moment
      });
    });
});

// 讀取單一文章頁面 show article
router.get("/post/:id", function(req, res) {
  const id = req.param("id");
  let categories = {};
  categoriesRef
    .once("value")
    .then(val => {
      categories = val.val();
      return articlesRef.child(id).once("value");
    })
    .then(val => {
      res.render("post", {
        categories: categories,
        article: val.val(),
        moment
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
