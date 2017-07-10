import * as React from 'react';
import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import BLISAppsHomepage from '../containers/BLISAppsHomepage';
import { fetchApplications } from '../actions/fetchActions'
import { setBLISAppDisplay, setWebchatDisplay } from '../actions/updateActions'
import Header from '../components/Header';
import Docs from '../components/otherPages/Docs';
import About from '../components/otherPages/About';
import Support from '../components/otherPages/Support';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import axios from 'axios';

class App extends React.Component<any, any> {
  componentWillMount() {
    this.props.fetchApplications();
  }
  render() {
    return (
      <Router>
        <div className="app">
          <Header setDisplay={this.props.setBLISAppDisplay} setWebchatDisplay={this.props.setWebchatDisplay} />
          <Route exact path="/" component={BLISAppsHomepage} />
          <Route path="/myApps" component={BLISAppsHomepage} />
          <Route path="/about" component={About} />
          <Route path="/support" component={Support} />
          <Route path="/docs" component={Docs} />
        </div>
      </Router>
    );
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators({
    fetchApplications: fetchApplications,
    setBLISAppDisplay: setBLISAppDisplay,
    setWebchatDisplay: setWebchatDisplay
  }, dispatch);
}
export default connect(null, mapDispatchToProps)(App);
