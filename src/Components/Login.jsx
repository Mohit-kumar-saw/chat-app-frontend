import React, { useState } from "react";
import { Backdrop, Button, CircularProgress, TextField, Alert } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Toaster from "./Toaster";
import { BASE_URL } from "../Url";
import { AuthIllustration, LoginIcon } from './AuthIllustration';

function Login() {
  const [data, setData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('error');

  const navigate = useNavigate();

  const changeHandler = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const loginHandler = async (e) => {
    e.preventDefault();
    
    if (!data.username || !data.password) {
      setAlertMessage('Please fill all the fields');
      setAlertSeverity('error');
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      const requestData = {
        username: data.username.trim(),
        password: data.password
      };

      console.log('Sending login request:', requestData);
      
      const response = await axios.post(
        `${BASE_URL}/user/login`,
        requestData,
        config
      );

      console.log('Login response:', response.data);

      if (response.data?.success) {
        const userData = {
          data: response.data.data
        };
        localStorage.setItem("userData", JSON.stringify(userData));
        setAlertMessage('Login successful!');
        setAlertSeverity('success');
        navigate("/app/welcome");
      } else {
        throw new Error(response.data?.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      setAlertMessage(error.response?.data?.message || 'Invalid username or password');
      setAlertSeverity('error');
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
        <CircularProgress color="primary" />
      </Backdrop>
      
      <div className="auth-container">
        <div className="auth-box">
          <div className="auth-header">
            <LoginIcon />
            <h1>Welcome back!</h1>
            <p className="auth-subtitle">Please enter your details to sign in</p>
          </div>

          {alertMessage && (
            <Alert 
              severity={alertSeverity}
              onClose={() => setAlertMessage('')}
              sx={{ mb: 2, width: '100%' }}
            >
              {alertMessage}
            </Alert>
          )}

          <form onSubmit={loginHandler} className="auth-form">
            <TextField
              label="Username or Email"
              type="text"
              value={data.username}
              onChange={changeHandler}
              name="username"
              fullWidth
              required
              sx={{ mb: 2 }}
              InputProps={{
                sx: {
                  borderRadius: '12px',
                  backgroundColor: 'var(--bg-secondary)'
                }
              }}
            />
            
            <TextField
              label="Password"
              type="password"
              value={data.password}
              onChange={changeHandler}
              name="password"
              fullWidth
              required
              sx={{ mb: 3 }}
              InputProps={{
                sx: {
                  borderRadius: '12px',
                  backgroundColor: 'var(--bg-secondary)'
                }
              }}
            />
            
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                py: 1.5,
                borderRadius: '12px',
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 600,
                backgroundColor: 'var(--primary-color)',
                '&:hover': {
                  backgroundColor: 'var(--primary-dark)',
                }
              }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <p className="auth-footer">
            Don't have an account?{' '}
            <a href="/signup" className="auth-link">
              Sign up
            </a>
          </p>
        </div>
      </div>

      {alertMessage && <Toaster key={Date.now()} message={alertMessage} />}
    </>
  );
}

export default Login;