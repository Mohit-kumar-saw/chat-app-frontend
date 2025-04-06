import React, { useState } from 'react';
import { TextField, Button, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from "../Url";

const SignUp = () => {
  const [showpass, setShowpass] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('error');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password) {
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

      const { data } = await axios.post(
        `${BASE_URL}/user/register`,
        {
          username: formData.username,
          email: formData.email,
          password: formData.password
        },
        config
      );

      localStorage.setItem("userInfo", JSON.stringify(data));
      setLoading(false);
      setAlertMessage('Account created successfully!');
      setAlertSeverity('success');
      navigate("/app");
    } catch (error) {
      setLoading(false);
      setAlertMessage(error.response?.data?.message || 'An error occurred');
      setAlertSeverity('error');
    }
  };

  return (
    <div className="login-container">
      <div className="wave-background" />
      <div className="login-box">
        <div className="login-header">
          <h1 className="login-text">Hello!</h1>
        </div>
        <p className="login-subtext">Sign up to create your account</p>

        {alertMessage && (
          <Alert 
            severity={alertSeverity}
            onClose={() => setAlertMessage('')}
            sx={{ py: 0.5, borderRadius: 2 }}
          >
            {alertMessage}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="input-group">
          <TextField
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="input"
            fullWidth
            variant="outlined"
          />
          <TextField
            label="Email address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="input"
            fullWidth
            variant="outlined"
          />
          <TextField
            label="Password"
            type={showpass ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="input"
            fullWidth
            variant="outlined"
          />
          
          <Button
            type="submit"
            variant="contained"
            className="auth-button"
            fullWidth
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <a href="/" className="auth-link">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignUp; 