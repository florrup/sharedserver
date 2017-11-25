import React, { Component } from 'react';

class CollapseButton extends Component {

  constructor(props) {
    super(props);

    this.state = {
      expanded: false,
      name: props.name,
    }

    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
  }

  open() {
    this.setState({ expanded: !this.state.expanded });
  }

  close() {
    this.setState({ expanded: !this.state.expanded });
  }

  render() {

    if (!this.state.expanded) {
      return (
        <button onClick={this.open}>{this.state.name}</button>
      )
    }

    return(
      <div className="addusersbutton">
        <button onClick={this.close}>Ocultar info</button>
        <div>{this.props.children}</div>
      </div>
    )
  }
}

export default CollapseButton;