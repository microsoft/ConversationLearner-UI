/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { connect } from 'react-redux';
import { State } from '../../../types'
import { AppBase } from '@conversationlearner/models'
import { FormattedMessage } from 'react-intl'
import { bindActionCreators } from 'redux'
import { FontClassNames, PrimaryButton } from 'office-ui-fabric-react'
import { FM } from '../../../react-intl-messages'
import ReactPlayer from 'react-player'
import { fetchBotInfoThunkAsync } from '../../../actions/fetchActions'
import * as ReactMarkdown from 'react-markdown'
import './Dashboard.css'

interface ComponentState {
    retrying: boolean
}

class Dashboard extends React.Component<Props, ComponentState> {
    state = {
        retrying: false
    }

    onClickRetry = () => {
        this.props.fetchBotInfoThunkAsync(this.props.browserId, this.props.app.appId)

        /**
         * This is here to toggle visibility of text for the screen reader.
         * Because it's meant for reading and not as a direct match of request duration it is fixed to 1000 ms
         */
        this.setState({
            retrying: true
        }, () => {
            setTimeout(() => {
                this.setState({
                    retrying: false
                })
            }, 1000)
        })
    }

    render() {
        // TODO: internationalize text
        return (
            <div className="cl-page">
                <span className={FontClassNames.xxLarge}>
                    <FormattedMessage
                        id={FM.DASHBOARD_TITLE}
                        defaultMessage="Overview"
                    />
                </span>
                <span className={FontClassNames.mediumPlus}>
                    <FormattedMessage
                        id={FM.DASHBOARD_SUBTITLE}
                        defaultMessage="Notifications about this model..."
                    />
                </span>
                {this.props.validationErrors.length > 0 && 
                (
                    <div className="cl-errorpanel" >
                        <div className={`cl-font--emphasis ${FontClassNames.medium}`}>Please check that the correct version of your Bot is running.</div>
                        {this.props.validationErrors.map((message: any, i) => { 
                                return message.length === 0
                                    ? <br key={i}></br>
                                    : <div key={i} className={FontClassNames.medium}>{message}</div>
                            })
                        }
                        <PrimaryButton
                            onClick={this.onClickRetry}
                            ariaDescription="Retry"
                            text="Retry"
                            iconProps={{ iconName: 'Sync' }}
                        />
                        <div role="alert" aria-live="assertive">
                            {this.state.retrying && <span className="cl-screen-reader">Retrying</span>}
                        </div>
                    </div>
                )}
                
                {this.props.app.metadata && this.props.app.metadata.markdown &&
                    <ReactMarkdown source={this.props.app.metadata.markdown} />
                }
                {this.props.app.metadata && this.props.app.metadata.video &&
                    <ReactPlayer 
                        url={this.props.app.metadata.video}
                        controls={true}
                    />
                }
            </div>
        );
    }
}

const mapStateToProps = (state: State) => {
    return {
        entities: state.entities,
        actions: state.actions,
        trainDialogs: state.trainDialogs,
        browserId: state.bot.browserId
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        fetchBotInfoThunkAsync
    }, dispatch);
}

export interface ReceivedProps {
    app: AppBase, 
    validationErrors: string[]
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps);
const dispatchProps = returntypeof(mapDispatchToProps);
type Props = typeof stateProps & ReceivedProps & typeof dispatchProps;

export default connect<typeof stateProps, typeof dispatchProps, ReceivedProps>(mapStateToProps, mapDispatchToProps)(Dashboard)
