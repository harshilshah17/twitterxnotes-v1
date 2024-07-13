// src/Login.js
import React, { useState, useEffect } from 'react';
import { auth, provider } from './firebase';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { Button, TextField, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        navigate('/home');
      }
    });
    return unsubscribe;
  }, [navigate]);

  const handleGoogleSignIn = () => {
    signInWithPopup(auth, provider).catch(error => console.log(error));
  };

  const handleEmailSignIn = (e) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then(() => navigate('/home'))
      .catch(error => console.log(error));
  };

  const handleEmailSignUp = (e) => {
    e.preventDefault();
    createUserWithEmailAndPassword(auth, email, password)
      .then(() => navigate('/home'))
      .catch(error => console.log(error));
  };

  return (
    <Box sx={{ textAlign: 'center', mt: 5 }}>
      <Typography variant="h4" gutterBottom>Login</Typography>
      <Box component="form" onSubmit={handleEmailSignIn} sx={{ display: 'inline-block', textAlign: 'left' }}>
        <TextField
          label="Email"
          type="email"
          fullWidth
          required
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          required
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Box sx={{ mt: 2 }}>
          <Button type="submit" variant="contained" color="primary">Sign In</Button>
        </Box>
      </Box>
      <Box sx={{ mt: 2 }}>
        <Button variant="outlined" color="primary" onClick={handleGoogleSignIn}>Sign in with Google</Button>
      </Box>
      <Box sx={{ mt: 2 }}>
        <Button variant="outlined" color="secondary" onClick={handleEmailSignUp}>Sign Up</Button>
      </Box>
    </Box>
  );
};

export default Login;
