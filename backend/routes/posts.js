const express = require('express');
const router = express.Router();
const Post = require("../models/post");
const multer = require("multer")

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg'
}

const storage = multer.diskStorage({
  destination: (request, file, callback) => {
    const isValid = MIME_TYPE_MAP[file.mimetype]
    let error = new Error('Invalid mime type')
    if (isValid) {
      error = null;
    }
    callback(error, "backend/images")
  },
  filename: (request, file, callback) => {
    const name = file.originalname.toLowerCase().split(" ").join("-")
    const extension = MIME_TYPE_MAP[file.mimetype]
    callback(null, `${name}-${Date.now()}.${extension}`)
  }
})

router.post("", multer({
  storage
}).single('image'), (request, response, next) => {
  const url = `${request.protocol}://${request.get("host")}`
  const post = new Post({
    title: request.body.title,
    content: request.body.content,
    imagePath: `${url}/images/${request.file.filename}`
  })
  post.save().then(post => {
    response.status(201).json({
      message: "post added successfully",
      post: {
        ...post,
        id: post._id
      }
    })
  })
});

router.get("", (request, response, next) => {
  const pageSize = +request.query.pagesize;
  const currentPage = +request.query.page;
  const postQuery = Post.find();
  let posts;

  if (pageSize && currentPage) {
    postQuery
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize)
  }
  postQuery
  .then(fetchedPosts => {
      posts = fetchedPosts
      return Post.estimatedDocumentCount()
    })
    .then(count => {
      console.log(posts, count)
      response.status(200).json({
        message: "success",
        posts,
        count
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

router.put("/:id", multer({
  storage
}).single('image'), (request, response, next) => {
  let imagePath = request.body.imagePath;
  if (request.file) {
    const url = `${request.protocol}://${request.get("host")}`
    imagePath = `${url}/images/${request.file.filename}`
  }
  const post = new Post({
    _id: request.body.id,
    title: request.body.title,
    content: request.body.content,
    imagePath
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
