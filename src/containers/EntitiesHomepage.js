import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
class EntitiesHomepage extends Component {
    render() {
        return (
            <div>
                EntitiesHomepage
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
