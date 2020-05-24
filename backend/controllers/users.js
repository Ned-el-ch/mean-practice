const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

exports.createUser = (request, response, next) => {
  bcrypt.hash(request.body.password, 10).then((hash) => {
    const user = new User({
      email: request.body.email,
      password: hash,
    });
    user
      .save()
      .then((result) => {
        response.status(201).json({
          message: "User created",
          result,
        });
      })
      .catch(() => {
        response.status(500).json({
          message: "Invalid auth credentials."
        });
      });
  });
}

exports.loginUser = (request, response, next) => {
  let fetchedUser;
  User.findOne({
      email: request.body.email,
    })
    .then((user) => {
      if (!user) {
        return response.status(401).json({
          message: "Auth Failed",
        });
      }
      fetchedUser = user;
      return bcrypt.compare(request.body.password, user.password);
    })
    .then((res) => {
      if (!res) {
        return response.status(401).json({
          message: "Invalid auth credentials."
        });
      }
      const token = jwt.sign({
          email: fetchedUser.email,
          userId: fetchedUser._id
        },
        "ahaaaahaREEEEASD12e@#E", {
          expiresIn: 3600
        }
      );
      response.status(200).json({
        token,
        expiresIn: 3600,
        userId: fetchedUser._id
      });
    })
    .catch((error) => {
      response.status(401).json({
        message: "Invalid auth credentials.",
        error,
      });
    });
}
