import React, { Component} from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { Footer, Menu, Header, Banner, GeneralStats, UserList } from './components';

import GlobalStrings from './components/GlobalStrings'

var path = 'https://serene-peak-94842.herokuapp.com';

class UsersPage extends Component {

 constructor(props) {
    super(props);

    this.state = { // populate state with data that comes from api
      people: [],
      search: '',
    };

    this.getPeople = this.getPeople.bind(this);
  }

  // For the filters
  updateSearch(event) {
    this.setState({ search: event.target.value} );
  }

  getPeople() {
    var localToken = localStorage.getItem('token');
    var axiosHeader = { headers: {'x-access-token': localToken} };
    return axios.get(path + '/api/users', axiosHeader)
    .then((response) => {
      console.log(response.data)
      //console.log('Metadata' + response.data.metadata);
      //console.log('Users' + response.data.users);
      this.setState( { people: response.data.users } )
    })
    .catch(function (error) {
      if (error.response.request.status == 401) {
        alert(error.response.request.statusText);
      }
    });
  }

  componentDidMount() {
    this.getPeople();
  }

  render() {
    const {people} = this.state;
    var tableHeader = ["Id", "Username", "Tipo", "Nombre", "Apellido", "Email", "País", "Cumpleaños"];
  
    var isLoggedIn = (localStorage.getItem('isLoggedIn') == 'true');

    if (!isLoggedIn) {
      window.location.replace("/"); // if he's not logged in, redirect to homepage
    }

    let filteredUsers = this.state.people.filter(
      (user) => {
        return user.username.toLowerCase().indexOf(this.state.search.toLowerCase()) !== -1;
      }
    )
    return (
      <div id="wrapper">

        <div id="main">
          <div className="inner">
            <Header title={GlobalStrings.headerTitle} link="/"/>

            <Banner title="Usuarios de aplicación" subtitle="Usuarios que utilizan Llevame!"/>
            <UserList header={tableHeader} people={filteredUsers} />
            <label>
              Filtrar por Username: 
              <input type="text"
                value={this.state.search}
                onChange={this.updateSearch.bind(this)} />
            </label>
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

ReactDOM.render(<UsersPage />, document.getElementById('userspage'));