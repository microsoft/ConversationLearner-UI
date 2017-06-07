import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
class EntitiesHome extends Component {
    render() {
        return (
            <div>
                EntitiesHome
            </div>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        entities: state.entities
    }
}
export default connect(mapStateToProps, null)(EntitiesHome);
