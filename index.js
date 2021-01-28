const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require('lodash');

const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

const options = {
  weekday: "long",
  month: "long",
  day: "numeric",
};
const today = new Date();
const date = today.toLocaleDateString("en-US", options);

const itemSchema = new mongoose.Schema({
  name: String,
});

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema],
});

const Item = mongoose.model("Item", itemSchema);
const List = mongoose.model("List", listSchema);

const item1 = new Item({ name: "Welcome to my todolist" });
const item2 = new Item({ name: "Add new item using + button" });
const item3 = new Item({ name: "<-- Use this to delete item" });

const items = [item1, item2, item3];

app.get("/", function (req, res) {
  Item.find({}, function (err, listItem) {

    res.render("index", {
      listTitle: date,
      listItem: listItem,
    });
  });
});

app.get("/:listName", function (req, res) {
  const listName = _.capitalize(req.params.listName);;
  List.findOne({ name: listName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: listName,
          items: items,
        });

        list.save();
        setTimeout(function () {
          res.redirect("/" + listName);
        }, 2000);
      } else {
        List.findOne({ name: listName }, function (err, foundList) {
          console.log(foundList.length);
          if (foundList.length === 0) {
            foundList.items = items;
            foundList.save();
          }
        });
        res.render("index", {
          listTitle: foundList.name,
          listItem: foundList.items,
        });
      }
    }
  });
});

app.post("/", function (req, res) {
  const route = req.body.submit;

  var item = new Item({ name: req.body.input });

  if (route === date) {
    if (req.body.input != "") {
      item.save(function (err) {
        if (err) console.log(err);
      });
    }

    res.redirect("/");
  } else {
    List.findOne({ name: route }, function (err, foundList) {
      if (req.body.input != "") {
        foundList.items.push(item);
        foundList.save();
      }
      res.redirect("/" + route);
    });
  }
});

app.post("/clear", function (req, res) {
  const route = req.body.clear;

  if (route === date) {
    Item.deleteMany({}, function (err) {
      if (err) console.log(err);
    });
    res.redirect("/");
  }

  else {
    List.findOne({ name: route }, function (err, foundList) {
      foundList.items = items;
      foundList.save();
    });
    res.redirect("/" + route);
  }
});

app.post("/delete", function (req, res) {
  // console.log(req.body);
  const route = req.body.list;
  // console.log(route);
  // console.log(date);

  if (route === date) {
    Item.findByIdAndDelete(req.body.id, function (err) {
      if (err) console.log(err);
    });
    res.redirect("/");
  }
  else {
    // console.log(List);
    List.findOneAndUpdate({ name: route }, { $pull: { items: { _id: req.body.id } } }, function (err) {
      if (err) console.log(err);
      else {
        res.redirect("/" + route)
      }
    });
  }
});

app.listen(3000, function () {
  console.log("Server Running at 3000 port");
});
