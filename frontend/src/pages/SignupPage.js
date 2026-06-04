import React, { useState } from "react";
import {
  Container, Box, Card, CardContent, Typography, TextField,
  Button, CircularProgress, Link as MuiLink, InputAdornment, IconButton,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const SignupPage = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.username) errs.username = "Username is required";
    else if (form.username.length < 3) errs.username = "Username must be at least 3 characters";
    else if (form.username.length > 20) errs.username = "Username cannot exceed 20 characters";
    else if (!/^[a-zA-Z0-9_]+$/.test(form.username))
      errs.username = "Only letters, numbers, and underscores allowed";

    if (!form.email) errs.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Invalid email format";

    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 6) errs.password = "Password must be at least 6 characters";

    if (!form.confirmPassword) errs.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Passwords do not match";

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      await signup(form.username, form.email, form.password);
      toast.success("Account created! Welcome 🎉");
      navigate("/");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
      }}
    >
      <Container maxWidth="xs">
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography variant="h4" fontWeight={800} color="primary.main" gutterBottom>
            SocialSpace
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Join the community today
          </Typography>
        </Box>

        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} mb={2.5}>
              Create Account ✨
            </Typography>

            <Box component="form" onSubmit={handleSubmit} noValidate>
              {/* Username */}
              <TextField
                fullWidth
                name="username"
                label="Username"
                value={form.username}
                onChange={handleChange}
                error={Boolean(errors.username)}
                helperText={errors.username || "Letters, numbers, underscores only"}
                sx={{ mb: 2 }}
                size="small"
                autoComplete="username"
                inputProps={{ maxLength: 20 }}
              />

              {/* Email */}
              <TextField
                fullWidth
                name="email"
                label="Email Address"
                type="email"
                value={form.email}
                onChange={handleChange}
                error={Boolean(errors.email)}
                helperText={errors.email}
                sx={{ mb: 2 }}
                size="small"
                autoComplete="email"
              />

              {/* Password */}
              <TextField
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                error={Boolean(errors.password)}
                helperText={errors.password || "At least 6 characters"}
                sx={{ mb: 2 }}
                size="small"
                autoComplete="new-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setShowPassword((prev) => !prev)}
                        edge="end"
                      >
                        {showPassword ? (
                          <VisibilityOffRoundedIcon fontSize="small" />
                        ) : (
                          <VisibilityRoundedIcon fontSize="small" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* Confirm Password */}
              <TextField
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type={showPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={handleChange}
                error={Boolean(errors.confirmPassword)}
                helperText={errors.confirmPassword}
                sx={{ mb: 3 }}
                size="small"
                autoComplete="new-password"
              />

              {/* Submit */}
              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mb: 2, py: 1.2, borderRadius: 2 }}
              >
                {loading ? <CircularProgress size={22} color="inherit" /> : "Create Account"}
              </Button>

              {/* Login Link */}
              <Typography variant="body2" textAlign="center" color="text.secondary">
                Already have an account?{" "}
                <MuiLink component={Link} to="/login" fontWeight={600}>
                  Log In
                </MuiLink>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default SignupPage;
