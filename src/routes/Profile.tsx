import * as React from 'react'
import { returntypeof } from 'react-redux-typescript'
import { connect } from 'react-redux'
import { State } from '../types'
import { bindActionCreators } from 'redux'
import { FormattedMessage } from 'react-intl'
import { FM } from '../react-intl-messages'
import { FontClassNames, PrimaryButton } from 'office-ui-fabric-react'

class Profile extends React.Component<Props, {}> {
    onClickLogout = () => {
        console.log(`onClickLogout`)
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
                    Name: {user && user.name}
                </div>
                <div>
                    <PrimaryButton onClick={this.onClickLogout}>
                        Log Out
                    </PrimaryButton>
                </div>
            </div>
        )
    }
}


const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
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