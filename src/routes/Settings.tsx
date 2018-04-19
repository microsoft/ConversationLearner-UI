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
import { FontClassNames, Label } from 'office-ui-fabric-react'
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
        const sdkPort = parseInt(event.target.value)
        SdkPort.set(sdkPort)
        this.setState({
            sdkPort
        })
    }

    render() {
        return (
            <div className="cl-page">
                <div className={FontClassNames.superLarge}>
                    <FormattedMessage
                        id={FM.PROFILE_SETTINGS_TITLE}
                        defaultMessage="Settings"
                    />
                </div>
                <div>
                    <Label>
                        <FormattedMessage
                            id={FM.PROFILE_SETTINGS_SDKPORT}
                            defaultMessage="SDK Port"
                        />
                    </Label>
                    <input
                        className="cl-input"
                        type="number"
                        min={0}
                        max={99999}
                        value={this.state.sdkPort}
                        onChange={this.onChangeSdkPort}
                    />
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