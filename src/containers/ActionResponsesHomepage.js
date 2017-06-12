import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import TrainingGroundArenaHeader from '../components/TrainingGroundArenaHeader'
class ActionResponsesHomepage extends Component {
    render() {
        return (
            <div>
                <TrainingGroundArenaHeader title="Actions" description="Manage a list of actions that your application can take given it's state and user input.."/>
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