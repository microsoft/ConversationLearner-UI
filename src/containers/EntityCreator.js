import React, { Component } from 'react';
import { createEntity } from '../actions/create';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
class EntityCreator extends Component {
    render() {
        return (
            <div className='arenaText'>
                <span className="ms-font-su">EntityCreator</span>
            </div>
        );
    }
}
const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({
        createEntity: createEntity,
    }, dispatch);
}
const mapStateToProps = (state) => {
    return {
        blisApps: state.apps
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(EntityCreator);
