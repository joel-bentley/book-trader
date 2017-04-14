import React from 'react';
import { Match, Redirect } from 'react-router';

const MatchWhenAuthorized = (
  { render: Component, isAuthenticated, ...rest }
) => (
  <Match
    {...rest}
    render={props =>
      isAuthenticated
        ? <Component {...props} />
        : <Redirect
            to={{ pathname: '/login', state: { referrer: props.location } }}
          />}
  />
);

export default MatchWhenAuthorized;
