import * as React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State } from '../types'
import { setDisplayMode } from '../actions/updateActions'

class TeachSessionScorer extends React.Component<any, any> {
    render() {
        return (
            <div>
                TeachSessionScorer
            </div>
        )
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        setDisplayMode: setDisplayMode
    }, dispatch);
}
const mapStateToProps = (state: State, ownProps: any) => {
    return {
        trainDialogs: state.trainDialogs,
        user: state.user
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(TeachSessionScorer as React.ComponentClass<any>);