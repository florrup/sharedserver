import React, { Component} from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

import GlobalStrings from './components/GlobalStrings';

import { Footer, Menu, Header, Banner, GeneralStats, ServerList, CollapseButton } from './components';

class AppServersPage extends Component {

 constructor(props) {
    super(props);

    this.state = {// populate state with data that comes from api
      servers: [],
    } 

    this.getServers = this.getServers.bind(this);
  }

  /* Displays servers on screen */
  getServers() {
    var localToken = localStorage.getItem('token');
    var axiosHeader = { headers: {'x-access-token': localToken} };
    return axios.get('http://localhost:5000/api/servers/activeServers', axiosHeader)
    .then((response) => {
      console.log(response);
      this.setState( { servers: response.data } ); // array with active servers
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
    return axios.post('http://localhost:5000/api/servers/deactivateServer', serverToDeactivate, axiosHeader) 
    .then((response) => {
      this.getServers();  
    });
  }

  componentDidMount() {
    this.getServers();
  }

  render() {
    const {servers} = this.state;
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