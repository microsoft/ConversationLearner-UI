import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import TrainingGroundArenaHeader from '../components/TrainingGroundArenaHeader'
class TrainDialogsHomepage extends Component {
    render() {
        return (
            <div>
                <TrainingGroundArenaHeader title="Train Dialogs" description="Use this tool to test the current and published versions of your application, to check if you are progressing on the right track ..."/>
            </div>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        trainDialogs: state.trainDialogs
    }
}
export default connect(mapStateToProps, null)(TrainDialogsHomepage);