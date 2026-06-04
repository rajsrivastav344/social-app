import React, { useState } from "react";
import {
  AppBar, Toolbar, Typography, Button, Box, Avatar,
  IconButton, Menu, MenuItem, Divider,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// MUI Icons
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate("/login");
  };

  // Get user's initials for avatar
  const getInitials = (username) =>
    username ? username.charAt(0).toUpperCase() : "U";

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "white",
        borderBottom: "1px solid",
        borderColor: "divider",
        color: "text.primary",
      }}
    >
      <Toolbar sx={{ maxWidth: 700, width: "100%", mx: "auto", px: { xs: 2, sm: 3 } }}>
        {/* Logo */}
        <Box
          component={Link}
          to="/"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            textDecoration: "none",
            color: "primary.main",
            flexGrow: 1,
          }}
        >
          <HomeRoundedIcon sx={{ fontSize: 28 }} />
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, letterSpacing: "-0.5px", color: "primary.main" }}
          >
            SocialSpace
          </Typography>
        </Box>

        {/* Right side */}
        {user ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", display: { xs: "none", sm: "block" } }}
            >
              Hey, <strong>{user.username}</strong>
            </Typography>

            {/* Avatar triggers dropdown */}
            <IconButton onClick={handleMenuOpen} size="small">
              <Avatar
                sx={{
                  bgcolor: "primary.main",
                  width: 36,
                  height: 36,
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                {getInitials(user.username)}
              </Avatar>
            </IconButton>

            {/* Dropdown Menu */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                sx: { mt: 1, borderRadius: 2, minWidth: 160, boxShadow: 3 },
              }}
            >
              <MenuItem disabled sx={{ opacity: 1 }}>
                <AccountCircleRoundedIcon sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="body2" fontWeight={600}>
                  {user.username}
                </Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
                <LogoutRoundedIcon sx={{ mr: 1, fontSize: 18 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button component={Link} to="/login" variant="outlined" size="small">
              Login
            </Button>
            <Button component={Link} to="/signup" variant="contained" size="small">
              Sign Up
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
