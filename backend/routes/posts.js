const express = require('express');
const router = express.Router();
const Post = require("../models/post");

router.post("", (request, response, next) => {
  const post = new Post({
    title: request.body.title,
    content: request.body.content
  })
  post.save().then(post => {
    response.status(201).json({
      message: "post added successfully",
      id: post._id
    })
  })
});

router.get("", (request, response, next) => {
  Post.find().then(posts => {
    // console.log(posts)
    response.status(200).json({
      message: "success",
      posts
    });
  })
});

router.get("/:id", (request, response, next) => {
  Post.findById(request.params.id).then(post => {
    if (post) {
      response.status(200).json(post)
    } else {
      response.status(404).json({
        message: "post not found"
      })
    }
  })
})

router.put("/:id", (request, response, next) => {
  const post = new Post({
    _id: request.body.id,
    title: request.body.title,
    content: request.body.content,
  });
  Post
    .updateOne({
      _id: request.params.id
    }, post)
    .then(res => {
      console.log(res)
      response.status(204).json({
        message: 'updated successfully'
      })
    })
})

router.delete("/:id", (request, response, next) => {
  // console.log(request.params.id)
  Post
    .deleteOne({
      _id: request.params.id
    })
    .then(res => {
      console.log(res)
      response.status(200).json({
        message: "deleted successfully"
      })
    })
    .catch(console.log)
})

module.exports = router;
