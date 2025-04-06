import React, { useState } from 'react'
import { Alert, Button, TextField, Typography, Box } from '@mui/material'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../Url';

const SingUp = () => {
    const [data, setData] = useState({ name: "", email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [signUpStatus, setSignUpStatus] = useState({});
    const [alert, setAlert] = useState(false);

    const navigate = useNavigate();
  
    const changeHandle = (e) => {
      setData({ ...data, [e.target.name]: e.target.value });
    };
  
    const signUpHandler = async () => {
      setLoading(true);
      try {
        const response = await axios.post(`${BASE_URL}/user/register`, data);
        localStorage.setItem("userData",JSON.stringify({ response}) );
        setLoading(false);
        setSignUpStatus({message: "Successfully Signed Up"})
        setAlert(true)
        navigate("/app/welcome");
      } catch (error) {
        setSignUpStatus({ message: "Registration failed" });
        console.log(error);
        setLoading(false);
      }
    };
  
    return (
      <div className="login-container">
        <div className="login-box">
          <Typography variant="h4" className="login-text">
            Create Account
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2, textAlign: 'center' }}>
            Join ChatSphere today
          </Typography>
          <TextField
            className="input"
            label="Username"
            variant="outlined"
            color="secondary"
            name="name"
            onChange={changeHandle}
            fullWidth
            size="small"
          />
          <TextField
            className="input"
            label="Email"
            variant="outlined"
            color="secondary"
            name="email"
            onChange={changeHandle}
            fullWidth
            size="small"
          />
          <TextField
            className="input"
            label="Password"
            type="password"
            autoComplete="new-password"
            variant="outlined"
            color="secondary"
            name="password"
            onChange={changeHandle}
            fullWidth
            size="small"
          />
          {signUpStatus.message && !alert && (
            <Alert severity="error">{signUpStatus.message}</Alert>
          )}
          {alert && (
            <Alert severity="success">{signUpStatus.message}</Alert>
          )}
          <Button 
            variant="outlined" 
            color="secondary"
            onClick={signUpHandler} 
            disabled={loading}
            fullWidth
          >
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              Already have an Account?{" "}
              <a href="/" className="hyper">Sign In</a>
            </Typography>
          </Box>
        </div>
      </div>
    );
  };
  
export default SingUp;
