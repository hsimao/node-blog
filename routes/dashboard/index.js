var express = require("express");
var router = express.Router();

router.get("/", (req, res) => {
  const auth = req.session.uid;
  const messages = req.flash("messages")[0];
  res.render("dashboard/index", {
    auth,
    messages
  });
});

module.exports = router;
