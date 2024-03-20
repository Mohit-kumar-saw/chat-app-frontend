import React, { useState } from 'react'
import image from "../image/img.png"
import { Alert, Button, TextField } from '@mui/material'
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
        localStorage.setItem("userData",JSON.stringify({ response}) ); // Store token in local storage
        setLoading(false);
        setSignUpStatus({message: "Successfully SingUp"})
        setAlert(true)
        navigate("/app/welcome");
        
        
      } catch (error) {
        setSignUpStatus({ message:  "Registration failed" });
        console.log(error);
        setLoading(false);
        
      }
    };
  
    return (
      <div className="login-container">
        <div className="image-container">
          <img src={image} alt="" />
        </div>
        <div className="login-box">
          <h3>Create Your Account</h3>
          <TextField
            className="input"
            id="standard-basic"
            label="Enter User Name"
            variant="outlined"
            name="name"
            onChange={changeHandle}
          />
          <TextField
            className="input"
            id="standard-basic"
            label="Enter Email"
            variant="outlined"
            name="email"
            onChange={changeHandle}
          />
          <TextField
            className="input"
            id="outline-password-input"
            label="Password"
            type="password"
            autoComplete="current-password"
            name="password"
            onChange={changeHandle}
          />
          {signUpStatus.message && <Alert severity="error">{signUpStatus.message}</Alert>}
          {alert && <Alert severity="success">{signUpStatus.message}</Alert>}

          <Button variant="outlined" onClick={signUpHandler} disabled={loading}>
            {loading ? "Loading..." : "SignUp"}
          </Button>
          <p>
            Already have an Account? <a href="/">Log In</a>
          </p>
        </div>
      </div>
    );
  };
  
  
export default SingUp;
