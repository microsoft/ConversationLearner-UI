import * as React from 'react'
import {
  BrowserRouter as Router, Redirect, Route, NavLink, Switch
} from 'react-router-dom'
import { returntypeof } from 'react-redux-typescript'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { State } from '../types'
import AppsIndex from './Apps/AppsIndex'
import Settings from './Settings'
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

  componentDidMount() {
    this.props.fetchBotInfoAsync()
  }

  render() {
    return (
      <Router>
        <div className="cl-app">
          <div className="cl-app_header-placeholder"></div>
          <header className={`cl-app_header cl-header ${FontClassNames.mediumPlus}`}>
            <nav className="cl-header_links ">
              <NavLink to="/home">
                <FormattedMessage
                  id={FM.APP_HEADER_HOME}
                  defaultMessage="Home"
                />
              </NavLink>
            </nav>
            <NavLink className="cl-header_user" to="/settings">Settings</NavLink>
          </header>
          <div className="cl-app_header-placeholder" />
          <div className="cl-app_content">
            <Switch>
              <Route exact path="/" render={() => <Redirect to="/home" />} />
              <Route path="/home" component={AppsIndex} />
              <Route path="/settings" component={Settings} />
              <Route component={NoMatch} />
            </Switch>
          </div>
          <div className="cl-app_modals">
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