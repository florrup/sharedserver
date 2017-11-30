import React, { Component} from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

import GlobalStrings from './components/GlobalStrings';

import { Footer, Menu, Header, Banner, GeneralStats, ServerList, CollapseButton } from './components';

var path = 'https://serene-peak-94842.herokuapp.com';

class AppServersPage extends Component {

 constructor(props) {
    super(props);

    this.state = {// populate state with data that comes from api
      servers: [],
      inactiveServers: [],
    } 

    this.getServers = this.getServers.bind(this);
    this.getInactiveServers = this.getInactiveServers.bind(this);
  }

  /* Displays servers on screen */
  getServers() {
    var localToken = localStorage.getItem('token');
    var axiosHeader = { headers: {'x-access-token': localToken} };
    return axios.get(path + '/api/servers/activeServers', axiosHeader)
    .then((response) => {
      console.log(response);
      this.setState( { servers: response.data } ); // array with active servers
    })
    .catch(function (error) {
      if (error.response.request.status == 401) {
        alert(error.response.request.statusText);
      }
    });
  }

  /* Displays inactive servers on screen */
  getInactiveServers() {
    var localToken = localStorage.getItem('token');
    var axiosHeader = { headers: {'x-access-token': localToken} };
    console.log('Inside inactive servers');
    return axios.get(path + '/api/servers/inactiveServers', axiosHeader)
    .then((response) => {
      console.log('Inactive servers are: ' + response);
      this.setState( { inactiveServers: response.data } ); // array with inactive servers
    })
    .catch(function (error) {
      if (error.response.request.status == 401) {
        alert(error.response.request.statusText);
      }
    });
  }

  /* Deactivates an active server */
  deactivateServer(event) {
    event.preventDefault();
    console.log(this.refs.name.value);

    var serverToDeactivate = {
      name: this.refs.name.value
    }

    var localToken = localStorage.getItem('token');
    var axiosHeader = { headers: {'x-access-token': localToken} };
    return axios.post(path + '/api/servers/deactivateServer', serverToDeactivate, axiosHeader) 
    .then((response) => {
      this.getServers();  
    })
    .catch(function (error){
      if (error.response.request.status == 401) {
        alert(error.response.request.statusText);
      }
    });
  }

  /* Adds a new appserver to the database */
  addServer(event) {
    event.preventDefault();
    console.log(this.refs.name.value);

    var newServer = {
      createdBy: this.refs.createdBy.value,
      createdTime: (new Date).getTime(),
      name: this.refs.name.value,
      username: this.refs.username.value,
      password: this.refs.password.value
    }

    var localToken = localStorage.getItem('token');
    var axiosHeader = { headers: {'x-access-token': localToken} };
    return axios.post(path + '/api/servers', newServer, axiosHeader)
    .then((response) => {
      this.refs.textarea.value = JSON.stringify(response.data.server.token);  
      this.getServers();
    })
    .catch(function (error) {
      if (error.response.request.status == 400) {
        alert(error.response.data.message);
      }
      if (error.response.request.status == 401) {
        alert(error.response.request.statusText);
      }
    });
  }

  componentDidMount() {
    this.getServers();
  }

  render() {
    const {servers} = this.state;
    const {inactiveServers} = this.state;
    var tableHeader = ["Id", "Username", "Password", "Created By", "Created Time", "Nombre", "Última conexión"];
    
    var isLoggedIn = (localStorage.getItem('isLoggedIn') == 'true');

    if (!isLoggedIn) {
      window.location.replace("/"); // if he's not logged in, redirect to homepage
    }

    return (

      <div id="wrapper">

        <div id="main">
          <div className="inner">

            <Header title={GlobalStrings.headerTitle} link="/"/>

            <Banner title="Application Servers" subtitle="Administración de Application Servers"/>
            <h3>Application Servers Autorizados</h3>
            <ServerList header={tableHeader} servers={servers} />
            <br/><br/>
            <CollapseButton name="Desactivar Appserver">
              <br/>
              <form onSubmit={this.deactivateServer.bind(this)}>
                <label>Nombre: <input type="text" ref="name" /></label>
                <center><button type="submit">Desactivar Appserver</button></center>
              </form>
            </CollapseButton>
            <br/><br/>
            <h3>Application Servers Invalidados</h3>
            <ServerList header={tableHeader} servers={inactiveServers} />
            <br/><br/>
            <CollapseButton name="Agregar Appserver">
              <br/>
              <form onSubmit={this.addServer.bind(this)}>
                <label>Nombre: <input type="text" ref="name"/></label>
                <label>Username: <input type="text" ref="username" /></label>
                <label>Password: <input type="text" ref="password" /></label>
                <label>Creado por <i>(campo numérico)</i>: <input type="text" ref="createdBy" /></label>
                <center><button type="submit">Agregar nuevo Appserver</button></center>
                <br/>
                <textarea id="noter-text-area" name="textarea" ref="textarea"></textarea>
              </form> 
            </CollapseButton>
            <br/><br/>
          </div>
        </div>

        <div id="sidebar">
          <div className="inner">
            <Menu />
            <Footer />
          </div>
        </div>
      </div>
    )
  }
}

ReactDOM.render(<AppServersPage />, document.getElementById('appserverspage'));