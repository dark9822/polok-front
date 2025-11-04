import React, { useState } from 'react';
import './SignIn.css';

function SignIn({ onSignIn }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Password is "I am crazy"
    if (password === 'I am crazy') {
      setError('');
      onSignIn();
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-card">
        <h1 className="signin-title">TAO AI</h1>
        <p className="signin-subtitle">Data Management System</p>
        
        <form onSubmit={handleSubmit} className="signin-form">
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="form-input"
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" className="signin-button">
            Sign In
          </button>
        </form>
        
        <div className="signin-hint">
          Hint: The password reflects your state of mind 😉
        </div>
      </div>
    </div>
  );
}

export default SignIn;

