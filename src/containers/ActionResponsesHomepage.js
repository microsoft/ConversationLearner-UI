import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
class ActionResponsesHomepage extends Component {
    render() {
        return (
            <div className='arenaText'>
                <span className="ms-font-su">ActionResponsesHomepage</span>
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