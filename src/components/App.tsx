import * as React from 'react';
import {
  BrowserRouter as Router, Redirect, Route, NavLink, Switch
} from 'react-router-dom'
import Home from './Home'
import About from './About'
import Docs from './Docs'
import Support from './Support'
import NoMatch from './NoMatch'
import './App.css'

const component = () => (
  <Router>
    <div className="blis-app">
      <div className="blis-app_header-placeholder"></div>
      <header className="blis-app_header blis-header">
          <nav className="blis-header_links">
            <NavLink to="/home">Home</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/docs">Docs</NavLink>
            <NavLink to="/support">Support</NavLink>
          </nav>
          <NavLink className="blis-header_user" to="/home">BLIS</NavLink>
      </header>
      <div className="blis-app_header-placeholder"></div>
      <div className="blis-app_content">
        <Switch>
          <Route exact path="/" render={() => <Redirect to="/home" />} />
          <Route path="/home" component={Home} />
          <Route path="/about" component={About} />
          <Route path="/docs" component={Docs} />
          <Route path="/support" component={Support} />
          <Route component={NoMatch} />
        </Switch>
      </div>
    </div>
  </Router>
)

export default component;
