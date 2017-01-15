import React from 'react';
import { Button, FormControl, InputGroup } from 'react-bootstrap';

class ControlledInput extends React.Component {
  state = { inputValue: '' };

  static propTypes = {
    placeholder: React.PropTypes.string.isRequired,
    onSubmit: React.PropTypes.func.isRequired,
    inputValue: React.PropTypes.string,
    buttonText: React.PropTypes.string.isRequired,
  };

  componentWillMount() {
    const { inputValue } = this.props;
    if (inputValue) {
      this.setState({ inputValue });
    }
  }

  handleInputChange = event => {
    this.setState({ inputValue: event.target.value });
  };

  handleInputKeyDown = event => {
    if (event.keyCode === 13) {
      this.handleSubmit();
    }
  };

  handleSubmit = () => {
    const { inputValue } = this.state;
    const { onSubmit } = this.props;

    onSubmit(inputValue);
    this.setState({ inputValue: '' });
  };

  render() {
    const { inputValue } = this.state;
    const { placeholder, buttonText } = this.props;

    return (
      <InputGroup>
        <FormControl
          type="text"
          value={inputValue}
          placeholder={placeholder}
          onChange={this.handleInputChange}
          onKeyDown={this.handleInputKeyDown}
        />
        <InputGroup.Button>
          <Button bsStyle="primary" onClick={this.handleSubmit}>
            {buttonText}
          </Button>
        </InputGroup.Button>
      </InputGroup>
    );
  }
}

export default ControlledInput;
