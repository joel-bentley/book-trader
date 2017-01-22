import React from 'react';
import { Col, Glyphicon } from 'react-bootstrap';

import ControlledInput from './ControlledInput';
import './Profile.css';

class Profile extends React.Component {
  state = {
    fullNameInput: !this.props.fullName,
    cityInput: !this.props.location.city,
    stateInput: !this.props.location.state,
  };

  render() {
    const {
      twitterName,
      avatar,
      fullName,
      location,
      profileUpdate,
    } = this.props;
    const { fullNameInput, cityInput, stateInput } = this.state;

    return (
      <Col sm={4} smOffset={4} xsOffset={1}>
        <img src={avatar} role="presentation" />
        <h4>Twitter:</h4>
        <p>{twitterName}</p>
        <h4>Full Name:</h4>
        {
          fullNameInput
            ? <ControlledInput
              placeholder=""
              onSubmit={newFullName => profileUpdate({ fullName: newFullName })}
              inputValue={fullName}
              buttonText="Enter"
            />
            : <p>
              {fullName}
              <Glyphicon
                glyph="pencil"
                title="Click here to edit Full Name"
                onClick={() => this.setState({ fullNameInput: true })}
                className="edit-icon"
              />
            </p>
        }
        <h4>City:</h4>
        {
          cityInput
            ? <ControlledInput
              placeholder=""
              onSubmit={
                newCity =>
                  profileUpdate({
                    location: { city: newCity, state: location.state },
                  })
              }
              inputValue={location.city}
              buttonText="Enter"
            />
            : <p>
              {location.city}
              <Glyphicon
                glyph="pencil"
                title="Click here to edit City"
                onClick={() => this.setState({ cityInput: true })}
                className="edit-icon"
              />
            </p>
        }
        <h4>State:</h4>
        {
          stateInput
            ? <ControlledInput
              placeholder=""
              onSubmit={
                newState =>
                  profileUpdate({
                    location: { city: location.city, state: newState },
                  })
              }
              inputValue={location.state}
              buttonText="Enter"
            />
            : <p>
              {location.state}
              <Glyphicon
                glyph="pencil"
                title="Click here to edit State"
                onClick={() => this.setState({ stateInput: true })}
                className="edit-icon"
              />
            </p>
        }
      </Col>
    );
  }
}

export default Profile;
