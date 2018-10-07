var express = require("express");
var router = express.Router();
var firebaseAdminDB = require("../../firebase/admin");
require("dotenv").config();

// data路徑
const categoriesRef = firebaseAdminDB.ref("/categories/");

// 取得文章分類 get post category
router.get("/", function(req, res, next) {
  if (req.session.uid !== process.env.ADMIN_UID) {
    req.flash("messages", "非管理者，無法訪問此頁面");
    res.redirect("/dashboard");
  } else {
    const messages = req.flash("messages")[0];
    categoriesRef.once("value").then(val => {
      const categories = val.val();
      res.render("dashboard/categories", {
        title: "Express",
        categories,
        messages,
        auth: req.session.uid
      });
    });
  }
});

// 新增文章分類 create post category
router.post("/create", function(req, res) {
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
    req.flash("messages", "路徑不可為空");
    res.redirect("/dashboard/categories");
  } else {
    data.path = data.path.replace(/\s+/g, ""); // 去除所有空格
    // 判斷資料庫是否已有相同分類路徑
    categoriesRef
      .orderByChild("path") // orderByChild() => 搜尋特定欄位
      .equalTo(data.path) // equalTo() => 判斷是否相同
      .once("value", val => {
        if (val.val() !== null) {
          req.flash("messages", "已有相同路徑");
          res.redirect("/dashboard/categories");
        } else {
          pathRepeat = false;
          setCategory();
        }
      });
  }
  if (!data.name) {
    req.flash("messages", "名稱不可為空");
    res.redirect("/dashboard/categories");
  } else {
    data.name = data.name.replace(/^\s+|\s+$/g, ""); // 僅去除頭跟尾空格
    // 判斷資料庫是否已有相同分類名稱
    categoriesRef
      .orderByChild("name")
      .equalTo(data.name)
      .once("value", val => {
        if (val.val() !== null) {
          req.flash("messages", "已有相同分類名稱");
          res.redirect("/dashboard/categories");
        } else {
          nameRepeat = false;
          setCategory();
        }
      });
  }
});

// 刪除文章分類 deleted post category
router.post("/delete/:id", function(req, res) {
  //取得網址所帶的id參數
  const id = req.param("id");
  categoriesRef.child(id).remove();
  req.flash("messages", "欄位已刪除");
  res.redirect("/dashboard/categories");
});

module.exports = router;
