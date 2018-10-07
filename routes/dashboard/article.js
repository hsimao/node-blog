var express = require("express");
var router = express.Router();
var firebaseAdminDB = require("../../firebase/admin");
const pagination = require("../../modules/pagination");
const moment = require("moment");
const stringtags = require("striptags");
require("dotenv").config();

// data路徑
const categoriesRef = firebaseAdminDB.ref("/categories/");
const articlesRef = firebaseAdminDB.ref("/articles");

// 文章列表
router.get("/", function(req, res) {
  // 抓取當前文章狀態 /dashboard/archives?status=public
  const status = req.query.status || "public";
  let currentPage = Number.parseInt(req.query.page) || 1;
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
        if (status === childVal.val().status) {
          articles.push(childVal.val());
        }
      });
      articles.reverse(); // 文章資料排序反轉(最先創建文章在上方=>最後創建文章在上方)

      const data = pagination(articles, currentPage);
      res.render("dashboard/archives", {
        title: "Express",
        articles: data.newData,
        page: data.page,
        categories,
        stringtags,
        moment,
        status,
        auth: req.session.uid
      });
    });
});

// 新增文章頁面 article create
router.get("/create", function(req, res) {
  categoriesRef.once("value", val => {
    res.render("dashboard/article", {
      title: "Express",
      categories: val.val(),
      auth: req.session.uid
    });
  });
});

// 新增文章頁面post  article create post
router.post("/create", function(req, res) {
  const data = req.body;
  const articleRef = articlesRef.push();
  data.id = articleRef.key;
  data.userId = req.session.uid;
  data.updateTime = Math.floor(Date.now() / 1000);

  articleRef.set(data).then(() => {
    res.redirect(`/dashboard/article/${data.id}`);
  });
});

// 更新文章 article/update post
router.post("/update/:id", function(req, res) {
  const data = req.body;
  const id = req.param("id").replace(/^\s+|\s+$/g, "");
  data.lastUpdateTime = Math.floor(Date.now() / 1000);
  articlesRef
    .child(id)
    .update(data)
    .then(() => {
      res.redirect(`/dashboard/article/${id}`);
    });
});

// 刪除文章 deleted article
router.post("/delete/:id", function(req, res) {
  // 取得網址所帶的id參數
  const id = req.param("id");
  articlesRef.child(id).remove();
  req.flash("messages", "文章已刪除");
  // 使用ajax的話可改用res.end()來取代redirect重新導向
  res.send("文章已刪除");
  res.end();
  // res.redirect("/dashboard/categories");
});

// 讀取單一文章頁面 show article
router.get("/:id", function(req, res) {
  const id = req.param("id");
  let categories = {};
  categoriesRef
    .once("value")
    .then(val => {
      categories = val.val();
      return articlesRef.child(id).once("value");
    })
    .then(val => {
      // 判斷是否是作者
      if (val.val().userId !== req.session.uid) {
        req.flash("messages", "非文章作者，無法訪問此頁面");
        res.redirect("/dashboard");
      }
      res.render("dashboard/article", {
        title: "Express",
        categories: categories,
        article: val.val(),
        auth: req.session.uid
      });
    });
});

module.exports = router;
