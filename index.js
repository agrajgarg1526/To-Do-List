const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

let items = ["One", "Two", "Three"];

app.get("/", function (req, res) {
  var options = {
    weekday: "long",
    month: "long",
    day: "numeric",
  };
  const today = new Date();
  const date = today.toLocaleDateString("en-US", options);
  res.render("index", { todayDate: date, listItem: items });
});

app.post("/", function (req, res) {
  if (req.body.input != "") {
    items.push(req.body.input);
  }
  if (req.body.clear === "clear") {
    items = [];
  }
  res.redirect("/");
});

app.listen(3000, function () {
  console.log("Server Running at 3000 port");
});
