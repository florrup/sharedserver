import React, { Component} from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

import GlobalStrings from './components/GlobalStrings'

import { Footer, Menu, Header, Banner, GeneralStats, RulesList, CollapseButton, RuleChangesList } from './components';

var path = 'https://serene-peak-94842.herokuapp.com';

class RulesPage extends Component {

 constructor(props) {
    super(props);

    this.state = { // populate state with data that comes from api
      rules: [],
      ruleChanges: [],
    } 

    this.getRules = this.getRules.bind(this);
    this.getRuleChanges = this.getRuleChanges.bind(this);
  }

  /* Displays rules on screen */
  getRules() {
    var localToken = localStorage.getItem('token');
    var axiosHeader = { headers: {'x-access-token': localToken} };
    return axios.get(path + '/api/rules', axiosHeader)
    .then((response) => {
      console.log(response.data.rules);
      this.setState( { rules: response.data.rules } )
    })    
    .catch(function (error) {
      if (error.response.request.status == 401) {
        alert(error.response.request.statusText);
      }
    });
  }

  /* Displays a specific rule changes on screen when user clicks a button */
  getRuleChanges(event) {
    event.preventDefault();

    var localToken = localStorage.getItem('token');
    var axiosHeader = { headers: {'x-access-token': localToken} };
    console.log(this.refs.name.value);
    return axios.get(path + '/api/rules/' + this.refs.name.value + '/commits', axiosHeader)
    .then((response) => {
      console.log('Commits are ' + response.data.commits);
      this.setState( { ruleChanges: [] } );
      this.setState( { ruleChanges: response.data.commits } );
    })
    .catch(function (error) {
      if (error.response.request.status == 401) {
        alert(error.response.request.statusText);
      }
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
    return axios.post(path + '/api/rules', ruleToPost, axiosHeader)
    .then((response) => {
      this.getRules();  
    })
    .catch(function (error) {
      if (error.response.request.status == 400) {
        alert(error.response.data.message);
      }
      if (error.response.request.status == 401) {
        alert(error.response.request.statusText);
      }
    });
  }

  /* Deletes a rule from the database */
  deleteRule(event) {
    event.preventDefault();
    console.log(this.refs.name.value);

    var localToken = localStorage.getItem('token');
    var axiosHeader = { headers: {'x-access-token': localToken} };
    return axios.delete(path + '/api/rules/' + this.refs.name.value, axiosHeader) 
    .then((response) => {
      this.getRules();  
    })
    .catch(function (error) {
      if (error.response.request.status == 401) {
        alert(error.response.request.statusText);
      }
      if (error.response.request.status == 404) {
        alert(error.response.data.message);
      }
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
    return axios.put(path + '/api/rules/' + this.refs.name.value, ruleToModify, axiosHeader) 
    .then((response) => {
      this.getRules();  
    })
    .catch(function (error) {
      if (error.response.request.status == 400) {
        alert(error.response.data.message);
      }
      if (error.response.request.status == 401) {
        alert(error.response.request.statusText);
      }
      if (error.response.request.status == 404) {
        alert(error.response.data.message);
      }
    });
  }

  /* Runs a rule from the database */
  runRule(event) {
    event.preventDefault();

    var localToken = localStorage.getItem('token');
    var axiosHeader = { headers: {'x-access-token': localToken} };

    var fact = this.refs.fact.value;
    var stringified = JSON.stringify(fact);
    console.log('string \n\n' + stringified);
    var stringifiedFact = fact.replace('\\','');
    console.log('stringifiedFact \n\n' + stringifiedFact);

    var JSONfact = {
      language: this.refs.language.value,
      blob: JSON.parse(stringifiedFact)
    }
    
    return axios.post(path + '/api/rules/' + this.refs.name.value + '/run', JSONfact, axiosHeader) 
    .then((response) => {
      console.log(response);
      this.refs.textarea.value = JSON.stringify(response.data.facts.blob);  
    })
    .catch(function (error) {
      if (error.response.request.status == 401) {
        alert(error.response.request.statusText);
      }
    });
  }

  /* Runs every rule from the database */
  runRuleSet(event) {
    event.preventDefault();

    var localToken = localStorage.getItem('token');
    var axiosHeader = { headers: {'x-access-token': localToken} };

    var fact = this.refs.factSet.value;
    var stringified = JSON.stringify(fact);
    console.log('string \n\n' + stringified);
    var stringifiedFact = fact.replace('\\','');
    console.log('stringifiedFact \n\n' + stringifiedFact);

    var JSONfact = {
      facts: {
        language: '',
        blob: JSON.parse(stringifiedFact)
      }
    }
    
    return axios.post(path + '/api/rules/run', JSONfact, axiosHeader) 
    .then((response) => {
      console.log(response);
      this.refs.rulesettextarea.value = JSON.stringify(response.data.facts.blob);  
    })
    .catch(function (error) {
      if (error.response.request.status == 401) {
        alert(error.response.request.statusText);
      }
      if (error.response.request.status == 400) {
        alert(error.response.data.message);
      }
    });
  }

  componentDidMount() {
    this.getRules();
  }

  render() {
    const {rules} = this.state;
    var tableHeader = ["Id", "Nombre", "Lenguaje", "Cuerpo", "Activa"];
    const {ruleChanges} = this.state;
    var changesTableHeader = ["Id", "Nombre", "Cuerpo", "Activa", "Razón", "Info de usuario"];

    var exampleFact = {     "type": "pasajero",     "saldo": 15,    "email": "florencia@gmail.com",     "kmRecorridos": 2,    "costoTotal": 0,    "dia": "miercoles", "hora": "15:20:58",     "viajesHoy": 5,     "primerViaje": true,  };
    exampleFact = JSON.stringify(exampleFact);

    var isLoggedIn = (localStorage.getItem('isLoggedIn') == 'true');

    if (!isLoggedIn) {
      window.location.replace("/"); // if he's not logged in, redirect to homepage
    }

    return (
      <div id="wrapper">
        <div id="main">
          <div className="inner">

            <Header title={GlobalStrings.headerTitle} link="/"/>

            <Banner title="Reglas de negocio" subtitle="Sistema de reglas para el cálculo del precio de un viaje"/>
            <h3>Listado de reglas</h3>
            <RulesList header={tableHeader} rules={rules} />
            <br/>
            <CollapseButton name="Agregar Regla">
              <br/>
              <form onSubmit={this.addRule.bind(this)}>
                <label>Nombre: <input type="text" ref="name"/></label>
                <label>Condición: <input type="text" ref="condition" /></label>
                <label>Consecuencia: <input type="text" ref="consequence" /></label>
                <label>Prioridad: <input type="text" ref="priority" /></label>
                <label>Lenguaje: <input type="text" ref="language" /></label>
                <label>Activa: <input type="text" ref="active" /></label>
                <center><button type="submit">Agregar nueva Regla</button></center>
              </form> 
            </CollapseButton>
            <br/><br/>
            <CollapseButton name="Borrar Regla">
              <br/>
              <form onSubmit={this.deleteRule.bind(this)}>
                <label>Nombre: <input type="text" ref="name" /></label>
                <center><button type="submit">Borrar Regla</button></center>
              </form>
            </CollapseButton>
            <br/><br/>
            <CollapseButton name="Modificar Regla">
              <br/>
              <form onSubmit={this.modifyRule.bind(this)}>
                <label>Nombre: <input type="text" ref="name" /></label>
                <label>Condición: <input type="text" ref="condition" /></label>
                <label>Consecuencia: <input type="text" ref="consequence" /></label>
                <label>Prioridad: <input type="text" ref="priority" /></label>
                <label>Lenguaje: <input type="text" ref="language" /></label>
                <label>Activa: <input type="text" ref="active" /></label>
                <center><button type="submit">Modificar Regla</button></center>
              </form> 
            </CollapseButton>
            <br/><br/><br/>
            <h3>Listado de commits de reglas</h3>
            <RuleChangesList header={changesTableHeader} rulechanges={ruleChanges} />
            <form onSubmit={this.getRuleChanges.bind(this)}>
              <label>Nombre: <input type="text" ref="name" /></label>
              <center><button type="submit">Ver commits</button></center>
            </form>
            <br/><br/><br/>
            <h3>Correr una regla</h3>
            <form onSubmit={this.runRule.bind(this)}>
              <label>EJEMPLO: <input disabled type="text" value="50ARSMinimo"/></label>
              <label>Nombre: <input type="text" ref="name" /></label>
              <label>Language: <input type="text" ref="language" /></label>
              <label>EJEMPLO: <input disabled type="text" value={exampleFact}/></label>
              <label>Fact: <textarea type="text" ref="fact" /></label>
              <center><button type="submit">Correr regla</button></center>
              <br/>
              <textarea id="noter-text-area" name="textarea" ref="textarea"></textarea>
            </form>
            <br/><br/><br/>

            <h3>Ejecutar un set de reglas</h3>
            <form onSubmit={this.runRuleSet.bind(this)}>
              <label>EJEMPLO: <input disabled type="text" value={exampleFact}/></label>
              <label>Fact: <textarea type="text" ref="factSet" /></label>
              <center><button type="submit">Correr set de reglas</button></center>
              <br/>
              <textarea id="noter-text-area" name="rulesettextarea" ref="rulesettextarea"></textarea>
            </form>
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

ReactDOM.render(<RulesPage />, document.getElementById('rulespage'));