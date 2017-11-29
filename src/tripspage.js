import React, { Component} from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { Footer, Menu, Header, Banner, GeneralStats, UserList, TripsList } from './components';

import GlobalStrings from './components/GlobalStrings'

class TripsPage extends Component {

 constructor(props) {
    super(props);

    this.state = { // populate state with data that comes from api
      trips: [],
    };

    this.getTrips = this.getTrips.bind(this);
  }

  getTrips() {
    var localToken = localStorage.getItem('token');
    var axiosHeader = { headers: {'x-access-token': localToken} };
    return axios.get(process.env.FRONTEND + '/api/trips', axiosHeader)
    .then((response) => {
      console.log(response.data)
      //console.log('Metadata' + response.data.metadata);
      this.setState( { trips: response.data.trips } )
    })
    .catch(function (error){
      if (error.response.request.status == 401) {
        alert(error.response.request.statusText);
      }
    });
  }

  componentDidMount() {
    this.getTrips();
  }

  render() {
    const {trips} = this.state;
    var tableHeader = ["Id", "Conductor", "Pasajero", "Tiempo total", "Distancia", "Currency", "Costo total"];
  
    var isLoggedIn = (localStorage.getItem('isLoggedIn') == 'true');

    if (!isLoggedIn) {
      window.location.replace("/"); // if he's not logged in, redirect to homepage
    }

    return (
      <div id="wrapper">

        <div id="main">
          <div className="inner">
            <Header title={GlobalStrings.headerTitle} link="/"/>

            <Banner title="Viajes realizados" subtitle="Listado de viajes realizados con Llevame!"/>
            <TripsList header={tableHeader} trips={trips} />
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

ReactDOM.render(<TripsPage />, document.getElementById('tripspage'));