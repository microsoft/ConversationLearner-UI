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
import FormattedMessageId from '../components/FormattedMessageId'
import { FM } from '../react-intl-messages'
import * as OF from 'office-ui-fabric-react'
import './Settings.css'

class Settings extends React.Component<Props> {

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
                <div data-testid="settings-title-2" className={OF.FontClassNames.superLarge}>
                    <FormattedMessageId id={FM.PROFILE_SETTINGS_TITLE} />
                </div>
                <div>
                    <OF.Label>
                        <FormattedMessageId id={FM.PROFILE_SETTINGS_BOT_PORT} />
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
                        <OF.Icon className="cl-icon cl-color-error" iconName="IncidentTriangle" />
                        <FormattedMessageId id={FM.PROFILE_SETTINGS_BOT_PORT_WARNING} />
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
        settingsReset: actions.settings.settingsReset,
        settingsUpdate: actions.settings.settingsUpdate
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