import * as React from 'react'
import {
  BrowserRouter as Router, Redirect, Route, NavLink, Switch
} from 'react-router-dom'
import { returntypeof } from 'react-redux-typescript'
import { connect } from 'react-redux'
import { State } from '../types'
import { bindActionCreators } from 'redux'
import AppsIndex from './Apps/AppsIndex'
import About from './About'
import Docs from './Docs'
import Profile from './Profile'
import Support from './Support'
import NoMatch from './NoMatch'
import HelpPanel from '../components/HelpPanel'
import { FontClassNames } from 'office-ui-fabric-react'
import { UserLogin, SpinnerWindow, LogoutModal, ErrorPanel } from '../components/modals'
import { setUser, logout } from '../actions/displayActions'
import './App.css'
import { FormattedMessage } from 'react-intl'
import { FM } from '../react-intl-messages'

interface ComponentState {
  isLoginWindowOpen: boolean
  isLogoutWindowOpen: boolean
}

const initialState: ComponentState = {
  isLoginWindowOpen: false,
  isLogoutWindowOpen: false
}

class App extends React.Component<Props, ComponentState> {
  state = initialState

  componentWillMount() {
    // If user is not logged in, show the login window
    if (this.props.user.name.length === 0) {
      this.setState({
        isLoginWindowOpen: true
      })
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    // If user is not logged in, show the login window
    if (nextProps.user.name.length === 0) {
      this.setState({
        isLoginWindowOpen: true
      })
    }
  }

  onClickLogin = (name: string, password: string, id: string) => {
    this.props.setUser(name, password, id)
    this.setState({
      isLoginWindowOpen: false
    })
  }

  onDismissLogin = () => {
    this.setState({
      isLoginWindowOpen: false
    })
  }

  onClickUsername = () => {
    // If user is not logged in, show login window
    // otherwise show logout window
    if (!this.props.user) {
      this.setState({
        isLoginWindowOpen: true
      })
    }
    else {
      this.setState({
        isLogoutWindowOpen: true
      })
    }
  }

  onClickConfirmLogout = () => {
    this.props.logout()
    this.setState({
      isLogoutWindowOpen: false
    })
  }

  onClickCancelLogout = () => {
    this.setState({
      isLogoutWindowOpen: false
    })
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
            {this.props.user.name
              ? <NavLink className="blis-header_user" to="/profile">{this.props.user.name}</NavLink>
              : <NavLink className="blis-header_user" to="/home" onClick={this.onClickUsername}>BLIS</NavLink>}
          </header>
          <div className="blis-app_header-placeholder" />
          <div className="blis-app_content">
            <div>
            <ErrorPanel/>
            </div>
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
            <HelpPanel />
            <UserLogin
              open={this.state.isLoginWindowOpen}
              onClickLogin={this.onClickLogin}
              onDismiss={this.onDismissLogin}
            />
            <LogoutModal
              open={this.state.isLogoutWindowOpen}
              onClickLogout={this.onClickConfirmLogout}
              onClickCancel={this.onClickCancelLogout}
              onDismiss={this.onClickCancelLogout}
            />
            <SpinnerWindow />
          </div>
        </div>
      </Router>
    );
  }
}

const mapDispatchToProps = (dispatch: any) => {
  return bindActionCreators({
    setUser,
    logout
  }, dispatch);
}

const mapStateToProps = (state: State) => {
  return {
    user: state.user
  }
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps)
const dispatchProps = returntypeof(mapDispatchToProps)
type Props = typeof stateProps & typeof dispatchProps

export default connect<typeof stateProps, typeof dispatchProps, {}>(mapStateToProps, mapDispatchToProps)(App)