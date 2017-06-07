import React, { Component } from 'react';
import '../assets/App.css';
import TrainingGround from '../containers/TrainingGround';
class App extends Component {
  render() {
    return (
      <div className="app">
          <TrainingGround />
      </div>
    );
  }
}

export default App;
