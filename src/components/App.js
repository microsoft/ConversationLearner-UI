import React, { Component } from 'react';
import '../assets/App.css';
import TrainingGround from '../containers/TrainingGround';
import { fetchAllActions, fetchAllEntities, fetchApplications, fetchTrainDialogs } from '../actions/fetch';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Header from './Header';
import Docs from './Docs';
import About from './About';
import Support from './Support';
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'

class App extends Component {
  componentDidMount() {
    this.props.fetchAllActions();
    this.props.fetchAllEntities();
    this.props.fetchApplications();
    this.props.fetchTrainDialogs();
  }
  render() {
    return (
      <Router>
        <div className="app">
          <Header />
          <Route exact path="/" component={TrainingGround} />
          <Route path="/myApps" component={TrainingGround} />
          <Route path="/about" component={About} />
          <Route path="/support" component={Support} />
          <Route path="/docs" component={Docs} />
        </div>
      </Router>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    fetchAllActions: fetchAllActions,
    fetchAllEntities: fetchAllEntities,
    fetchApplications: fetchApplications,
    fetchTrainDialogs: fetchTrainDialogs
  }, dispatch);
}
export default connect(null, mapDispatchToProps)(App);
