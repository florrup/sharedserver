import React, { Component} from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { Footer, Menu, Header, Banner, GeneralStats } from './components';

class Login extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      username: '',
      password: ''
    };

    this.handleUsernameChange = this.handleUsernameChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleUsernameChange(event) {
    this.setState({ username: event.target.value });
  }

  handlePasswordChange(event) {
    this.setState({ password: event.target.value });
  }

  handleSubmit(event) {
    alert('A name was submitted: ' + this.state.username + ' with password' + this.state.password);
    event.preventDefault();
  }

  render() {
    return (

      <div id="wrapper">

        <div id="main">
          <div className="inner">

              <Header title="Llevame! Aplicación de Gestión" link="/"/>

              <Banner title="LoginPage" subtitle="A free and fully responsive site template"
              content="Hello, log in"/>

              <form onSubmit={this.handleSubmit}>
                <label>
                  Username:
                  <input type="text" value={this.state.username} onChange={this.handleUsernameChange} />
                </label>

                <label>
                  Password:
                  <input type="text" value={this.state.password} onChange={this.handlePasswordChange} />
                </label>
                <input type="submit" value="Submit" />
              </form>

          </div>
        </div>

        <div id="sidebar">
          <div className="inner">
            <Menu />
            <Footer />
          </div>
        </div>
      </div>

    );
  }
}

ReactDOM.render(<Login />, document.getElementById('loginpage'));