/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import * as Util from '../Utils/util'
import * as OF from 'office-ui-fabric-react'
import actions from '../actions'
import FormattedMessageId from '../components/FormattedMessageId'
import Cookies from 'universal-cookie'
import { RouteComponentProps } from 'react-router'
import { returntypeof } from 'react-redux-typescript'
import { connect } from 'react-redux'
import { State, ports } from '../types'
import { bindActionCreators } from 'redux'
import { injectIntl, InjectedIntlProps } from 'react-intl'
import { FM } from '../react-intl-messages'
import './Settings.css'

interface ComponentState {
    mode: string
}

class Settings extends React.Component<Props, ComponentState> {
    state = {
        mode: ""
    }

    async componentDidMount() {
        const cookies = new Cookies()
        const mode = cookies.get("mode")
        this.setState({mode})
    }

    onChangeSdkPort = (event: React.ChangeEvent<HTMLInputElement>) => {
        const botPort = parseInt(event.target.value, 10)
        this.props.settingsUpdatePort(botPort)
    }

    onChangeCustomPort = () => {
        this.props.settingsToggleUseCustomPort()
    }

    onChangeMode = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({mode: event.target.value})
    }

    reset = () => {
        this.props.settingsReset()
    }

    setMode = () => {
        const cookies = new Cookies()
        cookies.set('mode', this.state.mode, { path: '/' })
    }

    render() {
        return (
            <div className="cl-page">
                <div data-testid="settings-title-2" className={OF.FontClassNames.superLarge}>
                    <FormattedMessageId id={FM.PROFILE_SETTINGS_TITLE} />
                </div>
                <div>
                    <div className="cl-settings__bot-port">
                        <div className={`${OF.FontClassNames.xLarge}`}>
                            <FormattedMessageId id={FM.PROFILE_SETTINGS_BOT_PORT} />
                        </div>
                        <div>
                            {Util.formatMessageId(this.props.intl, FM.PROFILE_SETTINGS_BOT_PORT_DESCRIPTION, { port: ports.urlBotPort })}
                        </div>
                        <div>
                            <OF.Icon className="cl-icon cl-color-error" iconName="IncidentTriangle" />
                            <FormattedMessageId id={FM.PROFILE_SETTINGS_BOT_PORT_WARNING} />
                        </div>
                        <div data-testid="settings-custom-bot-port">
                            <OF.Checkbox
                                label={Util.formatMessageId(this.props.intl, FM.PROFILE_SETTINGS_BOT_PORT_USE_CUSTOM)}
                                checked={this.props.settings.useCustomPort}
                                onChange={this.onChangeCustomPort}
                            />
                        </div>
                        <div>
                            <input
                                className="cl-input"
                                type="number"
                                min={0}
                                max={99999}
                                value={this.props.settings.customPort}
                                onChange={this.onChangeSdkPort}
                                disabled={!this.props.settings.useCustomPort}
                            />
                            <OF.PrimaryButton
                                text="Reset"
                                ariaDescription="Reset"
                                iconProps={{ iconName: 'Undo' }}
                                onClick={this.reset}
                                disabled={!this.props.settings.useCustomPort}
                            />
                        </div>
                        <div>
                            <input
                                className="cl-input"
                                min={0}
                                max={99999}
                                value={this.state.mode}
                                onChange={this.onChangeMode}
                            />

                            <OF.PrimaryButton
                                text="Mode"
                                ariaDescription="Mode"
                                iconProps={{ iconName: 'ReadingMode' }}
                                onClick={this.setMode}
                            />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        settingsReset: actions.settings.settingsReset,
        settingsUpdatePort: actions.settings.settingsUpdatePort,
        settingsToggleUseCustomPort: actions.settings.settingsToggleUseCustomPort,
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
type Props = typeof stateProps & typeof dispatchProps & RouteComponentProps<any> & InjectedIntlProps

export default connect<typeof stateProps, typeof dispatchProps, RouteComponentProps<any>>(mapStateToProps, mapDispatchToProps)(injectIntl(Settings))