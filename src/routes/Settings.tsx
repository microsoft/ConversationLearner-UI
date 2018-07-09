/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import { RouteComponentProps } from 'react-router'
import { returntypeof } from 'react-redux-typescript'
import { connect } from 'react-redux'
import actions from '../actions'
import { State } from '../types'
import { bindActionCreators } from 'redux'
import { FormattedMessage } from 'react-intl'
import { FM } from '../react-intl-messages'
import * as OF from 'office-ui-fabric-react'
import './Settings.css'

interface ComponentState {
}

class Settings extends React.Component<Props, ComponentState> {

    onChangeSdkPort = (event: React.ChangeEvent<HTMLInputElement>) => {
        const botPort = parseInt(event.target.value, 10)
        this.props.settingsUpdate(botPort)
    }

    reset = () => {
        this.props.settingsReset()
    }

    render() {
        return (
            <div className="cl-page">
                <div className={OF.FontClassNames.superLarge}>
                    <FormattedMessage
                        id={FM.PROFILE_SETTINGS_TITLE}
                        defaultMessage="Settings"
                    />
                </div>
                <div>
                    <OF.Label>
                        <FormattedMessage
                            id={FM.PROFILE_SETTINGS_BOT_PORT}
                            defaultMessage="SDK Port"
                        />
                    </OF.Label>
                    <input
                        className="cl-input"
                        type="number"
                        min={0}
                        max={99999}
                        value={this.props.settings.botPort}
                        onChange={this.onChangeSdkPort}
                    />
                    <div className="cl-input-warning">
                        <OF.Icon className="cl-icon" iconName="IncidentTriangle" />
                        <FormattedMessage
                            id={FM.PROFILE_SETTINGS_BOT_PORT_WARNING}
                            defaultMessage="Only change this value if you know what you are doing. This value must match the PORT that your SDK is listening on."
                        />
                    </div>
                    <div>
                        <OF.PrimaryButton
                            text="Reset"
                            ariaDescription="Reset"
                            onClick={this.reset}
                        />
                    </div>
                </div>
            </div>
        )
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        settingsReset: actions.update.settingsReset,
        settingsUpdate: actions.update.settingsUpdate
    }, dispatch)
}

const mapStateToProps = (state: State) => {
    return {
        settings: state.settings
    }
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps)
const dispatchProps = returntypeof(mapDispatchToProps)
type Props = typeof stateProps & typeof dispatchProps & RouteComponentProps<any>

export default connect<typeof stateProps, typeof dispatchProps, RouteComponentProps<any>>(mapStateToProps, mapDispatchToProps)(Settings)