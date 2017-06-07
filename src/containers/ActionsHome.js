import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
class ActionsHome extends Component {
    render() {
        return (
            <div>
                ActionsHome
            </div>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        actions: state.actions
    }
}
export default connect(mapStateToProps, null)(ActionsHome);