import React from 'react'
import { Glyphicon } from 'react-bootstrap'

import ControlledInput from './ControlledInput'

class Profile extends React.Component {
  state = {
    fullNameInput: false,
    cityInput: false,
    stateInput: false
  }

  handleSubmitClick = () => {

  }

  handleEditIconClick = inputName => {

  }

  render() {
    const { username, avatar, fullName, location, updateProfile } = this.props
    const { fullNameInput, cityInput, stateInput } = this.state

    return (
      <div>
        <img src={avatar} role="presentation" />
        <h4>Twitter:</h4>
        <p>{username}</p>

        <h4>Full Name:</h4>
        {
          fullNameInput ? (
            <ControlledInput
              placeholder=""
              onSubmit={this.handleSubmitClick}
              inputValue={fullName}
              buttonText="Enter"
            />
          ) : (
            <p>
              {fullName}
              &nbsp;&nbsp;
              <Glyphicon glyph="pencil" title="Click here to edit Full Name" onClick={() => this.setState({ fullNameInput: true })} />
            </p>
          )
        }

        <h4>City:</h4>
        {
          cityInput ? (
            <ControlledInput
              placeholder=""
              onSubmit={this.handleSubmitClick}
              inputValue={location.city}
              buttonText="Enter"
            />
          ) : (
            <p>
              {location.city}
              &nbsp;&nbsp;
              <Glyphicon glyph="pencil" title="Click here to edit City" onClick={() => this.setState({ cityInput: true })} />
            </p>
          )
        }

        <h4>State:</h4>
        {
          stateInput ? (
            <ControlledInput
              placeholder=""
              onSubmit={this.handleSubmitClick}
              inputValue={location.state}
              buttonText="Enter"
            />
          ) : (
            <p>
              {location.state}
              &nbsp;&nbsp;
              <Glyphicon glyph="pencil" title="Click here to edit State" onClick={() => this.setState({ stateInput: true })} />
            </p>
          )
        }
      </div>
    )
  }
}

export default Profile
