import React from 'react'
import { Redirect } from 'react-router'
import { Button } from 'react-bootstrap'

import './Login.css'

const Login = ({ isAuthenticated }) => {

    return (
      isAuthenticated ? (
        <Redirect to="/" />
      ) : (
        <div className="auth-buttons text-center">
          <Button bsStyle="primary" href={`${process.env.PUBLIC_URL}/auth/twitter`}>
            <img src={`${process.env.PUBLIC_URL}/img/twitter_32px.png`} className="auth-logo" role="presentation" /> Sign in with Twitter
          </Button>
        </div>
      )
    )
  }

export default Login
