import * as React from 'react';
import { createBLISApplication } from '../actions/createActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { State } from '../types'

class TeachSessionWindow extends React.Component<any, any> {
    render() {
        return (
            <div className="container">
                <span className="ms-font-su goldText">TEACH WINDOW</span>
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch: any) => {
    return bindActionCreators({
        createBLISApplication: createBLISApplication,
    }, dispatch);
}
const mapStateToProps = (state: State) => {
    return {
        blisApps: state.apps
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(TeachSessionWindow);