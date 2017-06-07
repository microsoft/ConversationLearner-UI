import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
class ActionResponsesHomepage extends Component {
    render() {
        return (
            <div>
                ActionsHomepage
            </div>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        actions: state.actions
    }
}
export default connect(mapStateToProps, null)(ActionResponsesHomepage);