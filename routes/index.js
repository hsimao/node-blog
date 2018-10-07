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

      // == 分頁邏輯開始
      // 資料數量
      const totalResult = articles.length;
      // 每頁呈現數量
      const perpage = 3;
      // 總頁數
      const pageTotal = Math.ceil(totalResult / perpage);
      // 當前頁數
      let currentPage = Number.parseInt(req.query.page) || 1;
      if (currentPage < 1) currentPage = 1;
      if (currentPage > pageTotal) currentPage = pageTotal;

      // 當下頁面需呈現資料位置換算
      // 該頁資料起始位置
      const minItem = currentPage * perpage - perpage + 1;
      // 該頁資料結束位置
      const maxItem = currentPage * perpage;
      // console.log(
      //   `總資料筆數:${totalResult}, 每頁呈現數量:${perpage}, 總頁數:${pageTotal}, 當前頁數:${currentPage}, 當前頁面第一筆:${minItem}, 當前頁面最後一筆${maxItem}`
      // );

      // 依據分頁條件印出資料
      let newArticles = [];
      articles.forEach((item, index) => {
        let itemNum = index + 1;
        if (itemNum >= minItem && itemNum <= maxItem) {
          newArticles.push(item);
        }
      });
      const page = {
        pageTotal,
        currentPage
      };
      // == 分頁邏輯結束

      res.render("index", {
        title: "Express",
        articles: newArticles,
        categories,
        page,
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
