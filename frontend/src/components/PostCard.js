import React, { useState } from "react";
import {
  Card, CardContent, CardActions, Box, Avatar, Typography,
  IconButton, Tooltip, TextField,  Collapse, Divider,
   Menu, MenuItem,
} from "@mui/material";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { format } from "timeago.js";
import { postsAPI } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const PostCard = ({ post, onDelete }) => {
  const { user } = useAuth();

  // Local state for optimistic UI updates
  const [likes, setLikes] = useState(post.likes || []);
  const [likedBy, setLikedBy] = useState(post.likedBy || []);
  const [comments, setComments] = useState(post.comments || []);
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  // Check if current user liked this post
  const isLiked = user && likes.includes(user._id);

  const getInitials = (username) =>
    username ? username.charAt(0).toUpperCase() : "U";

  // Toggle like with optimistic update
  const handleLike = async () => {
    if (!user || likeLoading) return;
    setLikeLoading(true);

    // Optimistic update
    if (isLiked) {
      setLikes((prev) => prev.filter((id) => id !== user._id));
      setLikedBy((prev) => prev.filter((u) => u !== user.username));
    } else {
      setLikes((prev) => [...prev, user._id]);
      setLikedBy((prev) => [...prev, user.username]);
    }

    try {
      await postsAPI.toggleLike(post._id);
    } catch (error) {
      // Revert on failure
      if (isLiked) {
        setLikes((prev) => [...prev, user._id]);
        setLikedBy((prev) => [...prev, user.username]);
      } else {
        setLikes((prev) => prev.filter((id) => id !== user._id));
        setLikedBy((prev) => prev.filter((u) => u !== user.username));
      }
      toast.error("Failed to update like");
    } finally {
      setLikeLoading(false);
    }
  };

  // Submit comment
  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || commentLoading) return;

    setCommentLoading(true);
    try {
      const { data } = await postsAPI.addComment(post._id, commentText.trim());
      setComments((prev) => [...prev, data.comment]);
      setCommentText("");
    } catch (error) {
      toast.error("Failed to add comment");
    } finally {
      setCommentLoading(false);
    }
  };

  // Delete post
  const handleDelete = async () => {
    setAnchorEl(null);
    try {
      await postsAPI.deletePost(post._id);
      onDelete(post._id);
      toast.success("Post deleted");
    } catch {
      toast.error("Failed to delete post");
    }
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent sx={{ pb: 1 }}>
        {/* ── Post Header ── */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
          <Avatar
            sx={{
              bgcolor: "primary.main",
              width: 42,
              height: 42,
              fontWeight: 700,
              mr: 1.5,
            }}
          >
            {getInitials(post.username)}
          </Avatar>

          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" fontWeight={700} lineHeight={1.2}>
              {post.username}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {format(post.createdAt)}
            </Typography>
          </Box>

          {/* More options (delete) — only for post owner */}
          {user && user._id === post.userId && (
            <>
              <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
                <MoreVertRoundedIcon fontSize="small" />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                PaperProps={{ sx: { borderRadius: 2 } }}
              >
                <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
                  <DeleteOutlineRoundedIcon sx={{ mr: 1, fontSize: 18 }} />
                  Delete Post
                </MenuItem>
              </Menu>
            </>
          )}
        </Box>

        {/* ── Post Content ── */}
        {post.content && (
          <Typography variant="body1" sx={{ mb: 1.5, lineHeight: 1.6, color: "text.primary" }}>
            {post.content}
          </Typography>
        )}

        {/* ── Post Image ── */}
        {post.imageUrl && (
          <Box sx={{ mb: 1.5, borderRadius: 3, overflow: "hidden" }}>
            <img
              src={post.imageUrl}
              alt="Post"
              style={{
                width: "100%",
                maxHeight: 400,
                objectFit: "cover",
                display: "block",
              }}
              loading="lazy"
            />
          </Box>
        )}

        {/* ── Likes count ── */}
        {likedBy.length > 0 && (
          <Tooltip title={likedBy.slice(0, 5).join(", ") + (likedBy.length > 5 ? "..." : "")} arrow>
            <Typography variant="caption" color="text.secondary" sx={{ cursor: "default" }}>
              ❤️ {likedBy.length === 1 ? likedBy[0] : `${likedBy[0]} and ${likedBy.length - 1} others`}
            </Typography>
          </Tooltip>
        )}
      </CardContent>

      {/* ── Action Buttons ── */}
      <Divider />
      <CardActions sx={{ px: 2, py: 0.5 }}>
        {/* Like Button */}
        <Box sx={{ display: "flex", alignItems: "center", mr: 1 }}>
          <IconButton
            onClick={handleLike}
            disabled={!user || likeLoading}
            size="small"
            sx={{ color: isLiked ? "error.main" : "text.secondary" }}
          >
            {isLiked ? (
              <FavoriteRoundedIcon fontSize="small" />
            ) : (
              <FavoriteBorderRoundedIcon fontSize="small" />
            )}
          </IconButton>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            {likes.length}
          </Typography>
        </Box>

        {/* Comment Toggle Button */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton
            onClick={() => setShowComments((prev) => !prev)}
            size="small"
            sx={{ color: showComments ? "primary.main" : "text.secondary" }}
          >
            <ChatBubbleOutlineRoundedIcon fontSize="small" />
          </IconButton>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            {comments.length}
          </Typography>
        </Box>
      </CardActions>

      {/* ── Comments Section ── */}
      <Collapse in={showComments}>
        <Divider />
        <Box sx={{ px: 2, py: 1.5, bgcolor: "grey.50" }}>
          {/* Existing Comments */}
          {comments.length === 0 ? (
            <Typography variant="caption" color="text.secondary">
              No comments yet. Be the first!
            </Typography>
          ) : (
            comments.map((comment) => (
              <Box
                key={comment._id}
                sx={{
                  display: "flex",
                  gap: 1,
                  mb: 1,
                  alignItems: "flex-start",
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: "secondary.main",
                    width: 28,
                    height: 28,
                    fontSize: 12,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {getInitials(comment.username)}
                </Avatar>
                <Box
                  sx={{
                    bgcolor: "white",
                    borderRadius: 2,
                    px: 1.5,
                    py: 0.75,
                    flex: 1,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography variant="caption" fontWeight={700} color="primary.main">
                    {comment.username}
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: 13, mt: 0.25 }}>
                    {comment.text}
                  </Typography>
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
                    {format(comment.createdAt)}
                  </Typography>
                </Box>
              </Box>
            ))
          )}

          {/* Add Comment Input */}
          {user && (
            <Box
              component="form"
              onSubmit={handleComment}
              sx={{ display: "flex", gap: 1, mt: 1.5, alignItems: "center" }}
            >
              <Avatar
                sx={{
                  bgcolor: "primary.main",
                  width: 28,
                  height: 28,
                  fontSize: 12,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {getInitials(user.username)}
              </Avatar>
              <TextField
                fullWidth
                size="small"
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                inputProps={{ maxLength: 500 }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 6,
                    fontSize: 13,
                    bgcolor: "white",
                  },
                }}
              />
              <IconButton
                type="submit"
                disabled={!commentText.trim() || commentLoading}
                color="primary"
                size="small"
              >
                <SendRoundedIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Box>
      </Collapse>
    </Card>
  );
};

export default PostCard;
