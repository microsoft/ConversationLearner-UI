/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
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
import { Banner } from '@conversationlearner/models';
import HelpPanel from '../components/HelpPanel'
import { FontClassNames, MessageBar, MessageBarType, Link } from 'office-ui-fabric-react'
import { SpinnerWindow, ErrorPanel } from '../components/modals'
import './App.css'
import { FormattedMessage } from 'react-intl'
import { FM } from '../react-intl-messages'
import { fetchBotInfoAsync } from '../actions/fetchActions'
import { clearBanner } from '../actions/displayActions'

interface ComponentState {
}

const initialState: ComponentState = {
}

class App extends React.Component<Props, ComponentState> {
  state = initialState

  componentDidMount() {
    this.props.fetchBotInfoAsync(this.props.browserId)
  }

  dismissBanner(banner: Banner) {
    // Can't clear error banners
    if (banner.type.toLowerCase() !== "error") {
      this.props.clearBanner(this.props.banner) 
    }
  }

  shouldShowBanner(banner: Banner) {
    if (!banner || !banner.message) {
      return false;
    }
    
    if (!this.props.clearedBanner) {
      return true;
    }
      
    if (JSON.stringify(banner) === JSON.stringify(this.props.clearedBanner)) {
      return false;
    }
    return true;
  }

  getMessageBarType(type: string) {
    if (type.toLowerCase() === "error") {
      return MessageBarType.error
    }
    if (type.toLowerCase() === "warning") {
      return MessageBarType.warning
    }
    return MessageBarType.success
  }

  render() {
    return (
      <Router>
        <div className="cl-app">
          <div className="cl-app_header-placeholder"/>
          <header className={`cl-app_header cl-header ${FontClassNames.mediumPlus}`}>
            <nav className="cl-header_links ">
              <NavLink to="/home">
                <FormattedMessage
                  id={FM.APP_HEADER_MYAPPS}
                  defaultMessage="My Apps"
                />
              </NavLink>
            </nav>
            <NavLink className="cl-header_user" to="/settings">Settings</NavLink>
          </header>
          
          <div className="cl-app_header-placeholder" />
          <div className="cl-app_content">
            {this.shouldShowBanner(this.props.banner) &&
              <MessageBar
                className="cl-messagebar"
                isMultiline={true}
                onDismiss={()=>this.dismissBanner(this.props.banner) }
                dismissButtonAriaLabel='Close'
                messageBarType={this.getMessageBarType(this.props.banner.type)}
              >
                {this.props.banner.message}
                {this.props.banner.message.link && this.props.banner.linktext &&
                  <Link href={this.props.banner.link}>{this.props.banner.linktext}</Link>
                }
                {this.props.banner.datestring &&
                  <div>
                    <span className="cl-font--demphasis">{this.props.banner.datestring}</span>
                  </div>
                }
              </MessageBar>
            }
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
      fetchBotInfoAsync,
      clearBanner
  }, dispatch);
}

const mapStateToProps = (state: State) => {
  return {
    user: state.user,
    browserId: state.bot.browserId,
    banner: state.bot.botInfo ? state.bot.botInfo.banner : null,
    clearedBanner: state.display.clearedBanner
  }
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps)
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & typeof dispatchProps

export default connect<typeof stateProps, typeof dispatchProps, {}>(mapStateToProps, mapDispatchToProps)(App)