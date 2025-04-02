import React, { useState } from "react";
import logo from "../image/img.png";
import { Backdrop, Button, CircularProgress, TextField, Typography, Box } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Toaster from "./Toaster";
import { BASE_URL } from "../Url";

function Login() {
  const [showlogin, setShowLogin] = useState(true);
  const [data, setData] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [logInStatus, setLogInStatus] = useState("");
  const [signInStatus, setSignInStatus] = useState("");

  const navigate = useNavigate();

  const changeHandler = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const loginHandler = async () => {
    setLoading(true);
    try {
      if (!data.username?.trim()) {
        setLogInStatus({
          msg: "Username is required",
          key: Math.random(),
        });
        setLoading(false);
        return;
      }

      if (!data.password) {
        setLogInStatus({
          msg: "Password is required",
          key: Math.random(),
        });
        setLoading(false);
        return;
      }

      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      const response = await axios.post(
        `${BASE_URL}/user/login`,
        {
          username: data.username.trim(),
          password: data.password
        },
        config
      );

      if (response.data?.success) {
        setLogInStatus({ msg: "Login successful!", key: Math.random() });
        localStorage.setItem("userData", JSON.stringify(response.data));
        navigate("/app/welcome");
      } else {
        throw new Error(response.data?.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Invalid username or password";
      setLogInStatus({
        msg: errorMessage,
        key: Math.random(),
      });
    } finally {
      setLoading(false);
    }
  };

  const signUpHandler = async () => {
    setLoading(true);
    try {
      if (!data.username?.trim()) {
        setSignInStatus({
          msg: "Username is required",
          key: Math.random(),
        });
        setLoading(false);
        return;
      }

      if (!data.email?.trim()) {
        setSignInStatus({
          msg: "Email is required",
          key: Math.random(),
        });
        setLoading(false);
        return;
      }

      if (!data.password) {
        setSignInStatus({
          msg: "Password is required",
          key: Math.random(),
        });
        setLoading(false);
        return;
      }

      if (data.password.length < 6) {
        setSignInStatus({
          msg: "Password must be at least 6 characters long",
          key: Math.random(),
        });
        setLoading(false);
        return;
      }

      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      const response = await axios.post(
        `${BASE_URL}/user/register`,
        {
          username: data.username.trim(),
          email: data.email.trim(),
          password: data.password
        },
        config
      );

      if (response.data?.success) {
        setSignInStatus({ msg: "Registration successful!", key: Math.random() });
        localStorage.setItem("userData", JSON.stringify(response.data));
        navigate("/app/welcome");
      } else {
        throw new Error(response.data?.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Registration failed. Please try again.";
      setSignInStatus({
        msg: errorMessage,
        key: Math.random(),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <CircularProgress color="secondary" />
      </Backdrop>
      <div className="login-container">
        <div className="image-container">
          <img src={logo} alt="Logo" className="welcome-logo" />
        </div>
        {showlogin ? (
          <div className="login-box">
            <Typography variant="h4" className="login-text">
              Welcome Back
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2, textAlign: 'center' }}>
              Sign in to continue to ChatSphere
            </Typography>
            <TextField
              onChange={changeHandler}
              className="input"
              label="Username or Email"
              variant="outlined"
              color="secondary"
              name="username"
              value={data.username}
              fullWidth
              size="small"
              onKeyDown={(event) => {
                if (event.code === "Enter") {
                  loginHandler();
                }
              }}
            />
            <TextField
              onChange={changeHandler}
              className="input"
              label="Password"
              type="password"
              autoComplete="current-password"
              color="secondary"
              name="password"
              value={data.password}
              fullWidth
              size="small"
              onKeyDown={(event) => {
                if (event.code === "Enter") {
                  loginHandler();
                }
              }}
            />
            <Button
              variant="outlined"
              color="secondary"
              onClick={loginHandler}
              disabled={loading}
              fullWidth
              size="medium"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            <Box sx={{ mt: 1.5, textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                Don't have an Account?{" "}
                <span
                  className="hyper"
                  onClick={() => {
                    setShowLogin(false);
                    setData({ username: "", email: "", password: "" });
                  }}
                >
                  Sign Up
                </span>
              </Typography>
            </Box>
          </div>
        ) : (
          <div className="login-box">
            <Typography variant="h4" className="login-text">
              Create Account
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2, textAlign: 'center' }}>
              Join ChatSphere today
            </Typography>
            <TextField
              onChange={changeHandler}
              className="input"
              label="Username"
              variant="outlined"
              color="secondary"
              name="username"
              value={data.username}
              fullWidth
              size="small"
            />
            <TextField
              onChange={changeHandler}
              className="input"
              label="Email"
              variant="outlined"
              color="secondary"
              name="email"
              value={data.email}
              fullWidth
              size="small"
            />
            <TextField
              onChange={changeHandler}
              className="input"
              label="Password"
              type="password"
              autoComplete="new-password"
              color="secondary"
              name="password"
              value={data.password}
              fullWidth
              size="small"
            />
            <Button
              variant="outlined"
              color="secondary"
              onClick={signUpHandler}
              disabled={loading}
              fullWidth
              size="medium"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
            <Box sx={{ mt: 1.5, textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                Already have an Account?{" "}
                <span
                  className="hyper"
                  onClick={() => {
                    setShowLogin(true);
                    setData({ username: "", email: "", password: "" });
                  }}
                >
                  Sign In
                </span>
              </Typography>
            </Box>
          </div>
        )}
      </div>
      {logInStatus && <Toaster key={logInStatus.key} message={logInStatus.msg} />}
      {signInStatus && <Toaster key={signInStatus.key} message={signInStatus.msg} />}
    </>
  );
}

export default Login;