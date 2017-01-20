const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const cookieParser = require("cookie-parser");
app.use(cookieParser());

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");


let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

let users = {

}

app.use( (request, response, next) => {
  response.locals.userID = request.userID;
  response.locals.username = request.username;
  response.locals.email = request.email;
  response.locals.password = request.password;
  next();
});

// default Hello to test server is running on root "/"
app.get("/", (request, response) => {
  response.end("Hello!!");
});

//parse database to json object... i think
app.get("/urls.json", (request, response) => {
  response.json(urlDatabase);
});

//tell server to listen on PORT
app.listen(PORT, () => {
  console.log(`Express Server listening on port ${PORT}!`);
});

//take long url and add short url and enter them into the database
app.post("/urls", (request, response) => {
  let shortURL = generateRandomString();
  let longURL = request.body.longURL;
  urlDatabase[shortURL] = longURL;
  let templateVars = {  username: request.cookies["username"],
                        urls: urlDatabase}
  response.redirect("/urls");
});

//display all short and long urls on the main page.
app.get("/urls", (request, response) => {
  let templateVars = {  username: request.cookies["username"],
                        id: request.cookies["userID"],
                        urls: urlDatabase };
  // response.cookie("userID", userID);
  response.render("urls_index", templateVars);

});

// render new url page
app.get("/urls/new", (request, response) => {
  let templateVars = { username: request.cookies["username"] }
  response.render("urls_new", templateVars);
});

//show page
app.get("/urls/:id", (request, response) => {
  var short = request.params.id;
  var long = urlDatabase[short];
  response.cookie("userID", users[userID]);
  response.render("urls_show", templateVars);
});


//testing if short urls work
app.get("/u/:shortURL", (request, response) => {
  let shortURL = request.params.shortURL;
  let longURL = urlDatabase[shortURL];
  response.redirect(longURL);
})

//delete urls from the list
app.post("/urls/:id/delete", (request, response) => {
  let shortURL = request.params.id;
  delete urlDatabase[shortURL];
  response.redirect("/urls");
})

//update urls
app.post("/urls/:id", (request, response) => {
  let shortURL = request.params.id;
  let longURL = request.body.longURL;
  urlDatabase[shortURL] = longURL;
  response.redirect(`${shortURL}`);
})

// Login request
app.post("/login", (request, response) => {
  response.cookie("username", request.body.username);
  response.redirect("/urls");
})

//Logout request
app.post("/logout", (request, response) => {
  response.clearCookie("username");
  response.redirect("/urls");
})

//Registration page
app.get("/register", (request, response) => {
  let templateVars = { username: request.cookies["username"] };
  response.render("urls_register", templateVars);
})

//Registration endpoint for data
app.post("/register", (request, response) => {
  let userID  = generateRandomString();
  let email   = request.body.email;
  let password = request.body.password;

  let userInfo = {  id: userID,
                    email: email,
                    password: password};
  users[userID] = userInfo;
  response.cookie("userID", userID);
  console.log(userID);
  response.redirect("/urls");
})







function generateRandomString() {
  var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var length = 6;
  var randomString = "";
  for (var i = length; i > 0; --i) {
    randomString += chars[Math.floor(Math.random() * chars.length)];
  }
  return randomString;
}