import * as React from 'react'
import { returntypeof } from 'react-redux-typescript'
import { connect } from 'react-redux'
import { State } from '../types'
import { bindActionCreators } from 'redux'
import { FormattedMessage } from 'react-intl'
import { FM } from '../react-intl-messages'
import { FontClassNames, PrimaryButton, Label } from 'office-ui-fabric-react'
import { logout } from '../actions/displayActions'
import LogoutModal from '../components/modals/LogoutModal'
import * as SdkPort from '../services/sdkPort'
import './Profile.css'

interface ComponentState {
    isLogoutWindowOpen: boolean
    sdkPort: number
}

const initialState: ComponentState = {
    isLogoutWindowOpen: false,
    sdkPort: SdkPort.get()
}

class Profile extends React.Component<Props, ComponentState> {
    state = initialState

    onClickLogout = () => {
        this.setState({
            isLogoutWindowOpen: true
        })
    }

    onChangeSdkPort = (event: React.ChangeEvent<HTMLInputElement>) => {
        const sdkPort = parseInt(event.target.value)
        SdkPort.set(sdkPort)
        this.setState({
            sdkPort
        })
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
        const { user } = this.props
        return (
            <div className="blis-page">
                <div className={FontClassNames.superLarge}>
                    <FormattedMessage
                        id={FM.PROFILE_TITLE}
                        defaultMessage="Profile"
                    />
                </div>
                <div className={FontClassNames.mediumPlus}>
                    <FormattedMessage
                        id={FM.PROFILE_NAME}
                        defaultMessage="Name"
                    /> {user && user.name}
                </div>
                <div>
                    <PrimaryButton onClick={this.onClickLogout}>
                        <FormattedMessage
                            id={FM.LOGOUT_PRIMARYBUTTON_TEXT}
                            defaultMessage="Log Out"
                        />
                    </PrimaryButton>
                </div>
                <div className={FontClassNames.xxLarge}>
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
                        className="blis-input"
                        type="number"
                        min={0}
                        max={99999}
                        value={this.state.sdkPort}
                        onChange={this.onChangeSdkPort}
                    />
                </div>
                <LogoutModal
                    open={this.state.isLogoutWindowOpen}
                    onClickLogout={this.onClickConfirmLogout}
                    onClickCancel={this.onClickCancelLogout}
                    onDismiss={this.onClickCancelLogout}
                />
            </div>
        )
    }
}


const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        logout
    }, dispatch)
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

export default connect<typeof stateProps, typeof dispatchProps, {}>(mapStateToProps, mapDispatchToProps)(Profile)