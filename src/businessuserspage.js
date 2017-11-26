import React, { Component} from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { Footer, Menu, Header, Banner, GeneralStats, BusinessUserList, CollapseButton } from './components';

import GlobalStrings from './components/GlobalStrings'

class BusinessUsersPage extends Component {

 constructor(props) {
    super(props);

    this.state = {// populate state with data that comes from api
      businesspeople: [],
      message: '',
    } 

    this.getBusinessPeople = this.getBusinessPeople.bind(this);
  }

  /* Displays business users on screen */
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

  /* Adds a new business user to the database */
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
      this.getBusinessPeople();  
    });
  }

  /* Deletes a business user from the database */
  deleteBusinessUser(event) {
    event.preventDefault();
    console.log(this.refs.id.value);

    var localToken = localStorage.getItem('token');
    var axiosHeader = { headers: {'x-access-token': localToken} };
    return axios.delete('http://localhost:5000/api/business-users/' + this.refs.id.value, axiosHeader) 
    .then((response) => {
      this.getBusinessPeople();  
    });
  }

  /* Modifies a business user */
  modifyBusinessUser(event) {
    event.preventDefault();
    console.log(this.refs.id.value);
    var businessRoles = (this.refs.roles.value).split(","); // Toma el string separado por comas que se ingresa y lo convierte en array

    var businessUserToModify = {
      _ref: '',
      username: this.refs.username.value,
      password: this.refs.password.value,
      name: this.refs.name.value,
      surname: this.refs.surname.value,
      roles: businessRoles
    }

    var localToken = localStorage.getItem('token');
    var axiosHeader = { headers: {'x-access-token': localToken} };
    return axios.put('http://localhost:5000/api/business-users/' + this.refs.id.value, businessUserToModify, axiosHeader) 
    .then((response) => {
      this.getBusinessPeople();  
    });
  }

  componentDidMount() {
    this.getBusinessPeople();
  }

  render() {
    const {businesspeople} = this.state;
    var tableHeader = ["Id", "Username", "Password", "Nombre", "Apellido", "Roles"];

    return (
      <div id="wrapper">

        <div id="main">
          <div className="inner">

            <Header title={GlobalStrings.headerTitle} link="/"/>

            <Banner title="Usuarios de negocio" subtitle="Usuarios encargados de la administración de la aplicación"/>
            <BusinessUserList header={tableHeader} businesspeople={businesspeople} />
            <br/>
            <CollapseButton name="Agregar Usuario">
              <br/>
              <form onSubmit={this.addBusinessUser.bind(this)}>
                <label>Username: <input type="text" ref="username" /></label>
                <label>Password: <input type="text" ref="password" /></label>
                <label>Nombre: <input type="text" ref="name" /></label>
                <label>Apellido: <input type="text" ref="surname" /></label>
                <label>Roles: <input type="text" ref="roles" /></label>
                <center><button type="submit">Agregar nuevo Usuario</button></center>
              </form> 
            </CollapseButton>
            <br/><br/>
            <CollapseButton name="Borrar Usuario">
              <br/>
              <form onSubmit={this.deleteBusinessUser.bind(this)}>
                <label>ID del Usuario: <input type="text" ref="id" /></label>
                <center><button type="submit">Borrar Usuario</button></center>
              </form>
            </CollapseButton>
            <br/><br/>
            <CollapseButton name="Modificar Usuario">
              <br/>
              <form onSubmit={this.modifyBusinessUser.bind(this)}>
                <label>Id: <input type="text" ref="id" /></label>
                <label>Username: <input type="text" ref="username" /></label>
                <label>Password: <input type="text" ref="password" /></label>
                <label>Nombre: <input type="text" ref="name" /></label>
                <label>Apellido: <input type="text" ref="surname" /></label>
                <label>Roles: <input type="text" ref="roles" /></label>
                <center><button type="submit">Modificar Usuario</button></center>
              </form> 
            </CollapseButton>
            <br/><br/><br/>
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