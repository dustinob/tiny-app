const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");


var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// default Hello to test server is running on root "/"
app.get("/", (req, res) => {
  res.end("Hello!!");
});

//parse database to json object... i think
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//tell server to listen on PORT
app.listen(PORT, () => {
  console.log(`Express Server listening on port ${PORT}!`);
});

//take long url and add short url and enter them into the database
app.post("/urls", (req, res) => {
  var shortURL = generateRandonString();
  var longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");
});

//display all short and long urls on the main page.
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// render new url page
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});


app.get("/urls/:id", (req, res) => {
  var short = req.params.id;
  var long = urlDatabase[short];
  let templateVars = { shortURL: short, longURL: long };
  res.render("urls_show", templateVars);
});



app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  res.redirect(longURL);
})

//delete urls from the list
app.post("/urls/:id/delete", (req,res) => {
  let shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
})



function generateRandonString() {
  var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var length = 6;
  var randomString = "";
  for (var i = length; i > 0; --i) {
    randomString += chars[Math.floor(Math.random() * chars.length)];
  }
  return randomString;
}