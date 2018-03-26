import * as React from 'react'
import {
  BrowserRouter as Router, Redirect, Route, NavLink, Switch
} from 'react-router-dom'
import { returntypeof } from 'react-redux-typescript'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { State } from '../types'
import AppsIndex from './Apps/AppsIndex'
import About from './About'
import Docs from './Docs'
import Profile from './Profile'
import Support from './Support'
import NoMatch from './NoMatch'
import HelpPanel from '../components/HelpPanel'
import { FontClassNames } from 'office-ui-fabric-react'
import { SpinnerWindow, ErrorPanel } from '../components/modals'
import './App.css'
import { FormattedMessage } from 'react-intl'
import { FM } from '../react-intl-messages'
import { fetchBotInfoAsync } from '../actions/fetchActions'

interface ComponentState {
}

const initialState: ComponentState = {
}

class App extends React.Component<Props, ComponentState> {
  state = initialState

  componentWillMount() {
    this.props.fetchBotInfoAsync()
  }

  render() {
    return (
      <Router>
        <div className="blis-app">
          <div className="blis-app_header-placeholder"></div>
          <header className={`blis-app_header blis-header ${FontClassNames.mediumPlus}`}>
            <nav className="blis-header_links ">
              <NavLink to="/home">
                <FormattedMessage
                  id={FM.APP_HEADER_HOME}
                  defaultMessage="Home"
                />
              </NavLink>
              <NavLink to="/about">
                <FormattedMessage
                  id={FM.APP_HEADER_ABOUT}
                  defaultMessage="About"
                />
              </NavLink>
              <NavLink to="/docs">
                <FormattedMessage
                  id={FM.APP_HEADER_DOCS}
                  defaultMessage="Docs"
                />
              </NavLink>
              <NavLink to="/support">
                <FormattedMessage
                  id={FM.APP_HEADER_SUPPORT}
                  defaultMessage="Support"
                />
              </NavLink>
            </nav>
            <NavLink className="blis-header_user" to="/profile">Settings</NavLink>
          </header>
          <div className="blis-app_header-placeholder" />
          <div className="blis-app_content">
            <Switch>
              <Route exact path="/" render={() => <Redirect to="/home" />} />
              <Route path="/home" component={AppsIndex} />
              <Route path="/about" component={About} />
              <Route path="/docs" component={Docs} />
              <Route path="/support" component={Support} />
              <Route path="/profile" component={Profile} />
              <Route component={NoMatch} />
            </Switch>
          </div>
          <div className="blis-app_modals">
            <ErrorPanel />
            <HelpPanel />
            <SpinnerWindow />
          </div>
        </div>
      </Router>
    );
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators({
      fetchBotInfoAsync
  }, dispatch);
}

const mapStateToProps = (state: State) => {
  return {
    user: state.user
  }
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps)
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps

export default connect<typeof stateProps, typeof dispatchProps, {}>(mapStateToProps, mapDispatchToProps)(App)