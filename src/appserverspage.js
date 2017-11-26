import React, { Component} from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

import GlobalStrings from './components/GlobalStrings';

import { Footer, Menu, Header, Banner, GeneralStats, ServerList } from './components';

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
    return axios.get('http://localhost:5000/api/servers', axiosHeader)
    .then((response) => {
      console.log(response.data)
      //console.log('Metadata' + response.data.metadata);
      this.setState( { servers: response.data } )
    });
  }

  componentDidMount() {
    this.getServers();
  }

  render() {
    const {servers} = this.state;
    var tableHeader = ["Id", "Username", "Password", "Created By", "Created Time", "Name", "Last Connection"];

    return (

      <div id="wrapper">

        <div id="main">
          <div className="inner">

              <Header title={GlobalStrings.headerTitle} link="/"/>

              <Banner title="AppServersPage" subtitle="A free and fully responsive site template"
              content="Hello, AppServersPage"/>
              <ServerList header={tableHeader} servers={servers} />
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