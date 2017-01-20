import React from 'react';

const UserInfo = ({user, message}) => {
  const { fullName, twitterName, location } = user;
  const displayName = fullName || twitterName;
  return (
    <div>
      <img src={`https://twitter.com/${twitterName}/profile_image?size=normal`} role="presentation" />
      <br /><br />
      {message} {displayName} in {location.city}, {location.state}.
      <br /><br />
    </div>
  )
}

export default UserInfo;