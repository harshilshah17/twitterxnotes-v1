// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import SignIn from './SignIn';
import SignUp from './SignUp';
import Home from './Home';
import { auth } from './firebase';
import { CssBaseline, GlobalStyles } from '@mui/material';

const PrivateRoute = ({ children }) => {
  return auth.currentUser ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Router>
      <CssBaseline />
      <GlobalStyles
        styles={{
          body: {
            backgroundColor: '#E3F2FD', // Light blue background
            margin: 0,
            padding: 0,
            boxSizing: 'border-box',
            fontFamily: 'Roboto, sans-serif',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
