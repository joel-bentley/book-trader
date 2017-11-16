import React from 'react';

const UserInfo = ({ message, user }) => {
  const { fullName, twitterName, location } = user;
  const displayName = fullName || twitterName;
  const locationString = location.city
    ? location.state
      ? ` in ${location.city}, ${location.state}`
      : ` in ${location.city}`
    : location.state ? ` in ${location.state}` : '';
  return (
    <div>
      <img
        src={`https://twitter.com/${twitterName}/profile_image?size=normal`}
        role="presentation"
      />
      <br />
      <br />
      {`${message} ${displayName}${locationString}`}.
      <br />
      <br />
    </div>
  );
};

export default UserInfo;
