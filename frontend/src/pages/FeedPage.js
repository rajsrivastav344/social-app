import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Container, Box, Typography, CircularProgress, Button, Skeleton,
} from "@mui/material";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import { postsAPI } from "../utils/api";
import CreatePost from "../components/CreatePost";
import PostCard from "../components/PostCard";
import { toast } from "react-toastify";

const LIMIT = 10;

const FeedPage = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // Ref to prevent duplicate fetches
  const isFetching = useRef(false);

  // Fetch posts for a given page
  const fetchPosts = useCallback(async (pageNum, replace = false) => {
    if (isFetching.current) return;
    isFetching.current = true;
    setLoading(true);

    try {
      const { data } = await postsAPI.getFeed(pageNum, LIMIT);
      setPosts((prev) => (replace ? data.posts : [...prev, ...data.posts]));
      setHasMore(data.hasMore);
    } catch (error) {
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
      setInitialLoad(false);
      isFetching.current = false;
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchPosts(1, true);
  }, [fetchPosts]);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 300 &&
        hasMore &&
        !loading
      ) {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchPosts(nextPage);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, loading, page, fetchPosts]);

  // Prepend a new post to the top of the feed
  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  // Remove a deleted post
  const handlePostDeleted = (postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  // Refresh feed
  const handleRefresh = () => {
    setPage(1);
    setHasMore(true);
    fetchPosts(1, true);
  };

  // Loading skeletons for initial load
  const renderSkeletons = () =>
    Array(3)
      .fill(0)
      .map((_, i) => (
        <Box key={i} sx={{ mb: 2, borderRadius: 4, overflow: "hidden", bgcolor: "white", p: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
            <Skeleton variant="circular" width={42} height={42} />
            <Box>
              <Skeleton width={120} height={16} />
              <Skeleton width={80} height={12} />
            </Box>
          </Box>
          <Skeleton width="90%" height={16} />
          <Skeleton width="70%" height={16} sx={{ mt: 0.5 }} />
          <Skeleton variant="rectangular" height={200} sx={{ mt: 1.5, borderRadius: 2 }} />
        </Box>
      ));

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", py: 3 }}>
      <Container maxWidth="sm">
        {/* ── Page Header ── */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h6" fontWeight={700} color="text.primary">
            🌐 Social Feed
          </Typography>
          <Button
            size="small"
            startIcon={<RefreshRoundedIcon />}
            onClick={handleRefresh}
            disabled={loading}
            variant="outlined"
            sx={{ borderRadius: 6 }}
          >
            Refresh
          </Button>
        </Box>

        {/* ── Create Post Box ── */}
        <CreatePost onPostCreated={handlePostCreated} />

        {/* ── Posts Feed ── */}
        {initialLoad ? (
          renderSkeletons()
        ) : posts.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 8, color: "text.secondary" }}>
            <Typography variant="h6" mb={1}>
              No posts yet 🌱
            </Typography>
            <Typography variant="body2">
              Be the first to share something!
            </Typography>
          </Box>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onDelete={handlePostDeleted}
              />
            ))}

            {/* Load More Indicator */}
            {loading && (
              <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                <CircularProgress size={28} />
              </Box>
            )}

            {!hasMore && posts.length > 0 && (
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
                py={3}
              >
                🎉 You've seen all posts!
              </Typography>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default FeedPage;