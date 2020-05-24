const Post = require("../models/post");

exports.createPost = (request, response, next) => {
  const url = `${request.protocol}://${request.get("host")}`
  const post = new Post({
    title: request.body.title,
    content: request.body.content,
    imagePath: `${url}/images/${request.file.filename}`,
    creator: request.userData.userId
  })
  post.save()
    .then(post => {
      response.status(201).json({
        message: "post added successfully",
        post: {
          ...post,
          id: post._id
        }
      })
    })
    .catch(() => {
      response.status(500).json({
        message: "Failed to create post"
      })
    })
}

exports.getPosts = (request, response, next) => {
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
      response.status(200).json({
        message: "success",
        posts,
        count
      });
    })
    .catch(() => {
      response.status(500).json({
        message: "Fetching posts failed"
      })
    })
}

exports.getPostById = (request, response, next) => {
  Post.findById(request.params.id)
    .then(post => {
      if (post) {
        response.status(200).json(post)
      } else {
        response.status(404).json({
          message: "post not found"
        })
      }
    })
    .catch(() => {
      response.status(404).json({
        message: "Failed to find post"
      })
    })
}

exports.updatePost = (request, response, next) => {
  let imagePath = request.body.imagePath;
  if (request.file) {
    const url = `${request.protocol}://${request.get("host")}`
    imagePath = `${url}/images/${request.file.filename}`
  }
  const post = new Post({
    _id: request.body.id,
    title: request.body.title,
    content: request.body.content,
    imagePath,
  });
  Post
    .updateOne({
      _id: request.params.id,
      creator: request.userData.userId
    }, post)
    .then(res => {
      if (res.nModified > 0) {
        response.status(204).json({
          message: 'updated successfully'
        })
      } else {
        response.status(401).json({
          message: 'Auth Failed'
        })
      }
    })
    .catch(() => {
      response.status(500).json({
        message: "Failed to update post"
      })
    })
}

exports.deletePost = (request, response, next) => {
  Post
    .deleteOne({
      _id: request.params.id,
      creator: request.userData.userId
    })
    .then(res => {
      console.log(res)
      if (res.deletedCount > 0) {
        response.status(204).json({
          message: 'deleted successfully'
        })
      } else {
        response.status(401).json({
          message: 'Auth Failed'
        })
      }
    })
    .catch(() => {
      response.status(500).json({
        message: "Failed to delete post"
      })
    })
}
