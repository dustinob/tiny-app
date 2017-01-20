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
  "exampleUser_id": {id: "exampleUser_id", email: "user@example.com", password: "passwordtemp"}
}

app.use( (request, response, next) => {
  response.locals.user = users[request.cookies.user_id]
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
  let shortUrl = generateRandomString();
  let longUrl = request.body.longUrl;
  urlDatabase[shortUrl] = longUrl;
  response.redirect("/urls");
});

//display all short and long urls on the main page.
app.get("/urls", (request, response) => {
  let templateVars = {
    urls: urlDatabase
  };
  response.render("urls_index", templateVars);

});

// render new url page
app.get("/urls/new", (request, response) => {
  response.render("urls_new");
});

//show page
app.get("/urls/:id", (request, response) => {
  let short = request.params.id;
  let long  = urlDatabase[short];
  let templateVars = {
    shortUrl: short,
    longUrl: long
  };
  response.render("urls_show", templateVars);
});

//testing if short urls work
app.get("/u/:shortUrl", (request, response) => {
  let shortUrl = request.params.shortUrl;
  let longUrl = urlDatabase[shortUrl];
  response.redirect(longUrl);
})

//delete urls from the list
app.post("/urls/:id/delete", (request, response) => {
  let shortUrl = request.params.id;
  delete urlDatabase[shortUrl];
  response.redirect("/urls");
})

//update urls
app.post("/urls/:id", (request, response) => {
  let shortUrl = request.params.id;
  let longUrl = request.body.longUrl;
  urlDatabase[shortUrl] = longUrl;
  response.redirect(`${shortUrl}`);
})

// Login request
app.post("/login", (request, response) => {
  response.cookie("user_id", user.user_id) //to do;
  response.redirect("/urls");
})

//Logout request
app.post("/logout", (request, response) => {
  response.clearCookie("user_id");
  response.redirect("/urls");
})

//Registration page
app.get("/register", (request, response) => {
  response.render("urls_register");
})

//Registration endpoint for data
app.post("/register", (request, response) => {

  let user_id   = generateRandomString();
  let email     = request.body.email;
  let password  = request.body.password;
    for (let item in users) {
      let value = users[item];
      if(email === value.email) {
        return response.sendStatus(400);
      }
    }
      let userInfo = {
        id: user_id,
        email: email,
        password: password
      }
        users[user_id] = userInfo;
        response.cookie("user_id", user_id);
        response.redirect("/");
});

//Login endpoint for get request
app.post("/login", (request, response) => {

  let user_id   = generateRandomString();
  let email     = request.body.email;
  let password  = request.body.password;
    for (let item in users) {
      let value = users[item];
      if(email === value.email) {
        return response.sendStatus(400);
      }
    }
      let userInfo = {
        id: user_id,
        email: email,
        password: password
      }
        users[user_id] = userInfo;
        response.cookie("user_id", user_id);
        response.redirect("/");
});


function generateRandomString() {
  var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var length = 6;
  var randomString = "";
  for (var i = length; i > 0; --i) {
    randomString += chars[Math.floor(Math.random() * chars.length)];
  }
  return randomString;
}