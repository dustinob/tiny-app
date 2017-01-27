const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const cookieSession = require("cookie-session");
app.use(cookieSession( {
  name: 'session',
  keys: ['secret'],
  maxAge: 24 * 60 * 60 * 1000
}));

const bcrypt = require("bcrypt");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

// Url Database
let urlDatabase = {
  "b2xVn2": {
    shortUrl: "b2xVn2",
    longUrl: "http://www.lighthouselabs.ca",
    createdBy: "3f5f3s" }
}

//User Database
let users = {
  "3f5f3s": {
    id: "3f5f3s",
    email: "user@example.com",
    password: "password" }
}

app.use((request, response, next) => {
  request.logged_in = request.session.user_id;
  response.locals.user = users[request.session.user_id]
  next();
});

app.get('/urls.json', (req, res) => {
   res.json(urlDatabase);
});

app.get("/", (request, response) => {
  if(response.locals.user) {
    response.redirect("/urls");
    return;
  }
  response.redirect("/login");
});

//take long url and add short url and enter them into the database
app.post("/urls", (request, response) => {
  if (request.logged_in) {
    let shortUrl = generateRandomString();
    let longUrl = request.body.longUrl;
    let createdBy = request.session.user_id;
    urlDatabase[shortUrl] = {
      shortUrl: shortUrl,
      longUrl: longUrl,
      createdBy: createdBy};
    response.redirect("/urls");
  }
  else {
    response.status(401).send("Please <a href='/login'>Login Here</a>");
  }
});

//display all short and long urls on the main page.
app.get("/urls", (request, response) => {
  if (response.locals.user) {
    const filteredDatabase = {};

    for(let url in urlDatabase) {
      if (response.locals.user.id === urlDatabase[url].createdBy) {
        filteredDatabase[url] = urlDatabase[url];
      }
    }
    let templateVars = {
      urls: filteredDatabase
    }
    response.render("urls_index", templateVars);
  }
  else {
    response.status(401).send("Please <a href='/login'>Login Here</a>");
  }
});

// render new url page
app.get("/urls/new", (request, response) => {
  if (response.locals.user) {
    response.render("urls_new");
  }
  else {
    response.status(401).send("Please <a href='/login'>Login Here</a>");
  }
});

//show page
app.get("/urls/:id", (request, response) => {

  let short = request.params.id;
  if(!urlDatabase[short]) {
    response.status(404).send("Short Url not found");
    return;
  }
  if (!response.locals.user) {
    response.status(401).send("Please <a href='/login'>Login Here</a>");
    return;
  }
  if(response.locals.user.id !== urlDatabase[request.params.id].createdBy) {
    response.status(403).send("This is not yours!");
  }
  let long  = urlDatabase[short].longUrl;
  let templateVars = {
    shortUrl: short,
    longUrl: long
  };
  response.render("urls_show", templateVars);
});


app.get("/u/:shortUrl", (request, response) => {

  let shortUrl = request.params.shortUrl;
  if(!urlDatabase[shortUrl]) {
    response.status(404).send("URL doesn not exist");
  }
  let longUrl = urlDatabase[shortUrl].longUrl;
  response.redirect(longUrl);
});

//delete urls from the list
app.post("/urls/:id/delete", (request, response) => {
  let shortUrl = request.params.id;
  delete urlDatabase[shortUrl];
  response.redirect("/urls");
})

//update urls
app.post("/urls/:id", (request, response) => {
  let shortUrl = request.params.id;
  if(!urlDatabase[shortUrl]) {
    response.status(404).send("Short Url not found");
    return;
  }
  if (!response.locals.user) {
    response.status(401).send("Please <a href='/login'>Login Here</a>");
    return;
  }
  if(response.locals.user.id !== urlDatabase[request.params.id].createdBy) {
    response.status(403).send("This is not yours!");
    return;
  }


  let longUrl = request.body.longUrl;
  urlDatabase[shortUrl].longUrl = longUrl;
  response.redirect(`/urls/${shortUrl}`);
})

///login get
app.get("/login", (request, response) => {
  if(!response.locals.user) {
    response.render("urls_login");
    return;
  }
  response.redirect("/urls");
})

// Login request
app.post("/login", (request, response) => {
  let email     = request.body.email;
  let password  = request.body.password;

  if(email === "" || password === "") {
    response.status(401).send("Use your fingers to enter something");
    return;
  }
    for (let user_id in users) {
      let user = users[user_id];
      let hashed_password = bcrypt.compareSync(password, users[user_id].password);
      if (email === user.email) {

        if (!hashed_password) {
          // found email, but bad password
          response.send(403, "Found email, but bad password");
          return;
        } else {
          // found email, and good password!  hooray!
          request.session.user_id = user_id;
          response.redirect("/");
          return;
        }
      }
    }

});

//Logout request
app.post("/logout", (request, response) => {
  request.session.user_id = null;
  response.redirect("/");
})

//Registration page
app.get("/register", (request, response) => {
   if(!response.locals.user) {
    response.render("urls_register");
    return;
  }
  response.redirect("/");
})

//Registration endpoint for data
app.post("/register", (request, response) => {
  let email = request.body.email;
  let password = request.body.password;
  let hashed_password = bcrypt.hashSync(password, 10);

  if (email === "" || password === "") {
    response.status(400).send("Use your fingers to enter something");
    return;
  }
    for (let item in users) {
      let value = users[item];
      if(email === value.email) {
        response.status(400).send("Email taken! Try again!");
      }
    }

  let user_id   = generateRandomString();
  let userInfo = {
    id: user_id,
    email: email,
    password: hashed_password
  }
  users[user_id] = userInfo;
  request.session.user_id = user_id;
  response.redirect("/urls");
});

//
function generateRandomString() {
  var chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var length = 6;
  var randomString = "";
  for (var i = length; i > 0; --i) {
    randomString += chars[Math.floor(Math.random() * chars.length)];
  }
  return randomString;
}

//tell server to listen on PORT
app.listen(PORT, () => {
  console.log(`Express Server listening on port ${PORT}!`);
});





