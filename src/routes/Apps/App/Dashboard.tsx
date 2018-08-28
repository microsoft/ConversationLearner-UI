/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react';
import { returntypeof } from 'react-redux-typescript';
import { connect } from 'react-redux';
import { State } from '../../../types'
import { AppBase, AppDefinition } from '@conversationlearner/models'
import { FormattedMessage } from 'react-intl'
import { bindActionCreators } from 'redux'
import * as OF from 'office-ui-fabric-react'
import { FM } from '../../../react-intl-messages'
import ReactPlayer from 'react-player'
import actions from '../../../actions'
import * as ReactMarkdown from 'react-markdown'
import * as moment from 'moment'
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

    onClickAcceptChanges = async (updatedAppDefinition: AppDefinition) => {
        const newTagName = `CL-${moment().format('MM-DD-SS')}`
        const appId = this.props.app.appId

        // Create a new tag for the current application and set it to live.
        await this.props.createAppTagThunkAsync(appId, newTagName, true)
        await this.props.promoteUpdatedAppDefinitionThunkAsync(appId, updatedAppDefinition)
    }

    render() {
        const app = this.props.app
        const editPackageId = this.props.activeApps[app.appId] || app.devPackageId
        const appDefinitionChange = this.props.source[app.appId]

        const actionChanges = !appDefinitionChange
            ? []
            : !appDefinitionChange.isChanged
            ? []
            : appDefinitionChange.appDefinitionChanges.actions
                .filter(cr => cr.isChanged)
                .map(cr => cr.changes)
                .reduce((a, b) => [...a, ...b], [])

        // TODO: internationalize text
        return (
            <div className="cl-page">
                <span className={OF.FontClassNames.xxLarge}>
                    <FormattedMessage
                        id={FM.DASHBOARD_TITLE}
                        defaultMessage="Overview"
                    />
                </span>
                <span className={OF.FontClassNames.mediumPlus}>
                    <FormattedMessage
                        id={FM.DASHBOARD_SUBTITLE}
                        defaultMessage="Notifications about this model..."
                    />
                </span>
                {appDefinitionChange && appDefinitionChange.isChanged
                    && <div>
                        <h2 className={OF.FontClassNames.large}>Upgrade Notice:</h2>
                        <p>You are running a version of the SDK that requires a newer version of the model than the one you have attempted to load.  The local copy of the model was upgraded to allow viewing.</p>

                        {editPackageId === app.devPackageId
                            ? <div>
                            <p><OF.Icon iconName="Warning" className="cl-icon" /> Live package and Edit package are the same. Cannot safely auto upgrade. Please confirm changes.</p>

                            <h3>Actions:</h3>
                            <ul>
                                {actionChanges.map((change, i) =>
                                    <li key={i}>{change}</li>
                                )}
                            </ul>

                            <p>By accepting changes we will automatically create a new tag for the unedited model, make it the live model, and then save the updated model. This will prevent a break in deployed models, but allow you to continue working.</p>
                            <OF.PrimaryButton
                                onClick={() => this.onClickAcceptChanges(appDefinitionChange.updatedAppDefinition)}
                                text="Accept Changes"
                            />
                        </div>
                        : <div>
                            <p>You cannot save this updated model because you are currently viewing an older tag: {app.packageVersions.find(pv => pv.packageId === editPackageId)!.packageVersion}</p>
                        </div>}
                    </div>}
                {this.props.validationErrors.length > 0 &&
                (
                    <div className="cl-errorpanel" >
                        <div className={`cl-font--emphasis ${OF.FontClassNames.medium}`}>Please check that the correct version of your Bot is running.</div>
                        {this.props.validationErrors.map((message: any, i) => {
                                return message.length === 0
                                    ? <br key={i}></br>
                                    : <div key={i} className={OF.FontClassNames.medium}>{message}</div>
                            })
                        }
                        <OF.PrimaryButton
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
        browserId: state.bot.browserId,
        source: state.source,
        activeApps: state.apps.activeApps
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        createAppTagThunkAsync: actions.app.createAppTagThunkAsync,
        fetchBotInfoThunkAsync: actions.bot.fetchBotInfoThunkAsync,
        promoteUpdatedAppDefinitionThunkAsync: actions.source.promoteUpdatedAppDefinitionThunkAsync
    }, dispatch)
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
