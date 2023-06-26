//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.set('strictQuery', true);
mongoose.connect(process.env.DB_URL);

const itemsSchema = {
    sr_no: Number,
    shortUrl: String,
    longUrl: String
};

const Item = mongoose.model("Item", itemsSchema);

app.get("/", function(req, res){
    res.render("home", {shortURL: ""});
});

app.get("/:shortUrlEnter", function(req, res){
    const shortUrlEnter = req.params.shortUrlEnter;
    console.log(shortUrlEnter);
    var id = 0;
  
    //A simple base conversion logic
    for (let i = 0; i < shortUrlEnter.length; i++) {
        if ('a' <= shortUrlEnter[i] && shortUrlEnter[i] <= 'z') {
            let temp = shortUrlEnter[i];
            let num = temp.charCodeAt(0);
            id = id*62 + num - 97;
        }
        if ('A' <=shortUrlEnter[i] && shortUrlEnter[i] <= 'Z') {
            let temp = shortUrlEnter[i];
            let num = temp.charCodeAt(0);
            id = id*62 + num - 65 + 26;
        }
        if ('0' <=shortUrlEnter[i] && shortUrlEnter[i] <= '9') {
            let temp = shortUrlEnter[i];
            let num = temp.charCodeAt(0);
            id = id*62 + num - 48 + 52;
        }
    }
    // find the entry in the database to the corresponding I'D
    Item.findOne({sr_no: id})
        .then(function(entry){
            // if the entry does not exist, then redirect to the home page
            if(!entry) {
                res.redirect("/");
            }
            else {
                // else redirect to the longURL saved in my database
                longurl = entry.longUrl;
                res.redirect(longurl);
            }
        })
        .catch(function(err){
            console.log(err);
        });
});

app.post("/", function(req, res){
    const url_enter = req.body.longUrlEntered;
    console.log(url_enter);

    Item.findOne({longUrl: url_enter})
        .then(function(entry){
            if(entry) {
                // if there is entry already, then just return the short url
                var short = entry.shortUrl;
                res.render("home", {shortURL: short});
            } else {
                // create the short url of it, and then save the new entry into the database
                Item.countDocuments().then(function(count){
                    var n = count + 1;
                    var temp_n = count + 1;
                    console.log(n);
                    var shorturl = '';
                    // Convert given integer id to a base 62 number
                    while (n > 0) {
                        shorturl += (characters[n % 62]);
                        n = Math.floor(n / 62);
                    }
                    var short_rev = shorturl.split('').reverse().join('');
                    var final_short = 'http://localhost:3000/' + short_rev;
                    console.log(final_short);
            
                    const newItem = new Item({
                        sr_no: temp_n,
                        shortUrl: final_short,
                        longUrl: url_enter
                    });
                    newItem.save();
                    res.render("home", {shortURL: final_short});
                })
            }
        })
        .catch(function(err){
            console.log(err);
        });
})

app.listen(3000, function() {
  console.log("Server started on port 3000");
});


// const item1 = new Item({
//     sr_no: 1,
//     shortUrl: "sjdkoasj",
//     longUrl: "leetcode"
// });

// const item2 = new Item({
//     sr_no: 2,
//     shortUrl: "uweuwui",
//     longUrl: "mongo"
// });

// const item3 = new Item({
//     sr_no: 3,
//     shortUrl: "xncmncn",
//     longUrl: "codechef"
// });

// const item4 = new Item({
//     sr_no: 4,
//     shortUrl: "sachin",
//     longUrl: "codechef"
// });

// const defaultItems = [item1, item2, item3, item4];