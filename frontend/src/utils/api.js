import axios from "axios";

// Base API URL from environment variable
const BASE_URL = "https://social-app-8kot.onrender.com/api";

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authAPI = {
  signup: (data) => axios.post(`${BASE_URL}/auth/signup`, data),
  login: (data) => axios.post(`${BASE_URL}/auth/login`, data),
  getMe: () => axios.get(`${BASE_URL}/auth/me`),
};

// ─── Posts API ────────────────────────────────────────────────────────────────
export const postsAPI = {
  // Get paginated feed
  getFeed: (page = 1, limit = 10) =>
    axios.get(`${BASE_URL}/posts?page=${page}&limit=${limit}`),

  // Create a post (FormData for image support)
  createPost: (formData) =>
    axios.post(`${BASE_URL}/posts`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  // Toggle like
  toggleLike: (postId) => axios.put(`${BASE_URL}/posts/${postId}/like`),

  // Add comment
  addComment: (postId, text) =>
    axios.post(`${BASE_URL}/posts/${postId}/comment`, { text }),

  // Delete post
  deletePost: (postId) => axios.delete(`${BASE_URL}/posts/${postId}`),
};