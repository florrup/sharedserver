import React, { Component} from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { Footer, Menu, Header, Banner, GeneralStats, BusinessUserList } from './components';

import GlobalStrings from './components/GlobalStrings'

class BusinessUsersPage extends Component {

 constructor(props) {
    super(props);

    this.state = {// populate state with data that comes from api
      businesspeople: [],
    } 

    this.getBusinessPeople = this.getBusinessPeople.bind(this);
  }

  getBusinessPeople() {
    var localToken = localStorage.getItem('token');
    var axiosHeader = { headers: {'x-access-token': localToken} };
    return axios.get('http://localhost:5000/api/business-users', axiosHeader)
    .then((response) => {
      console.log(response.data)
      //console.log('Metadata' + response.data.metadata);
      //console.log('BusinessUsers' + response.data.businessUser);
      this.setState( { businesspeople: response.data.businessUser } )
    });
  }

  componentDidMount() {
    this.getBusinessPeople();
  }

  render() {
    const {businesspeople} = this.state;
    var tableHeader = ["Id", "Username", "Password", "Name", "Surname", "Roles"];

    return (

      <div id="wrapper">

        <div id="main">
          <div className="inner">

              <Header title={GlobalStrings.headerTitle} link="/"/>

              <Banner title="BusinessUsersPage" subtitle="A free and fully responsive site template"
              content="Hello, BusinessUsers"/>
              <BusinessUserList header={tableHeader} businesspeople={businesspeople} />
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

ReactDOM.render(<BusinessUsersPage />, document.getElementById('businessuserspage'));