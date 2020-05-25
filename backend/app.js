const path = require("path");
const express = require("express");
const parser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
const postsRoutes = require("./routes/posts")
const usersRoutes = require("./routes/users")

// mongoose.connect(`mongodb+srv://niki:${process.env.MONGO_ATLAS_PW}@practice0-tgzhu.mongodb.net/mean?retryWrites=true&w=majority`, {
mongoose.connect(`mongodb://heroku_kwhj51nq:6b9i68u4rqphre8vt8oi13tg1h@ds163698.mlab.com:63698/heroku_kwhj51nq`, {
    useNewUrlParser: true
  })
  .then(() => console.log("Connected to DB"))
  .catch(() => console.log("Couldn't connect to DB"))
//1k4Ie4aczcC7HZlC
app.use(parser.json());
app.use(parser.urlencoded({
  extended: false
}))
app.use("/images", express.static(path.join("images")))

app.use((request, response, next) => {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  response.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  next();
});

app.use("/api/posts", postsRoutes)
app.use("/api/users", usersRoutes)

module.exports = app;
