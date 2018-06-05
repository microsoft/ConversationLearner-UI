/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import * as React from 'react'
import { RouteComponentProps } from 'react-router'
import { returntypeof } from 'react-redux-typescript'
import { connect } from 'react-redux'
import { State } from '../types'
import { bindActionCreators } from 'redux'
import { FormattedMessage } from 'react-intl'
import { FM } from '../react-intl-messages'
import * as OF from 'office-ui-fabric-react'
import * as SdkPort from '../services/sdkPort'
import './Settings.css'

interface ComponentState {
    sdkPort: number
}

const initialState: ComponentState = {
    sdkPort: SdkPort.get()
}

class Settings extends React.Component<Props, ComponentState> {
    state = initialState

    onChangeSdkPort = (event: React.ChangeEvent<HTMLInputElement>) => {
        const sdkPort = parseInt(event.target.value, 10)
        this.setSdkPort(sdkPort)        
    }

    reset = () => {
        this.setSdkPort(SdkPort.defaultPort)
    }

    private setSdkPort = (sdkPort: number) => {
        SdkPort.set(sdkPort)
        this.setState({
            sdkPort
        })
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
                            id={FM.PROFILE_SETTINGS_SDK_PORT}
                            defaultMessage="SDK Port"
                        />
                    </OF.Label>
                    <input
                        className="cl-input"
                        type="number"
                        min={0}
                        max={99999}
                        value={this.state.sdkPort}
                        onChange={this.onChangeSdkPort}
                    />
                    <div className="cl-input-warning">
                        <OF.Icon className="cl-icon" iconName="IncidentTriangle" />
                        <FormattedMessage
                            id={FM.PROFILE_SETTINGS_SDK_PORT_WARNING}
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
    }, dispatch)
}

const mapStateToProps = (_state: State) => {
    return {
    }
}

// Props types inferred from mapStateToProps & dispatchToProps
const stateProps = returntypeof(mapStateToProps)
const dispatchProps = returntypeof(mapDispatchToProps)
type Props = typeof stateProps & typeof dispatchProps & RouteComponentProps<any>

export default connect<typeof stateProps, typeof dispatchProps, RouteComponentProps<any>>(mapStateToProps, mapDispatchToProps)(Settings)