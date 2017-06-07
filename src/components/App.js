import React, { Component } from 'react';
import '../assets/App.css';
import TrainingGround from '../containers/TrainingGround';
import { fetchAllActions, fetchAllEntities, fetchApplications, fetchTrainDialogs } from '../actions/fetch';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
class App extends Component {
  componentDidMount(){
    this.props.fetchAllActions();
    this.props.fetchAllEntities();
    this.props.fetchApplications();
    this.props.fetchTrainDialogs();
  }
  render() {
    return (
      <div className="app">
        <TrainingGround />
      </div>
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
