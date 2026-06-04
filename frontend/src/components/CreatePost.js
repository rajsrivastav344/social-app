import React, { useState, useRef } from "react";
import {
  Card, CardContent, Box, Avatar, TextField, Button,
  IconButton, Tooltip, CircularProgress, Typography, Chip,
} from "@mui/material";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { useAuth } from "../context/AuthContext";
import { postsAPI } from "../utils/api";
import { toast } from "react-toastify";

const CreatePost = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);        // File object
  const [preview, setPreview] = useState(null);    // Data URL for preview
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setImage(file);
    // Generate preview URL
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setImage(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Submit post
  const handleSubmit = async () => {
    if (!content.trim() && !image) {
      toast.warning("Add some text or an image to post");
      return;
    }

    setLoading(true);
    try {
      // Use FormData to support image upload
      const formData = new FormData();
      if (content.trim()) formData.append("content", content.trim());
      if (image) formData.append("image", image);

      const { data: newPost } = await postsAPI.createPost(formData);

      // Reset form
      setContent("");
      handleRemoveImage();
      onPostCreated(newPost); // Notify parent to prepend post
      toast.success("Post shared! 🎉");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (username) =>
    username ? username.charAt(0).toUpperCase() : "U";

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
          {/* Avatar */}
          <Avatar
            sx={{ bgcolor: "primary.main", width: 40, height: 40, fontWeight: 700 }}
          >
            {getInitials(user?.username)}
          </Avatar>

          {/* Input area */}
          <Box sx={{ flex: 1 }}>
            <TextField
              fullWidth
              multiline
              minRows={2}
              maxRows={6}
              placeholder={`What's on your mind, ${user?.username}?`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              variant="outlined"
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  bgcolor: "grey.50",
                  "& fieldset": { borderColor: "transparent" },
                  "&:hover fieldset": { borderColor: "primary.light" },
                  "&.Mui-focused fieldset": { borderColor: "primary.main" },
                },
              }}
              inputProps={{ maxLength: 1000 }}
            />

            {/* Character count */}
            {content.length > 800 && (
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                {1000 - content.length} remaining
              </Typography>
            )}

            {/* Image Preview */}
            {preview && (
              <Box sx={{ mt: 1.5, position: "relative", display: "inline-block" }}>
                <img
                  src={preview}
                  alt="Preview"
                  style={{
                    maxWidth: "100%",
                    maxHeight: 240,
                    borderRadius: 12,
                    objectFit: "cover",
                    display: "block",
                  }}
                />
                <IconButton
                  size="small"
                  onClick={handleRemoveImage}
                  sx={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    bgcolor: "rgba(0,0,0,0.6)",
                    color: "white",
                    "&:hover": { bgcolor: "rgba(0,0,0,0.8)" },
                  }}
                >
                  <CloseRoundedIcon fontSize="small" />
                </IconButton>
                <Chip
                  label={image?.name}
                  size="small"
                  sx={{ mt: 0.5, maxWidth: "100%", fontSize: 11 }}
                />
              </Box>
            )}

            {/* Action Row */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mt: 1.5,
              }}
            >
              {/* Image Upload Button */}
              <Tooltip title="Add Image">
                <span>
                  <IconButton
                    size="small"
                    onClick={() => fileInputRef.current?.click()}
                    color="primary"
                    disabled={loading}
                  >
                    <ImageRoundedIcon />
                  </IconButton>
                </span>
              </Tooltip>

              {/* Hidden file input */}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageChange}
                style={{ display: "none" }}
              />

              {/* Post Button */}
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading || (!content.trim() && !image)}
                endIcon={
                  loading ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <SendRoundedIcon />
                  )
                }
                size="small"
                sx={{ borderRadius: 6, px: 2.5 }}
              >
                {loading ? "Posting..." : "Post"}
              </Button>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CreatePost;
