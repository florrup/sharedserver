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

  addBusinessUser(event) {
    event.preventDefault();
    console.log(this.refs.name.value);
    console.log(this.refs.surname.value);
    var businessRoles = (this.refs.roles.value).split(","); // Toma el string separado por comas que se ingresa y lo convierte en array

    var businessUserToPost = {
      _ref: '',
      username: this.refs.username.value,
      password: this.refs.password.value,
      name: this.refs.name.value,
      surname: this.refs.surname.value,
      roles: businessRoles
    }

    var localToken = localStorage.getItem('token');
    var axiosHeader = { headers: {'x-access-token': localToken} };
    return axios.post('http://localhost:5000/api/business-users', businessUserToPost, axiosHeader)
    .then((response) => {
      console.log(response.data)
      //console.log('Metadata' + response.data.metadata);
      //console.log('BusinessUsers' + response.data.businessUser);
      //this.setState( { businesspeople: this.state.businesspeople.push(businessUserToPost) } ) // TODO pushear esto para que se actualice la pantalla
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
            <br />
            <form onSubmit={this.addBusinessUser.bind(this)}>
              <label>Username: <input type="text" ref="username" /></label>
              <label>Password: <input type="text" ref="password" /></label>
              <label>Name: <input type="text" ref="name" /></label>
              <label>Surname: <input type="text" ref="surname" /></label>
              <label>Roles: <input type="text" ref="roles" /></label>
              <button type="submit">Add new Business User</button>
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
    )
  }
}

ReactDOM.render(<BusinessUsersPage />, document.getElementById('businessuserspage'));