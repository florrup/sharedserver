import React, { Component} from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

import { Footer, Menu, Header, Banner, GeneralStats } from './components';

import GlobalStrings from './components/GlobalStrings'

class Logout extends React.Component {

  constructor(props) {
    super(props);
  }

  handleSubmit(event) {
    alert('Logout button was clicked');
    //this.runLogout();
    event.preventDefault();
  }

  getToken() {
    var infoToSend = {BusinessUserCredentials:{ username: this.state.username, password: this.state.password }};

    return axios.post('http://localhost:5000/api/token', infoToSend)
    .then((response) => {
      if (response.status == 201) {
        console.log(response.data.token.token); // this gets the token 
        localStorage.setItem('token', response.data.token.token);
      } 
    })
    .catch(function(error) {
      console.log("Invalid");
    });
  }

  /* Logs the user out by invalidating his token */
  runLogout(event) {
    event.preventDefault();

    var localToken = localStorage.getItem('token');
    var axiosHeader = { headers: {'x-access-token': localToken} };
    
    localStorage.setItem('isLoggedIn', 'false');
    window.location.replace("/"); // used to redirect



    /*
    return axios.post('http://localhost:5000/api/token/invalidate', localToken, axiosHeader) 
    .then((response) => {
      console.log(response);
    });
    */
  }

  render() {
    return (

      <div id="wrapper">

        <div id="main">
          <div className="inner">

              <Header title={GlobalStrings.headerTitle} link="/"/>

              <Banner title="LogoutPage" subtitle="A free and fully responsive site template"
              content="Hello, log out"/>

            <form onSubmit={this.runLogout.bind(this)}>
              <center><button type="submit">Logout</button></center>
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

ReactDOM.render(<Logout />, document.getElementById('logoutpage'));