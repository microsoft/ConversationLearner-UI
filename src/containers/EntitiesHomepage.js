import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import TrainingGroundArenaHeader from '../components/TrainingGroundArenaHeader'
class EntitiesHomepage extends Component {
    render() {
        return (
            <div>
                <TrainingGroundArenaHeader title="Entities" description="Manage a list of entities in your application and track and control their instances within actions..."/>
            </div>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        entities: state.entities
    }
}
export default connect(mapStateToProps, null)(EntitiesHomepage);
