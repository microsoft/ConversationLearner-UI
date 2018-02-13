import * as React from 'react'
import {
  BrowserRouter as Router, Redirect, Route, NavLink, Switch
} from 'react-router-dom'
import { returntypeof } from 'react-redux-typescript'
import { connect } from 'react-redux'
import { State } from '../types'
import locationHelperBuilder from 'redux-auth-wrapper/history4/locationHelper'
import { connectedRouterRedirect } from 'redux-auth-wrapper/history4/redirect'
import AppsIndex from './Apps/AppsIndex'
import About from './About'
import Docs from './Docs'
import Login from './Login'
import Profile from './Profile'
import Support from './Support'
import NoMatch from './NoMatch'
import HelpPanel from '../components/HelpPanel'
import { FontClassNames } from 'office-ui-fabric-react'
import { SpinnerWindow, ErrorPanel } from '../components/modals'
import './App.css'
import { FormattedMessage } from 'react-intl'
import { FM } from '../react-intl-messages'

const userIsAuthenticated = connectedRouterRedirect<any, State>({
  // The url to redirect user to if they fail
  redirectPath: '/login',
  // Determine if the user is authenticated or not
  authenticatedSelector: state => state.user.isLoggedIn,
  // A nice display name for this check
  wrapperDisplayName: 'UserIsAuthenticated'
})

const locationHelper = locationHelperBuilder({})
const userIsNotAuthenticated = connectedRouterRedirect<any, State>({
  // This sends the user either to the query param route if we have one, or to the landing page if none is specified and the user is already logged in
  redirectPath: (state, ownProps) => locationHelper.getRedirectQueryParam(ownProps) || '/home',
  // This prevents us from adding the query parameter when we send the user away from the login page
  allowRedirectBack: false,
  // This prevents us from adding the query parameter when we send the user away from the login page
  // Determine if the user is authenticated or not
  authenticatedSelector: state => !state.user.isLoggedIn,
  // A nice display name for this check
  wrapperDisplayName: 'UserIsNotAuthenticated'
})

interface ComponentState {
  isLogoutWindowOpen: boolean
}

const initialState: ComponentState = {
  isLogoutWindowOpen: false
}

class App extends React.Component<Props, ComponentState> {
  state = initialState

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
            {this.props.user.isLoggedIn
              ? <NavLink className="blis-header_user" to="/profile">{this.props.user.name}</NavLink>
              : <NavLink className="blis-header_user" to="/login">Log In</NavLink>}
          </header>
          <div className="blis-app_header-placeholder" />
          <div className="blis-app_content">
            <Switch>
              <Route exact path="/" render={() => <Redirect to="/home" />} />
              <Route path="/home" component={userIsAuthenticated(AppsIndex)} />
              <Route path="/about" component={About} />
              <Route path="/docs" component={Docs} />
              <Route path="/support" component={Support} />
              <Route path="/login" component={userIsNotAuthenticated(Login)} />
              <Route path="/profile" component={userIsAuthenticated(Profile)} />
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

const mapStateToProps = (state: State) => {
  return {
    user: state.user
  }
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps)
type Props = typeof stateProps

export default connect<typeof stateProps, {}, {}>(mapStateToProps, null)(App)