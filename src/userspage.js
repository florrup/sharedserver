import React, { Component} from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { Footer, Menu, Header, Banner, GeneralStats } from './components';

class UsersPage extends Component {

/*  constructor(props) {
    super(props);

    this.state = {// populate state with data that comes from api
      people: [],
    } 

    this.getPeople = this.getPeople.bind(this);
  }

  getPeople() {
    var axiosHeader = { headers: {"x-access-token": token} };
    return axios.get('http://localhost:5000/api/users', axiosHeader)
    .then((response) => {
      console.log(response.data);
      this.setState( { people: response.data.results } )
    });
  }

  componentDidMount() {
    this.getPeople();
  }
*/

  render() {
    return (

      <div id="wrapper">

        <div id="main">
          <div className="inner">

              <Header title="Llevame! Aplicación de Gestión" link="/"/>

              <Banner title="UsersPage" subtitle="A free and fully responsive site template"
              content="Hello, Users"/>
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