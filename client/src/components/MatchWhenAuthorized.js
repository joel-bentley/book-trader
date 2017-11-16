import React from 'react';
import Match from 'react-router/Match';
import Redirect from 'react-router/Redirect';

const MatchWhenAuthorized = ({
  render: Component,
  isAuthenticated,
  ...rest
}) => (
  <Match
    {...rest}
    render={props =>
      isAuthenticated ? (
        <Component {...props} />
      ) : (
        <Redirect
          to={{ pathname: '/login', state: { referrer: props.location } }}
        />
      )}
  />
);

export default MatchWhenAuthorized;
