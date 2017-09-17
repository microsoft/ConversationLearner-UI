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
    <div>
      <header>
        <h1>BLIS</h1>
        <nav>
          <NavLink to="/home">Home</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/docs">Docs</NavLink>
          <NavLink to="/support">Support</NavLink>
        </nav>
      </header>
      <Switch>
        <Route exact path="/" render={() => <Redirect to="/home" />} />
        <Route path="/home" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/docs" component={Docs} />
        <Route path="/support" component={Support} />
        <Route component={NoMatch}/>
      </Switch>
    </div>
  </Router>
)

export default component;
