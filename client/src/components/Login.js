import React from 'react';
import Redirect from 'react-router/Redirect';
import Button from 'react-bootstrap/lib/Button';

import './Login.css';

const Login = ({ isAuthenticated }) => {
  return isAuthenticated ? (
    <Redirect to="/" />
  ) : (
    <div className="auth-buttons text-center">
      <Button bsStyle="primary" href={`${process.env.PUBLIC_URL}/auth/twitter`}>
        <img
          src={`${process.env.PUBLIC_URL}/img/twitter_32px.png`}
          className="auth-logo"
          role="presentation"
        />
        Sign in with Twitter
      </Button>
      <br />
      <br />
      <h4>OR</h4>
      <br />
      <Button bsStyle="primary" href={`${process.env.PUBLIC_URL}/auth/test1`}>
        <img
          src={`${process.env.PUBLIC_URL}/img/twitter-egg-icon.png`}
          className="auth-logo"
          role="presentation"
        />
        Sign in to Test Account
      </Button>
    </div>
  );
};

export default Login;
