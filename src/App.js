import React, { Component } from 'react';
import './App.css';
import TrainingGround from './TrainingGround';
class App extends Component {
  render() {
    return (
      <div className="app">
        <div>
          <TrainingGround />
        </div>
      </div>
    );
  }
}

export default App;
