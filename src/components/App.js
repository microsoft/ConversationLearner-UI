import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import '../assets/App.css';
import MyApps from '../containers/myApps';
import Header from './Header';
import Docs from './Docs';
import About from './About';
import Support from './Support';

class App extends Component {
  render() {
    return (
      <Router>
        <div className="app">
          <Header />
          <Route exact path="/" component={MyApps} />
          <Route path="/myApps" component={MyApps} />
          <Route path="/about" component={About} />
          <Route path="/support" component={Support} />
          <Route path="/docs" component={Docs} />
        </div>
      </Router>
    );
  }
}

export default App;
