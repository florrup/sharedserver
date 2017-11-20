import React, { Component} from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

import GlobalStrings from './components/GlobalStrings'

import { Footer, Menu, Header, Banner, GeneralStats, RulesList } from './components';

class RulesPage extends Component {

 constructor(props) {
    super(props);

    this.state = { // populate state with data that comes from api
      rules: [],
    } 

    this.getRules = this.getRules.bind(this);
  }

  /* Displays rules on screen */
  getRules() {
    var localToken = localStorage.getItem('token');
    var axiosHeader = { headers: {'x-access-token': localToken} };
    return axios.get('http://localhost:5000/api/rules', axiosHeader)
    .then((response) => {
      console.log(response.data.rules)
      //console.log('Metadata' + response.data.metadata);
      //console.log('BusinessUsers' + response.data.businessUser);
      this.setState( { rules: response.data.rules } )
    });
  }

  componentDidMount() {
    this.getRules();
  }

  render() {
    const {rules} = this.state;
    var tableHeader = ["Id", "Name", "Language", "Blob", "Active"];

    return (
      <div id="wrapper">
        <div id="main">
          <div className="inner">

              <Header title={GlobalStrings.headerTitle} link="/"/>

              <Banner title="RulesPage" subtitle="A free and fully responsive site template"
              content="Hello, RulesPage"/>
              <RulesList header={tableHeader} rules={rules} />
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

ReactDOM.render(<RulesPage />, document.getElementById('rulespage'));