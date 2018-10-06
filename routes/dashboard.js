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
  // 抓出firebase隨機產生的key, 存入本次新增的屬性內,作為索引值
  // 先新增一筆空資料, 抓出key
  const categoryRef = categoriesRef.push();
  const key = categoryRef.key;
  // 將key存入本次的資料物件內
  data.id = key;

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
