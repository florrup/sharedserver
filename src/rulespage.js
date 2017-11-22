import React, { Component} from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

import GlobalStrings from './components/GlobalStrings'

import { Footer, Menu, Header, Banner, GeneralStats, RulesList, CollapseButton } from './components';

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

  /* Adds a new rule to the database */
  addRule(event) {
    event.preventDefault();
    console.log(this.refs.name.value);

    var blob = {
      name: this.refs.name.value,
      condition: this.refs.condition.value,
      consequence: this.refs.consequence.value,
      priority: this.refs.priority.value     
    }

    var ruleToPost = {
      _ref: '',
      language: this.refs.language.value,
      blob: blob,
      active: this.refs.active.value
    }

    var localToken = localStorage.getItem('token');
    var axiosHeader = { headers: {'x-access-token': localToken} };
    return axios.post('http://localhost:5000/api/rules', ruleToPost, axiosHeader)
    .then((response) => {
      this.getRules();  
    });
  }

  /* Deletes a rule from the database */
  deleteRule(event) {
    event.preventDefault();
    console.log(this.refs.name.value);

    var localToken = localStorage.getItem('token');
    var axiosHeader = { headers: {'x-access-token': localToken} };
    return axios.delete('http://localhost:5000/api/rules/' + this.refs.name.value, axiosHeader) 
    .then((response) => {
      this.getRules();  
    });
  }

  /* Modifies a rule */
  modifyRule(event) {
    event.preventDefault();

    var blob = {
      name: this.refs.name.value,
      condition: this.refs.condition.value,
      consequence: this.refs.consequence.value,
      priority: this.refs.priority.value     
    }

    var ruleToModify = {
      _ref: '',
      language: this.refs.language.value,
      blob: blob,
      active: this.refs.active.value
    }

    var localToken = localStorage.getItem('token');
    var axiosHeader = { headers: {'x-access-token': localToken} };
    return axios.put('http://localhost:5000/api/rules/' + this.refs.name.value, ruleToModify, axiosHeader) 
    .then((response) => {
      this.getRules();  
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
              <br/>
              <CollapseButton name="Add Rule">
                <br/>
                <form onSubmit={this.addRule.bind(this)}>
                  <label>Name: <input type="text" ref="name" /></label>
                  <label>Condition: <input type="text" ref="condition" /></label>
                  <label>Consequence: <input type="text" ref="consequence" /></label>
                  <label>Priority: <input type="text" ref="priority" /></label>
                  <label>Language: <input type="text" ref="language" /></label>
                  <label>Active: <input type="text" ref="active" /></label>
                  <center><button type="submit">Add new Rule</button></center>
                </form> 
              </CollapseButton>
              <br/><br/>
              <CollapseButton name="Delete Rule">
              <br/>
              <form onSubmit={this.deleteRule.bind(this)}>
                <label>Rule Name: <input type="text" ref="name" /></label>
                <center><button type="submit">Delete Rule</button></center>
              </form>
            </CollapseButton>
            <br/><br/>
            <CollapseButton name="Modify Rule">
              <br/>
              <form onSubmit={this.modifyRule.bind(this)}>
                  <label>Name: <input type="text" ref="name" /></label>
                  <label>Condition: <input type="text" ref="condition" /></label>
                  <label>Consequence: <input type="text" ref="consequence" /></label>
                  <label>Priority: <input type="text" ref="priority" /></label>
                  <label>Language: <input type="text" ref="language" /></label>
                  <label>Active: <input type="text" ref="active" /></label>
                  <center><button type="submit">Modify Rule</button></center>
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

ReactDOM.render(<RulesPage />, document.getElementById('rulespage'));