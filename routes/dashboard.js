var express = require("express");
var router = express.Router();
var firebaseAdminDB = require("../firebase/admin");

// 分類data路徑
const categoriesRef = firebaseAdminDB.ref("/categories/");

router.get("/article", function(req, res, next) {
  res.render("dashboard/article", {
    title: "Express"
  });
});

router.get("/archives", function(req, res, next) {
  res.render("dashboard/archives", {
    title: "Express"
  });
});

// 取得文章分類 get post category
router.get("/categories", function(req, res, next) {
  categoriesRef.once("value").then(val => {
    const categories = val.val();
    res.render("dashboard/categories", {
      title: "Express",
      categories
    });
  });
});

// 新增文章分類 create post category
router.post("/categories/create", function(req, res) {
  const data = req.body;
  // 抓出firebase隨機產生的key, 存入本次新增的屬性內,作為索引值
  // 先新增一筆空資料, 抓出key
  const categoryRef = categoriesRef.push();
  const key = categoryRef.key;
  // 將key存入本次的資料物件內
  data.id = key;
  // 將資料存入
  categoryRef.set(data).then(() => {
    res.redirect("/dashboard/categories");
  });
});

// 刪除文章分類 deleted post category
router.post("/categories/delete/:id", function(req, res) {
  const id = req.param("id"); //取得網址所帶的id參數
  categoriesRef.child(id).remove();
  res.redirect("/dashboard/categories");
});

module.exports = router;
