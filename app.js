require("dotenv"). config();
const ejs = require("ejs");
const express = require("express");
const mongoose = require("mongoose");
const encrypt= require("mongoose-encryption");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.urlencoded({
  extended: true
}));

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://localhost:27017/userDB');
};

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(encrypt, { secret: process.env.SECRET , encryptedFields: ['password'] });

const User = mongoose.model('User', userSchema);



app.get("/", function(req, res) {
  res.render("home");
});

app.get("/login", function(req, res) {
  res.render("login", {errMsg:"", username:"", password:""});
});

app.get("/register", function(req, res) {
  res.render("register");
});

app.post("/register", function(req, res) {

  const newUser = new User({
    email: req.body.username,
    password: req.body.password
  });

  newUser.save(function(err) {
    if (!err) {
      res.render("secrets");
    }else{
      console.log(err);
    }
  });

});

app.post("/login", function(req, res){
  const username= req.body.username;
  const password= req.body.password;

  User.findOne({email: username}, function(err, foundUser){
    if(err){
      console.log(err);
    }else{
      if(foundUser){
        if(foundUser.password === password){
          res.render("secrets");
        } else{
          res.render("login", {errMsg: "Password is incorrect.", username: username, password: password});
        };
      }  else {
        res.render("login", {errMsg: "Email is incorrect.", username: username, password: password});
      }
    }
  });
});


app.listen(3000, function() {
  console.log("server running");
});
