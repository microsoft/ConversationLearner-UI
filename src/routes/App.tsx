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
import * as OF from 'office-ui-fabric-react'
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
      return OF.MessageBarType.error
    }
    if (type.toLowerCase() === "warning") {
      return OF.MessageBarType.warning
    }
    return OF.MessageBarType.success
  }

  render() {
    return (
      <Router>
        <div className="cl-app">
          <div className="cl-app_header-placeholder"/>
          <header className={`cl-app_header cl-header ${OF.FontClassNames.mediumPlus}`}>
            <nav className="cl-header_links">
              <img className="cl-header-logo" src="/Microsoft-logo_rgb_c-wht.png" alt="Microsoft Logo" />
              <span className="cl-header-text">
                <img className="cl-header-icon" src="/icon.svg" alt="ConversationLearner Logo" />
                Project Conversation Learner
              </span>
              <NavLink to="/home">
                <FormattedMessage
                  id={FM.APP_HEADER_MODELS}
                  defaultMessage="My Models"
                />
              </NavLink>
              <a href="https://labs.cognitive.microsoft.com/en-us/project-conversation-learner" target="_blank">Documentation</a>
              <a href="https://cognitive.uservoice.com/forums/912199-project-conversation-learner" target="_blank">Feedback</a>
            </nav>
            <NavLink className="cl-header_user" to="/settings"><OF.Icon className="cl-header-office-icon" iconName="Settings" /> Settings</NavLink>
          </header>
          
          <div className="cl-app_header-placeholder" />
          <div className="cl-app_content">
            {this.shouldShowBanner(this.props.banner) &&
              <OF.MessageBar
                className="cl-messagebar"
                isMultiline={true}
                onDismiss={()=>this.dismissBanner(this.props.banner) }
                dismissButtonAriaLabel='Close'
                messageBarType={this.getMessageBarType(this.props.banner.type)}
              >
                {this.props.banner.message}
                {this.props.banner.message.link && this.props.banner.linktext &&
                  <OF.Link href={this.props.banner.link}>{this.props.banner.linktext}</OF.Link>
                }
                {this.props.banner.datestring &&
                  <div>
                    <span className="cl-font--demphasis">{this.props.banner.datestring}</span>
                  </div>
                }
              </OF.MessageBar>
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