import React, { Component} from 'react';
import ReactDOM from 'react-dom';

import { Footer, Menu, Header, Banner, GeneralStats } from './components';

// Terminal 1
// ./node_modules/.bin/webpack -w 
// Terminal 2
// npm start
// El index se va a ir actualizando solito

class App extends Component {

	render() {
		return (
      <div id="wrapper">

        <div id="main">
          <div className="inner">

              <Header title="Index Header" link="/"/>

              <Banner title="Llevame!" subtitle="Aplicación de Gestión Central"
              content="El uso de esta aplicación es restringido al administrador del sistema y manager de servidores de aplicación."/>

              <GeneralStats/>
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

ReactDOM.render(<App />, document.getElementById('root'));
//export default App;


