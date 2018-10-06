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

router.get("/categories", function(req, res, next) {
  categoriesRef.once("value").then(val => {
    const categories = val.val();
    res.render("dashboard/categories", {
      title: "Express",
      categories
    });
  });
});

// 新增分類
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

module.exports = router;
