//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const _ = require('lodash');
const multer = require("multer");
const fs = require('fs');

mongoose.set("strictQuery", false);
mongoose.connect(process.env.DAILY_JOURNAL_DB, {useNewURLParser: true});

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json())
app.use(express.static("public"));

const postsSchema = new mongoose.Schema({
  title: String,
  date: String,
  body: String,
  imageLink: String,
  imagePath: Buffer
});

const Post = mongoose.model("Post", postsSchema);

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});

var upload = multer({
  storage: storage,
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|jpeg|svg|gif)$/)) {
      cb(alert('Please upload an image.'));
    }
    cb(undefined, true);
  }
});

app.use(express.static(__dirname + '/public'));
app.use('/uploads', express.static('uploads'));

app.get("/", function(req, res) {
  Post.find(function (err, posts){
  if(err){
    console.log(err);
  }
  else{
    res.render('home', {
      initalContent: homeStartingContent,
      posts: posts
    });
  };
});
});

app.get("/about", function(req, res) {
  res.render('about', {
    initalContent: aboutContent
  });
});

app.get("/contact", function(req, res) {
  res.render('contact', {
    initalContent: contactContent
  });
});

app.get("/compose", function(req, res) {
  res.render('compose');
});

app.get("/posts/:id", function(req, res) {
  Post.findById(req.params.id, function (err, post) {
    if (err){
        console.log(err);
    }
    else{
      res.render('post', {
        title: post.title,
        content: post.body,
        imagePath: post.imagePath.toString('base64'),
        imageLink: post.imageLink,
        date: post.date
      });
    }
});
});

app.post("/delete", function(req, res){
  console.log(req.body);
  checkedItemIds = req.body.checkbox;

  Post.deleteMany({_id: {$in: checkedItemIds}},function(err, result) {
      if (!err) {
        console.log("Item deleted successfully!");
        res.redirect("/");
      }
});
});

app.post("/compose", upload.single('postImgPath'), function(req, res) {
  console.log(req.file);
  newPost = new Post({
    title: req.body.postTitle,
    body: req.body.postContent,
    imagePath: ((req.file===undefined || req.file.path==="") ? "" : fs.readFileSync(__dirname+"/"+req.file.path)),
    imageLink: ((req.body.postImgLink===undefined || req.body.postImgLink==="") ? "" : req.body.postImgLink),
    date: new Date().toLocaleDateString('en-US', {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    })
  });

  newPost.save();
  res.redirect("/");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
