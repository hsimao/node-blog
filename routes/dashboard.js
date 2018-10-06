var express = require("express");
var router = express.Router();
var firebaseAdminDB = require("../firebase/admin");
const moment = require("moment");
const stringtags = require("striptags");

// data路徑
const categoriesRef = firebaseAdminDB.ref("/categories/");
const articlesRef = firebaseAdminDB.ref("/articles");

// 讀取單一文章頁面 show article
router.get("/article/:id", function(req, res) {
  const id = req.param("id");
  // console.log(id);
  let categories = {};
  categoriesRef
    .once("value")
    .then(val => {
      categories = val.val();
      return articlesRef.child(id).once("value");
    })
    .then(val => {
      res.render("dashboard/article", {
        title: "Express",
        categories: categories,
        article: val.val()
      });
    });
});

// 新增文章頁面 article create
router.get("/article/create", function(req, res) {
  categoriesRef.once("value", val => {
    res.render("dashboard/article", {
      title: "Express",
      categories: val.val()
    });
  });
});

// 新增文章頁面post  article create post
router.post("/article/create", function(req, res) {
  const data = req.body;
  const articleRef = articlesRef.push();
  data.id = articleRef.key;
  data.updateTime = Math.floor(Date.now() / 1000);

  articleRef.set(data).then(() => {
    res.redirect(`/dashboard/article/${data.id}`);
  });
});

// 更新文章 article/update post
router.post("/article/update/:id", function(req, res) {
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

// 文章列表
router.get("/archives", function(req, res) {
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
        articles.push(childVal.val());
      });
      console.log("屬性：", categories);
      articles.reverse(); // 文章資料排序反轉(最先創建文章在上方=>最後創建文章在上方)
      res.render("dashboard/archives", {
        title: "Express",
        articles,
        categories,
        stringtags,
        moment
      });
    });
});

// 取得文章分類 get post category
router.get("/categories", function(req, res, next) {
  const message = req.flash("info")[0];
  categoriesRef.once("value").then(val => {
    const categories = val.val();
    res.render("dashboard/categories", {
      title: "Express",
      categories,
      message
    });
  });
});

// 新增文章分類 create post category
router.post("/categories/create", function(req, res) {
  let pathRepeat = true;
  let nameRepeat = true;
  const data = req.body;

  function setCategory() {
    // 抓出firebase隨機產生的key, 存入本次新增的屬性內,作為索引值
    // 先新增一筆空資料, 抓出key
    const categoryRef = categoriesRef.push();
    const key = categoryRef.key;
    // 將key存入本次的資料物件內
    data.id = key;
    if (!pathRepeat && !nameRepeat) {
      categoryRef.set(data).then(() => {
        res.redirect("/dashboard/categories");
      });
    }
  }

  if (!data.path) {
    req.flash("info", "路徑不可為空");
    res.redirect("/dashboard/categories");
  } else {
    data.path = data.path.replace(/\s+/g, ""); // 去除所有空格
    // 判斷資料庫是否已有相同分類路徑
    categoriesRef
      .orderByChild("path") // orderByChild() => 搜尋特定欄位
      .equalTo(data.path) // equalTo() => 判斷是否相同
      .once("value", val => {
        if (val.val() !== null) {
          req.flash("info", "已有相同路徑");
          res.redirect("/dashboard/categories");
        } else {
          pathRepeat = false;
          setCategory();
        }
      });
  }
  if (!data.name) {
    req.flash("info", "名稱不可為空");
    res.redirect("/dashboard/categories");
  } else {
    data.name = data.name.replace(/^\s+|\s+$/g, ""); // 僅去除頭跟尾空格
    // 判斷資料庫是否已有相同分類名稱
    categoriesRef
      .orderByChild("name")
      .equalTo(data.name)
      .once("value", val => {
        if (val.val() !== null) {
          req.flash("info", "已有相同分類名稱");
          res.redirect("/dashboard/categories");
        } else {
          nameRepeat = false;
          setCategory();
        }
      });
  }
});

// 刪除文章分類 deleted post category
router.post("/categories/delete/:id", function(req, res) {
  //取得網址所帶的id參數
  const id = req.param("id");
  categoriesRef.child(id).remove();
  req.flash("info", "欄位已刪除");
  res.redirect("/dashboard/categories");
});

module.exports = router;
