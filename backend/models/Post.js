const mongoose = require("mongoose");

// ─── Comment Sub-Schema ───────────────────────────────────────────────────────
const commentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: [true, "Comment text is required"],
      maxlength: [500, "Comment cannot exceed 500 characters"],
    },
  },
  { timestamps: true }
);

// ─── Post Schema ──────────────────────────────────────────────────────────────
// Only ONE collection for posts: "posts"
const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    // Text content (optional if image is provided)
    content: {
      type: String,
      maxlength: [1000, "Post content cannot exceed 1000 characters"],
      default: "",
    },
    // Image URL (optional if content is provided)
    imageUrl: {
      type: String,
      default: "",
    },
    // Array of userIds who liked the post
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // Array of usernames who liked (for quick display)
    likedBy: [
      {
        type: String,
      },
    ],
    // Embedded comments array
    comments: [commentSchema],
  },
  { timestamps: true }
);

// Validate: at least content OR imageUrl must be present
postSchema.pre("save", function (next) {
  if (!this.content && !this.imageUrl) {
    return next(new Error("Post must have either text content or an image."));
  }
  next();
});

module.exports = mongoose.model("Post", postSchema);
