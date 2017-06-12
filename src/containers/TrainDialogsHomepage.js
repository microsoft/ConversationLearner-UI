import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
class TrainDialogsHomepage extends Component {
    render() {
        return (
            <div className='arenaText'>
                <span className="ms-font-su">TrainDialogsHomepage</span>
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