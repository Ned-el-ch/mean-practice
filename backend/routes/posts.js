const express = require('express');
const router = express.Router();
const checkAuth = require("../middleware/check-auth")
const extractFile = require("../middleware/extract-file")
const PostsController = require("../controllers/posts")


router.post("", checkAuth, extractFile, PostsController.createPost);

router.get("", PostsController.getPosts);

router.get("/:id", PostsController.getPostById)

router.put("/:id", checkAuth, extractFile, PostsController.updatePost)

router.delete("/:id", checkAuth, PostsController.deletePost)

module.exports = router;
