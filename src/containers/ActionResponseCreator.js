import React, { Component } from 'react';
import { createAction } from '../actions/create';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
class ActionResponseCreator extends Component {
    render() {
        return (
            <div>
                ActionResponseCreator
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({
        createAction: createAction,
    }, dispatch);
}
const mapStateToProps = (state) => {
    return {
        blisApps: state.apps
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(ActionResponseCreator);