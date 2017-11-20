import React, { Component} from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { Footer, Menu, Header, Banner, GeneralStats, UserList } from './components';

import GlobalStrings from './components/GlobalStrings'

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
    return axios.get('http://localhost:5000/api/users', axiosHeader)
    .then((response) => {
      console.log(response.data)
      //console.log('Metadata' + response.data.metadata);
      //console.log('Users' + response.data.users);
      this.setState( { people: response.data.users } )
    });
  }

  componentDidMount() {
    this.getPeople();
  }

  render() {
    const {people} = this.state;
    var tableHeader = ["Id", "Username", "Type", "First Name", "Last Name", "Email", "Country", "Birthdate"];
  
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

            <Banner title="UsersPage" subtitle="A free and fully responsive site template"
            content="Hello, Users"/>
            <UserList header={tableHeader} people={filteredUsers} />
            <label>
              Filter by username: 
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