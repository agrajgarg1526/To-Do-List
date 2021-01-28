const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");

const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

const itemSchema = new mongoose.Schema({
  name: String,
});

const Item = mongoose.model("Item", itemSchema);

app.get("/", function (req, res) {
  var options = {
    weekday: "long",
    month: "long",
    day: "numeric",
  };
  const today = new Date();
  const date = today.toLocaleDateString("en-US", options);

  Item.find({}, function (err, listItem) {
    if (listItem.length === 0) {
      const item1 = new Item({ name: "Welcome to my todolist" });
      const item2 = new Item({ name: "Add new item using + button" });
      const item3 = new Item({ name: "<-- Use this to delete item" });

      const items = [item1, item2, item3];

      Item.insertMany(items, function (err, listItem) {
        if (err) console.log(err);
      });
      res.redirect("/");
    } else {
      res.render("index", {
        todayDate: date,
        listItem: listItem,
      });
    }
  });
});

app.post("/", function (req, res) {
  if (req.body.input != "") {
    var item = new Item({ name: req.body.input });
    item.save(function (err) {
      if (err) console.log(err);
    });
  }

  res.redirect("/");
});

app.post("/clear", function (req, res) {
  Item.deleteMany({}, function (err) {
    if (err) console.log(err);
  });
  res.redirect("/");
});

app.post("/delete", function (req, res) {
  Item.findByIdAndDelete(req.body.id, function (err) {
    if (err) console.log(err);
  });
  res.redirect("/");
});


app.listen(3000, function () {
  console.log("Server Running at 3000 port");
});
