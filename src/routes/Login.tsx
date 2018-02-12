import * as React from 'react'
import { returntypeof } from 'react-redux-typescript'
import { connect } from 'react-redux'
import { State } from '../types'
import { bindActionCreators } from 'redux'
import { FormattedMessage } from 'react-intl'
import { FM } from '../react-intl-messages'
import { login } from '../actions/userActions'
import RSA from 'react-simple-auth'
import { microsoftProvider } from '../providers/microsoft-v2'
import { FontClassNames, PrimaryButton } from 'office-ui-fabric-react'
import './Login.css'

class Login extends React.Component<Props, {}> {

    onClickLogin = async () => {
        console.log(`onClickLogin`)
        const session = await RSA.acquireTokenAsync(microsoftProvider)
        this.props.login(session.decodedIdToken.oid, session.decodedIdToken.name)
    }

    render() {
        return (
            <div className="blis-page blis-login">
                <div className={FontClassNames.superLarge}>
                    <FormattedMessage
                        id={FM.LOGIN_TITLE}
                        defaultMessage="Login"
                    />
                </div>
                <div className={FontClassNames.mediumPlus}>
                    <div>
                        <PrimaryButton onClick={this.onClickLogin}>
                            Login
                        </PrimaryButton>
                    </div>
                </div>
            </div>
        )
    }
}


const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        login
    }, dispatch);
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

export default connect<typeof stateProps, typeof dispatchProps, {}>(mapStateToProps, mapDispatchToProps)(Login)