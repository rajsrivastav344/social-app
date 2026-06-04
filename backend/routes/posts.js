const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const { protect } = require("../middleware/auth");
const { upload } = require("../middleware/upload");
const path = require("path");

// ─── GET /api/posts ───────────────────────────────────────────────────────────
// Get all posts (public feed) with pagination
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Fetch posts sorted by newest first
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // .lean() returns plain JS objects (faster)

    const totalPosts = await Post.countDocuments();

    res.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts,
      hasMore: skip + posts.length < totalPosts,
    });
  } catch (error) {
    console.error("Get posts error:", error.message);
    res.status(500).json({ message: "Server error fetching posts" });
  }
});

// ─── POST /api/posts ──────────────────────────────────────────────────────────
// Create a new post (requires auth + optional image upload)
router.post("/", protect, upload.single("image"), async (req, res) => {
  try {
    const { content } = req.body;
    let imageUrl = "";

    // If an image was uploaded, build its URL
    if (req.file) {
      // Local dev: serve from /uploads
      imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    }

    // Validate: need at least content or image
    if (!content && !imageUrl) {
      return res.status(400).json({ message: "Post must have text or an image" });
    }

    const post = await Post.create({
      userId: req.user._id,
      username: req.user.username,
      content: content || "",
      imageUrl,
      likes: [],
      likedBy: [],
      comments: [],
    });

    res.status(201).json(post);
  } catch (error) {
    console.error("Create post error:", error.message);
    res.status(500).json({ message: error.message || "Server error creating post" });
  }
});

// ─── PUT /api/posts/:id/like ──────────────────────────────────────────────────
// Toggle like on a post
router.put("/:id/like", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.user._id;
    const username = req.user.username;
    const alreadyLiked = post.likes.some((id) => id.toString() === userId.toString());

    if (alreadyLiked) {
      // Unlike: remove userId and username
      post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
      post.likedBy = post.likedBy.filter((u) => u !== username);
    } else {
      // Like: add userId and username
      post.likes.push(userId);
      post.likedBy.push(username);
    }

    await post.save();

    // Return updated like info only (lightweight response)
    res.json({
      likes: post.likes,
      likedBy: post.likedBy,
      likesCount: post.likes.length,
      isLiked: !alreadyLiked,
    });
  } catch (error) {
    console.error("Like error:", error.message);
    res.status(500).json({ message: "Server error toggling like" });
  }
});

// ─── POST /api/posts/:id/comment ─────────────────────────────────────────────
// Add a comment to a post
router.post("/:id/comment", protect, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Build new comment object
    const newComment = {
      userId: req.user._id,
      username: req.user.username,
      text: text.trim(),
    };

    post.comments.push(newComment);
    await post.save();

    // Return the newly added comment (last in array)
    const savedComment = post.comments[post.comments.length - 1];
    res.status(201).json({
      comment: savedComment,
      commentsCount: post.comments.length,
    });
  } catch (error) {
    console.error("Comment error:", error.message);
    res.status(500).json({ message: "Server error adding comment" });
  }
});

// ─── DELETE /api/posts/:id ────────────────────────────────────────────────────
// Delete own post
router.delete("/:id", protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Only post owner can delete
    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }

    await post.deleteOne();
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Delete post error:", error.message);
    res.status(500).json({ message: "Server error deleting post" });
  }
});

module.exports = router;
